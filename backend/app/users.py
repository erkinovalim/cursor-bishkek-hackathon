from dataclasses import dataclass
from uuid import uuid4

from fastapi import HTTPException, status

from app.schemas import Role, UserCreate


@dataclass
class User:
    id: str
    email: str
    hashed_password: str
    role: Role


_users: dict[str, User] = {}


def get_user_by_email(email: str) -> User | None:
    return next((user for user in _users.values() if user.email == email), None)


def get_user_by_id(user_id: str) -> User | None:
    return _users.get(user_id)


def create_user(payload: UserCreate, hashed_password: str) -> User:
    if get_user_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        id=str(uuid4()),
        email=payload.email,
        hashed_password=hashed_password,
        role=payload.role,
    )
    _users[user.id] = user
    return user
