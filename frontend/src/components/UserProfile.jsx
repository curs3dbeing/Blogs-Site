import React, { useEffect, useState } from 'react';
import { Layout, Input, Button, message, Card, Space } from 'antd';
import axios from 'axios';
import useAuth from "../hooks/useAuth.jsx";
import { useParams } from "react-router-dom";
import UpdateUserDisabled from "./UpdateUserDisabled.jsx";

const UserProfile = () => {
    const { userId } = useParams();
    const { isAuthenticated } = useAuth();
    const [userData, setUserData] = useState(null);
    const [newUserData, setNewUserData] = useState({
        login: '',
        email: '',
        about: ''
    });
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access_token');
    const englishRegex = /^[A-Za-z0-9]+$/;

    const fetchAuthenticatedUserData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/users/user', {
                headers: { token: `${token}` },
            });
            setUserData(response.data);
            setNewUserData({
                login: response.data.login,
                email: response.data.email,
                about: response.data.about || ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchProfileData = async () => {
        try {
            const params = { auth_id: userId };
            let response = await axios.get('http://localhost:8000/user/username', { params });
            const dateString = response.data.created_at;
            const dateObject = new Date(dateString);
            const year = dateObject.getFullYear();
            const month = String(dateObject.getMonth() + 1).padStart(2, '0');
            const day = String(dateObject.getDate()).padStart(2, '0');
            const hours = String(dateObject.getHours()).padStart(2, '0');
            const minutes = String(dateObject.getMinutes()).padStart(2, '0');
            const seconds = String(dateObject.getSeconds()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            response.data.created_at = formattedDate;
            setProfileData(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchUserData = async () => {
        setLoading(true);
        if (isAuthenticated) {
            await fetchAuthenticatedUserData();
            if (userData && userData.id !== userId) {
                await fetchProfileData();
            }
        } else {
            await fetchProfileData();
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserData();
    }, [isAuthenticated]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newUserData.login) {
            message.error('Пожалуйста, заполните поле логина.');
            return;
        }

        if (newUserData.login.length < 5) {
            message.error('Имя пользователя должно содержать минимум 5 символов.');
            return;
        }

        if (newUserData.login.length > 15) {
            message.error('Имя пользователя должно содержать максимум 15 символов.');
            return;
        }

        if (!englishRegex.test(newUserData.login)) {
            message.error('Имя пользователя должно содержать только английские буквы и цифры.');
            return;
        }

        if(newUserData.login === userData.login && newUserData.about === userData.about) {
            message.error('Вы не поменяли данные!')
            return;
        }

        if(newUserData.login !== userData.login) {
            try {
                const params = {
                    login: newUserData.login
                }
                await axios.get(`http://localhost:8000/check/login/`, {
                    params
                })
            } catch (error) {
                if (error.status === 406) {
                    message.error("Введенный вами логин уже занят");
                    return;
                }
            }
        }

        try {
            await axios.put('http://localhost:8000/user/update_login', {}, {
                params: { login: newUserData.login, userid: userData.id },
                headers: { token: `${token}` },
            });

            await axios.put('http://localhost:8000/user/update_about', {}, {
                params: { about: newUserData.about, userid: userData.id },
                headers: { token: `${token}` },
            });

            message.success('Данные успешно обновлены!');

            setUserData((prev) => ({
                ...prev,
                login: newUserData.login,
                about: newUserData.about,
            }));
        } catch (err) {
            message.error(err.message || 'Произошла ошибка при обновлении данных.');
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    if (profileData && profileData.status === "User not found") {
        return (
            <div className="flex items-center justify-center w-full font-bold text-4xl py-16">
                Пользователь не существует
            </div>
        );
    } else {
        return (
            <Layout className="min-h-screen">
                <div style={{ padding: '24px', fontFamily: 'Rubik' }}>
                    <h1>Профиль пользователя</h1>
                    {isAuthenticated && userData ? (
                        userData.id === userId ? (
                            <form className="w-1/2" onSubmit={handleSubmit}>
                                <div className="py-4">
                                    <label>Логин:</label>
                                    <Input
                                        name="login"
                                        value={newUserData.login}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="py-4">
                                    <label>Электронная почта:</label>
                                    <Input
                                        name="email"
                                        value={userData.email}
                                        disabled
                                    />
                                </div>
                                <div className="py-4">
                                    <label>Информация о себе:</label>
                                    <Input.TextArea
                                        name="about"
                                        value={newUserData.about}
                                        onChange={handleChange}
                                    />
                                </div>
                                <Button type="primary" htmlType="submit">
                                    Сохранить изменения
                                </Button>
                            </form>
                        ) : (
                            <div style={{ fontFamily: "Rubik" }}>
                                <Space direction="vertical" size={25}>
                                    <Card title="Профиль пользователя" style={{width: 800}}>
                                        <h2>Имя пользователя: {profileData?.login}</h2>
                                        <h2>Дата регистрации: {profileData?.created_at}</h2>
                                        <h2>Информация о себе: {profileData?.about ? profileData.about : 'Пока тут пусто'}</h2>
                                        <h2>Заблокирован: {profileData?.disabled ? profileData.disabled : 'Нет'} {!profileData?.disabled ? !profileData.disabled : 'Да'}</h2>
                                        <UpdateUserDisabled isDisabled={profileData.disabled} userID={profileData.id}/>
                                    </Card>
                                </Space>
                            </div>
                        )
                    ) : (
                        profileData && (
                            <div style={{ fontFamily: "Rubik" }}>
                                <Space direction="vertical" size={25}>
                                    <Card title="Профиль пользователя" style={{width: 800}}>
                                        <h2>Имя пользователя: {profileData?.login}</h2>
                                        <h2>Дата регистрации: {profileData?.created_at}</h2>
                                        <h2>Информация о себе: {profileData?.about ? profileData.about : 'Пока тут пусто'}</h2>
                                        <h2>Заблокирован: {profileData?.disabled ? profileData.disabled : 'Нет'} {!profileData?.disabled ? !profileData.disabled : 'Да'}</h2>
                                    </Card>
                                </Space>
                            </div>
                        )
                    )}
                </div>
            </Layout>
        );
    }
};

export default UserProfile;