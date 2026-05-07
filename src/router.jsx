import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/Post_Pages/MainPage";
import DetailPage from "./pages/Post_Pages/DetailPage";
import WritePage from "./pages/Post_Pages/WritePage";
import LoginPage from "./pages/User_Pages/LoginPage";
import RegisterPage from "./pages/User_Pages/RegisterPage";
import UserPage from "./pages/User_Pages/UserPage";
import LikesPage from "./pages/My_Pages/LikesPage";
import MyPostsPage from "./pages/My_Pages/MyPostsPage";
import ChatRoomDetailPage from "./pages/Chat_Pages/ChatRoomDetailPage";
import ChatRoomsPage from "./pages/Chat_Pages/ChatRoomsPage";

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
      { path: "/chat-rooms", element: <ChatRoomsPage /> },
      {
        path: "/chat-rooms/:roomId",
        element: <ChatRoomDetailPage />,
      },
      {
        path: "/chat/:roomId",
        element: <ChatRoomDetailPage />,
      },
    ],
  },
]);

export default router;
