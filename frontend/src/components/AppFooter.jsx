import { Layout } from 'antd';
import "../index.css"
const { Footer } = Layout;

const AppFooter = () => {
    return (
        <Footer className="main_footer" style={{ textAlign: 'center',
            backgroundColor: '#ffffff',
            fontFamily: 'Rubik',
            fontSize: '17px',
            fontStyle: 'bold',
            color: '#000000',}}>
            ©2024 My Website. All rights reserved.
        </Footer>
    );
};

export default AppFooter;