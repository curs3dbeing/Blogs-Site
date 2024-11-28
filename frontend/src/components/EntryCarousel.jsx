import {Carousel} from "antd";

const contentStyle = {
    height: '300px',
    color: '##ccccff',
    lineHeight: '300px',
    textAlign: 'center',
    background: '#ccccff',
};

const containerStyle = {
    background:'#e6e6e6'
};

function EntryCarousel() {

    return (
        <div className="full-screen-container" style = {containerStyle}>
            <div className="carousel-container">
                <Carousel autoplay>
                    <div className="container mx-auto">
                        <h3 style={contentStyle}>Slide 1</h3>
                    </div>
                    <div className="container mx-auto">
                        <h3 style={contentStyle}>Slide 2</h3>
                    </div>
                    <div className="container mx-auto">
                        <h3 style={contentStyle}>Slide 3</h3>
                    </div>
                    <div className="container mx-auto">
                        <h3 style={contentStyle}>Slide 4</h3>
                    </div>
                </Carousel>
            </div>
        </div>
    )
}

export default EntryCarousel