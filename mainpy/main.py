from fastapi import FastAPI
from mainpy.src.users.users_router import users_router
from mainpy.src.posts.posts_router import posts_router
from mainpy.src.comments.comments_router import comments_router
from mainpy.src.reactions.reaction_router import reaction_router
from mainpy.src.tags.tags_router import tags_router
from mainpy.src.security.token import token_router
from mainpy.src.pages.page_router import page_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(page_router)
app.include_router(token_router)
app.include_router(users_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(reaction_router)
app.include_router(tags_router)