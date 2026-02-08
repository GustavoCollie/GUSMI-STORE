"""
Entry point for the Inventory Management FastAPI application.
"""
import logging
import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from src.infrastructure.api.limiter import limiter

from src.infrastructure.api.routes import router as products_router
from src.infrastructure.api.auth_routes import router as auth_router
from src.infrastructure.api.purchase_routes import router as purchase_router
from src.infrastructure.api.sales_routes import router as sales_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Only add file handler if NOT on Vercel
if not os.getenv("VERCEL"):
    try:
        file_handler = logging.FileHandler("app_debug.log", encoding='utf-8')
        file_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
        logger.addHandler(file_handler)
        # Also add to the root logger to catch everything
        logging.getLogger().addHandler(file_handler)
    except Exception:
        pass # Fallback if file isn't writable locally


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    try:
        logger.info("Starting startup sequence...")
        
        # Validate critical environment variables
        required_vars = ["DATABASE_URL", "SECRET_KEY", "API_KEY"]
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            error_msg = f"Missing required environment variables: {', '.join(missing)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        
        repo_type = os.getenv('REPOSITORY_TYPE', 'memory')
        logger.info(f"Repository mode: {repo_type}")
        
        # Initialize database
        try:
            from src.infrastructure.database.config import init_db
            logger.info("Initializing database connection...")
            init_db()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}", exc_info=True)
            raise

        # Start scheduler
        try:
            from src.infrastructure.services.scheduler_service import scheduler_service
            scheduler_service.start()
            logger.info("Scheduler started")
        except Exception as e:
            logger.warning(f"Failed to start scheduler (non-critical): {e}")
        
        logger.info("Startup sequence completed")
        yield
        
    except Exception as e:
        logger.critical(f"FATAL: Application startup failed: {e}", exc_info=True)
        # Re-raise to let Vercel handle the crash
        raise
    finally:
        # Shutdown scheduler
        try:
            from src.infrastructure.services.scheduler_service import scheduler_service
            scheduler_service.shutdown()
            logger.info("Scheduler shut down")
        except Exception:
            pass
        logger.info("Lifespan cleanup finished")


app = FastAPI(
    title="GUSMI Store Inventory Management API",
    description="""
    ## Comprehensive Inventory Management System
    
    This API provides complete inventory management capabilities including:
    
    * **Product Management**: CRUD operations for products with stock tracking
    * **Purchase Orders**: Supplier management and purchase order processing
    * **Sales Orders**: Customer orders and sales tracking
    * **Analytics**: Business intelligence and reporting
    * **Authentication**: Secure user and customer authentication
    
    ### Architecture
    Built with hexagonal architecture following SOLID principles.
    
    ### Authentication
    Most endpoints require authentication via JWT tokens or API keys.
    """,
    version="1.0.0",
    contact={
        "name": "GUSMI Store Support",
        "email": "support@gusmi-store.com",
    },
    lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Request logging middleware
from fastapi import Request
import time

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.3f}s"
    )
    return response

# Configure CORS with dynamic origins
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

# Default local origins for development
if not origins:
    origins = ["http://localhost:5173", "http://localhost:5174", "https://gusmi-store.vercel.app"]

logger.info(f"CORS configured for origins: {origins}")

# Allow all Vercel preview deployments by regex
# Format: https://project-name-git-branch-username.vercel.app
vercel_preview_regex = r"https://.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # More permissive for public API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_details = traceback.format_exc()
    logger.error(f"GLOBAL ERROR: {str(exc)}\n{error_details}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true"
        }
    )

app.include_router(products_router, prefix="/api/v1/products")
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(purchase_router, prefix="/api/v1/purchasing")
app.include_router(sales_router, prefix="/api/v1/sales")
from src.infrastructure.api.analytics_routes import router as analytics_router
app.include_router(analytics_router, prefix="/api/v1/analytics")
from src.infrastructure.api.public_routes import router as public_router
app.include_router(public_router, prefix="/api/v1/public")

# Servir archivos estáticos para documentos subidos
from fastapi.staticfiles import StaticFiles
is_vercel = os.getenv("VERCEL") == "1"
base_upload_dir = "/tmp/uploads" if is_vercel else "uploads"

# Asegurar que existan los directorios
os.makedirs(f"{base_upload_dir}/products/images", exist_ok=True)
os.makedirs(f"{base_upload_dir}/products/specs", exist_ok=True)
os.makedirs(f"{base_upload_dir}/documents", exist_ok=True)

# Montar archivos estáticos
app.mount("/uploads", StaticFiles(directory=base_upload_dir), name="uploads")

if is_vercel:
    logger.info(f"Running on Vercel: using {base_upload_dir} for static files")
else:
    logger.info(f"Running locally: using {base_upload_dir} for static files")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unexpected errors."""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "type": type(exc).__name__
        }
    )

from fastapi.exceptions import RequestValidationError
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error: {exc.errors()}")
    body = exc.body
    if not isinstance(body, (dict, list, str, int, float, bool, type(None))):
        body = str(body)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body},
    )


@app.get("/")
def read_root():
    return {
        "status": "online",
        "mode": os.getenv("REPOSITORY_TYPE", "memory")
    }

@app.get("/health")
def health_check():
    db_url = os.getenv("DATABASE_URL", "")
    db_host = "not-found"
    if "@" in db_url:
        db_host = db_url.split("@")[1].split(":")[0].split("/")[0]
    return {
        "status": "healthy", 
        "timestamp": time.time(),
        "db_host": db_host
    }

@app.get("/ping")
def ping():
    return "pong"


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
