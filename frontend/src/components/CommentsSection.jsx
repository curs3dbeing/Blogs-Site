import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pagination, Spin } from 'antd';
import qs from "qs";

const CommentsSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [commentsPerPage] = useState(5);
    const [totalComments, setTotalComments] = useState(0);
    const [loading, setLoading] = useState(true);
    const [commentNum, setCommentNum] = useState(0);
    const [authors, setAuthors] = useState([]);

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
        fetchComments(currentPage);
    }, [postId, currentPage]);

    if (loading) return <Spin size="large" />;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Комментарии:</h2>
            {comments.length > 0 ? (
                comments.map((comment, index) => (
                    <div key={comment.id} className="border-b border-gray-200 py-4">
                        <h3 className="px-5"> {comment.author_username}</h3>
                        <h3>{`${(currentPage - 1) * commentsPerPage + index + 1}. ${comment.context}`}</h3>
                    </div>
                ))
            ) : (
                <span>Здесь пока нет ни одного комментария, вы можете стать первым!</span>
            )}
            <Pagination
                current={currentPage}
                pageSize={commentsPerPage}
                total={totalComments}
                onChange={(page) => setCurrentPage(page)}
                className="mt-4"
            />
        </div>
    );
};


export default CommentsSection;