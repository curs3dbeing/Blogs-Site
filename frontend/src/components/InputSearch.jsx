import React, {useState} from 'react';
import { Input } from 'antd';
import './InputSearch.css'

const { Search } = Input;

const InputSearch = ({searchQuery}) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="custom-search-button">
            <Search
                placeholder="Ваш запрос"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={searchQuery(searchTerm.trim())}
            />
        </div>
    );
};

export default InputSearch;