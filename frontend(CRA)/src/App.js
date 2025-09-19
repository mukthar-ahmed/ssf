import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import styles from "./App.module.css";
import Protected from "./components/Protected/Protected";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import Login from "./pages/Login/Login";
import { useSelector } from "react-redux";
import Signup from "./pages/Signup/Signup";
import Blog from "./pages/Blog/Blog";
import SubmitBlog from "./pages/SubmitBlog/SubmitBlog";
import BlogDetails from "./pages/BlogDetails/BlogDetails";
import UpdateBlog from "./pages/UpdateBlog/UpdateBlog";
import useAutoLogin from "./hooks/useAutoLogin";
import Loader from "./components/Loader/Loader";
import PageTitle from "./components/PageTitle";
import Profile from "./pages/Profile/Profile";
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Finance from './pages/Finance/Finance';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const isAuth = useSelector((state) => state.user.auth);
  const loading = useAutoLogin();

  return loading ? (
    <Loader text="..." />
  ) : (
    <div className={styles.container}>
      <BrowserRouter>
        <PageTitle /> {/* Dynamically updates the title */}
        <div className={styles.layout}>
          <Navbar />
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="blogs" exact element={<Protected isAuth={isAuth}><Blog /></Protected>} />
            <Route path="blog/:id" exact element={<Protected isAuth={isAuth}><BlogDetails /></Protected>} />
            <Route path="blog-update/:id" exact element={<Protected isAuth={isAuth}><UpdateBlog /></Protected>} />
            <Route path="submit" exact element={<Protected isAuth={isAuth}><SubmitBlog /></Protected>} />
            <Route path="profile" exact element={<Protected isAuth={isAuth}><Profile /></Protected>} />
            <Route path="admin-dashboard" element={<Protected isAuth={isAuth}><AdminDashboard /></Protected>} />
            <Route path="finance" element={<Protected isAuth={isAuth}><Finance /></Protected>} />

            <Route path="signup" exact element={<Signup />} />
            <Route path="login" exact element={<Login />} />
            <Route path="error" exact element={<ErrorPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
          <Footer />
        </div>
        <ToastContainer position="top-center" autoClose={2000} />
      </BrowserRouter>
    </div>
  );
}

export default App;
