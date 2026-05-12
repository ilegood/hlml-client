import { createBrowserRouter } from "react-router-dom";
import Layout from "./Components/Layout";
import MainPage from "./Pages/MainPage";
import DetailPage from "./Pages/DetailPage";
import WritePage from "./Pages/WritePage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import UserPage from "./Pages/UserPage";
import LikesPage from "./Pages/LikesPage";
import MyPostsPage from "./Pages/MyPostsPage";
import ChatRoomDetailPage from "./Pages/ChatRoomDetailPage";
import ChatRoomsPage from "./Pages/ChatRoomsPage";
import DMsPage from "./Pages/DMsPage";
import DMDetailPage from "./Pages/DMDetailPage";

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
      { path: "/dms", element: <DMsPage /> },
      { path: "/dms/:roomId", element: <DMDetailPage /> },
    ],
  },
]);

export default router;
