"use client";

import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  CreditCard,
  Building2,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import { demoTransactions, demoParties, demoJobSheets } from "@/data/demo-data";

function FinanceReportsPageContent() {
  const [dateRange, setDateRange] = useState("month");
  const [reportType, setReportType] = useState("overview");

  // Calculate financial metrics
  const totalRevenue = demoTransactions
    .filter((t) => ["invoice", "payment"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = demoTransactions
    .filter((t) => ["debit"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const pendingInvoices = demoTransactions
    .filter((t) => t.type === "invoice" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const overdueAmount = demoTransactions
    .filter((t) => t.status === "overdue")
    .reduce((sum, t) => sum + t.amount, 0);

  const cashFlow =
    demoTransactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0) - totalExpenses;

  // Monthly revenue data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleDateString("en-US", {
      month: "short",
    });
    const revenue = Math.floor(Math.random() * 500000) + 200000;
    const expenses = Math.floor(Math.random() * 300000) + 100000;
    return { month, revenue, expenses, profit: revenue - expenses };
  });

  // Top customers by revenue
  const customerRevenue = demoParties
    .map((party) => {
      const jobs = demoJobSheets.filter((job) => job.partyId === party.id);
      const revenue = jobs.reduce(
        (sum, job) => sum + (job.sellingPrice || 0),
        0
      );
      return { ...party, revenue, jobCount: jobs.length };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      overdue: { color: "bg-red-100 text-red-800", label: "Overdue" },
      cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Financial Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive financial insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">
                  ₹{(totalRevenue / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
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
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-3xl font-bold">
                  ₹{(netProfit / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Profit Margin
                </p>
                <p className="text-3xl font-bold">{profitMargin.toFixed(1)}%</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -2% from last month
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash Flow</p>
                <p className="text-3xl font-bold">
                  ₹{(cashFlow / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% from last month
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses (Monthly)</CardTitle>
                <CardDescription>
                  Monthly comparison of revenue and expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.slice(0, 6).map((data, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {data.month}
                        </span>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-600">
                            ₹{(data.revenue / 1000).toFixed(0)}K
                          </span>
                          <span className="text-red-600">
                            ₹{(data.expenses / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Progress
                          value={(data.revenue / 500000) * 100}
                          className="h-2 flex-1"
                        />
                        <Progress
                          value={(data.expenses / 500000) * 100}
                          className="h-2 flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Outstanding Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                <CardDescription>
                  Pending and overdue invoice amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium">Pending Invoices</p>
                        <p className="text-sm text-gray-600">
                          Awaiting payment
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-600">
                        ₹{(pendingInvoices / 100000).toFixed(1)}L
                      </p>
                      <p className="text-sm text-gray-500">
                        {
                          demoTransactions.filter(
                            (t) =>
                              t.type === "invoice" && t.status === "pending"
                          ).length
                        }{" "}
                        invoices
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium">Overdue Amount</p>
                        <p className="text-sm text-gray-600">Past due date</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        ₹{(overdueAmount / 100000).toFixed(1)}L
                      </p>
                      <p className="text-sm text-gray-500">
                        {
                          demoTransactions.filter((t) => t.status === "overdue")
                            .length
                        }{" "}
                        overdue
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Collection Rate
                      </span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      Target: 90% collection rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Financial Transactions</CardTitle>
              <CardDescription>
                Latest financial activities and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoTransactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.referenceNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            ["payment", "credit"].includes(transaction.type)
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {["payment", "credit"].includes(transaction.type)
                            ? "+"
                            : "-"}
                          ₹{transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Revenue analysis by different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Printing Services</span>
                    <span className="font-medium">
                      ₹{((totalRevenue * 0.6) / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <Progress value={60} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Design Services</span>
                    <span className="font-medium">
                      ₹{((totalRevenue * 0.25) / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <Progress value={25} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Additional Services</span>
                    <span className="font-medium">
                      ₹{((totalRevenue * 0.15) / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Customers</CardTitle>
                <CardDescription>
                  Highest revenue generating customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerRevenue.slice(0, 5).map((customer, index) => (
                    <div
                      key={customer.id}
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
                            {customer.jobCount} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₹{(customer.revenue / 1000).toFixed(0)}K
                        </p>
                        <p className="text-sm text-gray-500">
                          {((customer.revenue / totalRevenue) * 100).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of business expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Major Expense Categories</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Raw Materials</span>
                        <span className="font-medium">
                          ₹{((totalExpenses * 0.4) / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <Progress value={40} className="h-2" />

                      <div className="flex justify-between">
                        <span className="text-sm">Salaries & Benefits</span>
                        <span className="font-medium">
                          ₹{((totalExpenses * 0.3) / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <Progress value={30} className="h-2" />

                      <div className="flex justify-between">
                        <span className="text-sm">Utilities</span>
                        <span className="font-medium">
                          ₹{((totalExpenses * 0.15) / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <Progress value={15} className="h-2" />

                      <div className="flex justify-between">
                        <span className="text-sm">Maintenance</span>
                        <span className="font-medium">
                          ₹{((totalExpenses * 0.15) / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Expense Trends</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">This Month</span>
                        <span className="font-medium">
                          ₹{(totalExpenses / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">Last Month</span>
                        <span className="font-medium">
                          ₹{((totalExpenses * 0.9) / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span className="text-sm text-green-600">Savings</span>
                        <span className="font-medium text-green-600">
                          ₹{((totalExpenses * 0.1) / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement</CardTitle>
              <CardDescription>
                Detailed cash flow analysis and projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <ArrowDownRight className="w-8 h-8 text-green-600" />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cash Inflow</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{(totalRevenue / 100000).toFixed(1)}L
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <ArrowUpRight className="w-8 h-8 text-red-600" />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cash Outflow</p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{(totalExpenses / 100000).toFixed(1)}L
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <DollarSign className="w-8 h-8 text-blue-600" />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Net Cash Flow</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{(cashFlow / 100000).toFixed(1)}L
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">
                    Cash Flow Forecast (Next 6 Months)
                  </h4>
                  <div className="space-y-3">
                    {Array.from({ length: 6 }, (_, i) => {
                      const month = new Date(
                        2024,
                        new Date().getMonth() + i + 1,
                        1
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      });
                      const projected =
                        cashFlow * (1 + (Math.random() * 0.2 - 0.1));
                      return (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 border rounded"
                        >
                          <span className="font-medium">{month}</span>
                          <span
                            className={`font-medium ${projected > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            ₹{(projected / 100000).toFixed(1)}L
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Revenue Analysis</CardTitle>
                <CardDescription>
                  Revenue contribution by customer segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerRevenue.slice(0, 8).map((customer, index) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">
                            {customer.jobCount} orders • {customer.tier} tier
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₹{(customer.revenue / 1000).toFixed(0)}K
                        </p>
                        <p className="text-sm text-gray-500">
                          {((customer.revenue / totalRevenue) * 100).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Behavior Analysis</CardTitle>
                <CardDescription>
                  Customer payment patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 grid-cols-2">
                    <div className="text-center p-4 bg-green-50 rounded">
                      <p className="text-sm text-gray-600">On-time Payments</p>
                      <p className="text-2xl font-bold text-green-600">87%</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded">
                      <p className="text-sm text-gray-600">Late Payments</p>
                      <p className="text-2xl font-bold text-red-600">13%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Payment Terms Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Immediate (0 days)</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <Progress value={25} className="h-2" />

                      <div className="flex justify-between">
                        <span className="text-sm">Net 15 days</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <Progress value={35} className="h-2" />

                      <div className="flex justify-between">
                        <span className="text-sm">Net 30 days</span>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FinanceReportsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "finance"]}>
        <FinanceReportsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
