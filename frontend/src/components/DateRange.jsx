import React from 'react';
import { DatePicker, Space, ConfigProvider } from 'antd';
const { RangePicker } = DatePicker;
import ruRU from 'antd/lib/locale/ru_RU';


const DateRange = ({onDateChange}) => {

    const handleDateChange = (dates) => {
        if (dates) {
            const [startDate, endDate] = dates;
            onDateChange([startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]);
        } else {
            onDateChange(null);
        }
    };
    return (
        <ConfigProvider locale={ruRU}>
            <Space direction="vertical">
                <RangePicker placeholder={["Начало", "Конец"]} onChange={handleDateChange} />
            </Space>
        </ConfigProvider>
    );
};
export default DateRange;