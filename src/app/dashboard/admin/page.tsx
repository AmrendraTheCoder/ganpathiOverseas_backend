"use client";

import React from "react";
import {
  Users,
  FileText,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
  Award,
  Activity,
  Package,
  Clock,
  Target,
  Star,
  CheckCircle,
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
import { formatDate, formatCurrency } from "@/lib/utils";

const AdminDashboard = () => {
  const stats = getDashboardStats("admin");

  const recentJobs = demoJobSheets.slice(0, 5);
  const recentExpenses = demoExpenses.slice(0, 4);

  // Calculate net profit and determine if it's positive or negative
  const netProfit = stats.totalRevenue - stats.monthlyExpenses;
  const isPositiveProfit = netProfit >= 0;

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    gradient = "from-blue-500 to-blue-600",
    iconColor = "text-white",
    bgPattern = "bg-gradient-to-br",
  }: any) => (
    <Card
      className={`${bgPattern} ${gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white opacity-90">
          {title}
        </CardTitle>
        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {description && (
          <p className="text-sm text-white opacity-80">{description}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-1 text-sm mt-2">
            <div className="bg-green-400 bg-opacity-20 p-1 rounded">
              <TrendingUp className="h-3 w-3 text-green-200" />
            </div>
            <span className="text-green-200 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending:
        "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md",
      in_progress:
        "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md",
      completed:
        "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md",
      cancelled:
        "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md",
    };
    return (
      statusStyles[status as keyof typeof statusStyles] ||
      "bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-md"
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 flex items-center gap-2 mt-2">
            <Activity className="h-4 w-4 text-green-500" />
            Complete overview of Ganpathi Overseas operations
            <Zap className="h-4 w-4 text-blue-500" />
            Live Data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow-md border-2 border-blue-200 hover:border-blue-300"
          >
            <Calendar className="mr-2 h-4 w-4 text-blue-600" />
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow-md border-2 border-purple-200 hover:border-purple-300"
          >
            <BarChart3 className="mr-2 h-4 w-4 text-purple-600" />
            Reports
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Active employees"
          trend="+2 from last month"
          gradient="from-blue-500 via-blue-600 to-blue-700"
          iconColor="text-blue-100"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={FileText}
          description="In progress & pending"
          trend="+5 from yesterday"
          gradient="from-green-500 via-emerald-600 to-green-700"
          iconColor="text-green-100"
        />
        <StatCard
          title="Total Parties"
          value={stats.totalParties}
          icon={Building}
          description="Active clients"
          trend="+1 this week"
          gradient="from-purple-500 via-purple-600 to-indigo-700"
          iconColor="text-purple-100"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          description="This month"
          trend="+12% from last month"
          gradient="from-emerald-500 via-teal-600 to-cyan-700"
          iconColor="text-emerald-100"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={Target}
          description="All time"
          gradient="from-indigo-500 via-indigo-600 to-blue-700"
          iconColor="text-indigo-100"
        />
        <StatCard
          title="Completed Jobs"
          value={stats.completedJobs}
          icon={CheckCircle}
          description="Successfully finished"
          gradient="from-green-500 via-green-600 to-emerald-700"
          iconColor="text-green-100"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon={AlertCircle}
          description="Awaiting payment"
          gradient="from-yellow-500 via-orange-500 to-red-600"
          iconColor="text-yellow-100"
        />
        <StatCard
          title="Active Machines"
          value={stats.totalMachines}
          icon={Package}
          description="Operational equipment"
          gradient="from-cyan-500 via-sky-600 to-blue-700"
          iconColor="text-cyan-100"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Jobs */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5 text-blue-600" />
              Recent Jobs
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest job orders and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200 hover:border-blue-300"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${index === 0 ? "bg-green-500 animate-pulse" : index === 1 ? "bg-blue-500" : "bg-yellow-500"}`}
                      />
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {job.title}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {job.jobNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusBadge(job.status)}>
                      {job.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        ₹{job.sellingPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Recent Expenses
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest business expenses and costs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-orange-50 hover:from-orange-50 hover:to-red-50 transition-all duration-300 border border-gray-200 hover:border-orange-300"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${index < 2 ? "bg-red-500" : "bg-orange-500"}`}
                      />
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {expense.description}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      -₹{expense.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{expense.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Award className="h-5 w-5 text-purple-600" />
            Performance Summary
          </CardTitle>
          <CardDescription className="text-gray-700">
            Key performance indicators for this month
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-white bg-opacity-70 shadow-md">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {((stats.completedJobs / stats.totalJobs) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <div className="flex items-center justify-center mt-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500" />
                <Star className="h-4 w-4 text-gray-300" />
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white bg-opacity-70 shadow-md">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                ₹
                {Math.round(
                  stats.totalRevenue / stats.totalJobs
                ).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Avg Job Value</p>
              <div className="mt-2">
                <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                  ↗ +15%
                </Badge>
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white bg-opacity-70 shadow-md">
              <div
                className={`text-2xl font-bold mb-1 ${isPositiveProfit ? "text-green-600" : "text-red-600"}`}
              >
                ₹{Math.abs(netProfit).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">
                Net {isPositiveProfit ? "Profit" : "Loss"}
              </p>
              <div className="mt-2">
                <Badge
                  className={`${isPositiveProfit ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"} text-white`}
                >
                  {isPositiveProfit ? "↗" : "↘"}{" "}
                  {isPositiveProfit ? "+" : "-"}8%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
