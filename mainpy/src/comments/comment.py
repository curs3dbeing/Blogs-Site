from pydantic import BaseModel, Field
from uuid import uuid4, UUID
from datetime import datetime

class Comment(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    context: str = Field(min_length=1)

class CommentLikes(Comment):
    likes: int = Field(gt=0)
    dislikes: int = Field(lt=0)

class CommentInfo(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    context: str = Field(min_length=1)
    author: UUID | None = None
    author_username: str | None = None
    comment_created_at: datetime = Field(default_factory=datetime.now)