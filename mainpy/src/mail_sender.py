#supersecuredpassword
#courseprojectposts@gmail.com
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from uuid import UUID
from mainpy.src.settings.settings import settings
from hashlib import sha256

smtp_server = 'smtp.mail.ru'
smtp_port = 587
smtp_user = 'courseprojauth@mail.ru'
smtp_password = 'kx3qsm5rxBDqmwgwLmuv'

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
        PostMaster.
        """

    msg.attach(MIMEText(body, 'plain'))

    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)