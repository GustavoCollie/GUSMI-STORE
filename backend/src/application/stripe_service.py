"""
Stripe Checkout integration service.
"""
import os
from decimal import Decimal
from typing import List
from uuid import uuid4

import stripe


ECOMMERCE_FRONTEND_URL = os.getenv("ECOMMERCE_FRONTEND_URL", "http://localhost:5174")
_MOCK_SESSIONS = {}  # Store mock metadata in memory for dev simulation


class StripeService:
    DISCOUNT_PERCENT = Decimal("0.02")  # 2%

    def create_checkout_session(
        self,
        items: list,
        customer_email: str,
        apply_discount: bool = False,
    ) -> dict:
        """
        Create a Stripe Checkout Session.
        Each item: {product_name, unit_price (Decimal), quantity (int), product_id (str)}
        """
        api_key = os.getenv("STRIPE_API_KEY", "")
        
        # Detect if we should use mock mode
        is_mock = os.getenv("MOCK_STRIPE", "false").lower() == "true" or not api_key or api_key == "xxxx"
        
        if is_mock:
            import json
            mock_session_id = f"mock_session_{uuid4()}"
            items_json = json.dumps([
                {"product_id": str(i["product_id"]), "quantity": i["quantity"],
                 "unit_price": str(i["unit_price"]), "product_name": i["product_name"]}
                for i in items
            ])
            success_url = f"{ECOMMERCE_FRONTEND_URL}/order-confirmation?session_id={mock_session_id}"
            
            # Store mock session metadata
            _MOCK_SESSIONS[mock_session_id] = {
                "customer_email": customer_email,
                "apply_discount": str(apply_discount),
                "items_json": items_json,
                "shipping_type": items[0].get("shipping_type", "PICKUP") if items else "PICKUP",
                "shipping_address": items[0].get("shipping_address", "") if items else "",
                "is_mock": "True"
            }
            
            return {"session_id": mock_session_id, "checkout_url": success_url, "is_mock": True}

        stripe.api_key = api_key
        line_items = []
        # Extract metadata from first item if passed through items list, or handle separately
        # (Assuming items[0] contains common metadata for simplicity in this flow)
        shipping_type = items[0].get("shipping_type", "PICKUP") if items else "PICKUP"
        shipping_address = items[0].get("shipping_address", "") if items else ""

        for item in items:
            stripe_price_id = item.get("stripe_price_id")

            if stripe_price_id:
                # Use pre-created Price ID from Stripe Dashboard
                line_items.append({
                    "price": stripe_price_id,
                    "quantity": item["quantity"],
                })
            else:
                # Fallback: inline price (current behavior)
                unit_price = Decimal(str(item["unit_price"]))
                if apply_discount:
                    unit_price = unit_price * (1 - self.DISCOUNT_PERCENT)
                unit_amount = int(unit_price * 100)

                product_data = {
                    "name": item["product_name"],
                    "metadata": {"product_id": str(item["product_id"])},
                }

                # Add image if available
                image_path = item.get("image_path")
                if image_path:
                    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
                    if image_path.startswith("http"):
                        full_image_url = image_path
                    else:
                        full_image_url = f"{backend_url}/uploads/{image_path}"
                    product_data["images"] = [full_image_url]

                line_items.append({
                    "price_data": {
                        "currency": "pen",
                        "product_data": product_data,
                        "unit_amount": unit_amount,
                    },
                    "quantity": item["quantity"],
                })

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            customer_email=customer_email,
            success_url=f"{ECOMMERCE_FRONTEND_URL}/order-confirmation?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{ECOMMERCE_FRONTEND_URL}/cart",
            metadata={
                "customer_email": customer_email,
                "apply_discount": str(apply_discount),
                "shipping_type": shipping_type,
                "shipping_address": shipping_address,
                "items_json": str([
                    {"product_id": str(i["product_id"]), "quantity": i["quantity"],
                     "unit_price": str(i["unit_price"]), "product_name": i["product_name"]}
                    for i in items
                ]),
            },
        )

        return {"session_id": session.id, "checkout_url": session.url}

    def verify_session(self, session_id: str) -> dict:
        """Retrieve and verify a completed Stripe checkout session."""
        if session_id.startswith("mock_session_"):
            # Retrieve stored mock metadata
            mock_data = _MOCK_SESSIONS.get(session_id, {
                "customer_email": "mock_customer@example.com",
                "is_mock": "True"
            })
            return {
                "payment_status": "paid",
                "customer_email": mock_data.get("customer_email"),
                "metadata": mock_data,
                "amount_total": 0,
            }

        stripe.api_key = os.getenv("STRIPE_API_KEY", "")
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status != "paid":
            raise ValueError("El pago no ha sido completado")
        return {
            "payment_status": session.payment_status,
            "customer_email": session.customer_email,
            "metadata": dict(session.metadata),
            "amount_total": session.amount_total,
        }

    @staticmethod
    def construct_webhook_event(payload: bytes, sig_header: str) -> object:
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
        return stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
