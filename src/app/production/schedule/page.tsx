"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Settings,
  Eye,
  Edit,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Users,
  Filter,
  Download,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import {
  demoJobSheets,
  demoMachines,
  demoUsers,
  getUserById,
  getMachineById,
  getPartyById,
} from "@/data/demo-data";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

// Generate production schedule data
const generateSchedule = () => {
  const today = new Date();
  const scheduleItems = [];

  demoJobSheets
    .filter((job) => job.status === "pending" || job.status === "in_progress")
    .forEach((job, index) => {
      const machine = demoMachines[index % demoMachines.length];
      const operator = demoUsers.find((user) => user.role === "operator");
      const party = getPartyById(job.partyId);

      const startDate = new Date(today);
      startDate.setDate(today.getDate() + index);

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 4 + (index % 6)); // 4-10 hour jobs

      scheduleItems.push({
        id: `schedule-${job.id}`,
        jobId: job.id,
        jobTitle: job.title,
        jobNumber: job.jobNumber,
        partyName: party?.name || "Unknown",
        machineId: machine.id,
        machineName: machine.name,
        operatorId: operator?.id || "",
        operatorName: operator?.name || "Unassigned",
        startTime: startDate,
        endTime: endDate,
        duration: Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
        ),
        status: job.status,
        priority: job.priority,
        progress: index < 2 ? 75 : index < 4 ? 45 : 0,
        estimatedHours: 4 + (index % 6),
        actualHours: index < 2 ? 3 + (index % 4) : 0,
      });
    });

  return scheduleItems.sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
};

function ProductionSchedulePageContent() {
  const [viewMode, setViewMode] = useState("timeline");
  const [machineFilter, setMachineFilter] = useState("all");
  const [dateRange, setDateRange] = useState("week");

  const schedule = generateSchedule();

  const filteredSchedule = schedule.filter((item) => {
    if (machineFilter === "all") return true;
    return item.machineId === machineFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return (
      variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    );
  };

  const getPriorityBadge = (priority: number) => {
    const labels = {
      1: { label: "Low", color: "bg-gray-100 text-gray-800" },
      2: { label: "Normal", color: "bg-blue-100 text-blue-800" },
      3: { label: "High", color: "bg-orange-100 text-orange-800" },
      4: { label: "Urgent", color: "bg-red-100 text-red-800" },
      5: { label: "Critical", color: "bg-red-200 text-red-900" },
    };
    return labels[priority as keyof typeof labels] || labels[2];
  };

  const machineUtilization = demoMachines.map((machine) => {
    const machineJobs = filteredSchedule.filter(
      (item) => item.machineId === machine.id
    );
    const totalHours = machineJobs.reduce(
      (sum, item) => sum + item.duration,
      0
    );
    const utilization = Math.min((totalHours / (8 * 7)) * 100, 100); // 8 hours/day * 7 days

    return {
      ...machine,
      scheduledJobs: machineJobs.length,
      utilization,
      totalHours,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Production Schedule
          </h1>
          <p className="text-gray-600">
            Plan and manage production timeline and machine allocation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="kanban">Kanban</SelectItem>
              <SelectItem value="calendar">Calendar</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Machine Utilization Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Machine Utilization
          </CardTitle>
          <CardDescription>
            Current machine capacity and scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {machineUtilization.map((machine) => (
              <div key={machine.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{machine.name}</h4>
                  <Badge variant={machine.isActive ? "default" : "secondary"}>
                    {machine.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilization:</span>
                    <span className="font-medium">
                      {machine.utilization.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        machine.utilization > 80
                          ? "bg-red-500"
                          : machine.utilization > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${machine.utilization}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{machine.scheduledJobs} jobs</span>
                    <span>{machine.totalHours}h scheduled</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Machine</label>
              <Select value={machineFilter} onValueChange={setMachineFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Machines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Machines</SelectItem>
                  {demoMachines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Date Range
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Production Timeline</CardTitle>
          <CardDescription>
            Scheduled jobs and machine assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSchedule.map((item) => {
              const priority = getPriorityBadge(item.priority);
              const isToday =
                item.startTime.toDateString() === new Date().toDateString();

              return (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 ${isToday ? "border-blue-200 bg-blue-50" : "hover:bg-gray-50"} transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          item.status === "in_progress"
                            ? "bg-blue-100"
                            : item.status === "completed"
                              ? "bg-green-100"
                              : "bg-yellow-100"
                        }`}
                      >
                        {item.status === "in_progress" ? (
                          <Play className="w-5 h-5 text-blue-600" />
                        ) : item.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-medium">{item.jobTitle}</h3>
                          <Badge className={getStatusBadge(item.status)}>
                            {item.status.replace("_", " ")}
                          </Badge>
                          <Badge className={priority.color}>
                            {priority.label}
                          </Badge>
                          {isToday && (
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800"
                            >
                              Today
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Job: {item.jobNumber}</span>
                          <span>Customer: {item.partyName}</span>
                          <span className="flex items-center">
                            <Settings className="w-4 h-4 mr-1" />
                            {item.machineName}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {item.operatorName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">
                        {item.startTime.toLocaleDateString()} -{" "}
                        {item.endTime.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.startTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {item.endTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Duration: {item.duration}h
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {item.status === "in_progress" && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{item.progress}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Estimated: {item.estimatedHours}h</span>
                        <span>Actual: {item.actualHours}h</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Job
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                    {item.status === "pending" && (
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}
                    {item.status === "in_progress" && (
                      <Button size="sm" variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSchedule.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No scheduled jobs
              </h3>
              <p className="text-gray-600">
                No jobs are scheduled for the selected criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled Jobs</p>
                <p className="text-2xl font-bold">{filteredSchedule.length}</p>
              </div>
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {
                    filteredSchedule.filter(
                      (item) => item.status === "in_progress"
                    ).length
                  }
                </p>
              </div>
              <Play className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {
                    filteredSchedule.filter((item) => item.status === "pending")
                      .length
                  }
                </p>
              </div>
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">
                  {filteredSchedule.reduce(
                    (sum, item) => sum + item.duration,
                    0
                  )}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductionSchedulePage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <ProductionSchedulePageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
