from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from jose import jwt, JWTError
from typing import Annotated
from mainpy.src.security.token_data import TokenData
from mainpy.src.settings.settings import settings
from mainpy.src.services.user_service import get_user_by_id, authenticate_user
from mainpy.src.security.security import create_access_token


class Token(BaseModel):
    access_token: str
    #refresh_token: str
    token_type: str

token_router = APIRouter()

def verify_token_func(token: Annotated[str,Header()]):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenData(id=payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")

@token_router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_LIFETIME)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@token_router.post("/verify_token")
async def verify_token (token : Annotated[TokenData,Depends(verify_token_func)]):
    return {"status": "Token is valid", "token_data" : token}