from typing import List
from mainpy.src.database.database import database
from mainpy.src.comments.comment import Comment, CommentInfo
from mainpy.src.services.user_service import get_user_by_id
from mainpy.src.users.user import UserModel
from sqlalchemy import text
from uuid import UUID

def add_comment(comment: CommentInfo, post_id: UUID):
    connection = database.connect()
    user : UserModel | None = get_user_by_id(comment.author)
    if user is None:
        query = text(
            "INSERT INTO comments(comment_id,comment,author,comment_created_at,author_username) VALUES ('{0}', '{1}','{2}','{3}', '{4}')".format(comment.id, comment.context, comment.author, comment.comment_created_at, "Deleted user"))
    else :
        query = text("INSERT INTO comments(comment_id,comment,author,comment_created_at,author_username) VALUES ('{0}', '{1}','{2}','{3}', '{4}')".format(comment.id, comment.context, comment.author, comment.comment_created_at, user.login))
    connection.execute(query)
    query = text("INSERT INTO comment_post(post_id,comment_id) VALUES('{0}', '{1}')".format(post_id, comment.id))
    connection.execute(query)
    connection.commit()
    connection.close()

def get_comments(post_id: UUID, offset : int) -> tuple[int, List[CommentInfo]]:
    connection = database.connect()
    offset=(offset-1)*5
    query = text("SELECT t1.comment_id as id,comment as context, author, comment_created_at, author_username FROM comments as t1 "
                 "LEFT JOIN comment_post as t2 using(comment_id) "
                 "WHERE t2.post_id = '{0}' "
                 "LIMIT 5 OFFSET {1}".format(post_id,offset))
    results = connection.execute(query).fetchall()
    query = text("SELECT count(*) FROM comments as t1 "
                 "LEFT JOIN comment_post as t2 using(comment_id) "
                 "WHERE t2.post_id = '{0}'".format(post_id))
    count = connection.execute(query).fetchone()[0]
    connection.close()
    return count, results

def delete_comment_by_comment(comment: Comment):
    connection = database.connect()
    query = text("DELETE FROM comment_post WHERE comment_id = '{0}'".format(comment.id))
    connection.execute(query)
    query = text("DELETE FROM comments WHERE comment_id = '{0}'".format(comment.id))
    connection.execute(query)
    connection.commit()
    connection.close()

def delete_comment_by_id(ids: UUID):
    connection = database.connect()
    query = text("DELETE FROM comments WHERE comment_id = '{0}'".format(ids))
    connection.execute(query)
    connection.commit()
    connection.close()

def get_comment_author(comment: Comment):
    connection = database.connect()
    query = text("SELECT comment_author FROM comments WHERE comment_id = '{0}'".format(comment.id))
    author = connection.execute(query).fetchone()
    connection.close()
    return author[0]