import React, {useState} from "react";
import axios from "axios";
import {message} from "antd";

const ResetPass = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const emailRegex = /^[a-zA-Z0-9]{3,}@(gmail|mail|rumbler|yandex|outlook|bsuir).[a-z]{2,3}$/;

        if(!emailRegex.test(email)) {
            setErrorMessage('Неверная почта')
            return;
        }

        try {
            const params = {
                email: email,
            }
            const response = await axios.post('http://localhost:8000/change/password/', {},
                {
                    params
                });
            if (response.status === 200) {
                message.success('Письмо для изменения пароля отправлено на почту')
                setErrorMessage('')
                return;
            } else {
                const errorData = response.json();
                setErrorMessage(errorData);
            }
            setErrorMessage('');
        } catch (error) {
            if (error.status === 406) {
                setErrorMessage('Пользователя с такой почтой не существует.');
                return;
            }
            console.error('Ошибка при попытке смены пароля:', error);
            setErrorMessage('Ошибка при попытке смены пароля.');
        }
    };

    return (
        <div style={{background: '#e6e6e6', width: '100%', height: '100vh', fontFamily: 'Rubik'}}>
            <div className="py-4" style={{display: 'flex', alignItems: 'center'}}>
                <a className="px-12 text-3xl font-semibold hover:text-indigo-500 text-black" href='/'
                   style={{fontFamily: 'Rubik'}}>
                    Posters
                </a>
            </div>
            <div className="flex min-h-full flex-col px-6 py-12 lg:px-8">

                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">Восстановление пароля</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-900">Почта</label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="current-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="text-red-600 font-bold">{errorMessage}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-900 transition-all">
                                Сменить пароль
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Уже сменили пароль?
                        <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500"> Авторизуйтесь
                            сейчас!</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ResetPass;