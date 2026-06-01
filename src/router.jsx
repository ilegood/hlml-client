/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";

const MainPage = lazy(() => import("./pages/post_pages/MainPage"));
const DetailPage = lazy(() => import("./pages/post_pages/DetailPage"));
const WritePage = lazy(() => import("./pages/post_pages/WritePage"));
const LoginPage = lazy(() => import("./pages/user_pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/user_pages/RegisterPage"));
const ResetPasswordPage = lazy(() => import("./pages/user_pages/ResetPasswordPage"));
const UserPage = lazy(() => import("./pages/user_pages/UserPage"));
const LikesPage = lazy(() => import("./pages/my_pages/LikesPage"));
const MyPostsPage = lazy(() => import("./pages/my_pages/MyPostsPage"));
const ChatRoomDetailPage = lazy(() => import("./pages/chat_pages/ChatRoomDetailPage"));
const ChatRoomsPage = lazy(() => import("./pages/chat_pages/ChatRoomsPage"));
const DMsPage = lazy(() => import("./pages/chat_pages/DMsPage"));
const DMDetailPage = lazy(() => import("./pages/chat_pages/DMDetailPage"));
const EmailVerificationSuccessPage = lazy(
  () => import("./pages/user_pages/EmailVerificationSuccessPage"),
);
const EmailVerificationFailPage = lazy(
  () => import("./pages/user_pages/EmailVerificationFailPage"),
);
const EmailVerificationPendingPage = lazy(
  () => import("./pages/user_pages/EmailVerificationPendingPage"),
);

const withSuspense = (element) => (
  <Suspense fallback={null}>{element}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(<MainPage />) },
      { path: "/detail/:id", element: withSuspense(<DetailPage />) },
      { path: "/write", element: withSuspense(<WritePage />) },
      { path: "/edit/:id", element: withSuspense(<WritePage />) },
      { path: "/register", element: withSuspense(<RegisterPage />) },
      { path: "/login", element: withSuspense(<LoginPage />) },
      { path: "/reset-password", element: withSuspense(<ResetPasswordPage />) },
      { path: "/verify-email", element: withSuspense(<EmailVerificationSuccessPage />) },
      { path: "/verify-email/fail", element: withSuspense(<EmailVerificationFailPage />) },
      {
        path: "/email-verification-pending",
        element: withSuspense(<EmailVerificationPendingPage />),
      },
      { path: "/user", element: withSuspense(<UserPage />) },
      { path: "/likes", element: withSuspense(<LikesPage />) },
      { path: "/my-posts", element: withSuspense(<MyPostsPage />) },
      { path: "/chat-rooms", element: withSuspense(<ChatRoomsPage />) },
      {
        path: "/chat-rooms/:roomId",
        element: withSuspense(<ChatRoomDetailPage />),
      },
      {
        path: "/chat/:roomId",
        element: withSuspense(<ChatRoomDetailPage />),
      },
      { path: "/dms", element: withSuspense(<DMsPage />) },
      { path: "/dms/:roomId", element: withSuspense(<DMDetailPage />) },
    ],
  },
]);

export default router;
