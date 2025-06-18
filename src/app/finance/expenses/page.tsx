"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Check,
  X,
  DollarSign,
  Calendar,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Target,
  Building2,
  CreditCard,
  FileText,
  Calculator,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

interface Expense {
  id: string;
  expense_number: string;
  category: string;
  subcategory?: string;
  vendor_name?: string;
  vendor_id?: string;
  expense_date: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  receipt_number?: string;
  description: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  created_at: string;
  approved_at?: string;
  parties?: {
    name: string;
    email: string;
    phone: string;
  };
  users?: {
    email: string;
    full_name: string;
  };
}

interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
  byCategory: { [key: string]: number };
}

const EXPENSE_CATEGORIES = [
  "Raw Materials",
  "Office Supplies",
  "Utilities",
  "Rent",
  "Equipment Maintenance",
  "Transportation",
  "Marketing",
  "Professional Fees",
  "Insurance",
  "Telecommunications",
  "Training",
  "Other",
];

const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "CHEQUE",
  "CREDIT_CARD",
  "UPI",
  "OTHER",
];

function ExpensesPageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Form states
  const [newExpense, setNewExpense] = useState({
    category: "",
    subcategory: "",
    vendor_name: "",
    vendor_id: "",
    expense_date: new Date().toISOString().split("T")[0],
    amount: 0,
    tax_amount: 0,
    payment_method: "CASH",
    receipt_number: "",
    description: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, [currentPage, statusFilter, categoryFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      });

      const response = await fetch(`/api/finance/expenses?${params}`);
      const data = await response.json();

      if (response.ok) {
        setExpenses(data.expenses);
        setSummary(data.summary);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error("Failed to fetch expenses:", data.error);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    try {
      const response = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setNewExpense({
          category: "",
          subcategory: "",
          vendor_name: "",
          vendor_id: "",
          expense_date: new Date().toISOString().split("T")[0],
          amount: 0,
          tax_amount: 0,
          payment_method: "CASH",
          receipt_number: "",
          description: "",
        });
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error creating expense:", error);
    }
  };

  const handleStatusUpdate = async (expenseId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/finance/expenses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: expenseId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error updating expense status:", error);
    }
  };

  const calculateTotal = () => {
    return newExpense.amount + newExpense.tax_amount;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PAID":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Check className="h-4 w-4" />;
      case "PAID":
        return <CreditCard className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "REJECTED":
        return <X className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      CASH: "Cash",
      BANK_TRANSFER: "Bank Transfer",
      CHEQUE: "Cheque",
      CREDIT_CARD: "Credit Card",
      UPI: "UPI",
      OTHER: "Other",
    };
    return labels[method] || method;
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expense_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`bg-${color.split("-")[1]}-100 p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Expense Management
          </h1>
          <p className="text-gray-600 mt-2">
            Track, approve, and manage business expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchExpenses}
            className="bg-white shadow-md"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={summary.totalExpenses}
            icon={Receipt}
            color="text-blue-600"
            subtitle="All time"
          />
          <StatCard
            title="Total Amount"
            value={formatCurrency(summary.totalAmount)}
            icon={DollarSign}
            color="text-red-600"
            subtitle="Total spent"
          />
          <StatCard
            title="Pending Approval"
            value={summary.pending}
            icon={Clock}
            color="text-yellow-600"
            subtitle="Awaiting review"
          />
          <StatCard
            title="Approved"
            value={summary.approved}
            icon={Check}
            color="text-green-600"
            subtitle="Ready for payment"
          />
        </div>
      )}

      {/* Category Breakdown */}
      {summary?.byCategory && Object.keys(summary.byCategory).length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Expense by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(summary.byCategory).map(([category, amount]) => (
                <div key={category} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">
                    {category}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Expenses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expense List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {expense.expense_number}
                    </TableCell>
                    <TableCell>{formatDate(expense.expense_date)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.category}</p>
                        {expense.subcategory && (
                          <p className="text-sm text-gray-500">
                            {expense.subcategory}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      {expense.vendor_name || expense.parties?.name || "—"}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(expense.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentMethodLabel(expense.payment_method)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(expense.status)}>
                        {getStatusIcon(expense.status)}
                        <span className="ml-1">{expense.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Expense
                          </DropdownMenuItem>
                          {expense.status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(expense.id, "APPROVED")
                                }
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(expense.id, "REJECTED")
                                }
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {expense.status === "APPROVED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(expense.id, "PAID")
                              }
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {filteredExpenses.length} of {summary?.totalExpenses || 0}{" "}
              expenses
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Expense Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Record a new business expense for approval and tracking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) =>
                    setNewExpense((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  placeholder="Optional subcategory"
                  value={newExpense.subcategory}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor_name">Vendor Name</Label>
                <Input
                  placeholder="Vendor or supplier name"
                  value={newExpense.vendor_name}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      vendor_name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="expense_date">Expense Date *</Label>
                <Input
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      expense_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Amount Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="tax_amount">Tax Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.tax_amount}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      tax_amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Total Amount</Label>
                <div className="p-2 bg-red-50 rounded-md text-right font-bold text-red-700 text-lg">
                  {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select
                  value={newExpense.payment_method}
                  onValueChange={(value) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      payment_method: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {getPaymentMethodLabel(method)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="receipt_number">Receipt/Bill Number</Label>
                <Input
                  placeholder="Receipt or bill number"
                  value={newExpense.receipt_number}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      receipt_number: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                placeholder="Describe the expense purpose and details..."
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Base Amount:</span>
                <span>{formatCurrency(newExpense.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Tax Amount:</span>
                <span>+ {formatCurrency(newExpense.tax_amount)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Amount:</span>
                <span className="text-red-700">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateExpense}
                disabled={
                  !newExpense.category ||
                  !newExpense.description ||
                  newExpense.amount <= 0
                }
                className="bg-red-600 hover:bg-red-700"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              Complete expense information and approval history
            </DialogDescription>
          </DialogHeader>

          {selectedExpense && (
            <div className="space-y-6">
              {/* Expense Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Expense Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expense Number:</span>
                      <span className="font-mono">
                        {selectedExpense.expense_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(selectedExpense.expense_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span>{selectedExpense.category}</span>
                    </div>
                    {selectedExpense.subcategory && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subcategory:</span>
                        <span>{selectedExpense.subcategory}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedExpense.status)}>
                        {selectedExpense.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Vendor Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Vendor:</span>
                      <p className="font-medium">
                        {selectedExpense.vendor_name ||
                          selectedExpense.parties?.name ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <p>
                        {getPaymentMethodLabel(selectedExpense.payment_method)}
                      </p>
                    </div>
                    {selectedExpense.receipt_number && (
                      <div>
                        <span className="text-gray-600">Receipt Number:</span>
                        <p className="font-mono">
                          {selectedExpense.receipt_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedExpense.description}
                </p>
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  Financial Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span>{formatCurrency(selectedExpense.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>{formatCurrency(selectedExpense.tax_amount)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-red-700">
                      {formatCurrency(selectedExpense.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Approval History */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Approval History</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(selectedExpense.created_at)}</span>
                  </div>
                  {selectedExpense.approved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved:</span>
                      <span>{formatDate(selectedExpense.approved_at)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created by:</span>
                    <span>
                      {selectedExpense.users?.full_name ||
                        selectedExpense.users?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "finance"]}>
        <ExpensesPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
