from uuid import UUID
from sqlalchemy import text

from mainpy.src.database.database import database
from mainpy.src.reactions.reaction import Reaction, AllReactions

def already_reacted_to_post(post_id: UUID,
                            reaction: Reaction,
                            user_id: UUID) -> bool:
    connection= database.connect()
    query=text("SELECT * FROM post_user_reaction WHERE post_id='{0}', user_id='{1}', reaction_id='{2}'".format(post_id, user_id, reaction.id))
    result = connection.execute(query).one_or_none()
    connection.close()
    return result != None

def get_all_reactions_to_post(post_id:UUID) -> list[AllReactions]:
    connection= database.connect()
    query=text("SELECT reaction_id,reaction_name,count(*) as amount FROM post_user_reaction "
                "left join reactions using(reaction_id) "
                "WHERE post_id='{0}' "
                "group by (reaction_id,reaction_name)".format(post_id))
    result = connection.execute(query).all()
    all_reactions : list[AllReactions] = []
    connection.close()
    for reaction in result:
        all_reactions.append(AllReactions(reaction=Reaction(id=reaction[0],reaction_type=reaction[1]),count=reaction[2]))
    return all_reactions

def add_reaction_to_post(post_id: UUID,
                         reaction: Reaction,
                         user_id: UUID):
    connection = database.connect()
    query = text("INSERT INTO post_user_reaction VALUES ('{0}', '{1}', '{2}')".format(post_id,user_id,reaction.id))
    connection.execute(query)
    connection.commit()
    connection.close()

def delete_reaction_from_post(post_id: UUID,
                              reaction: Reaction,
                              user_id: UUID):
    connection = database.connect()
    query = text("DELETE FROM post_user_reaction WHERE post_id='{0}' and user_id='{1}' and reaction_id={2}".format(post_id, user_id, reaction.id))
    connection.execute(query)
    connection.commit()
    connection.close()