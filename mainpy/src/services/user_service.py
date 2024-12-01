from mainpy.src.security.security import password_hash
from mainpy.src.database.database import database
from mainpy.src.security.security import verify
from sqlalchemy import text
from uuid import UUID


def user_insert(user):
    connection = database.connect()
    no_user = get_user_by_login(user.login) is None
    if no_user & get_user_by_email(user.email) is True:
        query = text("INSERT INTO Users(id,login,password,role,email) values ('{0}', '{1}', '{2}', '{3}','{4}')".format(user.id, user.login, password_hash(user.password), user.role.value, user.email))
        connection.execute(query)
        connection.commit()
        return user
    else:
        return None

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

def get_usermodel_by_id(uid : UUID):
    connection = database.connect()
    query = text("SELECT id,login,role,email,disabled,about,created_at FROM Users WHERE id = '{0}'".format(uid))
    user = connection.execute(query).one_or_none()
    connection.close()
    return user if not None else None

def get_user_by_email(email : str) -> bool:
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE email = '{0}'".format(email))
    user = connection.execute(query).one_or_none()
    connection.close()
    return user is None

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