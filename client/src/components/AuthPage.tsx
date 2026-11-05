import type { AuthTypes } from "../types/auth";
import AuthForm from "./AuthForm";

interface AuthPageProps {
  mode: AuthTypes;
}

function AuthPage({ mode }: AuthPageProps) {
  if (mode == "login") {
    return <AuthForm label="login" />;
  }

  if (mode == "sign-up") {
    return <AuthForm label="sign-up" />;
  }
}

export default AuthPage;
