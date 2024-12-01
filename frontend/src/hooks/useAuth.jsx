import { useEffect, useState } from 'react';
import axios from 'axios';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [id, setUUID] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (token) {
            axios.post('http://localhost:8000/verify_token', {}, {
                headers: { token: `${token}`},
            })
                .then(response => {
                    setIsAuthenticated(true);
                    setUUID(response.data.token_data.id);
                })
                .catch(error => {
                    console.error('Ошибка верификации:', error);
                    localStorage.removeItem('access_token');
                    setIsAuthenticated(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    return { isAuthenticated, loading, id };
};

export default useAuth;