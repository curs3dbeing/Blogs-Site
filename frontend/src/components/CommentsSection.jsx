import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Pagination, Spin, Input, message, Button, Divider} from 'antd';
import qs from "qs";
import useAuth from "../hooks/useAuth.jsx";
import {HeartOutlined} from "@ant-design/icons";
import DeleteComment from "./DeleteComment.jsx";
const { TextArea } = Input;


const CommentsSection = ({ postId }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [comment, setComment] = useState('');
    const [commentsPerPage] = useState(5);
    const [totalComments, setTotalComments] = useState(0);
    const [loading, setLoading] = useState(true);
    const [commentNum, setCommentNum] = useState(0);
    const [authors, setAuthors] = useState([]);
    const {isAuthenticated} = useAuth()
    const token = localStorage.getItem('access_token');


    const addComment = async () => {
        console.log(comment)
        if (!comment.trim()) {
            messageApi.open({
                type: 'error',
                content: 'Комментарий не может быть пустым',
            });
            return;
        }

        try {
            setLoading(true);
            console.log(comment);
            const responce = await axios.post(`http://localhost:8000/post_comment/${postId}`,{
                post_id: postId,
                context: comment
                }, {
                headers: {token: `${token}`},
            });
            setComment('');
            const successMessage = 'Комментарий добавлен';
            localStorage.setItem('successMessage', successMessage);
            messageApi.open({
                type: 'success',
                content: successMessage,
            });
            if (responce.status === 200) {
                await fetchComments(currentPage);
            }
        }

        catch (error) {
            message.error('Ошибка при добавлении комментария')
            messageApi.open({
                type: 'error',
                content: 'Ошибка при добавлении комментария',
            });
            console.error(error);
        }
        finally {
            setLoading(false);
        }

    };

    const fetchComments = async (page) => {
        const params ={
            offset: page
        }
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/post/comments/${postId}`, {
                params,
                paramsSerializer: params => {
                    return qs.stringify(params, { arrayFormat: 'repeat' });
                }});
            setComments(response.data[1]);
            setTotalComments(response.data[0]);
        } catch (error) {
            console.error("Ошибка при получении комментариев:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            messageApi.open({
                type: 'success',
                content: successMessage,
            })
        }

        fetchComments(currentPage);
    }, [postId, currentPage]);

    if (loading) return <Spin size="large" />;

    return (
        <div className="p-1" style={{fontFamily: "Rubik"}}>
            {contextHolder}
            <div className="w-10/12">
                <Divider
                    style={{
                        borderColor: '#000000', userSelect: 'none'
                    }}></Divider>
            </div>
            <h2 className="text-xl font-bold">Комментарии:</h2>

            {comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 py-2">
                        <a href={`/profile/${comment.author}`} className="px-5"> {comment.author_username}</a>
                        <div className="max-w-5xl" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                            {comment.context}
                            <div className="py-3 ">
                                <DeleteComment commentId={comment.id} commentAuthor={comment.author} />
                            </div>
                        </div>
                        <div className="w-10/12">
                            <Divider
                                style={{
                                borderColor: '#000000'
                            }}></Divider>
                        </div>
                    </div>
                ))
            ) : (
                <div className = "w-full py-5 text-lg">
                    <span>Здесь пока нет ни одного комментария, вы можете стать первым!</span>
                </div>
            )}
            <Pagination
                current={currentPage}
                pageSize={commentsPerPage}
                total={totalComments}
                onChange={(page) => setCurrentPage(page)}
                className="mt-4"
            />
            {isAuthenticated ? (
                <div className="py-5 w-8/12">
                    <>
                        <TextArea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Ваш комментарий"
                            autoSize={{minRows: 5, maxRows: 5}}
                            style={{ whiteSpace: 'pre-wrap' }}/>
                    </>

                    <div className="justify-end py-5 flex ">
                        <Button
                            type="primary"
                            onClick={addComment}>
                            Оставить комментарий
                        </Button>
                    </div>
                </div>
            ) : (
                <div className = "w-full py-5 text-xl">
                    <span>Авторизуйтесь, чтобы оставить комментарий.</span>
                </div>
                    )}
        </div>
    );
};


export default CommentsSection;