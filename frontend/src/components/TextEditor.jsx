import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import { Input, Popover } from "antd";
import {useNavigate} from "react-router-dom";
import TagChooser from "./TagChooser.jsx";

const TextEditor = ({ onChange }) => {
    const [editorHtml, setEditorHtml] = useState('');
    const [saveError, setSaveError] = useState(null);
    const [open, setOpen] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [title, setTitle] = useState("");
    const token = localStorage.getItem('access_token');
    const [selectedTags, setSelectedTags] = useState([]);
    const navigate = useNavigate();

    const handleChange = (html) => {
        setEditorHtml(html);
        onChange(html);
    };

    const hide = () => {
        setOpen(false);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    useEffect(() => {
        console.log(saveError);
        setSaveError(null);
    }, [saveError]);

    const handleSave = async () => {
        if (title.length <= 10 || title.length >= 100) {
            setOpen(true);
            return;
        }
        if(editorHtml === "") {
            setOpen(true);
            return;
        }

        try {

            const response = await axios.post('http://localhost:8000/create_post', {
                title: title,
                content: editorHtml,
                tags: selectedTags.map(tag => {
                    return {
                        id: tag,
                        tag_name: tag,
                    }
                }),
            }, {
                headers: { token: `${token}`},
            });
            console.log(response.data);
            setSaveSuccess(true);
            hide();
            navigate("/posts/"+response.data.id);
        } catch (error) {
            setSaveError(error.message);
        }
    };

    return (
        <div className="h-full" style={{ fontFamily: "Rubik" }}>
            <TagChooser onTagsChange={setSelectedTags}/>
            <div className="py-4">
                <Popover
                    content={<a onClick={hide}>Закрыть</a>}
                    title="Неверная длина названия!"
                    open={open}
                >
                    <Input
                        size="large"
                        placeholder="Название публикации"
                        onChange={handleTitleChange}
                    />
                </Popover>
            </div>
            <div className="h-2/3 overflow-auto">
                <ReactQuill
                    className="h-2/3"
                    value={editorHtml}
                    onChange={handleChange}
                    modules={TextEditor.modules}
                    formats={TextEditor.formats}
                />
            </div>
            <div className="flex flex-col items-center">
                <a
                    className="inline-flex justify-center rounded-lg text-xl py-2.5 px-4 bg-gray-300 text-stone-900 hover:bg-gray-400 hover:shadow-md transition-all -my-2.5 ml-8 hover:text-gray-700 hover:font-bold"
                    style={{ fontSize: '24px', fontFamily: 'Rubik' }}
                    onClick={handleSave}
                >
                    Сохранить публикацию
                </a>
            </div>
        </div>
    );
};

TextEditor.modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['link', 'clean']
    ],
};

TextEditor.formats = [
    'header',
    'bold', 'italic', 'underline',
    'link'
];

export default TextEditor;