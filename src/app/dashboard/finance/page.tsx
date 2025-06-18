"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
  Download,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DatabaseConnectionStatus from "@/components/DatabaseConnectionStatus";

// Mock data for demonstration
const mockFinanceData = {
  overview: {
    totalRevenue: 2450000,
    totalExpenses: 1820000,
    netProfit: 630000,
    profitMargin: 25.7,
    previousMonth: {
      revenue: 2200000,
      expenses: 1650000,
      profit: 550000,
    },
  },
  cashFlow: {
    inflow: 2450000,
    outflow: 1820000,
    netFlow: 630000,
    bankBalance: 850000,
    accountsReceivable: 420000,
    accountsPayable: 280000,
  },
  recentTransactions: [
    {
      id: 1,
      type: "Income",
      description: "Job Sheet Payment - ABC Corp",
      amount: 85000,
      date: "2024-01-15",
      status: "Completed",
    },
    {
      id: 2,
      type: "Expense",
      description: "Raw Material Purchase",
      amount: -45000,
      date: "2024-01-14",
      status: "Completed",
    },
    {
      id: 3,
      type: "Income",
      description: "Invoice Payment - XYZ Ltd",
      amount: 120000,
      date: "2024-01-13",
      status: "Completed",
    },
    {
      id: 4,
      type: "Expense",
      description: "Machine Maintenance",
      amount: -15000,
      date: "2024-01-12",
      status: "Pending",
    },
    {
      id: 5,
      type: "Income",
      description: "Service Revenue",
      amount: 65000,
      date: "2024-01-11",
      status: "Completed",
    },
  ],
  monthlyTargets: {
    revenueTarget: 2800000,
    expenseTarget: 1900000,
    profitTarget: 700000,
    currentRevenue: 2450000,
    currentExpenses: 1820000,
    currentProfit: 630000,
  },
  expenseCategories: [
    { name: "Raw Materials", amount: 680000, percentage: 37.4 },
    { name: "Labor Costs", amount: 450000, percentage: 24.7 },
    { name: "Utilities", amount: 220000, percentage: 12.1 },
    { name: "Machine Maintenance", amount: 180000, percentage: 9.9 },
    { name: "Office Expenses", amount: 150000, percentage: 8.2 },
    { name: "Others", amount: 140000, percentage: 7.7 },
  ],
  alerts: [
    {
      type: "warning",
      message: "Outstanding receivables increasing - ₹4.2L pending",
      priority: "medium",
    },
    {
      type: "info",
      message: "Monthly profit target 90% achieved",
      priority: "low",
    },
    {
      type: "success",
      message: "All vendor payments completed on time",
      priority: "low",
    },
  ],
};

