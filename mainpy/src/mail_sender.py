import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from uuid import UUID
from mainpy.src.settings.settings import settings
from mainpy.src.database.database import database
from hashlib import sha256
from sqlalchemy import text

smtp_server = settings.SMTP_SERVER
smtp_port = settings.SMTP_PORT
smtp_user = settings.SMTP_USER
smtp_password = settings.SMTP_PASSWORD

def send_verification_message(email: str, user_id: UUID):
    server = smtplib.SMTP(smtp_server, smtp_port)

    data = str(user_id)+settings.SECRET_KEY

    hashed_uuid=sha256(str(data).encode()).hexdigest()

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = email
    msg['Subject'] = 'Подтверждение регистрации'

    body = f"""
        Здравствуйте!

        Спасибо за регистрацию на нашем сайте. Пожалуйста, подтвердите свою регистрацию, перейдя по следующей ссылке:

        http://localhost:8000/verificate/{hashed_uuid}?user_id={user_id}

        Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.

        С уважением,
        Posters.
        """

    msg.attach(MIMEText(body, 'plain'))

    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)

    connection = database.connect()
    query = text("INSERT INTO user_verification(id,cypher) values ('{0}', '{1}')".format(user_id, hashed_uuid))
    connection.execute(query)
    connection.commit()
    connection.close()

def send_changepassword_message(email : str, user_id: UUID):
    server = smtplib.SMTP(smtp_server, smtp_port)

    data = str(email) + settings.SECRET_KEY

    hashed_uuid = sha256(str(data).encode()).hexdigest()

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = email
    msg['Subject'] = 'Изменение пароля'

    body = f"""
        Здравствуйте!

        Вы запросили изменение пароля на нашем сайте. Пожалуйста, подтвердите изменение, перейдя по следующей ссылке:

        http://localhost:5173/change_password/{hashed_uuid}?user_id={user_id}

        Если вы не запрашивали изменение пароля, просто проигнорируйте это письмо.

        С уважением,
        Posters.
        """

    msg.attach(MIMEText(body, 'plain'))

    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)
    server.close()