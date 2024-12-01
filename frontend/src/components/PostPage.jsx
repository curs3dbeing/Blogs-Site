import { Layout, message, Spin } from "antd";
import Sider from "antd/es/layout/Sider.js";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentsSection from "./CommentsSection.jsx";
import { Content } from "antd/es/layout/layout.js";
import "./PostPage.css";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import useAuth from "../hooks/useAuth.jsx";

const PostPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postLikes, setPostLikes] = useState(0);
    const { isAuthenticated } = useAuth();
    const [hasLiked, setHasLiked] = useState(false);
    const [postAuthor, setPostAuthor] = useState(null);
    const token = localStorage.getItem('access_token');

    const handleLike = async () => {
        if (!isAuthenticated) {
            message.error('Вы должны быть авторизованы, чтобы оставлять реакции');
            return;
        }
        try {
            if (!hasLiked) {
                await axios.post(`http://localhost:8000/post/${postId}/add_reaction`, {
                    id: 1,
                    reaction_type: "Like",
                }, {
                    headers: { token: `${token}` },
                });
                setPostLikes(prevLikes => prevLikes + 1);
            } else {
                await axios.delete(`http://localhost:8000/post/${postId}/delete_reaction`, {
                    params: { id: 1, reaction_type: "Like" },
                    headers: { token: `${token}` },
                });
                setPostLikes(prevLikes => prevLikes - 1);
            }
            setHasLiked(!hasLiked);
        } catch (err) {
            message.error(err.message);
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/poststags/${postId}`);
                setPost(response.data);

                const authparams = { auth_id: response.data.author };
                const authorResponse = await axios.get(`http://localhost:8000/user/username`, { params: authparams });
                setPostAuthor(authorResponse.data);

                const reactionsResponse = await axios.get(`http://localhost:8000/post/${postId}/get_reactions`);
                setPostLikes(reactionsResponse.data.count);

                if (isAuthenticated) {
                    const likesparams = { id: 1, reaction_type: "Like" };
                    const isLikedResponse = await axios.get(`http://localhost:8000/post/${postId}/isliked`, {
                        params: likesparams,
                        headers: { token: `${token}` },
                    });
                    setHasLiked(isLikedResponse.data.is_reacted);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId, isAuthenticated]);

    if (loading) return <Spin size="large" />;
    if (error) return <div>Error: {error}</div>;

    return (
        <Layout className="h-full">
            <Sider width={200} style={{ left: 0, backgroundColor: '#e6e6e6' }} />
            <Layout style={{ marginLeft: 50 }}>
                <Content style={{ padding: '24px', marginTop: 24 }}>
                    {post ? (
                        <div style={{ fontFamily: "Rubik", minHeight: 'fit-content' }}>
                            <h3>Автор : <a href={`/profile/${post.author}`}>{postAuthor?.login}</a></h3>
                            <h1>{post.title}</h1>
                            <p className="font-bold" style={{ fontSize: '20px' }}>Тэги:
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

                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            <div className="flex py-2 like-container" style={{ fontSize: '28px', height: '24px', userSelect: 'none' }}>
                                {hasLiked ? (
                                    <a className="like-icon" style={{ color: 'Red', height: '24px' }} onClick={handleLike}>
                                        <HeartFilled />
                                    </a>
                                ) : (
                                    <a className="like-icon" style={{ color: 'Red', height: '24px' }} onClick={handleLike}>
                                        <HeartOutlined />
                                    </a>
                                )}
                                <div className="px-2 like-count">
                                    {Number(postLikes)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>Ошибка, пост не существует.</p>
                    )}
                </Content>
                <CommentsSection postId={post.id} />
            </Layout>
        </Layout>
    );
};

export default PostPage;