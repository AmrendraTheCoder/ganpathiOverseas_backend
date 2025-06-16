"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Eye,
  EyeOff,
  UserPlus,
  Building2,
  Calendar,
  DollarSign,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  username: string;
  password: string;
  confirmPassword: string;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  isActive: boolean;
}

const rolePermissions = {
  admin: {
    label: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "All Modules",
      "User Management",
      "System Settings",
      "Reports",
      "Financial Data",
    ],
    color: "bg-red-100 text-red-800",
  },
  supervisor: {
    label: "Supervisor",
    description: "Production management and job oversight",
    permissions: [
      "Job Management",
      "Production",
      "Quality Control",
      "Reports",
      "Inventory",
    ],
    color: "bg-blue-100 text-blue-800",
  },
  finance: {
    label: "Finance Manager",
    description: "Financial operations and accounting",
    permissions: [
      "Financial Management",
      "Transactions",
      "Invoices",
      "Parties",
      "Reports",
    ],
    color: "bg-green-100 text-green-800",
  },
  operator: {
    label: "Machine Operator",
    description: "Machine operation and job execution",
    permissions: [
      "Assigned Jobs",
      "Machine Status",
      "Progress Updates",
      "Quality Checks",
    ],
    color: "bg-yellow-100 text-yellow-800",
  },
};

function CreateUserPageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    username: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    department: "",
    designation: "",
    joiningDate: "",
    salary: 0,
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    isActive: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real implementation, this would call an API
    console.log("Creating user:", formData);

    // Redirect to users list
    router.push("/users");
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateUsername = () => {
    if (formData.name) {
      const username = formData.name.toLowerCase().replace(/\s+/g, ".");
      handleInputChange("username", username);
    }
  };

  const generateEmployeeId = () => {
    const rolePrefix = {
      admin: "ADM",
      supervisor: "SUP",
      finance: "FIN",
      operator: "OPR",
    };

    if (formData.role) {
      const prefix = rolePrefix[formData.role as keyof typeof rolePrefix];
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      handleInputChange("employeeId", `${prefix}${randomNum}`);
    }
  };

  const selectedRole = formData.role
    ? rolePermissions[formData.role as keyof typeof rolePermissions]
    : null;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Add New User
            </h1>
            <p className="text-gray-600">Create a new employee account</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic personal details of the employee
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="employee@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Complete address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">
                      Emergency Contact Name
                    </Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) =>
                        handleInputChange("emergencyContact", e.target.value)
                      }
                      placeholder="Emergency contact person"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) =>
                        handleInputChange("emergencyPhone", e.target.value)
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Account & Security
                </CardTitle>
                <CardDescription>
                  Login credentials and access permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        placeholder="username"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateUsername}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        handleInputChange("role", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="finance">Finance Manager</SelectItem>
                        <SelectItem value="operator">
                          Machine Operator
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="Enter password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        placeholder="Confirm password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {formData.password &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <div className="text-sm text-red-600">
                      Passwords do not match!
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Employment Details
                </CardTitle>
                <CardDescription>
                  Job-related information and compensation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        onChange={(e) =>
                          handleInputChange("employeeId", e.target.value)
                        }
                        placeholder="EMP001"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateEmployeeId}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="administration">
                          Administration
                        </SelectItem>
                        <SelectItem value="quality">Quality Control</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) =>
                        handleInputChange("designation", e.target.value)
                      }
                      placeholder="Job title/designation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) =>
                        handleInputChange("joiningDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="salary">Monthly Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.salary}
                    onChange={(e) =>
                      handleInputChange(
                        "salary",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedRole && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Role & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge className={selectedRole.color}>
                      {selectedRole.label}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedRole.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Permissions Included:
                    </h4>
                    <div className="space-y-2">
                      {selectedRole.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Active</span>
                  <Badge variant={formData.isActive ? "default" : "secondary"}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="text-sm text-gray-600">
                  <p>New user will receive:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Welcome email with login credentials</li>
                    <li>Access to assigned modules</li>
                    <li>Initial setup instructions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {formData.salary > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Salary:</span>
                      <span className="font-medium">
                        ₹{formData.salary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Package:</span>
                      <span className="font-medium">
                        ₹{(formData.salary * 12).toLocaleString()}
                      </span>
                    </div>
                    {formData.joiningDate && (
                      <div className="flex justify-between">
                        <span>Joining Date:</span>
                        <span className="font-medium">
                          {new Date(formData.joiningDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.name ||
              !formData.email ||
              !formData.username ||
              !formData.password ||
              !formData.role
            }
          >
            {isSubmitting ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateUserPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin"]}>
        <CreateUserPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
