import {Layout, message, Spin, Divider } from "antd";
import Sider from "antd/es/layout/Sider.js";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentsSection from "./CommentsSection.jsx";
import { Content } from "antd/es/layout/layout.js";
import "./PostPage.css"
import {HeartFilled, HeartOutlined} from "@ant-design/icons";
import useAuth from "../hooks/useAuth.jsx";
import qs from "qs";

const PostPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postLikes, setPostLikes] = useState(0);
    const {isAuthenticated} = useAuth();
    const allTags = localStorage.getItem('tags');
    const [hasLiked, setHasLiked] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const token = localStorage.getItem('access_token');

    const handleLike = async () => {
        if(!isAuthenticated){
            messageApi.open({
                type: 'error',
                content: 'Вы должны быть авторизованы, чтобы оставлять реакции',
            });
            return;
        }
        try {
            if (!hasLiked) {
                await axios.post(`http://localhost:8000/post/${postId}/add_reaction`, {
                    id: 1,
                    reaction_type: "Like",
                }, {
                    headers: {token: `${token}`},
                });
                setPostLikes(prevLikes => prevLikes + 1);
            } else {
                const params = {
                    id: 1,
                    reaction_type: "Like",
                }
                await axios.delete(`http://localhost:8000/post/${postId}/delete_reaction`, {
                    params,
                    headers: {token: `${token}`},
                });
                setPostLikes(prevLikes => prevLikes - 1);
            }
            setHasLiked(!hasLiked);
        } catch (err) {
            message.error(err);
        }
    }

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/poststags/${postId}`);
                setPost(response.data);
                const reactions = await axios.get(`http://localhost:8000/post/${postId}/get_reactions`)
                setPostLikes(reactions.data.count);
                const likesparams = {
                    id: 1,
                    reaction_type: "Like"
                }
                if (token) {
                    const isLiked = await axios.get(`http://localhost:8000/post/${postId}/isliked`, {
                        params: likesparams,
                        headers: {token: `${token}`}
                    })
                    if (isLiked.data.is_reacted === true) {
                        setHasLiked(true);
                    } else {
                        setHasLiked(false);
                    }
                } else {
                    setHasLiked(false);
                }
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
            {contextHolder}
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
                            <div className="flex py-2 like-container " style={{fontSize: '28px', height: '24px', userSelect: 'none'}}>
                                {hasLiked ? (
                                    <a className="like-icon" style={{color: 'Red', height: '24px'}}
                                       onClick={handleLike}>
                                        <HeartFilled/>
                                    </a>
                                ) : (<a className="like-icon" style={{color: 'Red', height: '24px'}}
                                        onClick={handleLike}>
                                    <HeartOutlined/>
                                </a>)}
                                <div className="px-2 like-count">
                                    {Number(postLikes)}
                                </div>
                            </div>

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