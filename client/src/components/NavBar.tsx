import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

interface NavBarProps {
  children: React.ReactNode;
}

function NavBar({ children }: NavBarProps) {
  const { user, setUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { credentials: "include", method: "POST" });
      if (response.ok) {
        setUser(null);
      } else {
        const data = await response.json();
        console.log(data.error);
      }
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div>
      <div className="m-4 border-b border-b-pearl-aqua">
        <div className="mx-4 flex items-center justify-between">
          <div className=""> {user ? user.name : "Login please!"} </div>
          {user && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-md border border-golden-orange-300/40 px-3 py-1.5 mb-2 text-sm text-golden-orange-300 hover:bg-golden-orange-300/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRightStartOnRectangleIcon className="size-4" />
              Logout
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default NavBar;
