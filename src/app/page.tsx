"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Building2,
  Users,
  Settings,
  BarChart3,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      // Redirect authenticated users to their role-specific dashboard
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(credentials.username, credentials.password);
      // User will be redirected by the useEffect above
    } catch (error) {
      console.error("Login failed:", error);
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: "Admin", username: "admin", password: "password" },
    { role: "Supervisor", username: "supervisor", password: "password" },
    { role: "Finance", username: "finance", password: "password" },
    { role: "Operator", username: "operator1", password: "password" },
  ];

  const features = [
    {
      icon: Users,
      title: "Multi-Role Management",
      description:
        "Admin, Supervisor, Finance, and Operator roles with customized dashboards",
    },
    {
      icon: Building2,
      title: "Customer Management",
      description:
        "Complete party database with credit monitoring and transaction history",
    },
    {
      icon: Settings,
      title: "Machine Monitoring",
      description:
        "Real-time equipment tracking, utilization monitoring, and maintenance alerts",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description:
        "Comprehensive business intelligence and performance metrics",
    },
  ];

  // Don't render anything if user is already authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Ganpathi Overseas
            </h1>
          </div>
          <p className="text-xl text-gray-600">Print Shop Management System</p>
          <p className="text-gray-500 mt-2">
            Complete business management solution for print operations
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
          {/* Login Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                Login to Your Dashboard
              </CardTitle>
              <CardDescription>
                Access your role-specific management interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Demo Login Credentials
                </h3>
                <div className="space-y-2">
                  {demoCredentials.map((cred, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-blue-800">
                        {cred.role}:
                      </span>
                      <span className="text-blue-700">
                        {cred.username} / {cred.password}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCredentials({
                            username: cred.username,
                            password: cred.password,
                          })
                        }
                        className="text-xs"
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">System Features</CardTitle>
              <CardDescription>
                Comprehensive print shop management capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <feature.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  System Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-green-800">
                      Frontend Development:
                    </span>
                    <span className="text-green-700 font-medium">
                      ✅ Complete
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-800">Demo Data System:</span>
                    <span className="text-green-700 font-medium">
                      ✅ Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-800">API Integration:</span>
                    <span className="text-green-700 font-medium">✅ Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-800">Database Connection:</span>
                    <span className="text-amber-600 font-medium">
                      ⏳ Pending
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Role-Based Access Control
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="p-3 bg-red-100 rounded-lg inline-block mb-3">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Admin</h3>
                  <p className="text-sm text-gray-600">
                    Complete system access and user management
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Supervisor</h3>
                  <p className="text-sm text-gray-600">
                    Production management and job oversight
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Finance</h3>
                  <p className="text-sm text-gray-600">
                    Financial operations and reporting
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Operator</h3>
                  <p className="text-sm text-gray-600">
                    Task management and machine monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
