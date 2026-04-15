import { createBrowserRouter } from "react-router-dom";
import Layout from "./Components/Layout";
import MainPage from "./Pages/home/MainPage";
import DetailPage from "./Pages/home/DetailPage";
import WritePage from "./Pages/home/WritePage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import UserPage from "./pages/UserPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "/detail/:id", element: <DetailPage /> },
      { path: "/write", element: <WritePage /> },
      // { path: "/register", element: <RegisterPage /> },
      // { path: "/login", element: <LoginPage /> },
      // { path: "/user", element: <UserPage /> },
    ],
  },
]);

export default router;
