import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ChatNotificationProvider } from "./context/ChatNotificationContext.jsx";
import router from "./router.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ChatNotificationProvider>
      <Toaster richColors position="top-center" closeButton />
      <RouterProvider router={router} />
    </ChatNotificationProvider>
  </AuthProvider>,
);
