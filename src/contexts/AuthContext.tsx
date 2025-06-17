"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { demoUsers, User } from "@/data/demo-data";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signIn: (
    emailOrUsername: string,
    password: string
  ) => Promise<{ error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Try database authentication first
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.user) {
            const userSession: User = {
              id: userData.user.id.toString(),
              username: userData.user.username,
              name: userData.user.name,
              email: userData.user.email,
              role: userData.user.role,
              password: "",
              phone: userData.user.phone,
              address: userData.user.address,
              salary: userData.user.salary,
              hireDate: userData.user.hire_date,
              isActive: userData.user.is_active,
              status: userData.user.is_active ? "active" : "inactive",
              createdAt: userData.user.created_at,
              updatedAt: userData.user.updated_at,
              avatar: userData.user.avatar_url,
            };

            setUser(userSession);
            localStorage.setItem("currentUser", JSON.stringify(userSession));
            return;
          }
        }
      } catch (dbError) {
        console.log(
          "Database authentication failed, falling back to demo data"
        );
      }

      // Fallback to demo data
      await new Promise((resolve) => setTimeout(resolve, 500));

      const foundUser = demoUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        const userSession: User = {
          id: foundUser.id,
          username: foundUser.username,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          password: "",
          phone: foundUser.phone,
          address: foundUser.address,
          salary: foundUser.salary,
          hireDate: foundUser.hireDate,
          isActive: foundUser.isActive,
          status: foundUser.status,
          createdAt: foundUser.createdAt,
          updatedAt: foundUser.updatedAt,
          avatar: foundUser.avatar,
        };

        setUser(userSession);
        localStorage.setItem("currentUser", JSON.stringify(userSession));
      } else {
        throw new Error("Invalid username or password");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (
    emailOrUsername: string,
    password: string
  ): Promise<{ error?: string }> => {
    setIsLoading(true);

    try {
      // Try database authentication first
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrUsername,
            password,
          }),
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.user) {
            const userSession: User = {
              id: userData.user.id.toString(),
              username: userData.user.username,
              name: userData.user.name,
              email: userData.user.email,
              role: userData.user.role,
              password: "",
              phone: userData.user.phone,
              address: userData.user.address,
              salary: userData.user.salary,
              hireDate: userData.user.hire_date,
              isActive: userData.user.is_active,
              status: userData.user.is_active ? "active" : "inactive",
              createdAt: userData.user.created_at,
              updatedAt: userData.user.updated_at,
              avatar: userData.user.avatar_url,
            };

            setUser(userSession);
            localStorage.setItem("currentUser", JSON.stringify(userSession));

            // Redirect based on role
            switch (userData.user.role) {
              case "admin":
                router.push("/dashboard/admin");
                break;
              case "supervisor":
                router.push("/dashboard/supervisor");
                break;
              case "finance":
                router.push("/dashboard/finance");
                break;
              case "operator":
                router.push("/dashboard/operator");
                break;
              default:
                router.push("/dashboard");
            }

            return { error: undefined };
          }
        }
      } catch (dbError) {
        console.log(
          "Database authentication failed, falling back to demo data"
        );
      }

      // Fallback to demo data
      await new Promise((resolve) => setTimeout(resolve, 500));

      const foundUser = demoUsers.find(
        (u) =>
          (u.email === emailOrUsername || u.username === emailOrUsername) &&
          u.password === password
      );

      if (foundUser) {
        const userSession: User = {
          id: foundUser.id,
          username: foundUser.username,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          password: "",
          phone: foundUser.phone,
          address: foundUser.address,
          salary: foundUser.salary,
          hireDate: foundUser.hireDate,
          isActive: foundUser.isActive,
          status: foundUser.status,
          createdAt: foundUser.createdAt,
          updatedAt: foundUser.updatedAt,
          avatar: foundUser.avatar,
        };

        setUser(userSession);
        localStorage.setItem("currentUser", JSON.stringify(userSession));

        // Redirect based on role
        switch (foundUser.role) {
          case "admin":
            router.push("/dashboard/admin");
            break;
          case "supervisor":
            router.push("/dashboard/supervisor");
            break;
          case "finance":
            router.push("/dashboard/finance");
            break;
          case "operator":
            router.push("/dashboard/operator");
            break;
          default:
            router.push("/dashboard");
        }

        return { error: undefined };
      } else {
        return { error: "Invalid email or password" };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    router.push("/sign-in");
  };

  const value = {
    user,
    login,
    signIn,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
