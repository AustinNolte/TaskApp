import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./auth/AuthContext.tsx";
import AuthPage from "./components/AuthPage.tsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/auth/login", element: <AuthPage mode="login" /> },
  { path: "/auth/signup", element: <AuthPage mode="sign-up" /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
