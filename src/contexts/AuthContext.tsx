"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { demoUsers, User } from "@/data/demo-data";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find user in demo data
      const foundUser = demoUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        // Create user session without password
        const userSession: User = {
          id: foundUser.id,
          username: foundUser.username,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          password: "", // Don't store password in session
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const value = {
    user,
    login,
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
