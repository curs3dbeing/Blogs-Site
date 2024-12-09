from fastapi import APIRouter, HTTPException, Depends, Query, File, UploadFile
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import pandas as pd
import io
from sqlalchemy.exc import SQLAlchemyError
from mainpy.src.posts.post import Post, PostTags
from mainpy.src.services.post_service import add_post, get_post_by_id, delete_post_by_post, get_post_tags_by_id, \
    upload_csv_post
from mainpy.src.services.user_service import get_user_by_id
from mainpy.src.users.user import get_current_active_user, User, UserRoles, UserModel, get_current_active_user_model
from uuid import UUID

posts_router=APIRouter()

@posts_router.post('/create_post', status_code=200)
async def create_post(post : Post,
                      current_user: User = Depends(get_current_active_user_model)):
    try:
        post.author= current_user.id
        add_post(post)
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return post


@posts_router.get("/posts/{post_id}")
async def get_post(post_id:UUID):
    post = get_post_by_id(post_id)
    if post is None:
        return {
            "Post": "post not found"
        }
    else:
        return post

@posts_router.get("/posts/author/{author}", response_model=UserModel | None)
async def get_author(author:UUID):
    user = get_user_by_id(author)
    return user

class DeletePostRequest(BaseModel):
    reason: str

@posts_router.delete("/posts_delete/{post_id}")
async def delete_post(post_id:UUID,
                      request: DeletePostRequest,
                      current_user: User = Depends(get_current_active_user_model)):
    post : Post=get_post_by_id(post_id)
    if (post.author != current_user.id) & (current_user.role != UserRoles.Moderator) & (current_user.role != UserRoles.Admin):
        return {
            "status" : "You do not have permission to delete this post"
        }
    else:
        delete_post_by_post(post_id, current_user.id, request.reason)
        return {
            "status" : "Post deleted"
        }

@posts_router.get("/export/csv/{post_id}")
async def export_csv(post_id:UUID):
    data = get_post_by_id(post_id)
    df = pd.DataFrame(data)
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    return StreamingResponse(io.BytesIO(csv_buffer.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=export.csv"})

@posts_router.post("/import_post/csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        return {"error": "File is not a CSV"}
    upload_csv_post(file)
    return {"status": "success"}


@posts_router.get("/poststags/{post_id}", response_model=PostTags)
async def get_post_tags(post_id:UUID):
    post = get_post_tags_by_id(post_id)
    if post is None:
        return {
            "Post": "post not found"
        }
    else:
        return post