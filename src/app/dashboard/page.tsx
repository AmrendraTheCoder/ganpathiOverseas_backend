"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const DashboardPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case "admin":
          router.replace("/dashboard/admin");
          break;
        case "supervisor":
          router.replace("/dashboard/supervisor");
          break;
        case "finance":
          router.replace("/dashboard/finance");
          break;
        case "operator":
          router.replace("/dashboard/operator");
          break;
        default:
          router.replace("/dashboard/admin");
      }
    }
  }, [user, router]);

  // Loading state while redirecting
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardPage;
