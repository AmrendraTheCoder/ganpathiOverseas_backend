"use client";

import React, { useState } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Eye,
  DollarSign,
  FileText,
  Settings,
  Users,
  Building2,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  RefreshCw,
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
  demoJobSheets,
  demoTransactions,
  demoExpenses,
  demoMachines,
  demoParties,
  demoUsers,
  getDashboardStats,
  getPartyById,
  getMachineById,
  getUserById,
} from "@/data/demo-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  lastGenerated: string;
  status: "ready" | "generating" | "scheduled";
  size: string;
  downloads: number;
}

const demoReports: Report[] = [
  {
    id: "1",
    name: "Monthly Sales Report",
    description: "Comprehensive sales performance analysis",
    category: "Sales",
    frequency: "Monthly",
    lastGenerated: "2024-01-15",
    status: "ready",
    size: "2.4 MB",
    downloads: 45,
  },
  {
    id: "2",
    name: "Production Efficiency Report",
    description: "Machine utilization and production metrics",
    category: "Production",
    frequency: "Weekly",
    lastGenerated: "2024-01-14",
    status: "ready",
    size: "1.8 MB",
    downloads: 32,
  },
  {
    id: "3",
    name: "Financial Summary",
    description: "Revenue, expenses, and profit analysis",
    category: "Financial",
    frequency: "Monthly",
    lastGenerated: "2024-01-10",
    status: "generating",
    size: "3.2 MB",
    downloads: 67,
  },
  {
    id: "4",
    name: "Inventory Status Report",
    description: "Stock levels and movement analysis",
    category: "Inventory",
    frequency: "Daily",
    lastGenerated: "2024-01-15",
    status: "ready",
    size: "956 KB",
    downloads: 28,
  },
  {
    id: "5",
    name: "Customer Analysis Report",
    description: "Customer behavior and satisfaction metrics",
    category: "CRM",
    frequency: "Quarterly",
    lastGenerated: "2024-01-01",
    status: "scheduled",
    size: "4.1 MB",
    downloads: 19,
  },
];

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [reportType, setReportType] = useState("overview");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Calculate analytics data
  const stats = getDashboardStats("admin");

  const revenueData = demoTransactions
    .filter((t) => t.type === "payment" && t.status === "paid")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseData = demoExpenses.reduce((acc, e) => acc + e.amount, 0);

  const profit = revenueData - expenseData;
  const profitMargin = revenueData > 0 ? (profit / revenueData) * 100 : 0;

  // Job completion metrics
  const completedJobs = demoJobSheets.filter(
    (j) => j.status === "completed"
  ).length;
  const totalJobs = demoJobSheets.length;
  const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

  // Machine utilization
  const machineUtilization = demoMachines.map((machine) => {
    const activeJobs = demoJobSheets.filter(
      (job) =>
        job.assignedMachineId === machine.id &&
        ["in_progress", "setup"].includes(job.status)
    );
    const utilization = Math.min(((activeJobs.length * 2) / 8) * 100, 100);
    return { machine: machine.name, utilization };
  });

  // Revenue by customer
  const revenueByCustomer = demoParties
    .map((party) => {
      const partyRevenue = demoTransactions
        .filter(
          (t) =>
            t.partyId === party.id &&
            t.type === "payment" &&
            t.status === "paid"
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return { customer: party.name, revenue: partyRevenue };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Expense breakdown
  const expenseCategories = demoExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const expenseBreakdown = Object.entries(expenseCategories)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Performance metrics
  const avgJobDuration =
    demoJobSheets.reduce((acc, job) => {
      return acc + (job.estimatedHours || 4);
    }, 0) / demoJobSheets.length;

  const onTimeDelivery = demoJobSheets.filter(
    (job) => job.status === "completed" && new Date(job.dueDate) >= new Date()
  ).length;
  const onTimeRate =
    completedJobs > 0 ? (onTimeDelivery / completedJobs) * 100 : 0;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const ReportCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    description,
  }: {
    title: string;
    value: string;
    change?: string;
    changeType?: "increase" | "decrease";
    icon: any;
    description?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div
            className={`flex items-center text-xs ${
              changeType === "increase" ? "text-green-600" : "text-red-600"
            }`}
          >
            {changeType === "increase" ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {change}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const ChartCard = ({
    title,
    children,
    description,
  }: {
    title: string;
    children: React.ReactNode;
    description?: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const filteredReports = demoReports.filter(
    (report) => categoryFilter === "all" || report.category === categoryFilter
  );

  const getStatusBadge = (status: string) => {
    const config = {
      ready: { color: "bg-green-100 text-green-800", label: "Ready" },
      generating: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Generating",
      },
      scheduled: { color: "bg-blue-100 text-blue-800", label: "Scheduled" },
    };
    const { color, label } = config[status as keyof typeof config];
    return <Badge className={color}>{label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <FileText className="w-4 h-4 text-green-600" />;
      case "generating":
        return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor", "finance"]}>
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground">
                Comprehensive business insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Report Type Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Business Overview</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="production">Production Report</SelectItem>
                  <SelectItem value="customer">Customer Analysis</SelectItem>
                  <SelectItem value="machine">Machine Performance</SelectItem>
                  <SelectItem value="employee">Employee Report</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ReportCard
              title="Total Revenue"
              value={formatCurrency(revenueData)}
              change="+12.5%"
              changeType="increase"
              icon={DollarSign}
              description="Compared to last period"
            />
            <ReportCard
              title="Total Expenses"
              value={formatCurrency(expenseData)}
              change="+5.2%"
              changeType="increase"
              icon={TrendingDown}
              description="Operational costs"
            />
            <ReportCard
              title="Net Profit"
              value={formatCurrency(profit)}
              change="+18.7%"
              changeType="increase"
              icon={TrendingUp}
              description={`${profitMargin.toFixed(1)}% margin`}
            />
            <ReportCard
              title="Job Completion"
              value={`${completionRate.toFixed(1)}%`}
              change="+3.2%"
              changeType="increase"
              icon={Target}
              description={`${completedJobs}/${totalJobs} jobs`}
            />
          </div>

          {/* Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ReportCard
              title="Active Jobs"
              value={stats.activeJobs.toString()}
              icon={FileText}
              description="Currently in progress"
            />
            <ReportCard
              title="Running Machines"
              value={demoMachines
                .filter((m) => m.status === "running")
                .length.toString()}
              icon={Settings}
              description="Operational equipment"
            />
            <ReportCard
              title="Total Customers"
              value={stats.totalParties.toString()}
              icon={Building2}
              description="Active customers"
            />
            <ReportCard
              title="On-time Delivery"
              value={`${onTimeRate.toFixed(1)}%`}
              icon={Clock}
              description="Delivery performance"
            />
          </div>

          {/* Charts and Analytics */}
          {reportType === "overview" && (
            <div className="grid gap-6 md:grid-cols-2">
              <ChartCard
                title="Revenue vs Expenses Trend"
                description="Monthly comparison of income and expenses"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(revenueData)}
                    </span>
                  </div>
                  <Progress value={80} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expenses</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(expenseData)}
                    </span>
                  </div>
                  <Progress value={45} className="h-2" />

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Net Profit</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatCurrency(profit)}
                    </span>
                  </div>
                </div>
              </ChartCard>

              <ChartCard
                title="Machine Utilization"
                description="Current utilization across all machines"
              >
                <div className="space-y-3">
                  {machineUtilization.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{item.machine}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.utilization} className="w-20" />
                        <span className="text-sm font-medium">
                          {item.utilization.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard
                title="Top Customers by Revenue"
                description="Highest revenue generating customers"
              >
                <div className="space-y-3">
                  {revenueByCustomer.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm">{item.customer}</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard
                title="Expense Breakdown"
                description="Expenses by category"
              >
                <div className="space-y-3">
                  {expenseBreakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm capitalize">
                        {item.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${(item.amount / expenseData) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          )}

          {/* Detailed Tables */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Production Performance</CardTitle>
                <CardDescription>
                  Job completion and machine efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Machine</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Active Jobs</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoMachines.map((machine) => {
                      const activeJobs = demoJobSheets.filter(
                        (job) =>
                          job.assignedMachineId === machine.id &&
                          ["in_progress", "setup"].includes(job.status)
                      ).length;
                      const utilization = Math.min(
                        ((activeJobs * 2) / 8) * 100,
                        100
                      );
                      const revenue = machine.hourlyRate * utilization * 0.08;

                      return (
                        <TableRow key={machine.id}>
                          <TableCell className="font-medium">
                            {machine.name}
                          </TableCell>
                          <TableCell className="capitalize">
                            {machine.type}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                machine.status === "running"
                                  ? "bg-green-100 text-green-800"
                                  : machine.status === "idle"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {machine.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={utilization} className="w-16" />
                              <span className="text-sm">
                                {utilization.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{activeJobs}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(revenue)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Analysis</CardTitle>
                <CardDescription>
                  Customer revenue and job statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total Jobs</TableHead>
                      <TableHead>Active Jobs</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Credit Utilization</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoParties.map((party) => {
                      const totalJobs = demoJobSheets.filter(
                        (job) => job.partyId === party.id
                      ).length;
                      const activeJobs = demoJobSheets.filter(
                        (job) =>
                          job.partyId === party.id &&
                          ["in_progress", "setup", "pending"].includes(
                            job.status
                          )
                      ).length;
                      const revenue = demoTransactions
                        .filter(
                          (t) => t.partyId === party.id && t.type === "payment"
                        )
                        .reduce((sum, t) => sum + t.amount, 0);
                      const creditUtilization =
                        (party.outstandingBalance / party.creditLimit) * 100;

                      return (
                        <TableRow key={party.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{party.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {party.contactPerson}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{totalJobs}</TableCell>
                          <TableCell>{activeJobs}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(revenue)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={creditUtilization}
                                className="w-16"
                              />
                              <span className="text-sm">
                                {creditUtilization.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                creditUtilization < 50
                                  ? "bg-green-100 text-green-800"
                                  : creditUtilization < 80
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {creditUtilization < 50
                                ? "Good"
                                : creditUtilization < 80
                                  ? "Watch"
                                  : "Risk"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Action Items & Alerts</CardTitle>
              <CardDescription>
                Important items requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      2 machines require maintenance
                    </p>
                    <p className="text-xs text-red-600">
                      Offset Press 1 and Digital Press 1 are overdue for
                      maintenance
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      3 jobs approaching deadline
                    </p>
                    <p className="text-xs text-yellow-600">
                      Jobs need to be prioritized to meet customer expectations
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review Jobs
                  </Button>
                </div>

                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      Revenue increased by 12.5% this month
                    </p>
                    <p className="text-xs text-blue-600">
                      Strong performance driven by increased customer orders
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Report
                  </Button>
                </div>

                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      All critical processes running smoothly
                    </p>
                    <p className="text-xs text-green-600">
                      No immediate issues detected in production workflow
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList>
              <TabsTrigger value="reports">All Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Inventory">Inventory</SelectItem>
                        <SelectItem value="CRM">CRM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Reports Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {report.name}
                          </CardTitle>
                          <CardDescription>
                            {report.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          {getStatusBadge(report.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <div className="font-medium">{report.category}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <div className="font-medium">{report.frequency}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Generated:</span>
                          <div className="font-medium">
                            {new Date(
                              report.lastGenerated
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">File Size:</span>
                          <div className="font-medium">{report.size}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {report.downloads}
                          </span>{" "}
                          downloads
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          {report.status === "ready" && (
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                          {report.status === "generating" && (
                            <Button size="sm" disabled>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Generation Trends</CardTitle>
                    <CardDescription>
                      Report generation activity over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium">Reports Generated</p>
                            <p className="text-sm text-gray-600">This month</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            143
                          </p>
                          <p className="text-sm text-green-600 flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +12% from last month
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {["Sales", "Production", "Financial", "Inventory"].map(
                          (category, index) => {
                            const count = Math.floor(Math.random() * 30) + 10;
                            return (
                              <div
                                key={category}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm font-medium">
                                  {category}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{
                                        width: `${(count / 40) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Popular Reports</CardTitle>
                    <CardDescription>
                      Most downloaded reports this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {demoReports
                        .sort((a, b) => b.downloads - a.downloads)
                        .slice(0, 5)
                        .map((report, index) => (
                          <div
                            key={report.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-purple-600">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{report.name}</p>
                                <p className="text-sm text-gray-500">
                                  {report.category}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{report.downloads}</p>
                              <p className="text-sm text-gray-500">downloads</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Key Metrics */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Avg Generation Time
                        </p>
                        <p className="text-2xl font-bold">2.3 min</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                          -15% faster this month
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Success Rate
                        </p>
                        <p className="text-2xl font-bold">98.7%</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          +0.3% improvement
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Data Volume
                        </p>
                        <p className="text-2xl font-bold">24.5 GB</p>
                        <p className="text-xs text-gray-600">
                          Processed this month
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>
                    Automated report generation schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{report.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Frequency: {report.frequency}</span>
                              <span>•</span>
                              <span>Category: {report.category}</span>
                              <span>•</span>
                              <span>
                                Next:{" "}
                                {new Date(
                                  Date.now() + 7 * 24 * 60 * 60 * 1000
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(report.status)}
                          <Button variant="outline" size="sm">
                            Edit Schedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
};

export default ReportsPage;
