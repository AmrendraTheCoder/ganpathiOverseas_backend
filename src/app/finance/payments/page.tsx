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
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  MoreHorizontal,
  RefreshCw,
  ArrowUpDown,
  Building2,
  Receipt,
  Banknote,
  Smartphone,
  University,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

interface Payment {
  id: string;
  payment_number: string;
  payment_type: "INCOMING" | "OUTGOING";
  invoice_id?: string;
  expense_id?: string;
  party_id?: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  description?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  created_at: string;
  reconciled: boolean;
  reconciled_at?: string;
  parties?: {
    name: string;
    email: string;
    phone: string;
  };
  invoices?: {
    invoice_number: string;
    total_amount: number;
  };
  expenses?: {
    expense_number: string;
    total_amount: number;
  };
}

interface PaymentSummary {
  totalPayments: number;
  totalIncoming: number;
  totalOutgoing: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  unreconciled: number;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: University },
  { value: "CHEQUE", label: "Cheque", icon: FileText },
  { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { value: "UPI", label: "UPI", icon: Smartphone },
  { value: "OTHER", label: "Other", icon: ArrowUpDown },
];

function PaymentsPageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Form states
  const [newPayment, setNewPayment] = useState({
    payment_type: "INCOMING" as "INCOMING" | "OUTGOING",
    invoice_id: "",
    expense_id: "",
    party_id: "",
    amount: 0,
    payment_method: "CASH",
    payment_date: new Date().toISOString().split("T")[0],
    reference_number: "",
    description: "",
  });

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter, typeFilter, methodFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(methodFilter !== "all" && { method: methodFilter }),
      });

      const response = await fetch(`/api/finance/payments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPayments(data.payments);
        setSummary(data.summary);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error("Failed to fetch payments:", data.error);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const response = await fetch("/api/finance/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPayment),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setNewPayment({
          payment_type: "INCOMING",
          invoice_id: "",
          expense_id: "",
          party_id: "",
          amount: 0,
          payment_method: "CASH",
          payment_date: new Date().toISOString().split("T")[0],
          reference_number: "",
          description: "",
        });
        fetchPayments();
      }
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const handleReconcile = async (paymentId: string) => {
    try {
      const response = await fetch("/api/finance/payments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: paymentId,
          reconciled: true,
          reconciled_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        fetchPayments();
      }
    } catch (error) {
      console.error("Error reconciling payment:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "FAILED":
        return <AlertTriangle className="h-4 w-4" />;
      case "CANCELLED":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === "INCOMING" ? "text-green-600" : "text-red-600";
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodInfo = PAYMENT_METHODS.find((m) => m.value === method);
    return methodInfo ? methodInfo.icon : ArrowUpDown;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodInfo = PAYMENT_METHODS.find((m) => m.value === method);
    return methodInfo ? methodInfo.label : method;
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.parties?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="text-gray-500">Loading payments...</p>
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
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Payment Management
          </h1>
          <p className="text-gray-600 mt-2">
            Process, track, and reconcile payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchPayments}
            className="bg-white shadow-md"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Payments"
            value={summary.totalPayments}
            icon={CreditCard}
            color="text-blue-600"
            subtitle="All time"
          />
          <StatCard
            title="Total Incoming"
            value={formatCurrency(summary.totalIncoming)}
            icon={DollarSign}
            color="text-green-600"
            subtitle="Received"
          />
          <StatCard
            title="Total Outgoing"
            value={formatCurrency(summary.totalOutgoing)}
            icon={ArrowUpDown}
            color="text-red-600"
            subtitle="Paid out"
          />
          <StatCard
            title="Unreconciled"
            value={summary.unreconciled}
            icon={AlertTriangle}
            color="text-yellow-600"
            subtitle="Needs review"
          />
        </div>
      )}

      {/* Payment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="h-5 w-5" />
              Incoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed:</span>
                <span className="font-bold text-green-600">
                  {summary?.completedPayments || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="font-bold text-yellow-600">
                  {summary?.pendingPayments || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <ArrowUpDown className="h-5 w-5" />
              Outgoing Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Processed:</span>
                <span className="font-bold text-blue-600">
                  {summary?.completedPayments || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Failed:</span>
                <span className="font-bold text-red-600">
                  {summary?.failedPayments || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-5 w-5" />
              Reconciliation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reconciled:</span>
                <span className="font-bold text-green-600">
                  {(summary?.totalPayments || 0) - (summary?.unreconciled || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="font-bold text-yellow-600">
                  {summary?.unreconciled || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search payments..."
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
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INCOMING">Incoming</SelectItem>
                <SelectItem value="OUTGOING">Outgoing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Party/Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reconciled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const MethodIcon = getPaymentMethodIcon(
                    payment.payment_method
                  );
                  return (
                    <TableRow key={payment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {payment.payment_number}
                      </TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.payment_type === "INCOMING"
                              ? "default"
                              : "secondary"
                          }
                        >
                          <span className={getTypeColor(payment.payment_type)}>
                            {payment.payment_type === "INCOMING"
                              ? "↓ IN"
                              : "↑ OUT"}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {payment.parties?.name ||
                              payment.reference_number ||
                              "—"}
                          </p>
                          {payment.invoices && (
                            <p className="text-sm text-gray-500">
                              Invoice: {payment.invoices.invoice_number}
                            </p>
                          )}
                          {payment.expenses && (
                            <p className="text-sm text-gray-500">
                              Expense: {payment.expenses.expense_number}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold ${getTypeColor(payment.payment_type)}`}
                      >
                        {payment.payment_type === "INCOMING" ? "+" : "-"}
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MethodIcon className="h-4 w-4" />
                          <span className="text-sm">
                            {getPaymentMethodLabel(payment.payment_method)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{payment.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.reconciled ? "default" : "secondary"}
                        >
                          {payment.reconciled ? "Yes" : "No"}
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
                                setSelectedPayment(payment);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Payment
                            </DropdownMenuItem>
                            {!payment.reconciled && (
                              <DropdownMenuItem
                                onClick={() => handleReconcile(payment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Reconcile
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Receipt className="h-4 w-4 mr-2" />
                              Print Receipt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {filteredPayments.length} of {summary?.totalPayments || 0}{" "}
              payments
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

      {/* Create Payment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
            <DialogDescription>
              Record a new incoming or outgoing payment transaction
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payment Type */}
            <div>
              <Label>Payment Type *</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  type="button"
                  variant={
                    newPayment.payment_type === "INCOMING"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setNewPayment((prev) => ({
                      ...prev,
                      payment_type: "INCOMING",
                    }))
                  }
                  className="justify-start"
                >
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  Incoming Payment
                </Button>
                <Button
                  type="button"
                  variant={
                    newPayment.payment_type === "OUTGOING"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setNewPayment((prev) => ({
                      ...prev,
                      payment_type: "OUTGOING",
                    }))
                  }
                  className="justify-start"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2 text-red-600" />
                  Outgoing Payment
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="payment_date">Payment Date *</Label>
                <Input
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      payment_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={newPayment.payment_method}
                onValueChange={(value) =>
                  setNewPayment((prev) => ({ ...prev, payment_method: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input
                  placeholder="Transaction reference"
                  value={newPayment.reference_number}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      reference_number: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="party_id">Party (Optional)</Label>
                <Input
                  placeholder="Customer/Vendor name"
                  value={newPayment.party_id}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      party_id: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                placeholder="Payment description or notes..."
                value={newPayment.description}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Payment Amount:</span>
                <span
                  className={
                    newPayment.payment_type === "INCOMING"
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  {newPayment.payment_type === "INCOMING" ? "+" : "-"}
                  {formatCurrency(newPayment.amount)}
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
                onClick={handleCreatePayment}
                disabled={newPayment.amount <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete payment information and transaction history
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Number:</span>
                      <span className="font-mono">
                        {selectedPayment.payment_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(selectedPayment.payment_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <Badge
                        variant={
                          selectedPayment.payment_type === "INCOMING"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedPayment.payment_type}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedPayment.status)}>
                        {selectedPayment.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Transaction Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p
                        className={`font-bold text-lg ${getTypeColor(selectedPayment.payment_type)}`}
                      >
                        {selectedPayment.payment_type === "INCOMING"
                          ? "+"
                          : "-"}
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <p>
                        {getPaymentMethodLabel(selectedPayment.payment_method)}
                      </p>
                    </div>
                    {selectedPayment.reference_number && (
                      <div>
                        <span className="text-gray-600">Reference:</span>
                        <p className="font-mono">
                          {selectedPayment.reference_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Information */}
              {(selectedPayment.parties ||
                selectedPayment.invoices ||
                selectedPayment.expenses) && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Related Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                    {selectedPayment.parties && (
                      <div>
                        <span className="text-gray-600">Party:</span>
                        <p className="font-medium">
                          {selectedPayment.parties.name}
                        </p>
                        <p className="text-gray-500">
                          {selectedPayment.parties.email}
                        </p>
                      </div>
                    )}
                    {selectedPayment.invoices && (
                      <div>
                        <span className="text-gray-600">Related Invoice:</span>
                        <p className="font-medium">
                          {selectedPayment.invoices.invoice_number}
                        </p>
                        <p className="text-gray-500">
                          Amount:{" "}
                          {formatCurrency(
                            selectedPayment.invoices.total_amount
                          )}
                        </p>
                      </div>
                    )}
                    {selectedPayment.expenses && (
                      <div>
                        <span className="text-gray-600">Related Expense:</span>
                        <p className="font-medium">
                          {selectedPayment.expenses.expense_number}
                        </p>
                        <p className="text-gray-500">
                          Amount:{" "}
                          {formatCurrency(
                            selectedPayment.expenses.total_amount
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedPayment.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedPayment.description}
                  </p>
                </div>
              )}

              {/* Reconciliation Status */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Reconciliation Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reconciled:</span>
                    <Badge
                      variant={
                        selectedPayment.reconciled ? "default" : "secondary"
                      }
                    >
                      {selectedPayment.reconciled ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {selectedPayment.reconciled_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reconciled Date:</span>
                      <span>{formatDate(selectedPayment.reconciled_at)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(selectedPayment.created_at)}</span>
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

export default function PaymentsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "finance"]}>
        <PaymentsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
