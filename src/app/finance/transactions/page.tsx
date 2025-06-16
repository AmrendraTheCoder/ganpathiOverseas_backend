"use client";

import React, { useState } from "react";
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
  demoTransactions,
  getPartyById,
  getJobSheetById,
  Transaction,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

const TransactionsPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const filteredTransactions = demoTransactions.filter((transaction) => {
    const party = getPartyById(transaction.partyId);
    const job = getJobSheetById(transaction.jobId || "");

    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.referenceNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      party?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    // Date filtering logic would go here
    const matchesDate = true; // Simplified for demo

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FileText className="w-4 h-4" />;
      case "payment":
        return <DollarSign className="w-4 h-4" />;
      case "credit":
        return <TrendingUp className="w-4 h-4" />;
      case "debit":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      invoice: { color: "bg-blue-100 text-blue-800", label: "Invoice" },
      payment: { color: "bg-green-100 text-green-800", label: "Payment" },
      credit: { color: "bg-emerald-100 text-emerald-800", label: "Credit" },
      debit: { color: "bg-red-100 text-red-800", label: "Debit" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: "Other",
    };

    return (
      <Badge className={config.color}>
        {getTypeIcon(type)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      overdue: { color: "bg-red-100 text-red-800", label: "Overdue" },
      cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const isCredit = (type: string) => ["payment", "credit"].includes(type);

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const party = getPartyById(transaction.partyId);
    const job = getJobSheetById(transaction.jobId || "");
    const credit = isCredit(transaction.type);

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <div
                  className={`p-2 rounded-lg mr-3 ${credit ? "bg-green-100" : "bg-blue-100"}`}
                >
                  {credit ? (
                    <ArrowDownRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                {transaction.description}
              </CardTitle>
              <CardDescription>
                {transaction.referenceNumber} • {party?.name}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getTypeBadge(transaction.type)}
              {getStatusBadge(transaction.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p
                className={`text-lg font-bold ${credit ? "text-green-600" : "text-blue-600"}`}
              >
                {credit ? "+" : ""}
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Transaction Date</p>
              <p className="font-medium">
                {new Date(transaction.transactionDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">
                {transaction.paymentMethod || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Related Job</p>
              <p className="font-medium">
                {job?.title || "General Transaction"}
              </p>
            </div>
          </div>

          {transaction.dueDate && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Due Date:</strong>{" "}
                {new Date(transaction.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {transaction.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Notes:</p>
              <p className="text-sm">{transaction.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Created {new Date(transaction.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
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
  const totalIncome = demoTransactions
    .filter((t) => isCredit(t.type) && t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = demoTransactions
    .filter((t) => !isCredit(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingInvoices = demoTransactions.filter(
    (t) => t.type === "invoice" && t.status === "pending"
  ).length;

  const overdueTransactions = demoTransactions.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status === "pending"
  ).length;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Financial Transactions
          </h1>
          <p className="text-gray-600">
            Track payments, invoices, and financial activities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">Received payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Invoiced amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingInvoices}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueTransactions}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
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
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="credit">Credits</SelectItem>
                <SelectItem value="debit">Debits</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Transactions ({filteredTransactions.length})
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No transactions found
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  No transactions match your search criteria. Try adjusting your
                  filters.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Transaction
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Transactions Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions Table</CardTitle>
          <CardDescription>
            Detailed view of all financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.slice(0, 10).map((transaction) => {
                const party = getPartyById(transaction.partyId);
                const credit = isCredit(transaction.type);

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.referenceNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                        {party?.name}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${credit ? "text-green-600" : "text-blue-600"}`}
                      >
                        {credit ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(
                        transaction.transactionDate
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
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
