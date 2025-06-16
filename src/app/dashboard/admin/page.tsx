"use client";

import React from "react";
import {
  Users,
  FileText,
  Building,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
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
  getDashboardStats,
  demoJobSheets,
  demoExpenses,
  demoUsers,
  demoParties,
} from "@/data/demo-data";

const AdminDashboard = () => {
  const stats = getDashboardStats("admin");

  const recentJobs = demoJobSheets.slice(0, 5);
  const recentExpenses = demoExpenses.slice(0, 4);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
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
        {trend && (
          <div className="flex items-center space-x-1 text-xs">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete overview of Ganpathi Overseas operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Active employees"
          trend="+2 from last month"
          color="blue"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={FileText}
          description="In progress & pending"
          trend="+5 from yesterday"
          color="green"
        />
        <StatCard
          title="Total Parties"
          value={stats.totalParties}
          icon={Building}
          description="Active clients"
          trend="+1 this week"
          color="purple"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          description="This month"
          trend="+12% from last month"
          color="emerald"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={FileText}
          description="All time"
          color="indigo"
        />
        <StatCard
          title="Completed Jobs"
          value={stats.completedJobs}
          icon={FileText}
          description="Successfully finished"
          color="green"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon={AlertCircle}
          description="Awaiting payment"
          color="yellow"
        />
        <StatCard
          title="Active Machines"
          value={stats.totalMachines}
          icon={Settings}
          description="Operational equipment"
          color="blue"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>
              Latest job orders and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.jobNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusBadge(job.status)}>
                      {job.status.replace("_", " ")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ₹{job.sellingPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Jobs
            </Button>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest business expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {expense.description}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {expense.category} •{" "}
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ₹{expense.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {expense.paymentMethod}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Expenses
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Revenue and expense breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{stats.monthlyExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{(stats.totalRevenue - stats.monthlyExpenses).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                +22% from last month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Commonly used admin functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-xs">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-xs">New Job</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Building className="h-6 w-6" />
              <span className="text-xs">Add Party</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-xs">Add Expense</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs">Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
