import {Layout, message, Spin} from "antd";
import Sider from "antd/es/layout/Sider.js";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentsSection from "./CommentsSection.jsx";
import { Content } from "antd/es/layout/layout.js";

const PostPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const allTags = localStorage.getItem('tags');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/poststags/${postId}`);
                setPost(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) return <Spin size="large" />;
    if (error) return <div>Error: {error}</div>;

    return (
        <Layout className="h-full">
            <Sider width={200} style={{left: 0, backgroundColor: '#e6e6e6' }}>
                {}
            </Sider>
            <Layout style={{ marginLeft: 50 }}>
                <Content style={{ padding: '24px', marginTop: 24 }}>
                    {post ? (
                        <div style={{fontFamily: "Rubik", minHeight: 'fit-content'}}>
                            <h1>{post.title}</h1>
                            <p className="font-bold" style={{fontSize: '20px'}}>Тэги:
                                {post.tags && post.tags.length > 0 ? (
                                    <>
                                        {post.tags.map((tag, index) => (
                                            <span key={tag.id}>
                        {" " + tag.tag_name}{index < post.tags.length - 1 ? ', ' : '.'}
                    </span>
                                        ))}
                                    </>
                                ) : (
                                    <span> нет тегов.</span>
                                )}
                            </p>
                            <div dangerouslySetInnerHTML={{__html: post.content}}/>

                        </div>
                    ) : (
                        <p>Ошибка, пост не существует.</p>
                    )}
                </Content>
                <CommentsSection postId={post.id}/>
            </Layout>
        </Layout>
    );
};

export default PostPage;