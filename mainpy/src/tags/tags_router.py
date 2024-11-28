from fastapi import APIRouter, status, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from mainpy.src.services.tag_service import get_all_tags

tags_router = APIRouter()

@tags_router.get('/get_tags', status_code=status.HTTP_200_OK)
async def get_tags():
    try:
        tags_dict = get_all_tags()
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return tags_dict