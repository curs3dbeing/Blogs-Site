import React, {useEffect, useState} from "react";
import axios from "axios";
import {message} from "antd";
import {useLocation, useParams} from "react-router-dom";

const RefreshPassword = () => {
    const secretKey = import.meta.env.VITE_SECRET_KEY;

    const { token } = useParams();
    const location = useLocation();
    const userId = new URLSearchParams(location.search).get('user_id');
    const [password, setPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    async function hashSHA256(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        let info = email+secretKey
        const encoded = await hashSHA256(info);
        console.log("encoded:"+encoded)
        console.log("token:"+token)

        if (!password || !email || !checkPassword) {
            setErrorMessage('Пожалуйста, заполните все поля.');
            return;
        }


        if (!password || password.length > 15) {
            setErrorMessage('Пароль должен содержать максимум 15 символов.');
            return;
        }

        if(!password || password.length < 5) {
            setErrorMessage('Пароль должен содержать минимум 6 символов.');
            return;
        }
        if(checkPassword !== password) {
            setErrorMessage('Введенные пароли не совпадают');
            return;
        }

        const englishRegex = /^[A-Za-z0-9]+$/;

        const emailRegex = /^[a-zA-Z0-9]{3,}@(gmail|mail|rumbler|yandex|outlook|bsuir).[a-z]{2,3}$/;

        if(!emailRegex.test(email)) {
            setErrorMessage('Неверная почта')
            return;
        }

        if (!englishRegex.test(password)) {
            setErrorMessage('Пароль должен содержать только английские буквы и цифры.');
            return;
        }

        if(encoded !== token) {
            setErrorMessage('Неверная почта.');
            return;
        }

        try {
            const params = {
                email: email,
                password: password
            }
            const response = await axios.post('http://localhost:8000/change_password', {},
                {
                    params
                });
            if (response.data.status ==='Same password') {
                setErrorMessage('Пароль совпадает с паролем аккаунта');
                return;
            }
            if (response.status === 200) {
                message.success('Пароль успешно изменен')
                setErrorMessage('')
                return;
            } else {
                const errorData = response.json();
                setErrorMessage(errorData);
            }
            setErrorMessage('');
        } catch (error) {
            console.log(error);
            if (error.detail === 'Same password'){
                setErrorMessage('Пароль совпадает с паролем аккаунта');
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
                    <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">Смена пароля</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-900">Новый пароль</label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password"
                                       className="block text-sm font-medium text-gray-900">Повторите пароль</label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="check_password"
                                    name="new_password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={checkPassword}
                                    onChange={(e) => setCheckPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                />
                            </div>
                        </div>

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

export default RefreshPassword