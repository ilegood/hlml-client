import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext.jsx";
import router from "./router.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Toaster position="top-center" richColors />
    <RouterProvider router={router} />
  </AuthProvider>,
);
