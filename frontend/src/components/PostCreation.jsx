import TextEditor from "./TextEditor.jsx";
import {Layout, Button, message, Upload} from "antd";
import useAuth from "../hooks/useAuth.jsx";
import { UploadOutlined } from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import TagChooser from "./TagChooser.jsx";
import {useState} from "react";
import axios from "axios";

const PostCreation = () => {
    const {isAuthenticated} = useAuth()
    const navigate = useNavigate();

    if(!isAuthenticated){
        navigate("/signup");
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            message.error('Пожалуйста, выберите файл.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/import_post/csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success(response.data.message || 'Файл успешно загружен!');
        } catch (error) {
            if (error.status === 403){
                message.error('Пост с таким id уже существует')
                return;
            }
            message.error(error.response?.data?.error || 'Ошибка при загрузке файла.');
        }
    };

    return (
        <Layout className="h-screen justify-center">
            <div style={{fontFamily: "Rubik", textAlign: "center", margin: "20px"}}>
                <h2>Создание публикации</h2>
            </div>
            <div className="flex-1 justify-end w-full py-2 select-none flex">
                <div className="py-2 ml-auto w-3/12">
                    <Button className="" icon={<UploadOutlined/>}
                            onClick={() => document.querySelector('input[type=file]').click()}>
                        Загрузить CSV
                    </Button>
                </div>
                <div className="py-2">
                    <input type="file" accept=".csv" onChange={handleFileChange}
                           style={{display: 'none'}}/>
                </div>
            </div>
            <div className="w-10/12 mx-auto border border-gray-950 h-[100vh]"
                 style={{border: '4px', borderStyle: '#000000'}}>
                <TextEditor/>
            </div>
        </Layout>
    );

};
export default PostCreation;