# Sistema de Gestión de Inventario para E-commerce

Sistema de gestión de inventario desarrollado con **FastAPI** siguiendo los principios de **Arquitectura Hexagonal** (Ports & Adapters).

## 🏗️ Arquitectura

Este proyecto implementa una arquitectura hexagonal con clara separación de responsabilidades:

```
src/
├── domain/              # Núcleo de negocio
│   ├── entities.py      # Entidades del dominio
│   └── exceptions.py    # Excepciones de negocio
├── ports/               # Interfaces/Contratos
│   └── repository.py    # Interface del repositorio
├── application/         # Casos de uso
│   └── services.py      # Servicios de aplicación
├── infrastructure/      # Adaptadores
│   ├── repositories/
│   │   └── in_memory_repository.py
│   └── api/
│       ├── routes.py
│       ├── api_models.py
│       └── dependencies.py
└── main.py             # Punto de entrada
```

### Principios Aplicados

- ✅ **SOLID**: Responsabilidad única, inversión de dependencias
- ✅ **Type Hints**: Tipado estático en todo el código
- ✅ **Domain-Driven Design**: Lógica de negocio encapsulada
- ✅ **Dependency Injection**: Desacoplamiento de componentes

## 🚀 Instalación y Ejecución

### Opción A: Con Docker (Recomendado)

#### Prerequisitos
- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))

#### Pasos

1. **Clonar o navegar al repositorio**
```bash
cd c:\Users\gusta\OneDrive\Escritorio\Inventario
```

2. **Construir las imágenes**
```bash
docker compose build
```

3. **Iniciar los servicios**
```bash
docker compose up -d
```

4. **Verificar que todo esté corriendo**
```bash
docker compose ps
```

La API estará disponible en `http://localhost:8000`

#### Comandos útiles

```bash
# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Reiniciar servicios
docker compose restart

# Acceder a la base de datos
docker compose exec db psql -U inventory_user -d inventory_db
```

---

### Opción B: Sin Docker (Desarrollo Local)

#### 1. Instalar PostgreSQL localmente

Descargar e instalar PostgreSQL desde https://www.postgresql.org/download/

#### 2. Crear base de datos

```bash
python -m venv venv
venv\Scripts\activate  # En Windows
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

## 💻 Uso

### Iniciar el servidor

```bash
uvicorn src.main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

### Documentación interactiva

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### Crear Producto

```bash
POST /api/v1/products
Content-Type: application/json

{
  "name": "Laptop HP Pavilion",
  "description": "Laptop con 16GB RAM",
  "price": 899.99,
  "stock": 10,
  "sku": "LAP-HP-001"
}
```

### Obtener Producto

```bash
GET /api/v1/products/{product_id}
```

### Recibir Stock

```bash
POST /api/v1/products/{product_id}/receive-stock
Content-Type: application/json

{
  "quantity": 5
}
```

### Vender Producto

```bash
POST /api/v1/products/{product_id}/sell
Content-Type: application/json

{
  "quantity": 3
}
```

## 🧪 Testing

```bash
# Ejecutar tests (una vez implementados)
pytest tests/
```

## 📋 Reglas de Negocio

1. **Stock no negativo**: El stock de un producto nunca puede ser menor a cero
2. **Venta validada**: No se puede vender más cantidad de la disponible
3. **Cantidades positivas**: Solo se aceptan cantidades positivas en operaciones de stock

## 🛠️ Tecnologías

- **Python 3.10+**
- **FastAPI** - Framework web moderno y rápido
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI

## 📝 Licencia

MIT License
