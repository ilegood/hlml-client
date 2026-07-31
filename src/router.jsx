import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/post_pages/MainPage";
import DetailPage from "./pages/post_pages/DetailPage";
import WritePage from "./pages/post_pages/WritePage";
import LoginPage from "./pages/user_pages/LoginPage";
import RegisterPage from "./pages/user_pages/RegisterPage";
import ResetPasswordPage from "./pages/user_pages/ResetPasswordPage";
import UserPage from "./pages/user_pages/UserPage";
import LikesPage from "./pages/my_pages/LikesPage";
import MyPostsPage from "./pages/my_pages/MyPostsPage";
import ChatRoomDetailPage from "./pages/chat_pages/ChatRoomDetailPage";
import ChatRoomsPage from "./pages/chat_pages/ChatRoomsPage";
import DMsPage from "./pages/chat_pages/DMsPage";
import DMDetailPage from "./pages/chat_pages/DMDetailPage";

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
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/user", element: <UserPage /> },
      { path: "/likes", element: <LikesPage /> },
      { path: "/my-posts", element: <MyPostsPage /> },
      { path: "/chat-rooms", element: <ChatRoomsPage /> },
      {
        path: "/chat-rooms/:roomId",
        element: <ChatRoomDetailPage />,
      },
      {
        path: "/chat/:roomId",
        element: <ChatRoomDetailPage />,
      },
      { path: "/dms", element: <DMsPage /> },
      { path: "/dms/:roomId", element: <DMDetailPage /> },
    ],
  },
]);

export default router;
