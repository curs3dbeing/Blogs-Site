from pydantic import BaseModel
from uuid import UUID

class TokenData(BaseModel):
    id : UUID