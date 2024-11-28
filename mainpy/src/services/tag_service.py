from mainpy.src.database.database import database
from sqlalchemy import text

def get_all_tags() -> dict:
    connection=database.connect()
    query = text("SELECT * FROM tags")
    tags_tuple = connection.execute(query)
    tags = tags_tuple.mappings().all()
    connection.close()
    return tags

def get_tags_names() -> list:
    all_tags_json = get_all_tags()
    all_tags = [tag['tag_name'] for tag in all_tags_json]
    return all_tags

def get_tags_ids() -> list:
    all_tags_json = get_all_tags()
    all_tags = [tag['tag_id'] for tag in all_tags_json]
    return all_tags

def get_tag_ID_by_names(tag_names:list):
    connection=database.connect()
    result = []
    for tag in tag_names:
        query = text("SELECT * FROM tags WHERE tag_name ='{0}'".format(tag))
        results = connection.execute(query).fetchone()
        if results is not None:
            result.append(results)
    connection.close()
    if len(result) == 0:
        return None
    else:
        return result