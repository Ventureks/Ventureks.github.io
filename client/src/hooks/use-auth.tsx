import { useState, useEffect, createContext, useContext } from "react";
import type { AuthUser } from "@/lib/types";

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string, recaptchaToken: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("crm-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("crm-user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, recaptchaToken: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, recaptchaToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const { user: authUser } = await response.json();
    setUser(authUser);
    localStorage.setItem("crm-user", JSON.stringify(authUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
