"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultRouteForRole } from "@/lib/auth";
import { Building2 } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && user.role) {
        // User is authenticated, redirect to their default route
        const defaultRoute = getDefaultRouteForRole(user.role);
        router.push(defaultRoute);
      } else {
        // User is not authenticated, redirect to sign in
        router.push("/auth/sign-in");
      }
    }
  }, [user, loading, router]);

  // Show loading screen while determining authentication status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full animate-pulse">
            <Building2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ganpathi Overseas
        </h1>
        <p className="text-gray-600 mb-6">Job Management System</p>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    </div>
  );
}
