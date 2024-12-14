import useAuth from "../hooks/useAuth.jsx";
import {UserAddOutlined, UserDeleteOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {Button, message, Modal} from "antd";
import axios from "axios";


const UpdateUserDisabled = ({isDisabled, userID}) => {

    const{isAuthenticated, id} = useAuth()
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('access_token');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleChangeBlock = async () => {
        if (!isAuthenticated) {
            return null;
        }
        if (user.role !== 'Admin') {
            return null;
        }
        try {
            await axios.put(`http://localhost:8000/profile_update_block/${userID}`, {}, {
                headers: {token: `${token}`},
            })
            let msg = ''
            if(!isDisabled) {
                msg= 'Пользователь заблокирован успешно'
            } else {
                msg = 'Пользователь успешно разблокирован'
            }
            message.success(msg);
        } catch (error) {
            message.error('Ошибка при обновлении состояния пользователя: ' + error.message);
        } finally {
            setIsModalVisible(false);
        }
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    const handleCancel = () => {
        setIsModalVisible(false);
    };

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

    useEffect(() => {
        getUser();
    }, [isAuthenticated]);


    if(isAuthenticated && user && user.role==='Admin'){
        return (
            <>
                {isDisabled ? (
                    <>
                        <div>
                            <Button onClick={handleClick}> <UserAddOutlined /> </Button>
                        </div>
                        <Modal
                            title="Подтверждение разблокировки"
                            visible={isModalVisible}
                            onOk={handleChangeBlock}
                            onCancel={handleCancel}>
                            <p>Вы уверены, что хотите разблокировать этого пользователя?</p>
                        </Modal>
                    </>
                ) : (
                    <>
                        <div>
                            <Button onClick={handleClick}> <UserDeleteOutlined /> </Button>
                        </div>
                        <Modal
                            title="Подтверждение блокировки"
                            visible={isModalVisible}
                            onOk={handleChangeBlock}
                            onCancel={handleCancel}>
                            <p>Вы уверены, что хотите заблокировать этого пользователя?</p>
                        </Modal>
                    </>
                )
                }
            </>
        )
    } else {
        return null;
    }
}

export default UpdateUserDisabled