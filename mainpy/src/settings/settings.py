from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    POSTGRES_USER: str = os.getenv('POSTGRES_USER')
    POSTGRES_PASSWORD: str = os.getenv('POSTGRES_PASSWORD')
    POSTGRES_PORT: int = os.getenv('POSTGRES_PORT')
    POSTGRES_HOST: str = os.getenv('POSTGRES_HOST')
    POSTGRES_DATABASE: str = os.getenv('POSTGRES_DATABASE')

    SECRET_KEY: str = os.getenv('SECRET_KEY')
    ALGORITHM: str = os.getenv('ALGORITHM')
    ACCESS_TOKEN_LIFETIME: int = os.getenv('ACCESS_TOKEN_LIFETIME')
    #REFRESH_TOKEN_LIFETIME: int = os.getenv('REFRESH_TOKEN_LIFETIME')

settings = Settings()