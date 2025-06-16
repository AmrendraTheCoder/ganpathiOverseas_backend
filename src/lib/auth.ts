import { createClient } from "@/supabase/client";
import { createClient as createServerClient } from "@/supabase/server";
import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "supervisor" | "finance" | "operator";

export interface ExtendedUser extends User {
  role?: UserRole;
  full_name?: string;
  username?: string;
  is_active?: boolean;
  avatar_url?: string;
  phone?: string;
}

export interface AuthResponse {
  user: ExtendedUser | null;
  error: string | null;
}

// Client-side authentication functions
export class AuthClient {
  private supabase = createClient();

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const userProfile = await this.getUserProfile(data.user.id);
        const extendedUser: ExtendedUser = {
          ...data.user,
          ...userProfile,
        };
        return { user: extendedUser, error: null };
      }

      return { user: null, error: "Authentication failed" };
    } catch (error) {
      return { user: null, error: "An unexpected error occurred" };
    }
  }

  // Sign up new user (admin only)
  async signUp(userData: {
    email: string;
    password: string;
    username: string;
    full_name: string;
    role: UserRole;
    phone?: string;
  }): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role,
            phone: userData.phone || "",
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Insert user profile
      if (data.user) {
        const { error: profileError } = await this.supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: userData.email,
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role,
            phone: userData.phone || "",
            is_active: true,
          });

        if (profileError) {
          return { user: null, error: "Failed to create user profile" };
        }

        const extendedUser: ExtendedUser = {
          ...data.user,
          ...userData,
        };
        return { user: extendedUser, error: null };
      }

      return { user: null, error: "User creation failed" };
    } catch (error) {
      return { user: null, error: "An unexpected error occurred" };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: "Sign out failed" };
    }
  }

  // Get current user with profile
  async getCurrentUser(): Promise<ExtendedUser | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user) return null;

      const userProfile = await this.getUserProfile(user.id);
      return {
        ...user,
        ...userProfile,
      };
    } catch (error) {
      return null;
    }
  }

  // Get user profile from database
  private async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("role, full_name, username, is_active, avatar_url, phone")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return { role: "operator" as UserRole };
      }

      return data;
    } catch (error) {
      return { role: "operator" as UserRole };
    }
  }

  // Update user profile
  async updateProfile(
    updates: Partial<{
      full_name: string;
      username: string;
      phone: string;
      avatar_url: string;
    }>
  ): Promise<{ error: string | null }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { error: "User not authenticated" };
      }

      const { error } = await this.supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      return { error: error?.message || null };
    } catch (error) {
      return { error: "Profile update failed" };
    }
  }

  // Change password
  async changePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      return { error: error?.message || null };
    } catch (error) {
      return { error: "Password change failed" };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error: error?.message || null };
    } catch (error) {
      return { error: "Password reset failed" };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: ExtendedUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userProfile = await this.getUserProfile(session.user.id);
        const extendedUser: ExtendedUser = {
          ...session.user,
          ...userProfile,
        };
        callback(extendedUser);
      } else {
        callback(null);
      }
    });
  }
}

// Server-side authentication functions
export class AuthServer {
  // Get current user on server side
  static async getCurrentUser(): Promise<ExtendedUser | null> {
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: userProfile } = await supabase
        .from("users")
        .select("role, full_name, username, is_active, avatar_url, phone")
        .eq("id", user.id)
        .single();

      return {
        ...user,
        role: userProfile?.role || "operator",
        full_name: userProfile?.full_name || "",
        username: userProfile?.username || "",
        is_active: userProfile?.is_active || false,
        avatar_url: userProfile?.avatar_url || "",
        phone: userProfile?.phone || "",
      };
    } catch (error) {
      return null;
    }
  }

  // Check if user has required role
  static async hasRole(requiredRoles: UserRole[]): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  }

  // Check if user is admin
  static async isAdmin(): Promise<boolean> {
    return this.hasRole(["admin"]);
  }

  // Check if user is supervisor or admin
  static async isSupervisorOrAdmin(): Promise<boolean> {
    return this.hasRole(["admin", "supervisor"]);
  }

  // Check if user is finance or admin
  static async isFinanceOrAdmin(): Promise<boolean> {
    return this.hasRole(["admin", "finance"]);
  }
}

// Role-based route protection
export const ROLE_ROUTES = {
  admin: ["/admin", "/users", "/settings", "/audit"],
  supervisor: ["/jobs", "/parties", "/machines", "/reports"],
  finance: ["/finance", "/expenses", "/invoices", "/payments"],
  operator: ["/dashboard", "/my-jobs"],
};

// Get default route for user role
export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "supervisor":
      return "/jobs";
    case "finance":
      return "/finance";
    case "operator":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

// Check if user can access route
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Admin can access everything
  if (userRole === "admin") return true;

  // Check role-specific routes
  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  return allowedRoutes.some((allowedRoute) => route.startsWith(allowedRoute));
}

// Create auth client instance
export const authClient = new AuthClient();
