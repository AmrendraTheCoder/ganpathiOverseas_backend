"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authClient,
  ExtendedUser,
  UserRole,
  getDefaultRouteForRole,
  canAccessRoute,
} from "@/lib/auth";

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<ExtendedUser>
  ) => Promise<{ error: string | null }>;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        const currentUser = await authClient.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to get initial user:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = authClient.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);

      // Redirect based on user role
      if (user && user.role) {
        const currentPath = window.location.pathname;

        // If user is on auth pages, redirect to their default route
        if (currentPath.startsWith("/auth") || currentPath === "/") {
          const defaultRoute = getDefaultRouteForRole(user.role);
          router.push(defaultRoute);
        }
        // If user doesn't have access to current route, redirect to default
        else if (!canAccessRoute(user.role, currentPath)) {
          const defaultRoute = getDefaultRouteForRole(user.role);
          router.push(defaultRoute);
        }
      } else if (!user) {
        // User is not authenticated, redirect to sign in
        const publicRoutes = [
          "/auth/sign-in",
          "/auth/sign-up",
          "/auth/forgot-password",
        ];
        if (!publicRoutes.includes(window.location.pathname)) {
          router.push("/auth/sign-in");
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: signedInUser, error } = await authClient.signIn(
        email,
        password
      );

      if (error) {
        setLoading(false);
        return { error };
      }

      // User state will be updated by the auth state change listener
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ExtendedUser>) => {
    try {
      const { error } = await authClient.updateProfile(updates);

      if (!error && user) {
        // Update local user state
        setUser({ ...user, ...updates });
      }

      return { error };
    } catch (error) {
      return { error: "Profile update failed" };
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  const canAccess = (route: string): boolean => {
    if (!user || !user.role) return false;
    return canAccessRoute(user.role, route);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
    hasRole,
    canAccess,
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

// Higher-order component for route protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push("/auth/sign-in");
        } else if (requiredRoles && !hasRole(requiredRoles)) {
          const defaultRoute = getDefaultRouteForRole(user.role!);
          router.push(defaultRoute);
        }
      }
    }, [user, loading, hasRole, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (requiredRoles && !hasRole(requiredRoles)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for role-based access control
export function useRoleAccess() {
  const { user, hasRole, canAccess } = useAuth();

  return {
    isAdmin: hasRole(["admin"]),
    isSupervisor: hasRole(["admin", "supervisor"]),
    isFinance: hasRole(["admin", "finance"]),
    isOperator: hasRole(["operator"]),
    hasRole,
    canAccess,
    userRole: user?.role,
  };
}
