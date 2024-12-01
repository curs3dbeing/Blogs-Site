import React, {useEffect, useState} from 'react';
import { Button, Modal, message } from 'antd';
import { DeleteOutlined } from "@ant-design/icons";
import useAuth from "../hooks/useAuth.jsx";
import axios from 'axios';
import {useParams} from "react-router-dom";

const DeletePost = () => {
    const { postId } = useParams();
    const { isAuthenticated } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const token = localStorage.getItem('access_token');
    const [user, setUser] = useState(null);
    const [postData, setPostData] = useState(null);

    const handleClick = () => {
        setIsModalVisible(true);
    };

    const getUser = async() => {
        if (!isAuthenticated) {
            return null;
        }
        try {
            const response =await axios.get(`http://localhost:8000/users/user`, {
                headers: {token: `${token}`},
            });
            if (response.status === 200) {
                setUser(response.data);
            }
        } catch (error) {
            console.log("No auth");
        }
    };

    const getPost = async () => {
        if (!postId) {
            return null;
        }
        try {
            const response = await axios.get(`http://localhost:8000/posts/${postId}`);
            if (response.status === 200) {
                setPostData(response.data);
            }
        } catch (error) {
            console.log("No post");
        }
    }

    useEffect(() => {
        getPost();
    }, [postId]);

    useEffect(() => {
        getUser();
    }, [isAuthenticated]);


    const handleDelete = async () => {
        if (!isAuthenticated) {
            message.error('Вы должны быть авторизованы для удаления поста.');
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/posts_delete/${postId}`, {
                headers: { token: `${token}` },
            });
            message.success('Пост успешно удален!');
        } catch (error) {
            message.error('Ошибка при удалении поста: ' + error.message);
        } finally {
            setIsModalVisible(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    if (isAuthenticated && user && postData && (user.id===postData.author || user.role==='Moderator' || user.role==='Admin')) {
        return (
            <>
                <Button className="" style={{ color: 'Black', height: '24px' }} onClick={handleClick}>
                    <DeleteOutlined />
                </Button>
                <Modal
                    title="Подтверждение удаления"
                    visible={isModalVisible}
                    onOk={handleDelete}
                    onCancel={handleCancel}>
                    <p>Вы уверены, что хотите удалить этот пост?</p>
                </Modal>
            </>
        );
    } else {
        return null;
    }
};

export default DeletePost;