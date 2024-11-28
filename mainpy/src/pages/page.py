from pydantic import BaseModel

from mainpy.src.posts.post import Post

class Page(BaseModel):
    page: list[Post]
    page_number: int
    