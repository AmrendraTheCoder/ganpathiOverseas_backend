"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Receipt,
  TrendingDown,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  BarChart3,
  PieChart,
  Download,
  Upload,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  demoExpenses,
  demoUsers,
  getUserById,
  Expense,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

function ExpensesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const filteredExpenses = demoExpenses.filter((expense) => {
    const user = getUserById(expense.submittedBy);

    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || expense.status === statusFilter;

    // Date filtering logic would go here
    const matchesDate = true; // Simplified for demo

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "materials":
        return <Receipt className="w-4 h-4" />;
      case "utilities":
        return <FileText className="w-4 h-4" />;
      case "maintenance":
        return <Tag className="w-4 h-4" />;
      case "salary":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      materials: { color: "bg-blue-100 text-blue-800", label: "Materials" },
      utilities: { color: "bg-green-100 text-green-800", label: "Utilities" },
      maintenance: {
        color: "bg-orange-100 text-orange-800",
        label: "Maintenance",
      },
      salary: { color: "bg-purple-100 text-purple-800", label: "Salary" },
      office: { color: "bg-gray-100 text-gray-800", label: "Office" },
      travel: { color: "bg-yellow-100 text-yellow-800", label: "Travel" },
    };

    const config = categoryConfig[category as keyof typeof categoryConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: category,
    };

    return (
      <Badge className={config.color}>
        {getCategoryIcon(category)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      paid: { color: "bg-blue-100 text-blue-800", label: "Paid" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const ExpenseCard = ({ expense }: { expense: Expense }) => {
    const submitter = getUserById(expense.submittedBy);

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <div className="p-2 rounded-lg mr-3 bg-red-100">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                {expense.description}
              </CardTitle>
              <CardDescription>
                {expense.vendor
                  ? `Vendor: ${expense.vendor}`
                  : "Internal Expense"}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getCategoryBadge(expense.category)}
              {getStatusBadge(expense.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(expense.amount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Expense Date</p>
              <p className="font-medium">
                {new Date(expense.expenseDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Submitted By</p>
              <p className="font-medium">{submitter?.name || "Unknown"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">
                {expense.paymentMethod || "Not specified"}
              </p>
            </div>
          </div>

          {expense.receiptNumber && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Receipt Number:</strong> {expense.receiptNumber}
              </p>
            </div>
          )}

          {expense.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Notes:</p>
              <p className="text-sm">{expense.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Submitted {new Date(expense.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              {expense.status === "pending" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Reject
                  </Button>
                </>
              )}
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
  const totalExpenses = demoExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const pendingExpenses = demoExpenses.filter(
    (e) => e.status === "pending"
  ).length;
  const thisMonthExpenses = demoExpenses
    .filter((e) => new Date(e.expenseDate).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryTotals = demoExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Expense Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage all business expenses
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">All time expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(thisMonthExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingExpenses}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(categoryTotals).length}
            </div>
            <p className="text-xs text-muted-foreground">Expense categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown & Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  {getCategoryIcon(category)}
                  <span className="ml-2 text-sm capitalize">{category}</span>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoExpenses
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 4)
                .map((expense) => {
                  const submitter = getUserById(expense.submittedBy);
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {expense.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {submitter?.name} •{" "}
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </p>
                        {getStatusBadge(expense.status)}
                      </div>
                    </div>
                  );
                })}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="materials">Materials</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Expenses ({filteredExpenses.length})
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No expenses found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No expenses match your search criteria. Try adjusting your
                  filters.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Expenses Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses Table</CardTitle>
          <CardDescription>
            Detailed view of all expense records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.slice(0, 10).map((expense) => {
                const submitter = getUserById(expense.submittedBy);

                return (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        {expense.vendor && (
                          <p className="text-sm text-muted-foreground">
                            Vendor: {expense.vendor}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                    <TableCell>
                      <span className="font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </TableCell>
                    <TableCell>{submitter?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {expense.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                          >
                            Approve
                          </Button>
                        )}
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
}

const ExpensesPage = () => {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "finance"]}>
        <ExpensesPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
};

export default ExpensesPage;
