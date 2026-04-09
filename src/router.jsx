import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserPage from "./pages/UserPage";
import ChatRoomsPage from "./pages/ChatRoomsPage"; // ChatRoomsPage 임포트
import ChatPage from "./pages/ChatPage"; // ChatPage 임포트

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/user", element: <UserPage /> },
      { path: "/chatrooms", element: <ChatRoomsPage /> }, // 채팅방 목록 페이지 경로 추가
      { path: "/chat/:roomId", element: <ChatPage /> }, // 동적 roomId를 받는 채팅방 페이지 경로 수정
    ],
  },
]);

export default router;
