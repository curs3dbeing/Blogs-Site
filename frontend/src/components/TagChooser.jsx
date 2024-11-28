import {Select, Space} from "antd";
import axios from "axios";
import React, {useState, useEffect} from "react";
import useAuth from "../hooks/useAuth.jsx";



const TagChooser = ({onTagsChange}) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tags, setTags] = useState([]);
    const { isAuthenticated} = useAuth();

    const fetchTags = async () => {
        try {
            const responce = await axios.get(`http://localhost:8000/get_tags`);
            const tagsData = responce.data.map(c => ({
                value: c.tag_id,
                label: c.tag_name
            }));
            setTags(tagsData);
            localStorage.setItem('tags', JSON.stringify(tagsData));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        const storedTags = localStorage.getItem("tags");
        if(!storedTags || !isAuthenticated) {
            fetchTags();
        } else {
            setTags(JSON.parse(storedTags));
            setLoading(false);
        }
    },[]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <Space className="flex" direction="vertical">
            <Select mode="multiple" allowClear style={{
                width: '100%',
            }}
                    placeholder="Выберите теги"
                    defaultValue={[]}
                    onChange={(value) => {
                        onTagsChange(value);
                    }}
                    options={tags}
            />
        </Space>
    );
};

export default TagChooser;