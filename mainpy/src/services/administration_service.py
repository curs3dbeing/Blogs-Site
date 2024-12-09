from sqlalchemy import text
from uuid import UUID
from mainpy.src.database.database import database


def get_all_users_data():
    connection = database.connect()
    query = text("SELECT id,login,role,lastmodified,created_at,disabled,about FROM users")
    data = connection.execute(query)
    return data

def get_users_each_month():
    connection = database.connect()
    query = text("SELECT TO_CHAR(created_at, 'TMMonth') as month, count(*) as Users FROM users WHERE created_at >= NOW() - INTERVAL '6 months' group by month")
    data = connection.execute(query).mappings().fetchall()
    return data

def get_users_authors():
    connection = database.connect()
    query = text("SELECT TO_CHAR(created_at, 'TMMonth') as month, count(distinct id) as Users FROM users RIGHT JOIN user_post on users.id=user_post.idu WHERE created_at >= NOW() - INTERVAL '6 months' group by month")
    data = connection.execute(query).mappings().fetchall()
    return data

def get_user_and_authors():
    connection = database.connect()
    query = text("select * from (SELECT TO_CHAR(created_at, 'TMMonth') as month, count(*) as Users FROM users WHERE created_at >= NOW() - INTERVAL '6 months' group by month) join (SELECT TO_CHAR(created_at, 'TMMonth') as month, count(distinct id) as authors FROM users RIGHT JOIN user_post on users.id=user_post.idu WHERE created_at >= NOW() - INTERVAL '6 months' group by month) using(month)")
    data = connection.execute(query).mappings().fetchall()
    return data

def get_posts_by_month():
    connection = database.connect()
    query = text("SELECT TO_CHAR(post_created_at, 'TMMonth') as month, count(*) posts FROM posts WHERE post_created_at >= NOW() - INTERVAL '6 months' group by month")
    data = connection.execute(query).mappings().fetchall()
    return data

def get_posts_each_tag():
    connection = database.connect()
    query = text("SELECT month, array_agg(count) as array_count, array_agg(tags) as array_tags FROM (SELECT TO_CHAR(post_created_at, 'TMMonth') as month, count(*) as count, tag_name as tags FROM posts join posts_tags using(post_id) join tags using(tag_id) WHERE post_created_at >= NOW() - INTERVAL '6 months' group by month, tag_name) group by month")
    data = connection.execute(query).mappings().fetchall()
    return data