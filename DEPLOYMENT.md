# Guía de Despliegue a Producción

Este documento detalla los pasos para desplegar el sistema de inventario y la tienda Gusmi Store a producción usando **Supabase** y **Vercel**.

## 1. Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ve a **Project Settings** > **Database** y copia la **Connection String** (URI).
   - *Nota:* Debe tener este formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
3. Asegúrate de que el backend esté configurado para usar esta URL.

## 2. Backend (FastAPI) en Vercel

1. Instala la Vercel CLI o conecta tu repositorio de GitHub a Vercel.
2. Configura las siguientes **Environment Variables** en Vercel:
   - `DATABASE_URL`: Tu Connection String de Supabase.
   - `STRIPE_API_KEY`: Tu clave secreta de Stripe.
   - `STRIPE_WEBHOOK_SECRET`: El secreto del webhook de Stripe.
   - `ECOMMERCE_FRONTEND_URL`: La URL final de tu frontend en Vercel.
   - `SECRET_KEY`: Una cadena aleatoria para JWT.
3. Despliega la carpeta `backend`.

## 3. Frontend (Gusmi Store) en Vercel

1. Conecta el repositorio o despliega la carpeta `gusmi-store`.
2. Configura las **Environment Variables**:
   - `VITE_API_URL`: La URL del backend desplegado en el paso anterior (ej: `https://tu-api.vercel.app/api/v1/public`).
3. El archivo `vercel.json` incluido manejará el ruteo de React.

## 4. Comandos de Utilidad

- **Limpieza de Datos**: Si necesitas resetear la base de datos en producción, puedes ejecutar localmente `python force_cleanup.py` apuntando a la `DATABASE_URL` de producción en tu `.env`.

> [!WARNING]
> Nunca compartas tu archivo `.env` ni tus claves privadas de Stripe.
