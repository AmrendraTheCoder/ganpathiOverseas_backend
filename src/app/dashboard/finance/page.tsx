"use client";

import React from "react";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  Building,
  Calendar,
  Plus,
  Download,
  Eye,
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
  demoTransactions,
  demoExpenses,
  demoParties,
  demoJobSheets,
  getPartyById,
  getJobSheetById,
} from "@/data/demo-data";

const FinanceDashboard = () => {
  const stats = getDashboardStats("finance");

  const pendingInvoices = demoTransactions.filter(
    (t) => t.type === "invoice" && t.status === "pending"
  );

  const recentTransactions = demoTransactions.slice(0, 6);
  const recentExpenses = demoExpenses.slice(0, 5);

  const overdueInvoices = demoTransactions.filter(
    (t) =>
      t.type === "invoice" &&
      t.status === "pending" &&
      t.dueDate &&
      new Date(t.dueDate) < new Date()
  );

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FileText className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "credit":
        return <TrendingUp className="h-4 w-4" />;
      case "debit":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Finance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Financial overview and transaction management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          description="This month"
          trend="+12% from last month"
          color="green"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon={FileText}
          description="Awaiting payment"
          color="yellow"
        />
        <StatCard
          title="Overdue Invoices"
          value={stats.overdueInvoices}
          icon={AlertCircle}
          description="Past due date"
          color="red"
        />
        <StatCard
          title="Active Parties"
          value={stats.totalParties}
          icon={Building}
          description="Customer accounts"
          color="blue"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Monthly Expenses"
          value={`₹${(stats.monthlyExpenses / 1000).toFixed(0)}K`}
          icon={TrendingDown}
          description="This month"
          trend="+8% from last month"
          color="red"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(stats.monthlyRevenue / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          description="This month"
          trend="+15% from last month"
          color="green"
        />
        <StatCard
          title="Net Profit"
          value={`₹${((stats.totalRevenue - stats.monthlyExpenses) / 1000).toFixed(0)}K`}
          icon={DollarSign}
          description="This month"
          trend="+22% from last month"
          color="emerald"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invoices</CardTitle>
            <CardDescription>Invoices awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvoices.map((invoice) => {
                const party = getPartyById(invoice.partyId);
                const job = getJobSheetById(invoice.jobId || "");
                const isOverdue =
                  invoice.dueDate && new Date(invoice.dueDate) < new Date();

                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between space-x-4 p-3 border rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">
                          {invoice.referenceNumber}
                        </p>
                        <Badge
                          className={getStatusBadge(
                            isOverdue ? "overdue" : invoice.status
                          )}
                        >
                          {isOverdue ? "Overdue" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {party?.name} • {job?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due:{" "}
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "TBD"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ₹{invoice.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Invoices
            </Button>
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
              {recentTransactions.map((transaction) => {
                const party = getPartyById(transaction.partyId);
                const isCredit = ["payment", "credit"].includes(
                  transaction.type
                );

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center space-x-4"
                  >
                    <div
                      className={`p-2 rounded-lg ${isCredit ? "bg-green-100" : "bg-blue-100"}`}
                    >
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {party?.name} •{" "}
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${isCredit ? "text-green-600" : "text-blue-600"}`}
                      >
                        {isCredit ? "+" : ""}₹
                        {transaction.amount.toLocaleString()}
                      </p>
                      <Badge className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Latest business expenses and costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between space-x-4 p-3 bg-muted/50 rounded-lg"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{expense.description}</p>
                    <Badge variant="outline" className="capitalize">
                      {expense.category}
                    </Badge>
                    {expense.isRecurring && (
                      <Badge variant="secondary">Recurring</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {expense.vendorName} •{" "}
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </p>
                  {expense.invoiceNumber && (
                    <p className="text-xs text-muted-foreground">
                      Invoice: {expense.invoiceNumber}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
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

      {/* Party Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Party Account Summary</CardTitle>
          <CardDescription>
            Outstanding balances and credit limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {demoParties.map((party) => {
              const utilizationPercent =
                (party.currentBalance / party.creditLimit) * 100;
              const isHighUtilization = utilizationPercent > 80;

              return (
                <div key={party.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{party.name}</h4>
                    <Badge
                      variant={isHighUtilization ? "destructive" : "secondary"}
                    >
                      {utilizationPercent.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Balance:</span>
                      <span className="font-medium">
                        ₹{party.currentBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Credit Limit:</span>
                      <span>₹{party.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available Credit:</span>
                      <span className="font-medium text-green-600">
                        ₹
                        {(
                          party.creditLimit - party.currentBalance
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used finance functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span className="text-xs">Create Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-xs">Record Payment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingDown className="h-6 w-6" />
              <span className="text-xs">Add Expense</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span className="text-xs">Export Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Building className="h-6 w-6" />
              <span className="text-xs">Party Accounts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
