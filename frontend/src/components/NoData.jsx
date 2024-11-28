import React, {useState} from 'react';
import {Button, Empty, Popover, Typography} from 'antd';
import { useNavigate} from "react-router-dom";
import useAuth from "../hooks/useAuth.jsx";


const NoData = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const {isAuthenticated} = useAuth();

    const hide = () => {
        setOpen(false);
    };
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };
    const handleRedirect = () => {
        navigate("/new_post");
    }

    return (
        <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
                height: 100,
            }}
            description={
                <Typography.Text>
                    Нету поста на такую тему? <a href="/new_post">Напишите свой</a>
                </Typography.Text>
            }>
            {isAuthenticated === false ? (
                <Popover
                    content={<a onClick={hide}>Закрыть</a>}
                    title="Необходимо авторизоваться"
                    trigger="click"
                    open={open}
                    onOpenChange={handleOpenChange}>
                    <Button type="primary">Создайте свой пост</Button>
                </Popover>
            ) : (
                <Button type="primary" onClick={handleRedirect}>Создайте свой пост</Button>
            )
        }
        </Empty>
    );
};

export default NoData;