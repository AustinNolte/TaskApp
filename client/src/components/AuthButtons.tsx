import type { ReactNode } from "react";
import type { AuthTypes } from "../types/auth";

export interface AuthButtonProps {
  label: AuthTypes;
  onClick: () => void;
  children?: ReactNode;
}

function AuthButton({ label, onClick, children }: AuthButtonProps) {
  return (
    <div>
      <button onClick={onClick}>
        {label} {children}
      </button>
    </div>
  );
}

export default AuthButton;
