from fastapi import APIRouter, Query, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from mainpy.src.pages.page import Page, Post
from typing import List
from mainpy.src.services.page_service import get_page, get_amount_of_posts
from datetime import datetime


page_router = APIRouter()

@page_router.get("/posts/page/{offset}")
async def page_posts(offset: int, tags:List[int] = Query(None),
                     start_date:datetime = Query(None),
                     end_date: datetime = Query(None),
                     title_search: str = Query(None),
                     views_desc: bool = Query(None)) -> tuple[int,List[Post]]:
    try:
        posts, count = get_page(offset, tags, start_date, end_date, title_search, views_desc)
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(406, str(e))
    return count, posts
