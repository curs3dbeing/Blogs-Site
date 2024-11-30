from fastapi import APIRouter, Path, Depends, HTTPException, status, Query
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID

from mainpy.src.reactions.reaction import Reaction, AllReactions
from mainpy.src.users.user import User, get_current_user, UserModel, get_current_active_user_model

from mainpy.src.services.reaction_service import add_reaction_to_post, get_all_reactions_to_post, \
    delete_reaction_from_post, already_reacted_to_post

reaction_router = APIRouter()

@reaction_router.post('/post/{post_id}/add_reaction')
async def add_reaction(reaction: Reaction,
                       post_id: UUID,
                       current_user: UserModel = Depends(get_current_active_user_model)):
    try:
        add_reaction_to_post(post_id, reaction, current_user.id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=str(e))
    return reaction

@reaction_router.get('/post/{post_id}/get_reactions', status_code=status.HTTP_200_OK)
async def get_reactions(post_id: UUID, responce_model=AllReactions):
    try:
        result = get_all_reactions_to_post(post_id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=str(e))
    if len(result) == 0:
        return {
            "reaction" : {
                "id" : 1,
                "reaction_type" : "Like"
            },
            "count" : "0"
        }
    else:
        return {
            "reaction" : {
                "id" : {result[0].reaction.id},
                "reaction_type" : {result[0].reaction.reaction_type}
            },
            "count" : result[0].count
        }

@reaction_router.get("/post/{post_id}/isliked")
async def isLiked(post_id: UUID,
                  reaction: Reaction=Query(None),
                  current_user: UserModel = Depends(get_current_active_user_model)):
    try:
        is_reacted:bool = already_reacted_to_post(post_id,reaction,current_user.id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=str(e))
    return {
        "is_reacted" : is_reacted
    }


@reaction_router.delete('/post/{post_id}/delete_reaction')
async def delete_reaction(post_id: UUID,
                          reaction: Reaction = Query(None),
                          current_user: UserModel = Depends(get_current_active_user_model)):
    try:
        delete_reaction_from_post(post_id, reaction, current_user.id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=str(e))
    return {"status": "Like deleted"}