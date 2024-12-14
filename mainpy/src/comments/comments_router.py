from fastapi import APIRouter, Path, Body, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from typing import Annotated
from mainpy.src.security.security import oauth2_scheme
from mainpy.src.comments.comment import Comment, CommentInfo
from mainpy.src.services.post_service import get_post_by_id
from mainpy.src.users.user import User, UserModel, get_current_user, UserRoles, get_current_active_user_model
from mainpy.src.services.comment_service import add_comment, delete_comment_by_comment, get_comment_author, \
    get_comments, delete_comment_by_id, get_comment_by_id
from uuid import UUID

comments_router = APIRouter()

@comments_router.post('/post_comment/{post_id}')
async def create_comment(comment: CommentInfo,
                         post_id: UUID,
                          current_user: User = Depends(get_current_active_user_model)):
    try:
        post = get_post_by_id(post_id)
        if post is None:
            raise HTTPException(status_code=404, detail='Post not found')
        comment.author=current_user.id
        add_comment(comment=comment,post_id=post_id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return comment

@comments_router.get('/post/comments/{post_id}')
async def get_post_comments(offset: int, post_id: UUID) -> tuple[int, list[CommentInfo]]:
    count, comments = get_comments(post_id, offset)
    return count, comments



@comments_router.delete('/delete_comment/{post_id}')
async def delete_comment(commentID: UUID,
                         author: UUID,
                         post_id: UUID,
                         current_user: User = Depends(get_current_active_user_model)):
    if (author != current_user.id) & (current_user.role != UserRoles.Moderator) & (current_user.role != UserRoles.Admin):
        raise HTTPException(status_code=403,detail="You do not have permission to delete this comment")
    else:
        try:
            post = get_post_by_id(post_id)
            if post is None:
                raise HTTPException(status_code=404, detail='Post not found')
            comment = get_comment_by_id(commentID)
            if comment is None:
                raise HTTPException(status_code=405, detail='Comment not found')
            delete_comment_by_id(commentID)
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {
        "status": "Comment deleted successfully",
    }