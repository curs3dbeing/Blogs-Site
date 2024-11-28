import React, { useState } from 'react';
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!username || !password) {
            setErrorMessage('Пожалуйста, заполните все поля.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/token', {
                username, password
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            if (response.status === 200) {
                localStorage.setItem('access_token', response.data.access_token);
                navigate('/posts')
            } else {
                const errorData = response.json();
                setErrorMessage(errorData);
            }
            setErrorMessage('');
        } catch (error) {
            console.error('Ошибка при входе:', error);
            setErrorMessage('Неверное имя пользователя или пароль.');
        }
    };

    return (
        <div style={{background: '#e6e6e6', width: '100%', height: '100vh', fontFamily: 'Rubik'}}>
            <div className="py-4" style={{display: 'flex', alignItems: 'center'}}>
                <a href='/' className="px-12 text-3xl font-semibold hover:text-indigo-500 text-black" style={{ fontFamily: 'Rubik'}}>
                    Website
                </a>
            </div>
            <div className="flex min-h-full flex-col px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">Войдите в свой
                        аккаунт</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-900">Имя
                                пользователя</label>
                            <div className="mt-2">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password"
                                       className="block text-sm font-medium text-gray-900">Пароль</label>
                                <div className="text-sm">
                                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Забыли
                                        пароль?</a>
                                </div>
                            </div>
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

                        {errorMessage && (
                            <p className="text-red-600 font-bold">{errorMessage}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-900 transition-all">
                                Войти
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Еще не зарегистрированы?
                        <a href="/signup"
                           className="font-semibold text-indigo-600 hover:text-indigo-500"> Зарегистрируйтесь
                            сейчас!</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;