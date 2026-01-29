
from fastapi import APIRouter, Depends, HTTPException, status, Body

from src.application.auth_service import AuthService
from src.domain.schemas import (
    UserCreate, UserResponse, UserLogin, Token, 
    PasswordResetRequest, PasswordResetConfirm
)
from .dependencies import get_auth_service

router = APIRouter(tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: UserCreate,
    service: AuthService = Depends(get_auth_service)
):
    try:
        return await service.register_user(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
async def login(
    request: UserLogin,
    service: AuthService = Depends(get_auth_service)
):
    try:
        return await service.authenticate_user(request)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/verify-email")
async def verify_email(
    token: str = Body(..., embed=True),
    service: AuthService = Depends(get_auth_service)
):
    try:
        await service.verify_email(token)
        return {"message": "Email verified successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    service: AuthService = Depends(get_auth_service)
):
    await service.request_password_reset(request.email)
    return {"message": "If the email exists, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(
    request: PasswordResetConfirm,
    service: AuthService = Depends(get_auth_service)
):
    try:
        await service.reset_password(request.token, request.new_password)
        return {"message": "Password reset successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
