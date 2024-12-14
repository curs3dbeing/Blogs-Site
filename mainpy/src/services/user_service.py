from fastapi import HTTPException

from mainpy.src.security.security import password_hash
from mainpy.src.database.database import database
from mainpy.src.security.security import verify
from sqlalchemy import text
from uuid import UUID


def user_insert(user):
    connection = database.connect()
    no_login_user = get_user_by_login(user.login)
    no_email_user = get_user_by_email(user.email)
    if (no_login_user is None) & (no_email_user is None):
        query = text("INSERT INTO Users(id,login,password,role,email,disabled) values ('{0}', '{1}', '{2}', '{3}','{4}', '{5}')".format(user.id, user.login, password_hash(user.password), user.role.value, user.email, user.disabled))
        connection.execute(query)
        connection.commit()
        return user
    else:
        return None

def user_login_exists(new_login):
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE login = '{0}'".format(new_login))
    result = connection.execute(query).one_or_none()
    if result:
        return True
    else:
        return False

def get_user_by_login(login : str):
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE login = '{0}'".format(login))
    user = connection.execute(query).one_or_none()
    connection.close()
    return user

def get_user_id(login : str):
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE login = '{0}'".format(login))
    user = connection.execute(query)
    connection.close()
    if user is None:
        return None
    uid = user.fetchone()[0]
    return uid

def update_ban_user_by_id(userID: UUID):
    connection = database.connect()
    query = text("UPDATE Users SET disabled = not disabled WHERE id='{0}'".format(userID))
    connection.execute(query)
    connection.commit()
    connection.close()

def get_user_by_id(uid : UUID):
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE id = '{0}'".format(uid))
    user = connection.execute(query).one_or_none()
    connection.close()
    return user if not None else None

def get_user_verification_send(user):
    connection = database.connect()
    query = text("SELECT id,cypher,verificated FROM user_verification WHERE id = '{0}'".format(user.id))
    result = connection.execute(query).one_or_none()
    connection.close()
    if result is None:
        return
    if result[2] == False:
        raise HTTPException(status_code=402, detail="Verification is already send")
    if result[2] == True:
        raise HTTPException(status_code=403, detail="Already verified")

def get_usermodel_by_id(uid : UUID):
    connection = database.connect()
    query = text("SELECT id,login,role,email,disabled,about,created_at FROM Users WHERE id = '{0}'".format(uid))
    user = connection.execute(query).one_or_none()
    connection.close()
    return user if not None else None

def get_user_by_email(email : str):
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE email = '{0}'".format(email))
    user = connection.execute(query).one_or_none()
    connection.close()
    return user

def get_user_log():
    connection = database.connect()
    query = text("SELECT * FROM Users_log")
    data = connection.execute(query).mappings().fetchall()
    connection.close()
    return data

def verificate_user_data(userid : UUID):
    connection = database.connect()
    query = text("SELECT id,cypher,verificated FROM user_verification WHERE id = '{0}'".format(userid))
    result = connection.execute(query).one_or_none()
    if result[2] == True:
        raise HTTPException(status_code=403, detail="Already verified")
    query = text("UPDATE user_verification SET verificated = 'true' WHERE id = '{0}'".format(userid))
    connection.execute(query)
    connection.commit()
    query = text("UPDATE Users SET disabled = 'false' WHERE id = '{0}'".format(userid))
    connection.execute(query)
    connection.commit()
    connection.close()

def update_password(uid: UUID, password: str):
    hashed_pass = password_hash(password)
    connection = database.connect()
    query = text("UPDATE Users SET password = '{0}' WHERE id = '{1}'".format(hashed_pass, uid))
    connection.execute(query)
    connection.commit()
    connection.close()

def update_user_login(login, userID : UUID):
    connection = database.connect()
    query = text("UPDATE USERS SET login = '{0}' where id = '{1}'".format(login, userID))
    connection.execute(query)
    query = text("UPDATE comments SET author_username= '{0}' where author = '{1}'".format(login, userID))
    connection.execute(query)
    connection.commit()
    connection.close()

def update_user_about(about,userID : UUID):
    connection = database.connect()
    query = text("UPDATE USERS SET about = '{0}' where id = '{1}'".format(about, userID))
    connection.execute(query)
    connection.commit()
    connection.close()

def is_admin(userID : UUID):
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE id = '{0}'".format(userID))
    user = connection.execute(query).one_or_none()
    if user is None:
        return False
    else:
        if user.role.value != 'Admin':
            return False
        else:
            return True

def is_moderator(userID : UUID):
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE id = '{0}'".format(userID))
    user = connection.execute(query).one_or_none()
    if user is None:
        return False
    else:
        if user.role.value != 'Moderator':
            return False
        else:
            return True

def match_password(user, password : str) -> bool:
    if user is None:
        return False
    if user.password == password_hash(password):
        return True
    else:
        return False

def authenticate_user(username : str, password : str):
    user = get_user_by_login(username)
    if not user:
        return False
    if not verify(password,user.password):
        return False
    return user