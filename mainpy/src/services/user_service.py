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

def get_user_by_id(uid : UUID):
    connection = database.connect()
    query = text("SELECT * FROM Users WHERE id = '{0}'".format(uid))
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


#def get_current_user(token: str = Depends(oauth2_scheme)):
#    user=token_decode(token)