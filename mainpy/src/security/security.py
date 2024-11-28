from hashlib import sha256
from datetime import datetime, timedelta, timezone
from mainpy.src.settings.settings import settings
from fastapi.security import OAuth2PasswordBearer
from jose import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def password_hash(password:str) -> str:
    return sha256(password.encode('utf-8')).hexdigest()

def verify(plain_password, hashed_password):
    return password_hash(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt