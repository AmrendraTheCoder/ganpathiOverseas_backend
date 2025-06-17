"use client";

import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Users,
  Eye,
  Lock,
  Unlock,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  color: string;
}

const permissions: Permission[] = [
  // User Management
  {
    id: "users.create",
    name: "Create Users",
    description: "Add new user accounts",
    category: "User Management",
  },
  {
    id: "users.read",
    name: "View Users",
    description: "View user information",
    category: "User Management",
  },
  {
    id: "users.update",
    name: "Edit Users",
    description: "Modify user accounts",
    category: "User Management",
  },
  {
    id: "users.delete",
    name: "Delete Users",
    description: "Remove user accounts",
    category: "User Management",
  },
  {
    id: "roles.manage",
    name: "Manage Roles",
    description: "Create and modify user roles",
    category: "User Management",
  },

  // Jobs & Production
  {
    id: "jobs.create",
    name: "Create Jobs",
    description: "Create new job orders",
    category: "Jobs & Production",
  },
  {
    id: "jobs.read",
    name: "View Jobs",
    description: "View job information",
    category: "Jobs & Production",
  },
  {
    id: "jobs.update",
    name: "Edit Jobs",
    description: "Modify job details",
    category: "Jobs & Production",
  },
  {
    id: "jobs.delete",
    name: "Delete Jobs",
    description: "Remove job orders",
    category: "Jobs & Production",
  },
  {
    id: "production.manage",
    name: "Manage Production",
    description: "Control production processes",
    category: "Jobs & Production",
  },
  {
    id: "machines.operate",
    name: "Operate Machines",
    description: "Use production machinery",
    category: "Jobs & Production",
  },

  // Financial
  {
    id: "invoices.create",
    name: "Create Invoices",
    description: "Generate customer invoices",
    category: "Financial",
  },
  {
    id: "invoices.read",
    name: "View Invoices",
    description: "View invoice information",
    category: "Financial",
  },
  {
    id: "invoices.update",
    name: "Edit Invoices",
    description: "Modify invoice details",
    category: "Financial",
  },
  {
    id: "transactions.manage",
    name: "Manage Transactions",
    description: "Handle financial transactions",
    category: "Financial",
  },
  {
    id: "reports.financial",
    name: "Financial Reports",
    description: "Access financial reports",
    category: "Financial",
  },

  // Inventory
  {
    id: "inventory.read",
    name: "View Inventory",
    description: "View inventory levels",
    category: "Inventory",
  },
  {
    id: "inventory.update",
    name: "Update Inventory",
    description: "Modify inventory records",
    category: "Inventory",
  },
  {
    id: "suppliers.manage",
    name: "Manage Suppliers",
    description: "Handle supplier relationships",
    category: "Inventory",
  },
  {
    id: "purchase.orders",
    name: "Purchase Orders",
    description: "Create and manage purchase orders",
    category: "Inventory",
  },

  // Parties & CRM
  {
    id: "parties.create",
    name: "Create Parties",
    description: "Add new customers/suppliers",
    category: "Parties & CRM",
  },
  {
    id: "parties.read",
    name: "View Parties",
    description: "View party information",
    category: "Parties & CRM",
  },
  {
    id: "parties.update",
    name: "Edit Parties",
    description: "Modify party details",
    category: "Parties & CRM",
  },
  {
    id: "crm.access",
    name: "CRM Access",
    description: "Access CRM functionality",
    category: "Parties & CRM",
  },

  // System
  {
    id: "system.config",
    name: "System Configuration",
    description: "Modify system settings",
    category: "System",
  },
  {
    id: "reports.access",
    name: "Access Reports",
    description: "View system reports",
    category: "System",
  },
  {
    id: "analytics.access",
    name: "Access Analytics",
    description: "View analytics dashboard",
    category: "System",
  },
];

const roles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: permissions.map((p) => p.id),
    userCount: 2,
    isSystemRole: true,
    createdAt: "2023-01-01",
    updatedAt: "2024-01-01",
    color: "bg-red-100 text-red-800",
  },
  {
    id: "supervisor",
    name: "Supervisor",
    description: "Production and job management with reporting access",
    permissions: [
      "jobs.create",
      "jobs.read",
      "jobs.update",
      "production.manage",
      "machines.operate",
      "inventory.read",
      "inventory.update",
      "parties.read",
      "parties.update",
      "reports.access",
      "analytics.access",
    ],
    userCount: 3,
    isSystemRole: true,
    createdAt: "2023-01-01",
    updatedAt: "2024-01-01",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "finance",
    name: "Finance Manager",
    description: "Financial operations and invoice management",
    permissions: [
      "invoices.create",
      "invoices.read",
      "invoices.update",
      "transactions.manage",
      "reports.financial",
      "parties.read",
      "analytics.access",
    ],
    userCount: 1,
    isSystemRole: true,
    createdAt: "2023-01-01",
    updatedAt: "2024-01-01",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "operator",
    name: "Machine Operator",
    description: "Machine operation and job execution",
    permissions: [
      "jobs.read",
      "machines.operate",
      "inventory.read",
      "production.manage",
    ],
    userCount: 5,
    isSystemRole: true,
    createdAt: "2023-01-01",
    updatedAt: "2024-01-01",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "sales",
    name: "Sales Representative",
    description: "Customer management and order creation",
    permissions: [
      "jobs.create",
      "jobs.read",
      "parties.create",
      "parties.read",
      "parties.update",
      "crm.access",
      "invoices.read",
    ],
    userCount: 2,
    isSystemRole: false,
    createdAt: "2023-06-01",
    updatedAt: "2023-12-01",
    color: "bg-purple-100 text-purple-800",
  },
];

function UserRolesPageContent() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  // Format dates consistently to avoid hydration errors
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEditingPermissions([...role.permissions]);
  };

  const togglePermission = (permissionId: string) => {
    setEditingPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};
    permissions.forEach((permission) => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const hasPermission = (rolePermissions: string[], permissionId: string) => {
    return rolePermissions.includes(permissionId);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Role & Permission Management
          </h1>
          <p className="text-gray-600">
            Manage user roles and their associated permissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Permission Matrix
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Permission Matrix</DialogTitle>
                <DialogDescription>
                  Overview of all roles and their permissions
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Permission</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center p-2 min-w-20">
                          <Badge className={role.color}>{role.name}</Badge>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission) => (
                      <tr key={permission.id} className="border-b">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-xs text-gray-500">
                              {permission.description}
                            </div>
                          </div>
                        </td>
                        {roles.map((role) => (
                          <td key={role.id} className="text-center p-2">
                            {hasPermission(role.permissions, permission.id) ? (
                              <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new user role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input id="roleName" placeholder="Enter role name" />
                  </div>
                  <div>
                    <Label htmlFor="roleColor">Color</Label>
                    <select className="w-full p-2 border rounded">
                      <option value="bg-blue-100 text-blue-800">Blue</option>
                      <option value="bg-green-100 text-green-800">Green</option>
                      <option value="bg-purple-100 text-purple-800">
                        Purple
                      </option>
                      <option value="bg-orange-100 text-orange-800">
                        Orange
                      </option>
                      <option value="bg-pink-100 text-pink-800">Pink</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea
                    id="roleDescription"
                    placeholder="Describe the role's purpose and responsibilities"
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="max-h-64 overflow-auto border rounded p-4 space-y-4">
                    {Object.entries(getPermissionsByCategory()).map(
                      ([category, perms]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium text-sm">{category}</h4>
                          <div className="space-y-2 ml-4">
                            {perms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center space-x-2"
                              >
                                <Switch id={permission.id} />
                                <div>
                                  <Label
                                    htmlFor={permission.id}
                                    className="text-sm font-medium"
                                  >
                                    {permission.name}
                                  </Label>
                                  <p className="text-xs text-gray-500">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Create Role</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold">{roles.length}</p>
                <p className="text-xs text-gray-500">Active roles</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Roles
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {roles.filter((r) => r.isSystemRole).length}
                </p>
                <p className="text-xs text-green-600">Built-in roles</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Custom Roles
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {roles.filter((r) => !r.isSystemRole).length}
                </p>
                <p className="text-xs text-purple-600">User-defined</p>
              </div>
              <Settings className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold">
                  {roles.reduce((sum, role) => sum + role.userCount, 0)}
                </p>
                <p className="text-xs text-gray-500">Across all roles</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">All Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="matrix">Role Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <Badge className={role.color}>
                          {role.userCount} users
                        </Badge>
                        {role.isSystemRole && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            System
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Permissions:</span>{" "}
                      {role.permissions.length} of {permissions.length}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(role.createdAt)}
                    </p>
                    <p>
                      <span className="font-medium">Last Updated:</span>{" "}
                      {formatDate(role.updatedAt)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Permission Categories:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(getPermissionsByCategory()).map(
                        ([category, perms]) => {
                          const categoryPermissions = perms.filter((p) =>
                            role.permissions.includes(p.id)
                          );
                          if (categoryPermissions.length === 0) return null;

                          return (
                            <Badge
                              key={category}
                              variant="outline"
                              className="text-xs"
                            >
                              {category} ({categoryPermissions.length}/
                              {perms.length})
                            </Badge>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleSelect(role)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {!role.isSystemRole && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>
                System permissions grouped by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(getPermissionsByCategory()).map(
                  ([category, perms]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        {category}
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {perms.map((permission) => (
                          <div
                            key={permission.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">
                                  {permission.name}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {permission.description}
                                </p>
                                <div className="mt-2 text-xs text-gray-500">
                                  ID:{" "}
                                  <code className="bg-gray-100 px-1 rounded">
                                    {permission.id}
                                  </code>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">
                                  Used in{" "}
                                  {
                                    roles.filter((r) =>
                                      r.permissions.includes(permission.id)
                                    ).length
                                  }{" "}
                                  roles
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permission Matrix</CardTitle>
              <CardDescription>
                Complete overview of roles and their assigned permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 min-w-64">Permission</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center p-3 min-w-32">
                          <div className="space-y-1">
                            <Badge className={role.color}>{role.name}</Badge>
                            <div className="text-xs text-gray-500">
                              {role.userCount} users
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(getPermissionsByCategory()).map(
                      ([category, perms]) => (
                        <React.Fragment key={category}>
                          <tr className="bg-gray-50">
                            <td
                              colSpan={roles.length + 1}
                              className="p-3 font-medium"
                            >
                              {category}
                            </td>
                          </tr>
                          {perms.map((permission) => (
                            <tr
                              key={permission.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">
                                    {permission.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {permission.description}
                                  </div>
                                </div>
                              </td>
                              {roles.map((role) => (
                                <td key={role.id} className="text-center p-3">
                                  {hasPermission(
                                    role.permissions,
                                    permission.id
                                  ) ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Details Modal */}
      {selectedRole && (
        <Dialog
          open={!!selectedRole}
          onOpenChange={() => setSelectedRole(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Badge className={selectedRole.color}>
                  {selectedRole.name}
                </Badge>
                {selectedRole.isSystemRole && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    System Role
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{selectedRole.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-medium">
                    {formatDate(selectedRole.createdAt)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <div className="font-medium">
                    {formatDate(selectedRole.updatedAt)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Users:</span>
                  <div className="font-medium">
                    {selectedRole.userCount} assigned
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Permissions:</span>
                  <div className="font-medium">
                    {selectedRole.permissions.length} of {permissions.length}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Assigned Permissions</h4>
                <div className="max-h-64 overflow-auto space-y-4">
                  {Object.entries(getPermissionsByCategory()).map(
                    ([category, perms]) => {
                      const categoryPermissions = perms.filter((p) =>
                        selectedRole.permissions.includes(p.id)
                      );
                      if (categoryPermissions.length === 0) return null;

                      return (
                        <div key={category} className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">
                            {category}
                          </h5>
                          <div className="space-y-1 ml-4">
                            {categoryPermissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center space-x-2 text-sm"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="font-medium">
                                  {permission.name}
                                </span>
                                <span className="text-gray-500">
                                  - {permission.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function UserRolesPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin"]}>
        <UserRolesPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
