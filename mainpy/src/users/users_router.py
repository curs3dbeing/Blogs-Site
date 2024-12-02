from sqlalchemy.exc import SQLAlchemyError
import smtplib
from mainpy.src.security.security import create_access_token, oauth2_scheme, password_hash
from mainpy.src.users.user import User, get_current_user, get_current_active_user, UserModel, \
    get_current_active_user_model, UserRoles
from fastapi import APIRouter, HTTPException, Depends, Body, Query
from pydantic import ValidationError
from enum import Enum
from typing import Annotated
from jose import jwt, JWTError
from mainpy.src.security.token import TokenData
from mainpy.src.settings.settings import settings, Settings
from mainpy.src.security.token import verify_token_func
from mainpy.src.services.user_service import user_insert, get_user_by_login, match_password, update_password, \
    get_user_by_id, get_usermodel_by_id, update_user_login, update_user_about, update_ban_user_by_id, \
    verificate_user_data, get_user_by_email, get_user_verification_send
from mainpy.src.mail_sender import send_verification_message, send_changepassword_message
from mainpy.src.settings.settings import settings
from datetime import timedelta
from uuid import UUID
from hashlib import sha256

class RegistrationExceptions(str,Enum):
    email_regex : str = 'Invalid email'
    login_length : str = 'Wrong login length'
    login_exists : str = 'User with such login already exists'

users_router = APIRouter()

@users_router.post("/signup",status_code=200)
async def signup(username : Annotated[str,Body(...)], password : Annotated[str,Body(...)], email :Annotated[str,Body(...)]):
    try:
        new_user = User(login=username, password=password,email=email, role='User', disabled=True)
    except ValidationError as e:
        raise HTTPException(407,str(e))
    if user_insert(new_user) is None:
        raise HTTPException(406,'Such login or email already exists')
    else:
        return new_user

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

@users_router.put("/profile_update_block/{userID}")
async def update_block_user(userID : UUID,
                            current_user: UserModel = Depends(get_current_active_user_model)):
    if current_user.role != UserRoles.Admin:
        return {"status": "Method not allowed"}
    else:
        try:
            update_ban_user_by_id(userID)
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=e)
    return {"status": "User Updated Successfully"}


@users_router.post("/change_password")
async def change_password(email: str,password: str):
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    else:
        hashed_pass = password_hash(password)
        if hashed_pass == user.password:
            return {"status" : "Same password"}
        update_password(user.id, password)
    return {"status": "Password Changed Successfully"}

@users_router.get("/user/username")
async def get_author(auth_id: UUID):
    try:
        result = get_usermodel_by_id(auth_id)
        if result is None:
            return {
                "status": "User not found",
            }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=e)
    user : UserModel = UserModel(id=result.id,email=result.email,login=result.login,disabled=result.disabled,created_at=result.created_at,about=result.about, role=result.role)
    return user

@users_router.put("/user/update_login")
async def update_login(login: str | None,userid : UUID, current_user : UserModel = Depends(get_current_active_user_model)):
    if current_user.id!=userid:
        return {"status": "Method not allowed"}
    if login is None:
        return {"status": "No login"}
    if login == "":
        return {"status": "No login"}
    else:
        try:
            update_user_login(login,userid)
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=e)
        return {"status": "Login Updated Successfully"}

@users_router.put("/user/update_about")
async def update_about(about: str | None,userid : UUID, current_user : UserModel = Depends(get_current_active_user_model)):
    if current_user.id!=userid:
        return {"status": "Method not allowed"}
    else:
        if about is None:
            return {"status" : "OK"}
        try:
            update_user_about(about,userid)
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=e)
        return {"status": "About Updated Successfully"}

@users_router.get("/check/login/")
async def check_login(login: str):
    user_login = get_user_by_login(login)
    if user_login is None:
        return {"status": "OK"}
    else:
        raise HTTPException(status_code=406, detail="Login already taken")


@users_router.post("/send_verification/{userID}")
async def send_verification(userID : UUID):
    user = get_user_by_id(userID)
    get_user_verification_send(user)
    if user is None:
        raise HTTPException(407,'no user')
    send_verification_message(user.email, userID)
    return {"status" : "Email send"}

@users_router.post("/change/password/")
async def send_change_password(email : str):
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(406,'No user')
    else:
        send_changepassword_message(email, user.id)
    return {"status": "Email send"}



@users_router.get("/verificate/{cypher}")
async def verificate_user(cypher : str, user_id : UUID = Query(None)):
    data = str(user_id) + settings.SECRET_KEY
    hashed_uuid = sha256(str(data).encode()).hexdigest()
    if hashed_uuid != cypher:
        raise HTTPException(status_code=406, detail="Invalid verification data")
    else:
        verificate_user_data(user_id)
    return {"status": "User Verified"}