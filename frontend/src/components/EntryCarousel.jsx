import React from 'react';
import { Carousel } from 'antd';

const contentStyle = {
    margin: 0,
    height: '90vh',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
};

const EntryCarousel = () => {
    const containerStyle = {
        height: '90vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e6e6e6',
    };

    const carouselItems = [
        {
            img: '/public/drawable/test1.png',
            text: 'Расскажите миру то, что ваc интересует'
        },
        {
            img: '/public/drawable/test2.png',
            text: 'Читайте публикации людей по всему миру'
        },
        {
            img: '/public/drawable/test3.png',
            text: 'Ищите только то, что вас интересует'
        },


    ];

    return (
        <div className="relative w-full h-5/6">
            <Carousel className="h-fit select-none" autoplay arrows>
                {carouselItems.map((item, index) => (
                    <div key={index} className="relative w-full h-full">
                        <img
                            src={item.img}
                            alt={`Slide ${index + 1}`}
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{fontFamily: 'Rubik', fontSize: '45px'}}>
                            <h2 className="text-gray-300">{item.text}</h2>
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default EntryCarousel;