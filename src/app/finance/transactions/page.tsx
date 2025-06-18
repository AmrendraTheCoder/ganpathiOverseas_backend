"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  Calendar,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  MoreHorizontal,
  Receipt,
  Target,
  AlertTriangle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  demoTransactions,
  getPartyById,
  getJobSheetById,
  Transaction,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import { useAuth } from "@/contexts/AuthContext";
import DatabaseConnectionStatus from "@/components/DatabaseConnectionStatus";

interface Transaction {
  id: string;
  transaction_number: string;
  transaction_date: string;
  reference_type: string;
  reference_id?: string;
  party_id?: string;
  description: string;
  total_amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  created_at: string;
  parties?: {
    name: string;
    email: string;
  };
  users?: {
    email: string;
    full_name: string;
  };
}

interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
  pending: number;
  approved: number;
  byType: {
    jobSheet: number;
    invoice: number;
    payment: number;
    expense: number;
  };
}

const TransactionsPageContent = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, typeFilter, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      let startDate = "";
      const endDate = new Date().toISOString().split("T")[0];

      switch (dateRange) {
        case "week":
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          break;
        case "month":
          startDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          )
            .toISOString()
            .split("T")[0];
          break;
        case "quarter":
          const quarterStart = new Date(
            new Date().getFullYear(),
            Math.floor(new Date().getMonth() / 3) * 3,
            1
          );
          startDate = quarterStart.toISOString().split("T")[0];
          break;
        case "year":
          startDate = new Date(new Date().getFullYear(), 0, 1)
            .toISOString()
            .split("T")[0];
          break;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(startDate && { startDate }),
        endDate,
      });

      const response = await fetch(`/api/finance/transactions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions);
        setSummary(data.summary);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error("Failed to fetch transactions:", data.error);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    transactionId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch("/api/finance/transactions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: transactionId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "JOB_SHEET":
        return <FileText className="h-4 w-4" />;
      case "INVOICE":
        return <Receipt className="h-4 w-4" />;
      case "PAYMENT":
        return <CreditCard className="h-4 w-4" />;
      case "EXPENSE":
        return <Target className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? "text-green-600" : "text-red-600";
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.transaction_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.parties?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`bg-${color.split("-")[1]}-100 p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500">Loading transactions...</p>
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
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Financial Transactions
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all financial transactions and entries
          </p>
          <div className="mt-2">
            <DatabaseConnectionStatus variant="compact" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchTransactions}
            className="bg-white shadow-md"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-green-600 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Transactions"
            value={summary.totalTransactions}
            icon={FileText}
            color="text-blue-600"
          />
          <StatCard
            title="Total Amount"
            value={formatCurrency(summary.totalAmount)}
            icon={DollarSign}
            color="text-green-600"
          />
          <StatCard
            title="Pending Approval"
            value={summary.pending}
            icon={AlertTriangle}
            color="text-yellow-600"
          />
          <StatCard
            title="Approved"
            value={summary.approved}
            icon={Check}
            color="text-green-600"
          />
        </div>
      )}

      {/* Filters and Search */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
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
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="JOB_SHEET">Job Sheet</SelectItem>
                <SelectItem value="INVOICE">Invoice</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction History
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {transaction.transaction_number}
                    </TableCell>
                    <TableCell>
                      {formatDate(transaction.transaction_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.reference_type)}
                        <span className="text-sm">
                          {transaction.reference_type.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{transaction.parties?.name || "—"}</TableCell>
                    <TableCell
                      className={`text-right font-bold ${getAmountColor(transaction.total_amount)}`}
                    >
                      {transaction.total_amount >= 0 ? "+" : "-"}
                      {formatCurrency(transaction.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
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
                              setSelectedTransaction(transaction);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {transaction.status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(transaction.id, "APPROVED")
                                }
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(transaction.id, "REJECTED")
                                }
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
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
              Showing {filteredTransactions.length} of{" "}
              {summary?.totalTransactions || 0} transactions
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

      {/* Transaction Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View complete transaction information and audit trail
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Transaction Number
                  </label>
                  <p className="font-mono">
                    {selectedTransaction.transaction_number}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date
                  </label>
                  <p>{formatDate(selectedTransaction.transaction_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Type
                  </label>
                  <p>{selectedTransaction.reference_type.replace("_", " ")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <p>{selectedTransaction.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Amount
                  </label>
                  <p
                    className={`text-lg font-bold ${getAmountColor(selectedTransaction.total_amount)}`}
                  >
                    {selectedTransaction.total_amount >= 0 ? "+" : "-"}
                    {formatCurrency(selectedTransaction.total_amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Party
                  </label>
                  <p>{selectedTransaction.parties?.name || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TransactionsPage = () => {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "finance"]}>
        <TransactionsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
};

export default TransactionsPage;
