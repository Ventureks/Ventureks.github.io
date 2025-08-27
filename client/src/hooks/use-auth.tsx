import { useState, useEffect, createContext, useContext } from "react";
import type { AuthUser } from "@/lib/types";

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string, recaptchaToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sprawdź sesję na serwerze przy ładowaniu
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // Ważne dla sesji
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      // Użytkownik nie jest zalogowany
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string, recaptchaToken: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Ważne dla sesji
      body: JSON.stringify({ username, password, recaptchaToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const { user: authUser } = await response.json();
    setUser(authUser);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Ważne dla sesji
      });
    } catch (error) {
      console.error("Błąd podczas wylogowania:", error);
    } finally {
      setUser(null);
      // Odśwież stronę aby wyczyścić stan aplikacji
      window.location.href = "/";
    }
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
