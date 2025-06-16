"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

interface RoleBasedAccessProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleBasedAccess({
  allowedRoles,
  children,
  fallback,
}: RoleBasedAccessProps) {
  const { user } = useAuth();

  // If no user is logged in, show access denied
  if (!user) {
    return (
      fallback || (
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Please log in to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check if user role is in allowed roles
  if (!allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-orange-600">
                Access Restricted
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-gray-500">
                Required roles: {allowedRoles.join(", ")}
              </p>
              <p className="text-sm text-gray-500">Your role: {user.role}</p>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Hook for checking permissions in components
export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  };

  const canAccessAdminFeatures = () => hasRole("admin");
  const canAccessSupervisorFeatures = () => hasRole(["admin", "supervisor"]);
  const canAccessFinanceFeatures = () => hasRole(["admin", "finance"]);
  const canAccessOperatorFeatures = () =>
    hasRole(["admin", "supervisor", "operator"]);

  return {
    user,
    hasRole,
    canAccessAdminFeatures,
    canAccessSupervisorFeatures,
    canAccessFinanceFeatures,
    canAccessOperatorFeatures,
  };
}
