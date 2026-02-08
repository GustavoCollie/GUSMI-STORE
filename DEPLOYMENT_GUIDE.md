# Deployment Guide: Vercel + Supabase

Follow these steps to deploy your inventory system to production.

## 1. Supabase Setup
You have already provided the project details. Ensure the following environment variables are ready for Vercel.

**Supabase PostgreSQL Connection String:**
`postgresql://postgres:[YOUR_PASSWORD]@db.wbjikwsuakjrcokgklxl.supabase.co:5432/postgres`
*(Replace `[YOUR_PASSWORD]` with your Supabase database password)*

## 2. Vercel Backend Deployment
1. Connect your GitHub repository to Vercel.
2. Select the `backend` folder as the root for the backend project (if deploying separately) or use monorepo settings.
3. Configure the following **Environment Variables** in Vercel:
   - `REPOSITORY_TYPE`: `postgres`
   - `DATABASE_URL`: Su URL de Supabase. **IMPORTANTE**: Use la URL del **Transaction Pooler** (Puerto 6543) para Vercel (SIN `?pgbouncer=true`).
   - `SECRET_KEY`: Genere una clave segura (ej: `python scripts/generate_secrets.py`).
   - `API_KEY`: Genere una clave segura para la administración (ej: `dev-secret-key-123`).
   - `ALLOWED_ORIGINS`: Lista separada por comas de tus URLs de frontend. **IMPORTANTE**: Incluye todas las variantes.
     - Ejemplo: `https://gusmi-store-i8u8.vercel.app,https://almacenes-gusmi.vercel.app`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: For email notifications.

## 3. Despliegue del Frontend (Administración) en Vercel
1. Conecta el repositorio a Vercel.
2. Selecciona la carpeta `frontend` como raíz.
3. Variables de entorno:
   - `VITE_API_URL`: `https://gusmi-store.vercel.app/api/v1` (SIN barra final)
   - `VITE_API_KEY`: El mismo valor que pusiste en el backend.

## 4. Despliegue de Gusmi Store (Tienda Pública) en Vercel
1. Conecta el repositorio a Vercel.
2. Selecciona la carpeta `gusmi-store` como raíz.
3. Variables de entorno:
   - `VITE_API_URL`: `https://gusmi-store.vercel.app/api/v1/public` (SIN barra final)
   - `VITE_SUPABASE_URL`: Tu URL de Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase.
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Tu clave pública de Stripe.

## 5. Inicialización de la Base de Datos
Una vez que el backend esté desplegado, puedes crear las tablas corriendo este comando localmente (apuntando a Supabase):

```bash
# Locally, update your .env with the Supabase URL, then run:
python -c "from src.infrastructure.database.config import init_db; init_db()"
```

## ⚠️ Important Security Note
The **Anon Key** and **Publishable Key** you provided are typically used for frontend Supabase client integration. If you plan to use Supabase Auth directly in the frontend, add them to your frontend environment variables as:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
