import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import DetailPage from "./pages/DetailPage";
import WritePage from "./pages/WritePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserPage from "./pages/UserPage";
import LikesPage from "./pages/LikesPage";
import MyPostsPage from "./pages/MyPostsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "/detail/:id", element: <DetailPage /> },
      { path: "/write", element: <WritePage /> },
      { path: "/edit/:id", element: <WritePage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/user", element: <UserPage /> },
      { path: "/likes", element: <LikesPage /> },
      { path: "/my-posts", element: <MyPostsPage /> },
    ],
  },
]);

export default router;
