import type { ReactNode } from "react";
import React, { useState } from "react";
import type { AuthTypes } from "../types/auth";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router";

export interface AuthFormProps {
  label: AuthTypes;
  children?: ReactNode;
}

function AuthForm({ label, children }: AuthFormProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isSignup = label === "sign-up";
  const { setUser } = useAuth();

  const onSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        isSignup ? navigate("/auth/login") : navigate("/");
      } else {
        setError(data.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        {isSignup && (
          <div>
            <label htmlFor="signup-name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        )}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <button type="submit" disabled={submitting}>
            Submit
          </button>
        </div>
      </form>
      {children}
      {error && <p> {error} </p>}
    </div>
  );
}

export default AuthForm;
