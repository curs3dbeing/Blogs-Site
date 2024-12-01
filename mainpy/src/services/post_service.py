from mainpy.src.database.database import database
from mainpy.src.posts.post import Post, PostTags
from mainpy.src.tags.tag import tags_ids, Tag, TagName
from mainpy.src.services.comment_service import delete_comment_by_id
from mainpy.src.services.tag_service import get_tag_ID_by_names
from sqlalchemy import text
from uuid import UUID


def add_post(post):
    connection = database.connect()
    query = text("INSERT INTO Posts ("
                 "post_id,"
                 "content,"
                 "post_created_at,"
                 "title) VALUES ('{0}','{1}','{2}','{3}')".format(post.id,post.content,post.post_created_at,post.title))

    q = connection.execute(query)

    pid=post.id
    uid=post.author

    if post.tags is not None:
        selected_tags = {tag.id for tag in post.tags if tag.id in tags_ids}
        for tid in selected_tags:
            connection.execute(text("INSERT INTO posts_tags(tag_id,post_id) VALUES ('{0}','{1}')".format(tid, pid)))

    connection.execute(text("INSERT INTO user_post (idu,idp) VALUES ('{0}','{1}')".format(uid,pid)))
    connection.commit()
    connection.close()

def get_post_by_id(post_id):
    connection = database.connect()
    query = text("SELECT DISTINCT t1.post_id,content,post_created_at,title, array_agg(tag_name),idu, views FROM Posts as t1 "
                "LEFT JOIN Posts_tags as t2 on t1.post_id=t2.post_id "
                "LEFT JOIN User_post as t3 on t1.post_id=t3.idp "
                "LEFT JOIN tags as t4 on t4.tag_id=t2.tag_id "
                "group by t1.post_id,idu "
                "having t1.post_id='{0}'".format(post_id))
    result = connection.execute(query).fetchone()
    if result is None:
        return None
    else:
        query = text("UPDATE Posts SET views=views+1 where post_id='{0}'".format(post_id))
        connection.execute(query)
        connection.commit()
        connection.close()
        tags = get_tag_ID_by_names(result[4])
        all_tags : list[Tag] = []
        if tags is not None:
            for elem in tags:
                tag=Tag(id=elem[0], tag_name=elem[0])
                all_tags.append(tag)
            return Post(id=result[0],title=result[3], content=result[1], author=result[5],tags=all_tags,post_created_at=result[2],views=result[6])
        else:
            return Post(id=result[0], title=result[3], content=result[1], author=result[5], tags=None,post_created_at=result[2], views=result[6])

def get_post_tags_by_id(post_id):
    connection = database.connect()
    query = text(
        "SELECT DISTINCT t1.post_id,content,post_created_at,title, array_agg(row(t2.tag_id,tag_name)) as tags,idu as author, views FROM Posts as t1 "
        "LEFT JOIN Posts_tags as t2 on t1.post_id=t2.post_id "
        "LEFT JOIN User_post as t3 on t1.post_id=t3.idp "
        "LEFT JOIN tags as t4 on t4.tag_id=t2.tag_id "
        "group by t1.post_id,idu "
        "having t1.post_id='{0}'".format(post_id))
    result = connection.execute(query).fetchone()
    if result is None:
        return None
    else:
        query = text("UPDATE Posts SET views=views+1 where post_id='{0}'".format(post_id))
        connection.execute(query)
        connection.commit()
        connection.close()
        tags = result[4]
        if tags == '{"(,)"}':
            return PostTags(id=result[0], title=result[3], content=result[1], author=result[5], tags=None,
                            post_created_at=result[2], views=result[6])
        else:
            query_string = tags.strip('{}')
            elements = query_string.split('","')

            result_array = []
            for element in elements:
                element = element.strip('"')
                id_str, tag_name = element.strip('()').split(',')
                result_array.append(TagName(id=int(id_str), tag_name=tag_name))
            return PostTags(id=result[0], title=result[3], content=result[1], author=result[5], tags=result_array,
                             post_created_at=result[2], views=result[6])


def delete_post_by_post(postid : UUID):
    connection = database.connect()
    query = text("SELECT comment_id FROM comment_post WHERE post_id='{0}'".format(postid))
    result = connection.execute(query).fetchall()
    for comment in result:
        delete_comment_by_id(comment[0])
    query = text("DELETE FROM posts_tags where post_id='{0}'".format(postid))
    connection.execute(query)
    query = text("DELETE FROM pages_posts where post_id='{0}'".format(postid))
    connection.execute(query)
    query = text("DELETE FROM post_user_reaction where post_id='{0}'".format(postid))
    connection.execute(query)
    query = text("DELETE FROM user_post where idp='{0}'".format(postid))
    connection.execute(query)
    query = text("DELETE FROM Posts where post_id='{0}'".format(postid))
    connection.execute(query)
    connection.commit()
    connection.close()