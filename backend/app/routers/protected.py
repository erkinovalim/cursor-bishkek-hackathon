from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.deps import get_current_user, require_roles, to_user_response
from app.schemas import Role, UserResponse
from app.users import User

router = APIRouter(prefix="/protected", tags=["protected"])


@router.get("/profile", response_model=UserResponse)
def read_profile(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return to_user_response(current_user)


@router.get("/admin")
def admin_only(current_user: Annotated[User, Depends(require_roles(Role.admin))]) -> dict:
    return {"message": f"Welcome, admin {current_user.email}"}
