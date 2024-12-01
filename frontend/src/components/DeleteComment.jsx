import { DeleteOutlined } from "@ant-design/icons";
import useAuth from "../hooks/useAuth.jsx";
import axios from 'axios';
import {useParams} from "react-router-dom";
import {Button, message, Modal} from "antd";
import React, {useEffect, useState} from "react";

const DeleteComment = ({commentId, commentAuthor}) => {
    const {postId} = useParams();
    const {isAuthenticated, id} = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('access_token');

    const handleDelete = async () => {
        if (!isAuthenticated){
            return;
        }
        try {
            const params = {
                commentID: commentId,
                author: commentAuthor,
            }
            await axios.delete(`http://localhost:8000/delete_comment/${postId}`, {
                params,
                headers: {token: `${token}`},
            })
            message.success('Комментарий успешно удален!');
        } catch (error) {
            message.error('Ошибка при удалении комментария: ' + error.message);
        } finally {
            setIsModalVisible(false);
        }
    }

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

    useEffect(() => {
        getUser();
    }, [isAuthenticated]);

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleClick = () => {
        setIsModalVisible(true);
    };


    if( isAuthenticated && commentAuthor && id && user && (id===commentAuthor || user.role==='Admin' || user.role === 'Moderator')) {
        return (
            <>
                <div>
                    <Button onClick={handleClick} style={{height: '25px', width: '25px'}}><DeleteOutlined/></Button>
                </div>
                <Modal
                    title="Подтверждение удаления"
                    visible={isModalVisible}
                    onOk={handleDelete}
                    onCancel={handleCancel}>
                    <p>Вы уверены, что хотите удалить этот комментарий?</p>
                </Modal>
            </>
        )
    } else {
        return null;
    }
};

export default DeleteComment;