import { useNavigate } from "react-router";
import AuthButton from "./components/AuthButtons";
import type { AuthTypes } from "./types/auth";
import { useAuth } from "./auth/AuthContext";
import "./App.css";

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const authButtons: { label: AuthTypes; onClick: () => void }[] = [
    { label: "login", onClick: () => navigate("/auth/login") },
    { label: "sign-up", onClick: () => navigate("/auth/signup") },
  ];

  if (loading) return <p>Loading...</p>;

  if (!user)
    return (
      <div>
        {authButtons.map((btn) => (
          <AuthButton key={btn.label} label={btn.label} onClick={btn.onClick} />
        ))}
      </div>
    );

  return <p>Welcome, {user.name}</p>;
}

export default App;
