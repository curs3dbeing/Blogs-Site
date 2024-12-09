import React from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined, TableOutlined } from '@ant-design/icons';
import {Menu, message} from 'antd';
import axios from "axios";
const items = [
    {
        key: 'sub1',
        label: 'Меню',
        icon: <MailOutlined />,
        children: [
            {
                key: 'g1',
                label: 'Экспорт публикации',
                type: 'group',
                children: [
                    {
                        key: '1',
                        label: 'Экспорт в CSV',
                        icon: <TableOutlined />,
                    },
                ],
            },
        ],
    }
];
const SiderMenu = ({post_id}) => {
    const handleExport = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/export/csv/${post_id}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${post_id}.csv`);

            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
        }
    };
    return (
        <Menu
            onClick={handleExport}
            style={{
                width: 256,
                userSelect: 'none'
            }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={items}
        />
    );
};
export default SiderMenu;