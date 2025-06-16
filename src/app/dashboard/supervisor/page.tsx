"use client";

import React from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Settings,
  Calendar,
  Plus,
  Eye,
  Edit,
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
import { Progress } from "@/components/ui/progress";
import {
  getDashboardStats,
  demoJobSheets,
  demoJobProgress,
  demoUsers,
  demoMachines,
  getUserById,
  getMachineById,
  getPartyById,
} from "@/data/demo-data";

const SupervisorDashboard = () => {
  const stats = getDashboardStats("supervisor");

  const activeJobs = demoJobSheets.filter((job) =>
    ["pending", "in_progress"].includes(job.status)
  );

  const myJobs = demoJobSheets.filter((job) => job.assignedTo === "2"); // Supervisor's jobs
  const todaysJobs = demoJobSheets.filter(
    (job) =>
      new Date(job.orderDate).toDateString() === new Date().toDateString()
  );

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      1: "bg-red-100 text-red-800",
      2: "bg-yellow-100 text-yellow-800",
      3: "bg-green-100 text-green-800",
    };
    const labels = { 1: "High", 2: "Medium", 3: "Low" };
    return {
      color:
        colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800",
      label: labels[priority as keyof typeof labels] || "Normal",
    };
  };

  const getJobProgress = (jobId: string) => {
    const progressSteps = demoJobProgress.filter((p) => p.jobId === jobId);
    const totalSteps = 4; // Typical printing workflow stages
    const completedSteps = progressSteps.filter(
      (p) => p.status === "completed"
    ).length;
    return (completedSteps / totalSteps) * 100;
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    color = "blue",
  }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supervisor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Job management and production oversight
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={FileText}
          description="All assigned jobs"
          color="blue"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={Clock}
          description="In progress & pending"
          color="orange"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle}
          description="Jobs finished today"
          color="green"
        />
        <StatCard
          title="My Jobs"
          value={stats.myJobs}
          icon={Users}
          description="Directly assigned to me"
          color="purple"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Active Jobs</CardTitle>
            <CardDescription>
              Jobs currently in progress or pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.slice(0, 5).map((job) => {
                const progress = getJobProgress(job.id);
                const priority = getPriorityBadge(job.priority);
                const party = getPartyById(job.partyId);
                const operator = getUserById(job.assignedTo || "");

                return (
                  <div
                    key={job.id}
                    className="space-y-3 border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{job.title}</p>
                          <Badge className={getStatusBadge(job.status)}>
                            {job.status.replace("_", " ")}
                          </Badge>
                          <Badge className={priority.color}>
                            {priority.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {job.jobNumber} • {party?.name} • {operator?.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Due:{" "}
                        {job.dueDate
                          ? new Date(job.dueDate).toLocaleDateString()
                          : "TBD"}
                      </span>
                      <span>Qty: {job.quantity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Active Jobs
            </Button>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Jobs scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysJobs.length > 0 ? (
                todaysJobs.map((job) => {
                  const machine = getMachineById(job.machineId || "");
                  const operator = getUserById(job.assignedTo || "");

                  return (
                    <div
                      key={job.id}
                      className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {machine?.name} • {operator?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadge(job.status)}>
                          {job.status.replace("_", " ")}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {job.startedAt
                            ? new Date(job.startedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Not started"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm">No jobs scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Production Overview</CardTitle>
          <CardDescription>
            Current production status and machine utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {demoMachines
              .filter((m) => m.isActive)
              .map((machine) => {
                const assignedJobs = demoJobSheets.filter(
                  (job) =>
                    job.machineId === machine.id && job.status === "in_progress"
                );
                const operator = getUserById(machine.operatorId || "");

                return (
                  <div key={machine.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">{machine.name}</h4>
                      <Badge
                        variant={
                          assignedJobs.length > 0 ? "default" : "secondary"
                        }
                      >
                        {assignedJobs.length > 0 ? "Busy" : "Idle"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {machine.type} • {operator?.name || "Unassigned"}
                    </p>
                    {assignedJobs.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Current Job:</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {assignedJobs[0].title}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used supervisor functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span className="text-xs">Create Job</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-xs">Update Progress</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-xs">Assign Tasks</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span className="text-xs">Machine Status</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-xs">Quality Check</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorDashboard;
