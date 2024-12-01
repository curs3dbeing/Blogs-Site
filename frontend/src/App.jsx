import EntryCarousel from "./components/EntryCarousel.jsx";
import AppHeader from "./components/AppHeader.jsx";
import AppFooter from "./components/AppFooter.jsx";
import {Layout} from "antd"
import './App.css';
import {Content} from "antd/es/layout/layout.js";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';
import MainPage from './MainPage' ;
import Register from './Register';
import PostPage from "./components/PostPage.jsx";
import PostCreation from "./components/PostCreation.jsx";
import ProfilePage from "./components/UserProfile.jsx";
import LikedPosts from "./components/LikedPosts.jsx";


function App() {
    const location = useLocation();


  return (
    <Layout style={{ minHeight: '100vh', background: '#e6e6e6'}}>
        {location.pathname !== '/login' && location.pathname !=='/signup' && <AppHeader key = {location.pathname} />}
      <Content>
          <Layout.Content>
              <Routes>
                  <Route path="/signup" element={<Register/>}/>
                  <Route path="/posts/:postId" element={<PostPage/>}/>
                  <Route path="/" element={<EntryCarousel />}/>
                  <Route path="/login" element={<Login />}/>
                  <Route path="/posts" element={<MainPage/>}/>
                  <Route path="/new_post" element={<PostCreation/>}/>
                  <Route path={"/profile/:userId"} element={<ProfilePage/>}/>
                  <Route path={"likes/:userId"} element={<LikedPosts/>}/>
              </Routes>
          </Layout.Content>
      </Content>
      <AppFooter />
    </Layout>
  );
}

const Wrapper = () => (
    <Router>
        <App />
    </Router>
);

export default Wrapper;