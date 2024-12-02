import {Button, Layout, Popover, Spin, Typography} from 'antd';
import useAuth from "../hooks/useAuth.jsx";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";


const { Header } = Layout;

const AppHeader = () => {
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('access_token');
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const hide = () => {
        setOpen(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const handleRedirect = () => {
        setOpen(true);
    };

    const removeItem = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('tags');
    };

    const location = useLocation();

    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (isAuthenticated && token) {
            axios.get('http://localhost:8000/users/me', {
                headers: { token: `${token}` },
            })
                .then(response => {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    setUser(response.data);
                })
                .catch(error => {
                    console.error("Ошибка при получении данных пользователя:", error);
                    navigate('/');
                });
        }
    }, [isAuthenticated, token, navigate]);

    const handleLogout = (e) => {
        e.preventDefault();
        removeItem();
        if (location.pathname !== '/') {
            navigate('/');
        } else {
            window.location.reload()
        }
    };

    if (loading) {
        return <Spin />;
    }

    if (!isAuthenticated) {
        return (
            <Header style={{ background: '#ffffff', userSelect: 'none'}}>
                <div className="gap-2" style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
                    <a href="/" style={{display: 'inline-block', width: '4%'}}>
                        <img src="/public/drawable/main%20logo2.png" className="flex logo"></img>
                    </a>
                    <a className="text-3xl font-semibold hover:text-indigo-500 text-black" href='/'
                       style={{fontFamily: 'Rubik'}}>
                        Posters
                    </a>
                    <div className="w-full">
                        <div className="grid grid-cols-2 gap-4 content-center items-center">
                            <div className="flex flex-col items-center">
                                <a className=" text-stone-900 text-xl font-semibold hover:text-indigo-500 content-center"
                                   style={{fontSize: '25px', fontFamily: 'Rubik'}} href="/posts">Посты</a>
                            </div>
                            <div className="flex flex-col items-center">
                                <Popover
                                    content={
                                        <div>
                                            <Typography.Text className style={{fontFamily: 'Rubik'}}>
                                                Необходимо  <Link to="/login">авторизоваться</Link>
                                            </Typography.Text>
                                            <br />
                                            <Button type="link" onClick={hide}>Закрыть</Button>
                                        </div>
                                    }
                                    trigger="click"
                                    open={open}
                                    onOpenChange={handleOpenChange}
                                >
                                    <a
                                        className="text-stone-900 text-xl font-semibold hover:text-indigo-500 content-center"
                                        style={{ fontSize: '25px', fontFamily: 'Rubik' }}
                                        onClick={handleRedirect}
                                    >
                                        Написать пост
                                    </a>
                                </Popover>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-end lg:items-center" style={{width: '100%', height: '100%'}}>
                        <a className="text-stone-900 text-xl font-semibold hover:text-indigo-500"
                           style={{fontSize: '25px', fontFamily: 'Rubik'}} href="/login">Войти</a>
                        <a className="inline-flex justify-center rounded-lg text-xl font-semibold py-2.5 px-4 bg-gray-500 text-stone-900 hover:bg-slate-400 hover:shadow-md transition-all -my-2.5 ml-8 hover:text-indigo-500"
                           style={{fontSize: '25px', fontFamily: 'Rubik'}}
                           href="/signup">Зарегистрироваться</a>
                    </div>
                </div>
            </Header>
        );
    }

    return (
        <Header style={{background: '#ffffff', userSelect: 'none'}}>
            <div className="gap-2" style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
                <a href="/" style={{display: 'inline-block', width: '4%'}}>
                    <img src="/public/drawable/main%20logo2.png" className="flex logo"></img>
                </a>
                <a className="text-3xl font-semibold hover:text-indigo-500 text-black" href='/'
                   style={{fontFamily: 'Rubik'}}>
                    Posters
                </a>
                <div className="w-full">
                    <div className="grid grid-cols-3 gap-4 content-center items-center">
                        <div className="flex flex-col items-center">
                            <a className=" text-stone-900 text-xl font-semibold hover:text-indigo-500 content-center"
                               style={{fontSize: '25px', fontFamily: 'Rubik'}} href="/posts">Посты</a>
                        </div>
                        <div className="flex flex-col items-center">
                            <a className="text-stone-900 text-xl font-semibold hover:text-indigo-500 content-center"
                               style={{fontSize: '25px', fontFamily: 'Rubik'}}
                               href="/new_post">Написать публикацию
                            </a>
                        </div>
                        <div className="flex flex-col items-center">
                            <a className="text-stone-900 text-xl font-semibold hover:text-indigo-500 content-center"
                               style={{fontSize: '25px', fontFamily: 'Rubik'}}
                               href={`/likes/${user?.id}`}>Понравившееся
                            </a>
                        </div>
                    </div>

                </div>
                <div className="flex justify-end lg:items-center" style={{width: '39%', height: '100%'}}>
                    <p style={{
                        color: '#000000',
                        fontSize: '20px',
                        fontFamily: 'Rubik'
                    }}><a href={`/profile/${user?.id}`}> <b> {user?.login} </b> </a></p>
                    <a className="inline-flex justify-center rounded-lg text-xl font-semibold py-2.5 px-4 bg-gray-500 text-stone-900 hover:bg-slate-400 hover:shadow-md transition-all -my-2.5 ml-8 hover:text-indigo-500"
                       style={{fontSize: '25px', fontFamily: 'Rubik'}}
                       href="/" onClick={handleLogout}>Выйти</a> {}
                </div>
            </div>
        </Header>
    );
};

export default AppHeader;