import TextEditor from "./TextEditor.jsx";
import {Layout} from "antd";
import useAuth from "../hooks/useAuth.jsx";
import {useNavigate} from "react-router-dom";
import TagChooser from "./TagChooser.jsx";
import {useState} from "react";

const PostCreation = () => {
    const {isAuthenticated} = useAuth()
    const navigate = useNavigate();

    if(!isAuthenticated){
        navigate("/signup");
    }

    return (
        <Layout className="h-screen">
            <div style={{ fontFamily: "Rubik", textAlign: "center", margin: "20px" }}>
                <h2>Создание публикации</h2>
            </div>
            <div className="w-10/12 mx-auto border border-gray-950 h-[100vh]" style={{border: '4px', borderStyle: '#000000'}}>
                <TextEditor/>
            </div>
        </Layout>
    );

};
export default PostCreation;