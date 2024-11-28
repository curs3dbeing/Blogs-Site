from fastapi import APIRouter, Path, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID

from mainpy.src.reactions.reaction import Reaction, AllReactions
from mainpy.src.users.user import User, get_current_user

from mainpy.src.services.reaction_service import add_reaction_to_post, get_all_reactions_to_post, delete_reaction_from_post


reaction_router = APIRouter()

@reaction_router.post('/post/{post_id}/add_reaction')
async def add_reaction(reaction: Reaction,
                       post_id: UUID = Path(...),
                       current_user: User = Depends(get_current_user)):
    try:
        add_reaction_to_post(post_id, reaction, current_user.id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=str(e))
    return reaction

@reaction_router.get('/post/{post_id}/get_reactions', status_code=status.HTTP_200_OK)
async def get_reactions(post_id: UUID = Path(...), responce_model=AllReactions):
    try:
        result = get_all_reactions_to_post(post_id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=str(e))
    return result

@reaction_router.delete('/post/{post_id}/delete_reaction')
async def delete_reaction(reaction: Reaction,
                          post_id: UUID = Path(...),
                          current_user: User = Depends(get_current_user)):
    try:
        delete_reaction_from_post(post_id, reaction, current_user.id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=str(e))