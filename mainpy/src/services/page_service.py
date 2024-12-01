from mainpy.src.database.database import database
from mainpy.src.tags.tag import Tag
from sqlalchemy import text
from uuid import UUID
from datetime import datetime


def get_page(offset:int,
             tags: list[int] | None = None,
             start_date:datetime | None = None,
             end_date:datetime | None = None,
             title_search : str | None = None,
             views_desc : bool | None = None):
    connection = database.connect()
    real_offset=(offset-1)*10
    limit = 10
    query_parts = ["SELECT post_id as id, content, post_created_at, title, views, array_agg(tag_id) as tags, users.id as author FROM Posts " 
                "LEFT JOIN posts_tags using(post_id) "
                "LEFT JOIN tags using(tag_id) "
                "LEFT JOIN user_post on user_post.idp=posts.post_id "
                "LEFT JOIN users on users.id=user_post.idu "
                "group by post_id, users.id"
    ]

    filters = []

    if tags:
        filters.append(f"ARRAY[{','.join(map(str,tags))}] <@ ARRAY_AGG(tag_id)")

    if start_date:
        filters.append(f"post_created_at >= '{start_date}'")

    if end_date:
        filters.append(f"post_created_at <= '{end_date}'")

    if title_search:
        filters.append(f"title ILIKE '%{title_search}%'")

    if filters:
        query_parts.append("HAVING " + " AND ".join(filters))

    if views_desc is not None:
        if views_desc is True:
            query_parts.append("ORDER BY views DESC")
        else:
            query_parts.append("ORDER BY views ASC")


    query_parts.append(f"LIMIT {limit} OFFSET {real_offset}")

    query = text(" ".join(query_parts))

    result = connection.execute(query).fetchall()

    for row in result:
        temp_tags=row[5]
        list_tags = []
        if temp_tags[0] is None:
            row[5][0] = Tag(id=-1,tag_name=1)
        else:
            for tag in temp_tags:
                main_tag = Tag(id=tag,tag_name=tag)
                list_tags.append(main_tag)
            for i in range(len(list_tags)):
                row[5][i]=list_tags[i]

    count_query_parts = [
        "SELECT COUNT(*) FROM (" 
        "SELECT COUNT(post_id) FROM Posts "
        "LEFT JOIN posts_tags USING(post_id) "
        "LEFT JOIN tags USING(tag_id) "
        "LEFT JOIN user_post ON user_post.idp = posts.post_id "
        "LEFT JOIN users ON users.id = user_post.idu "
        "group by post_id, users.id"
    ]

    if filters:
        count_query_parts.append("HAVING " + " AND ".join(filters))

    count_query = text(" ".join(count_query_parts)+")")

    total_count_result = connection.execute(count_query).scalar()

    connection.close()

    return result, total_count_result

def get_liked_page(offset:int, user_id: UUID,
             tags: list[int] | None = None,
             start_date:datetime | None = None,
             end_date:datetime | None = None,
             title_search : str | None = None,
             views_desc : bool | None = None):
    connection = database.connect()
    real_offset=(offset-1)*10
    limit = 10
    query_parts = ["SELECT post_id as id, content, post_created_at, title, views, array_agg(tag_id) as tags, users.id as author FROM post_user_reaction as t1 "
                   "LEFT JOIN posts using(post_id)" 
                "LEFT JOIN posts_tags using(post_id) "
                "LEFT JOIN tags using(tag_id) "
                "LEFT JOIN user_post on user_post.idp=post_id "
                "LEFT JOIN users on users.id=user_post.idu "
                "WHERE user_id = '{0}'"
                "group by post_id, users.id, content, post_created_at, title, views".format(user_id)]

    filters = []

    if tags:
        filters.append(f"ARRAY[{','.join(map(str,tags))}] <@ ARRAY_AGG(tag_id)")

    if start_date:
        filters.append(f"post_created_at >= '{start_date}'")

    if end_date:
        filters.append(f"post_created_at <= '{end_date}'")

    if title_search:
        filters.append(f"title ILIKE '%{title_search}%'")

    if filters:
        query_parts.append("HAVING " + " AND ".join(filters))

    if views_desc is not None:
        if views_desc is True:
            query_parts.append("ORDER BY views DESC")
        else:
            query_parts.append("ORDER BY views ASC")


    query_parts.append(f"LIMIT {limit} OFFSET {real_offset}")

    query = text(" ".join(query_parts))

    result = connection.execute(query).fetchall()

    for row in result:
        temp_tags=row[5]
        list_tags = []
        if temp_tags[0] is None:
            row[5][0] = Tag(id=-1,tag_name=1)
        else:
            for tag in temp_tags:
                main_tag = Tag(id=tag,tag_name=tag)
                list_tags.append(main_tag)
            for i in range(len(list_tags)):
                row[5][i]=list_tags[i]

    connection.close()

    return result, len(result)

def get_amount_of_posts():
    connection = database.connect()
    query=text("SELECT COUNT(*) FROM Posts")
    result = connection.execute(query).fetchone()
    connection.close()
    return result[0]