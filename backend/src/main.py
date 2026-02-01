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
# Add a file handler for debugging tracebacks
file_handler = logging.FileHandler("app_debug.log", encoding='utf-8')
file_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logger.addHandler(file_handler)
# Also add to the root logger to catch everything
logging.getLogger().addHandler(file_handler)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    repo_type = os.getenv('REPOSITORY_TYPE', 'memory')
    logger.info(f"Starting application. Repository mode: {repo_type}")
    
    # Initialize database
    from src.infrastructure.database.config import init_db
    init_db()
    logger.info("Database initialized (tables created/verified)")

    # Start scheduler
    from src.infrastructure.services.scheduler_service import scheduler_service
    scheduler_service.start()
    
    yield
    
    # Shutdown scheduler
    scheduler_service.shutdown()
    logger.info("Shutting down application...")


app = FastAPI(
    title="Collie Almacenes",
    description="Inventory REST API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router, prefix="/api/v1/products")
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(purchase_router, prefix="/api/v1/purchasing")
app.include_router(sales_router, prefix="/api/v1/sales")
from src.infrastructure.api.analytics_routes import router as analytics_router
app.include_router(analytics_router, prefix="/api/v1/analytics")

# Servir archivos estáticos para documentos subidos
from fastapi.staticfiles import StaticFiles
os.makedirs("uploads/documents", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unexpected errors."""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "Start request failed. Please check logs for details."
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