export default function FinanceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Financial data has been updated successfully.",
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Exporting Report",
      description: "Financial report is being generated...",
    });
  };

  const calculateGrowthPercentage = (current: number, previous: number) => {
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const revenueGrowth = calculateGrowthPercentage(
    mockFinanceData.overview.totalRevenue,
    mockFinanceData.overview.previousMonth.revenue
  );
  const profitGrowth = calculateGrowthPercentage(
    mockFinanceData.overview.netProfit,
    mockFinanceData.overview.previousMonth.profit
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Finance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor financial performance and cash flow in real-time
          </p>
          <div className="mt-2">
            <DatabaseConnectionStatus variant="compact" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {mockFinanceData.alerts.length > 0 && (
        <div className="grid gap-4">
          {mockFinanceData.alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center p-4 rounded-lg border ${
                alert.type === "warning"
                  ? "bg-yellow-50 border-yellow-200"
                  : alert.type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-blue-50 border-blue-200"
              }`}
            >
              {alert.type === "warning" && (
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              )}
              {alert.type === "success" && (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              )}
              {alert.type === "info" && (
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
              )}
              <span className="text-sm font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(mockFinanceData.overview.totalRevenue / 100000).toFixed(1)}L
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {parseFloat(revenueGrowth) > 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span
                className={
                  parseFloat(revenueGrowth) > 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {revenueGrowth}% from last month
              </span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(mockFinanceData.overview.totalExpenses / 100000).toFixed(1)}L
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1 text-red-500" />
              <span className="text-red-500">
                {calculateGrowthPercentage(
                  mockFinanceData.overview.totalExpenses,
                  mockFinanceData.overview.previousMonth.expenses
                )}
                % from last month
              </span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(mockFinanceData.overview.netProfit / 100000).toFixed(1)}L
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">
                {profitGrowth}% from last month
              </span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockFinanceData.overview.profitMargin}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Industry avg: 18-22%</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Revenue vs Expenses Trend
                </CardTitle>
                <CardDescription>
                  Monthly comparison over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">
                      Interactive Chart Coming Soon
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Chart.js integration in progress
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFinanceData.recentTransactions
                    .slice(0, 5)
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              transaction.type === "Income"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {transaction.type === "Income" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}₹
                            {Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <Badge
                            variant={
                              transaction.status === "Completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Cash Inflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{(mockFinanceData.cashFlow.inflow / 100000).toFixed(1)}L
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Cash Outflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{(mockFinanceData.cashFlow.outflow / 100000).toFixed(1)}L
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Net Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{(mockFinanceData.cashFlow.netFlow / 100000).toFixed(1)}L
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>Monthly cash flow trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">
                    Cash Flow Chart Coming Soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Current month expense categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFinanceData.expenseCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span className="font-medium">
                          ₹{(category.amount / 1000).toFixed(0)}K (
                          {category.percentage}%)
                        </span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Trends</CardTitle>
                <CardDescription>
                  Category-wise expense analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">
                      Expense Pie Chart Coming Soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Revenue Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-bold">
                      ₹
                      {(
                        mockFinanceData.monthlyTargets.revenueTarget / 100000
                      ).toFixed(1)}
                      L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achieved:</span>
                    <span className="font-bold">
                      ₹
                      {(
                        mockFinanceData.monthlyTargets.currentRevenue / 100000
                      ).toFixed(1)}
                      L
                    </span>
                  </div>
                  <Progress
                    value={
                      (mockFinanceData.monthlyTargets.currentRevenue /
                        mockFinanceData.monthlyTargets.revenueTarget) *
                      100
                    }
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    {(
                      (mockFinanceData.monthlyTargets.currentRevenue /
                        mockFinanceData.monthlyTargets.revenueTarget) *
                      100
                    ).toFixed(1)}
                    % of target achieved
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Expense Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-bold">
                      ₹
                      {(
                        mockFinanceData.monthlyTargets.expenseTarget / 100000
                      ).toFixed(1)}
                      L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span className="font-bold">
                      ₹
                      {(
                        mockFinanceData.monthlyTargets.currentExpenses / 100000
                      ).toFixed(1)}
                      L
                    </span>
                  </div>
                  <Progress
                    value={
                      (mockFinanceData.monthlyTargets.currentExpenses /
                        mockFinanceData.monthlyTargets.expenseTarget) *
                      100
                    }
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    {(
                      (mockFinanceData.monthlyTargets.currentExpenses /
                        mockFinanceData.monthlyTargets.expenseTarget) *
                      100
                    ).toFixed(1)}
                    % of budget used
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Profit Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-bold">
                      ₹
                      {(
                        mockFinanceData.monthlyTargets.profitTarget / 100000
                      ).toFixed(1)}
                      L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achieved:</span>
                    <span className="font-bold">
                      ₹
                      {(
                        mockFinanceData.monthlyTargets.currentProfit / 100000
                      ).toFixed(1)}
                      L
                    </span>
                  </div>
                  <Progress
                    value={
                      (mockFinanceData.monthlyTargets.currentProfit /
                        mockFinanceData.monthlyTargets.profitTarget) *
                      100
                    }
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    {(
                      (mockFinanceData.monthlyTargets.currentProfit /
                        mockFinanceData.monthlyTargets.profitTarget) *
                      100
                    ).toFixed(1)}
                    % of target achieved
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>
                Target vs actual performance visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">
                    Performance Chart Coming Soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
