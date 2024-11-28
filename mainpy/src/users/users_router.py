from sqlalchemy.exc import SQLAlchemyError

from mainpy.src.security.security import create_access_token, oauth2_scheme
from mainpy.src.users.user import User, get_current_user, get_current_active_user, UserModel, get_current_active_user_model
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import ValidationError
from enum import Enum
from typing import Annotated
from jose import jwt, JWTError
from mainpy.src.security.token import TokenData
from mainpy.src.settings.settings import settings
from mainpy.src.security.token import verify_token_func
from mainpy.src.services.user_service import user_insert, get_user_by_login, match_password, update_password, get_user_by_id
from mainpy.src.settings.settings import settings
from datetime import timedelta
from uuid import UUID

class RegistrationExceptions(str,Enum):
    email_regex : str = 'Invalid email'
    login_length : str = 'Wrong login length'
    login_exists : str = 'User with such login already exists'

users_router = APIRouter()

@users_router.post("/signup",status_code=200)
async def signup(username : Annotated[str,Body(...)], password : Annotated[str,Body(...)], email :Annotated[str,Body(...)]):
    try:
        new_user = User(login=username, password=password,email=email, role='User')
    except ValidationError as e:
        raise HTTPException(406,str(e))
    if user_insert(new_user) is None:
        raise HTTPException(406,'Such login or email already exists')
    else:
        return {"status" : "Registered Successfully"}

@users_router.post("/authorize",status_code=200)
async def authorize(username : str, password : str):
    user = get_user_by_login(username)
    is_user = user is not None
    if is_user & match_password(user,password):
        data= {'sub': str(user.id)}
        token = create_access_token(data=data, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_LIFETIME))
        return {"status": "Authorized Successfully",
                "token": token}
    else:
        raise HTTPException(406, 'Wrong username or password')

@users_router.get("/users/me", response_model=UserModel)
async def get_me(data : Annotated[TokenData,Depends(verify_token_func)]):

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if data.id is None:
            raise credentials_exception

    user = get_user_by_id(data.id)

    if user is None:
        raise credentials_exception

    return user

@users_router.get("/users/user", response_model=UserModel)
async def get_user_model(current_user: UserModel = Depends(get_current_active_user_model)):
    return current_user


@users_router.post("/{current_user.id}/change_password")
async def change_password(email: str,
                          new_password: str,
                          current_user: User = Depends(get_current_user)):
    if email != current_user.email:
        raise HTTPException(406,'Invalid email')
    else:
        try:
            update_password(current_user.id, new_password)
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=e)
    return {"status": "Password Changed Successfully"}

@users_router.get("/user/username")
async def get_author(auth_id: UUID):
    try:
        user : UserModel | None = get_user_by_id(auth_id)
        if user is None:
            return {
                "status": "User not found",
            }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=e)
    return user