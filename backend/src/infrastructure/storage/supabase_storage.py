"""
Supabase Storage service for uploading product images and files.
Uses the Supabase Storage REST API via httpx.
"""
import os
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "products")


def is_configured() -> bool:
    """Check if Supabase Storage is configured."""
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)


def upload_file(
    path: str,
    file_bytes: bytes,
    content_type: str = "application/octet-stream",
    bucket: Optional[str] = None,
) -> str:
    """
    Upload a file to Supabase Storage and return its public URL.

    Args:
        path: Object path inside the bucket (e.g. "images/uuid_file.jpg")
        file_bytes: Raw file content
        content_type: MIME type of the file
        bucket: Bucket name (defaults to SUPABASE_STORAGE_BUCKET env var)

    Returns:
        Public URL of the uploaded file.

    Raises:
        RuntimeError: If the upload fails.
    """
    bucket = bucket or SUPABASE_STORAGE_BUCKET
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}"

    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    resp = httpx.post(url, content=file_bytes, headers=headers, timeout=30)

    if resp.status_code not in (200, 201):
        logger.error("Supabase Storage upload failed: %s %s", resp.status_code, resp.text)
        raise RuntimeError(f"Supabase Storage upload failed ({resp.status_code}): {resp.text}")

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}"
    logger.info("Uploaded to Supabase Storage: %s", public_url)
    return public_url
