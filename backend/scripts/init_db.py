"""
Crea todas las tablas y opcionalmente inserta datos de prueba.
"""
import sys
from pathlib import Path

# Agregar el directorio raíz al path
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

from src.infrastructure.database.config import init_db, SessionLocal
from src.infrastructure.database.models import ProductModel, UserModel
from decimal import Decimal
import uuid

def create_tables():
    """Crea todas las tablas en la base de datos."""
    print("Creando tablas...")
    init_db()
    print("✓ Tablas creadas exitosamente")


def insert_sample_data():
    """Inserta datos de prueba en la base de datos."""
    print("\nInsertando datos de prueba...")
    
    db = SessionLocal()
    try:
        # Verificar si ya hay datos
        existing = db.query(ProductModel).count()
        if existing > 0:
            print(f"⚠ Ya existen {existing} productos en la base de datos")
            response = input("¿Desea agregar más datos de prueba? (s/n): ")
            if response.lower() != 's':
                return
        
        # Datos de prueba
        sample_products = [
            ProductModel(
                id=uuid.uuid4(),
                name="Laptop HP Pavilion 15",
                description="Laptop con procesador Intel Core i7, 16GB RAM, 512GB SSD",
                price=Decimal("899.99"),
                stock=15,
                sku="LAP-HP-001"
            ),
            ProductModel(
                id=uuid.uuid4(),
                name="Mouse Logitech MX Master 3",
                description="Mouse inalámbrico ergonómico con múltiples botones",
                price=Decimal("99.99"),
                stock=50,
                sku="MOU-LOG-001"
            ),
            ProductModel(
                id=uuid.uuid4(),
                name="Teclado Mecánico Keychron K2",
                description="Teclado mecánico inalámbrico 75%, switches Gateron Brown",
                price=Decimal("89.99"),
                stock=30,
                sku="KEY-KEY-001"
            ),
            ProductModel(
                id=uuid.uuid4(),
                name="Monitor Dell 27 4K",
                description="Monitor 27 pulgadas, resolución 4K, IPS",
                price=Decimal("450.00"),
                stock=20,
                sku="MON-DEL-001"
            ),
            ProductModel(
                id=uuid.uuid4(),
                name="Webcam Logitech C920",
                description="Webcam Full HD 1080p con micrófono integrado",
                price=Decimal("79.99"),
                stock=40,
                sku="WEB-LOG-001"
            ),
        ]
        
        for product in sample_products:
            db.add(product)
        
        db.commit()
        print(f"✓ {len(sample_products)} productos de prueba insertados")
        
        # Mostrar productos insertados
        print("\nProductos en la base de datos:")
        all_products = db.query(ProductModel).all()
        for p in all_products:
            print(f"  - {p.sku}: {p.name} (Stock: {p.stock})")
        
    except Exception as e:
        print(f"✗ Error al insertar datos: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Función principal."""
    print("=" * 60)
    print("Inicialización de Base de Datos - Sistema de Inventario")
    print("=" * 60)
    
    create_tables()
    
    response = input("\n¿Desea insertar datos de prueba? (s/n): ")
    if response.lower() == 's':
        insert_sample_data()
    
    print("\n" + "=" * 60)
    print("Inicialización completada")
    print("=" * 60)


if __name__ == "__main__":
    main()
