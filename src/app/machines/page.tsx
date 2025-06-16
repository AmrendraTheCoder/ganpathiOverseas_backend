"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Settings,
  Activity,
  Clock,
  Wrench,
  User,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Power,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  demoMachines,
  demoJobSheets,
  demoUsers,
  getUserById,
  Machine,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

const MachinesPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredMachines = demoMachines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || machine.status === statusFilter;
    const matchesType = typeFilter === "all" || machine.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "idle":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "maintenance":
        return <Wrench className="w-4 h-4 text-orange-600" />;
      case "offline":
        return <Power className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      running: { color: "bg-green-100 text-green-800", label: "Running" },
      idle: { color: "bg-yellow-100 text-yellow-800", label: "Idle" },
      maintenance: {
        color: "bg-orange-100 text-orange-800",
        label: "Maintenance",
      },
      offline: { color: "bg-red-100 text-red-800", label: "Offline" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };

    return (
      <Badge className={config.color}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const calculateUtilization = (machineId: string) => {
    const totalHours = 8; // 8 hour work day
    const activeJobs = demoJobSheets.filter(
      (job) =>
        job.assignedMachineId === machineId &&
        ["in_progress", "setup"].includes(job.status)
    );

    const usedHours = activeJobs.reduce((total, job) => {
      return total + (job.estimatedHours || 2);
    }, 0);

    return Math.min((usedHours / totalHours) * 100, 100);
  };

  const getMaintenanceStatus = (lastMaintenance: string) => {
    const lastDate = new Date(lastMaintenance);
    const daysSince = Math.floor(
      (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince > 30)
      return { status: "overdue", color: "text-red-600", days: daysSince };
    if (daysSince > 21)
      return { status: "due", color: "text-yellow-600", days: daysSince };
    return { status: "good", color: "text-green-600", days: daysSince };
  };

  const MachineCard = ({ machine }: { machine: Machine }) => {
    const operator = getUserById(machine.operatorId);
    const utilization = calculateUtilization(machine.id);
    const maintenance = getMaintenanceStatus(machine.lastMaintenance);

    const activeJobs = demoJobSheets.filter(
      (job) =>
        job.assignedMachineId === machine.id &&
        ["in_progress", "setup"].includes(job.status)
    ).length;

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <div className="p-2 rounded-lg mr-3 bg-blue-100">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                {machine.name}
              </CardTitle>
              <CardDescription>
                {machine.type} • Model: {machine.model || "N/A"}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(machine.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Operator</p>
              <div className="flex items-center mt-1">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <p className="font-medium">{operator?.name || "Unassigned"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Hourly Rate</p>
              <p className="text-lg font-bold text-green-600">
                ₹{machine.hourlyRate}/hr
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-lg font-bold text-blue-600">{activeJobs}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Utilization</p>
              <div className="flex items-center space-x-2 mt-1">
                <Progress value={utilization} className="flex-1" />
                <span className="text-sm font-medium">
                  {utilization.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Last Maintenance
                  </p>
                  <p className="font-medium">
                    {new Date(machine.lastMaintenance).toLocaleDateString()}
                  </p>
                </div>
                <div className={`text-sm font-medium ${maintenance.color}`}>
                  {maintenance.days} days ago
                </div>
              </div>
              {maintenance.status === "overdue" && (
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Maintenance overdue!
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Today's Runtime
                  </p>
                  <p className="font-medium">
                    {(utilization * 0.08).toFixed(1)} hours
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {machine.specifications && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Specifications
              </p>
              <div className="grid gap-2 text-sm">
                {Object.entries(machine.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(machine.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Wrench className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate summary stats
  const runningMachines = demoMachines.filter(
    (m) => m.status === "running"
  ).length;
  const maintenanceMachines = demoMachines.filter(
    (m) => m.status === "maintenance"
  ).length;
  const averageUtilization =
    demoMachines.reduce(
      (sum, machine) => sum + calculateUtilization(machine.id),
      0
    ) / demoMachines.length;
  const totalRevenue = demoMachines.reduce(
    (sum, machine) =>
      sum + machine.hourlyRate * calculateUtilization(machine.id) * 0.08,
    0
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Machine Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all production machines
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Maintenance Schedule
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Machine
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Machines
            </CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMachines.length}</div>
            <p className="text-xs text-muted-foreground">
              Production equipment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {runningMachines}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Utilization
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {averageUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Efficiency rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Machine earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              Machine Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm">Running</span>
              </div>
              <span className="text-sm font-medium">{runningMachines}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm">Idle</span>
              </div>
              <span className="text-sm font-medium">
                {demoMachines.filter((m) => m.status === "idle").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wrench className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-sm">Maintenance</span>
              </div>
              <span className="text-sm font-medium">{maintenanceMachines}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Power className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm">Offline</span>
              </div>
              <span className="text-sm font-medium">
                {demoMachines.filter((m) => m.status === "offline").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maintenance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoMachines
                .filter((machine) => {
                  const maintenance = getMaintenanceStatus(
                    machine.lastMaintenance
                  );
                  return maintenance.status !== "good";
                })
                .slice(0, 3)
                .map((machine) => {
                  const maintenance = getMaintenanceStatus(
                    machine.lastMaintenance
                  );
                  return (
                    <div
                      key={machine.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{machine.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {maintenance.days} days overdue
                        </p>
                      </div>
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                  );
                })}
              {demoMachines.filter((machine) => {
                const maintenance = getMaintenanceStatus(
                  machine.lastMaintenance
                );
                return maintenance.status !== "good";
              }).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No maintenance alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoMachines
                .sort(
                  (a, b) =>
                    calculateUtilization(b.id) - calculateUtilization(a.id)
                )
                .slice(0, 3)
                .map((machine) => (
                  <div
                    key={machine.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{machine.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {machine.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {calculateUtilization(machine.id).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Machine Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Machine Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="printing">Printing</SelectItem>
                <SelectItem value="cutting">Cutting</SelectItem>
                <SelectItem value="lamination">Lamination</SelectItem>
                <SelectItem value="binding">Binding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Machines List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Machines ({filteredMachines.length})
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No machines found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No machines match your search criteria. Try adjusting your
                  filters.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Machine
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Machines Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Machines Overview</CardTitle>
          <CardDescription>
            Detailed machine information and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Machine</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.map((machine) => {
                const operator = getUserById(machine.operatorId);
                const utilization = calculateUtilization(machine.id);

                return (
                  <TableRow key={machine.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{machine.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {machine.model || "No model specified"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{machine.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        {operator?.name || "Unassigned"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(machine.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={utilization} className="w-16" />
                        <span className="text-sm">
                          {utilization.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{machine.hourlyRate}/hr
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Wrench className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const MachinesPage = () => {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <MachinesPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
};

export default MachinesPage;
