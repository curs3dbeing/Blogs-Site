

from pydantic import BaseModel, field_validator, Field
from mainpy.src.security.security import oauth2_scheme
from fastapi import Depends, status, HTTPException
from jose import jwt, JWTError
from typing import Annotated
from mainpy.src.services.user_service import get_user_by_login
from mainpy.src.settings.settings import settings
from mainpy.src.services.user_service import get_user_by_id
from mainpy.src.security.token_data import TokenData
from mainpy.src.security.token import verify_token_func
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4
import re

email_regex=r'^[a-zA-Z0-9._%+-]+@(gmail|mail|rumbler|yandex|outlook|bsuir)\.[a-z]{2,3}$'

class UserRoles(str, Enum):
    Admin = 'Admin'
    Moderator = 'Moderator'
    User = 'User'

class User(BaseModel):
    id: UUID=Field(default_factory=uuid4)
    login: str
    password: str
    email: str
    created_at: datetime = Field(default_factory=datetime.now)
    role: UserRoles
    about: str | None = None
    disabled: bool = Field(default=True)

class UserModel(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    login: str
    email: str
    created_at: datetime = Field(default_factory=datetime.now)
    role: UserRoles
    about: str | None = None
    disabled: bool = Field(default=False)

    @property
    def password(self):
        return self.password

    @field_validator('email')
    def validate_email(cls, value):
        if not re.match(email_regex, value):
            raise ValueError('Invalid email')
        return value

    @field_validator('login')
    def validate_login(cls, value : str):
        login_min_len=5
        login_max_len=15
        if len(value) < login_min_len or len(value) > login_max_len:
            raise ValueError('Invalid login length')
        return value


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        id = payload.get("sub")
        if id is None:
            raise credentials_exception
        token_data = TokenData(id=id)
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(token_data.id)
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_model(data: Annotated[TokenData, Depends(verify_token_func)]) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user : User = get_user_by_id(data.id)
    if user is None:
        raise credentials_exception
    user_model = UserModel(id=user.id, login=user.login, email=user.email, created_at=user.created_at, role=user.role, disabled=user.disabled, about=user.about)
    return user_model


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    # if current_user.disabled
    # raise HTTPException(status_code=400,detail="Inactive user")
    return current_user

async def get_current_active_user_model(current_user:UserModel = Depends(get_current_user_model)) -> UserModel:
    if current_user.disabled:
        raise HTTPException(status_code=400,detail="Inactive user")
    return current_user