from fastapi import APIRouter, Path, Body, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from typing import Annotated
from mainpy.src.security.security import oauth2_scheme
from mainpy.src.comments.comment import Comment, CommentInfo
from mainpy.src.users.user import User, UserModel, get_current_user, UserRoles, get_current_active_user_model
from mainpy.src.services.comment_service import add_comment, delete_comment_by_comment, get_comment_author, get_comments
from uuid import UUID

comments_router = APIRouter()

@comments_router.post('/post_comment/{post_id}')
async def create_comment(comment: CommentInfo,
                         post_id: UUID=Path(),
                          current_user: User = Depends(get_current_active_user_model)):
    try:
        comment.author=current_user.id
        add_comment(comment=comment,post_id=post_id)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return comment

@comments_router.get('/post/comments/{post_id}')
async def get_post_comments(offset: int, post_id: UUID) -> tuple[int, list[CommentInfo]]:
    count, comments = get_comments(post_id, offset)
    return count, comments



@comments_router.delete('/posts/{post_id}')
async def delete_comment(comment: Comment,
                         post_id: UUID=Path(...),
                         current_user: User = Depends(get_current_user)):
    if (get_comment_author(comment) != current_user.id) & (current_user.role != UserRoles.Moderator) & (current_user.role != UserRoles.Admin):
        raise HTTPException(status_code=403,detail="You do not have permission to delete this comment")
    else:
        try:
            delete_comment_by_comment(comment=comment)
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {
        "status": "Comment deleted successfully",
        "comment": comment,
    }