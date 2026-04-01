import { createBrowserRouter } from "react-router";
import RegisterPage from "./Pages/RegisterPage";
import Layout from "./Components/Layout";
import MainPage from "./Pages/MainPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
]);

export default router;
