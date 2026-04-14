import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import router from "./router.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <>
    <Toaster position="top-center" richColors />
    <RouterProvider router={router} />
  </>,
);
