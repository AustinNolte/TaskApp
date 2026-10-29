import type { AuthTypes } from "../types/auth";

interface AuthPageProps {
  mode: AuthTypes;
}

function AuthPage({ mode }: AuthPageProps) {
  if (mode == "login") {
    return <div> login </div>;
  }

  if (mode == "sign-up") {
    return <div> sign-up </div>;
  }
}

export default AuthPage;
