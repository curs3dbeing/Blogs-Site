import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Card, Pagination } from 'antd';
import {useNavigate, Link, useParams} from 'react-router-dom';
import qs from "qs";
import NoData from "./NoData.jsx";

const { Meta } = Card;

const LikedList = ({selectedTags, dateRange, searchQuery, sortViewsType}) => {
    const { userId } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [authors, setAuthors] = useState({});
    const navigate = useNavigate();


    const fetchPosts = async (page) => {


        try {
            const params = {
                tags: selectedTags,
                user_id: userId
            };

            if (sortViewsType !== null) {
                params.views_desc = sortViewsType;
            }

            if ( searchQuery ) {
                params.title_search = searchQuery;
            }

            if (dateRange && dateRange[0]) {
                params.start_date = dateRange[0];
            }
            if (dateRange && dateRange[1]) {
                params.end_date = dateRange[1];
            }
            const response = await axios.get(`http://localhost:8000/posts/liked/page/${page}`, {
                params,
                paramsSerializer: params => {
                    return qs.stringify(params, { arrayFormat: 'repeat' });
                }
            });
            setPosts(response.data[1]);
            setTotalPosts(response.data[0]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthors = async (authorIds) => {
        try {
            const promises = authorIds.map(id => axios.get(`http://localhost:8000/posts/author/${id}`));
            const responses = await Promise.all(promises);
            const authorsData = {};
            responses.forEach(response => {
                authorsData[response.data.id] = response.data;
            });
            setAuthors(authorsData);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (posts.length > 0) {
            const authorIds = posts.map(post => post.author);
            fetchAuthors(authorIds);
        }
    }, [posts]);

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage, selectedTags, dateRange, searchQuery, sortViewsType]);

    useEffect(() => {
        if (selectedTags.length > 0) {
            setCurrentPage(1);
        }
    }, [selectedTags]);

    useEffect(() => {
        if (dateRange && dateRange[0] && dateRange[1]) {
            setCurrentPage(1);
        }
    }, [dateRange]);

    useEffect(() => {
        if (sortViewsType !== null) {
            setCurrentPage(1)
        }
    }, [sortViewsType])

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="flex justify-center font-bold">Method not allowed</p>;

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="py-5" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
        }}>
            {posts.length === 0 ? (
                <div className="flex flex-col items-center h-full">
                    <NoData/>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 content-center"
                         style={{ width: '60%'}}>
                        {posts.map(post => {
                            const author = authors[post.author];
                            const username = author ? author.login : "No Author";
                            return (
                                <Link key={post.id} to={`/posts/${post.id}`}> {}
                                    <Card
                                        className="shadow-lg h-50 cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                                    >
                                        <Meta title={post.title} description={"Автор: "+username} />
                                        <p className="mt-2">Просмотры: {post.views}</p>
                                        <p className="text-gray-500 text-sm">Создан: {new Date(post.post_created_at).toLocaleString()}</p>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                    <Pagination
                        current={currentPage}
                        pageSize={10}
                        total={totalPosts}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </>
            )}
        </div>
    );
};

export default LikedList;