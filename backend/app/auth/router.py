from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.deps import get_current_user, to_user_response
from app.auth.jwt import create_access_token, hash_password, verify_password
from app.schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.users import User, create_user, get_user_by_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate) -> UserResponse:
    user = create_user(payload, hash_password(payload.password))
    return to_user_response(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin) -> TokenResponse:
    user = get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return to_user_response(current_user)
