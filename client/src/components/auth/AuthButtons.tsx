import type { ReactNode } from "react";
import type { AuthTypes } from "../../types/auth";
import { UserCircleIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export interface AuthButtonProps {
  label: AuthTypes;
  onClick: () => void;
  children?: ReactNode;
}

function AuthButton({ label, onClick, children }: AuthButtonProps) {
  return (
    <div>
      <button
        className="flex items-center gap-2 py-1.5 px-2 m-2 rounded-md border border-pearl-aqua-300/40 text-sm text-pearl-aqua-300 hover:bg-pearl-aqua-300/10 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onClick}
      >
        {label === "login" && <UserCircleIcon className="size-4" />}
        {label === "sign-up" && <UserPlusIcon className="size-4" />}
        {label}
      </button>
      {children}
    </div>
  );
}

export default AuthButton;
