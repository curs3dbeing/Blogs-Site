from sqlalchemy import create_engine, Engine
from mainpy.src.settings.settings import settings

class Database:
    engine : Engine = create_engine(f'postgresql+psycopg2://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}'
                           f':{settings.POSTGRES_PORT}/{settings.POSTGRES_DATABASE}')

    @staticmethod
    def connect():
        try:
            connection = Database.engine.connect()
            if connection:
                return connection
            else:
                raise ConnectionError
        except ConnectionError as e:
            print("CONNECTION ERROR", e)


database = Database()