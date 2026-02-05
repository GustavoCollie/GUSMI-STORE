"""
Configuración de la base de datos con SQLAlchemy.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# URL de conexión a la base de datos
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://inventory_user:inventory_pass@localhost:5432/inventory_db"
)

# Fix for Supabase/Heroku which uses 'postgres://' but SQLAlchemy needs 'postgresql://'
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Proactively remove pgbouncer=true as it causes errors with psycopg2-binary
    # even when using the transaction pooler (port 6543)
    if "?pgbouncer=true" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("?pgbouncer=true", "")

# Crear engine de SQLAlchemy
engine_kwargs = {
    "pool_pre_ping": True,
    "echo": False,
}

if DATABASE_URL.startswith("sqlite"):
    # Convert potential relative path to absolute to avoid ambiguity
    if ":///" in DATABASE_URL:
        db_path = DATABASE_URL.split(":///")[1]
        if not os.path.isabs(db_path):
            # Resolve relative to the backend directory
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            abs_db_path = os.path.join(base_dir, db_path)
            DATABASE_URL = f"sqlite:///{abs_db_path}"
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Optimized for PostgreSQL (Supabase)
    if os.getenv("VERCEL") or os.getenv("SERVERLESS"):
        # On Vercel (Serverless), we don't want local pooling. 
        # We rely on Supabase's transaction pooler (port 6543).
        from sqlalchemy.pool import NullPool
        engine_kwargs["poolclass"] = NullPool
    else:
        # Standard pooling for local/persistent servers
        engine_kwargs["pool_size"] = 5
        engine_kwargs["max_overflow"] = 10

engine = create_engine(DATABASE_URL, **engine_kwargs)

# Habilitar claves foráneas para SQLite
if DATABASE_URL.startswith("sqlite"):
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Crear session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para modelos declarativos
Base = declarative_base()


def get_db():
    """
    Dependency para obtener sesión de base de datos.
    
    Yields:
        Session de SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Inicializa la base de datos creando todas las tablas.
    
    Esta función debe llamarse al inicio de la aplicación.
    """
    # En Vercel/Producción, es mejor no intentar crear tablas en cada arranque para evitar errores de conexión.
    # El usuario debe haber inicializado la DB previamente o usar un script de migración.
    if os.getenv("VERCEL") and os.getenv("REPOSITORY_TYPE") == "postgres":
        print("Running on Vercel: Skipping automatic table creation (ensure DB is initialized)")
        return

    from .models import ProductModel, UserModel, MovementModel, SupplierModel, PurchaseOrderModel, SalesOrderModel  # Import aquí para evitar circular imports
    Base.metadata.create_all(bind=engine)
