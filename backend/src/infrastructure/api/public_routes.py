"""
Public API routes for the ecommerce storefront.
No API key required — open to the internet.
"""
import logging
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Header, Request

from src.domain.public_schemas import (
    PublicProductResponse,
    CustomerRegister,
    CustomerLogin,
    GoogleAuthRequest,
    CustomerTokenResponse,
    CreateCheckoutSessionRequest,
    CheckoutSessionResponse,
    EcommerceOrderCreate,
    EcommerceOrderResponse,
)
from .dependencies import (
    get_customer_auth_service,
    get_ecommerce_service,
    get_current_customer,
)
from src.application.customer_auth_service import CustomerAuthService
from src.application.ecommerce_service import EcommerceService
from src.infrastructure.database.models import CustomerModel

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Public Ecommerce"])


# ─── Products ────────────────────────────────────────────────────

@router.get("/products", response_model=list[PublicProductResponse])
def public_list_products(
    ecommerce: EcommerceService = Depends(get_ecommerce_service),
):
    products = ecommerce.list_public_products()
    now = datetime.now(timezone(timedelta(hours=-5)))
    result = []
    for p in products:
        # Preorder is active if:
        # 1. Manually marked as preorder and has no stock (even if date passed, until arrived)
        # 2. Has pending purchase orders and has no stock (automatic preorder/coming soon)
        # OR 3. Manually marked, date hasn't passed (standard logic)
        
        is_preorder_marked = p.is_preorder
        date_passed = p.estimated_delivery_date is not None and p.estimated_delivery_date <= now
        
        preorder_active = (is_preorder_marked or p.has_pending_purchase_orders) and p.stock <= 0
        if is_preorder_marked and not date_passed:
            preorder_active = True
        
        # General Visibility: Show if has stock OR (stock is 0 BUT has pending PO or is marked preorder)
        # This keeps the product visible even if the PROMO price expired but stock hasn't arrived.
        visibility_active = p.stock > 0 or is_preorder_marked or p.has_pending_purchase_orders
        
        if not visibility_active:
            continue

        # UI Status:
        # - If preorder_active: show as "PRE-VENTA" with promo price
        # - If stock is 0 but has pending PO / marked preorder (and date passed): show as "PRÓXIMO ARRIBO" (retail price)
        # - Else: Standard product
        
        final_is_preorder = preorder_active
        is_coming_soon = p.stock <= 0 and not preorder_active and (is_preorder_marked or p.has_pending_purchase_orders)
        
        result.append(PublicProductResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            stock=p.stock,
            retail_price=p.retail_price,
            image_path=p.image_path,
            is_preorder=final_is_preorder,
            preorder_price=p.preorder_price if final_is_preorder else None,
            estimated_delivery_date=p.estimated_delivery_date if final_is_preorder else None,
            preorder_description=p.preorder_description if final_is_preorder else ("Próximo arribo" if is_coming_soon else None),
        ))
    return result


@router.get("/products/{product_id}", response_model=PublicProductResponse)
def public_get_product(
    product_id: UUID,
    ecommerce: EcommerceService = Depends(get_ecommerce_service),
):
    product = ecommerce.get_public_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    now = datetime.now(timezone(timedelta(hours=-5)))
    
    is_preorder_marked = product.is_preorder
    date_passed = product.estimated_delivery_date is not None and product.estimated_delivery_date <= now
    
    preorder_active = (is_preorder_marked or product.has_pending_purchase_orders) and product.stock <= 0
    if is_preorder_marked and not date_passed:
        preorder_active = True
    
    # UI Status and Visibility
    final_is_preorder = preorder_active
    is_coming_soon = product.stock <= 0 and not preorder_active and (is_preorder_marked or product.has_pending_purchase_orders)

    return PublicProductResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        stock=product.stock,
        retail_price=product.retail_price,
        image_path=product.image_path,
        is_preorder=final_is_preorder,
        preorder_price=product.preorder_price if final_is_preorder else None,
        estimated_delivery_date=product.estimated_delivery_date if final_is_preorder else None,
        preorder_description=product.preorder_description if final_is_preorder else ("Próximo arribo" if is_coming_soon else None),
    )


# ─── Customer Auth ────────────────────────────────────────────────

@router.post("/auth/register", response_model=CustomerTokenResponse)
def customer_register(
    body: CustomerRegister,
    auth_service: CustomerAuthService = Depends(get_customer_auth_service),
):
    try:
        customer = auth_service.register(
            email=body.email,
            password=body.password,
            full_name=body.full_name,
            phone=body.phone,
        )
        token = auth_service.create_token(customer)
        return CustomerTokenResponse(
            access_token=token,
            customer_id=customer.id,
            email=customer.email,
            full_name=customer.full_name,
            has_discount=customer.has_discount,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/login", response_model=CustomerTokenResponse)
def customer_login(
    body: CustomerLogin,
    auth_service: CustomerAuthService = Depends(get_customer_auth_service),
):
    try:
        customer = auth_service.login(email=body.email, password=body.password)
        token = auth_service.create_token(customer)
        return CustomerTokenResponse(
            access_token=token,
            customer_id=customer.id,
            email=customer.email,
            full_name=customer.full_name,
            has_discount=customer.has_discount,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/auth/google", response_model=CustomerTokenResponse)
def customer_google_auth(
    body: GoogleAuthRequest,
    auth_service: CustomerAuthService = Depends(get_customer_auth_service),
):
    try:
        customer = auth_service.google_auth(credential=body.credential)
        token = auth_service.create_token(customer)
        return CustomerTokenResponse(
            access_token=token,
            customer_id=customer.id,
            email=customer.email,
            full_name=customer.full_name,
            has_discount=customer.has_discount,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# ─── Checkout ─────────────────────────────────────────────────────

@router.post("/checkout/create-session", response_model=CheckoutSessionResponse)
def create_checkout_session(
    body: CreateCheckoutSessionRequest,
    ecommerce: EcommerceService = Depends(get_ecommerce_service),
):
    try:
        logger.info(f"Creando sesión de checkout para {body.customer_email}")
        result = ecommerce.create_checkout_session(
            items=body.items,
            customer_email=body.customer_email,
            customer_name=body.customer_name,
            shipping_address=body.shipping_address,
            apply_discount=body.apply_discount,
        )
        logger.info(f"Sesión creada exitosamente. URL: {result.get('checkout_url')}")
        return CheckoutSessionResponse(**result)
    except ValueError as e:
        logger.error(f"Error al crear sesión de checkout: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/checkout/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    from src.application.stripe_service import StripeService

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = StripeService.construct_webhook_event(payload, sig_header)
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        logger.info(f"Checkout session completed: {event['data']['object']['id']}")

    return {"status": "ok"}


# ─── Orders ───────────────────────────────────────────────────────

@router.post("/orders", response_model=EcommerceOrderResponse)
def create_order_from_session(
    body: EcommerceOrderCreate,
    ecommerce: EcommerceService = Depends(get_ecommerce_service),
):
    try:
        result = ecommerce.create_orders_from_session(session_id=body.session_id)
        return EcommerceOrderResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/orders/my-orders")
def get_my_orders(
    customer: CustomerModel = Depends(get_current_customer),
    ecommerce: EcommerceService = Depends(get_ecommerce_service),
):
    orders = ecommerce.get_customer_orders(customer.email)
    return orders
