from pydantic import BaseModel, Field
from typing import Annotated, List
from mainpy.src.tags.tag import Tag, TagName
from datetime import datetime
from uuid import uuid4, UUID

class Post(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(default='Title', min_length=10, max_length=100)
    content: str = Field(default='Content')
    author: UUID | None = None
    tags: Annotated[List[Tag],Field(min_length=1)] | None = None
    views: Annotated[int,Field(default=0)] | None = None
    post_created_at: datetime = datetime.now()

class PostTags(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(default='Title', min_length=10, max_length=100)
    content: str = Field(default='Content')
    author: UUID | None = None
    tags: Annotated[List[TagName], Field(min_length=1)] | None = None
    views: Annotated[int, Field(default=0)] | None = None
    post_created_at: datetime = datetime.now()