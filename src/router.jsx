import { createBrowserRouter } from "react-router";
import RegisterPage from "./Pages/RegisterPage";
import Layout from "./Components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
]);

export default router;
