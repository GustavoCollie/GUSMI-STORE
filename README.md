# Sistema de Gestión de Inventario "Almacenes GUSMI"

Sistema de gestión de inventario profesional desarrollado con **FastAPI** siguiendo los principios de **Arquitectura Hexagonal** (Ports & Adapters) y **Diseño Atómico**. El sistema incluye funcionalidades avanzadas como trazabilidad documental, generación de actas en PDF, notificaciones por correo y tareas automatizadas.

## 🏗️ Arquitectura y Tecnologías

### Backend
- **FastAPI**: Framework principal de alto rendimiento.
- **SQLAlchemy**: ORM para gestión de base de datos (PostgreSQL/SQLite).
- **APScheduler**: Motor de tareas programadas (Cron Jobs).
- **ReportLab**: Generación dinámica de reportes en PDF.
- **SMTPLib**: Servicio de mensajería para notificaciones por correo.
- **Pydantic**: Validación de esquemas y tipos de datos.
- **SlowAPI**: Protección contra abusos mediante Rate Limiting.

### Frontend
- **React.js**: Biblioteca para la interfaz de usuario.
- **Vite**: Herramienta de construcción ultra rápida.
- **Tailwind CSS**: Estilizado moderno y responsivo.

## 📧 Servicio de Correo y Notificaciones

El sistema cuenta con un adaptador de correo (`SMTPEmailService`) que gestiona tres tipos de envíos:
1. **Verificación de Cuenta**: Enlace seguro para nuevos registros.
2. **Actas de Entrega**: Envío automático de recibos PDF al registrar salidas.
3. **Recordatorios de Devolución**: Notificaciones automáticas para artículos devolutivos.

### Configuración SMTP
Se utilizan variables de entorno para la configuración:
- `SMTP_HOST`: Servidor de correo (ej. smtp.gmail.com).
- `SMTP_PORT`: Puerto (587 para TLS).
- `SMTP_USER`: Usuario/Email.
- `SMTP_PASSWORD`: Contraseña o App Password.

## ⏰ Tareas Programadas (Cron Jobs)

Se implementa un servicio de **Scheduler** basado en `APScheduler` que corre en segundo plano junto a la API:
- **Check de Vencimientos**: Se ejecuta diariamente (configurado por defecto a las 8:00 AM) para buscar artículos que deben devolverse al día siguiente y envía un correo preventivo al solicitante.

## 🛒 Módulo de Compras (KPIs)

El nuevo módulo de Compras permite gestionar proveedores y órdenes de compra, midiendo:
- **Calidad**: % de pedidos rechazados por defectos.
- **Costes**: Coste Total de Adquisición (CTA) y Ahorros Totales.
- **Plazos**: Cumplimiento de fechas de entrega (Lead Time).

## 📄 Generación de Actas (PDF)

Al registrar una salida de almacén, el sistema genera automáticamente un **Acta de Recepción/Despacho** que incluye:
- Detalles del producto y cantidades.
- Datos del solicitante y área.
- Fecha límite de retorno (si aplica).
- Espacios para firmas digitales/físicas.
- Trazabilidad por referencia/guía.

## 📡 API Endpoints Principales

### Productos e Inventario
- `GET /api/v1/products`: Listar inventario completo.
- `POST /api/v1/products`: Crear producto con carga de documento inicial.
- `PATCH /api/v1/products/{id}`: Actualización parcial y trazabilidad.
- `POST /api/v1/purchasing/orders`: Creación de órdenes de compra.
- `GET /api/v1/purchasing/kpis`: Métricas de Calidad, Costes y Plazos.
- `POST /api/v1/products/{id}/receive-stock`: Entrada de mercancía con adjuntos.
- `POST /api/v1/products/{id}/sell`: Salida de mercancía (soporta flujos devolutivos y correos automáticos).
- `GET /api/v1/products/movements`: Historial completo de trazabilidad.

### 🛡️ Seguridad y Rendimiento (Nuevos)
- **Rate Limiting**: Protección contra ataques de fuerza bruta en `/auth/login` y `/auth/register`.
- **Paginación**: Todos los endpoints de listado soportan `skip` y `limit` para manejar grandes volúmenes de datos.
- **Health Check**: Endpoint `/health` para monitoreo de estado.

### Autenticación
- `POST /api/v1/auth/register`: Registro de nuevos usuarios.
- `POST /api/v1/auth/login`: Obtención de token JWT.

## 🚀 Instalación y Ejecución

### Requisitos
- Python 3.10+
- Node.js 18+
- PostgreSQL (Opcional, soporta SQLite por defecto)

### Pasos rápidos
1. clonar repositorio.
2. Configurar `.env` en `/backend`.
3. Instalar dependencias: `pip install -r requirements.txt`.
4. Ejecutar backend: `uvicorn src.main:app --reload`.
5. Ejecutar frontend: `npm install && npm run dev`.

### 🧪 Pruebas (Testing)
El sistema incluye una suite de pruebas unitarias e integración:
```powershell
cd backend
python -m pytest tests/
```

### 🔐 Seguridad en Producción
Para entornos de producción, asegúrese de:
1. Generar llaves únicas ejecutando: `python scripts/generate_secrets.py`.
2. Configurar `ALLOWED_ORIGINS` con los dominios reales en el `.env`.
3. Utilizar un servicio SMTP real (se recomienda configurar TLS en puerto 587).

---
Desarrollado para el control eficiente de almacenes y suministros.
