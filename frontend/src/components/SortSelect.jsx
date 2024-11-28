import {useState} from 'react';
import { Select} from 'antd';



const SortSelect = ({onSortChange}) => {

    const handleChange = (value) => {
        onSortChange(value);
    }

    return (
        <Select
            defaultValue="Сортировка"
            className="w-10/12"
            onChange={handleChange}
            options={[
                {
                    value: null,
                    label: 'Без сортировки',
                },
                {
                    value: true,
                    label: 'Убывание просмотров',
                },
                {
                    value: false,
                    label: 'Возрастание просмотров',
                },
            ]}
        />
        );
    };

export default SortSelect;
