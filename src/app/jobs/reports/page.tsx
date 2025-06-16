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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  demoJobSheets,
  demoJobProgress,
  getUserById,
  getPartyById,
  getMachineById,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

function JobReportsPageContent() {
  const [dateRange, setDateRange] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calculate statistics
  const totalJobs = demoJobSheets.length;
  const completedJobs = demoJobSheets.filter(
    (job) => job.status === "completed"
  ).length;
  const inProgressJobs = demoJobSheets.filter(
    (job) => job.status === "in_progress"
  ).length;
  const pendingJobs = demoJobSheets.filter(
    (job) => job.status === "pending"
  ).length;
  const cancelledJobs = demoJobSheets.filter(
    (job) => job.status === "cancelled"
  ).length;

  const totalRevenue = demoJobSheets.reduce(
    (sum, job) => sum + (job.sellingPrice || 0),
    0
  );
  const avgJobValue = totalRevenue / totalJobs;
  const completionRate = (completedJobs / totalJobs) * 100;

  // Priority distribution
  const priorityStats = demoJobSheets.reduce(
    (acc, job) => {
      acc[job.priority] = (acc[job.priority] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  // Monthly trends (mock data)
  const monthlyData = [
    { month: "Jan", jobs: 12, revenue: 85000, completed: 10 },
    { month: "Feb", jobs: 15, revenue: 95000, completed: 13 },
    { month: "Mar", jobs: 18, revenue: 120000, completed: 16 },
    { month: "Apr", jobs: 20, revenue: 135000, completed: 18 },
    { month: "May", jobs: 16, revenue: 110000, completed: 14 },
    { month: "Jun", jobs: 22, revenue: 150000, completed: 20 },
  ];

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: CheckCircle,
      in_progress: Activity,
      pending: Clock,
      cancelled: XCircle,
    };
    return icons[status as keyof typeof icons] || FileText;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "text-green-600",
      in_progress: "text-blue-600",
      pending: "text-yellow-600",
      cancelled: "text-red-600",
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Job Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into job performance and trends
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-3xl font-bold">{totalJobs}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold">
                  {completionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% from last month
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">
                  ₹{(totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Job Value
                </p>
                <p className="text-3xl font-bold">
                  ₹{(avgJobValue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -3% from last month
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Job Status Distribution
            </CardTitle>
            <CardDescription>
              Current status breakdown of all jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  status: "completed",
                  count: completedJobs,
                  color: "bg-green-500",
                },
                {
                  status: "in_progress",
                  count: inProgressJobs,
                  color: "bg-blue-500",
                },
                {
                  status: "pending",
                  count: pendingJobs,
                  color: "bg-yellow-500",
                },
                {
                  status: "cancelled",
                  count: cancelledJobs,
                  color: "bg-red-500",
                },
              ].map(({ status, count, color }) => {
                const percentage = (count / totalJobs) * 100;
                const StatusIcon = getStatusIcon(status);

                return (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <StatusIcon
                        className={`w-4 h-4 ${getStatusColor(status)}`}
                      />
                      <span className="capitalize font-medium">
                        {status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {count}
                      </span>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Jobs by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(priorityStats).map(([priority, count]) => {
                const priorityLabels = {
                  "1": { label: "Low", color: "bg-gray-100 text-gray-800" },
                  "2": { label: "Normal", color: "bg-blue-100 text-blue-800" },
                  "3": {
                    label: "High",
                    color: "bg-orange-100 text-orange-800",
                  },
                  "4": { label: "Urgent", color: "bg-red-100 text-red-800" },
                  "5": { label: "Critical", color: "bg-red-200 text-red-900" },
                };

                const priorityInfo =
                  priorityLabels[priority as keyof typeof priorityLabels];
                const percentage = ((count as number) / totalJobs) * 100;

                return (
                  <div
                    key={priority}
                    className="flex items-center justify-between"
                  >
                    <Badge
                      className={
                        priorityInfo?.color || "bg-gray-100 text-gray-800"
                      }
                    >
                      {priorityInfo?.label || "Normal"}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <div className="w-16">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Monthly Performance Trends
          </CardTitle>
          <CardDescription>
            Job volume, completion rate, and revenue trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{data.month}</h4>
                  <Badge variant="outline">{data.jobs} jobs</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue:</span>
                    <span className="font-medium">
                      ₹{(data.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed:</span>
                    <span className="font-medium">{data.completed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className="font-medium">
                      {((data.completed / data.jobs) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <Progress
                    value={(data.completed / data.jobs) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Volume</CardTitle>
            <CardDescription>
              Customers with most jobs this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(
                demoJobSheets.reduce(
                  (acc, job) => {
                    const party = getPartyById(job.partyId);
                    if (party) {
                      acc[party.id] = acc[party.id] || {
                        name: party.name,
                        count: 0,
                        value: 0,
                      };
                      acc[party.id].count++;
                      acc[party.id].value += job.sellingPrice || 0;
                    }
                    return acc;
                  },
                  {} as Record<
                    string,
                    { name: string; count: number; value: number }
                  >
                )
              )
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((customer, index) => (
                  <div
                    key={customer.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">
                          {customer.count} jobs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₹{(customer.value / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest job updates and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoJobProgress
                .sort(
                  (a, b) =>
                    new Date(b.startedAt).getTime() -
                    new Date(a.startedAt).getTime()
                )
                .slice(0, 5)
                .map((progress, index) => {
                  const job = demoJobSheets.find(
                    (j) => j.id === progress.jobId
                  );
                  const party = job ? getPartyById(job.partyId) : null;

                  return (
                    <div
                      key={progress.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{job?.title}</span> -{" "}
                          {progress.stage}
                        </p>
                        <p className="text-xs text-gray-500">
                          {party?.name} •{" "}
                          {new Date(progress.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          progress.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }
                      >
                        {progress.status}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function JobReportsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <JobReportsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
