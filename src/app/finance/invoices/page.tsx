"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Edit,
  Printer,
  DollarSign,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { demoJobSheets, demoParties, getPartyById } from "@/data/demo-data";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

// Generate demo invoices based on completed jobs
const generateInvoices = () => {
  return demoJobSheets
    .filter((job) => job.status === "completed" || job.status === "in_progress")
    .map((job, index) => {
      const party = getPartyById(job.partyId);
      const invoiceDate = new Date(job.orderDate);
      invoiceDate.setDate(invoiceDate.getDate() + 7); // Invoice 7 days after order

      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

      const subtotal = job.sellingPrice || 0;
      const gstRate = 18;
      const gstAmount = (subtotal * gstRate) / 100;
      const total = subtotal + gstAmount;

      const statuses = ["draft", "sent", "paid", "overdue", "cancelled"];
      const status =
        index < 2
          ? "paid"
          : index < 4
            ? "sent"
            : statuses[index % statuses.length];

      return {
        id: `INV-${(1000 + index).toString()}`,
        jobId: job.id,
        partyId: job.partyId,
        partyName: party?.name || "Unknown",
        invoiceNumber: `GPI-2024-${(1000 + index).toString()}`,
        invoiceDate: invoiceDate.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        status,
        subtotal,
        gstRate,
        gstAmount,
        total,
        paidAmount: status === "paid" ? total : 0,
        description: job.title,
        quantity: job.quantity || 1,
        unitPrice: subtotal / (job.quantity || 1),
      };
    });
};

function InvoicesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const invoices = generateInvoices();

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: FileText,
      sent: Send,
      paid: CheckCircle,
      overdue: AlertTriangle,
      cancelled: AlertTriangle,
    };
    return icons[status as keyof typeof icons] || FileText;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = totalAmount - paidAmount;
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === "overdue"
  ).length;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Invoices Management
          </h1>
          <p className="text-gray-600">
            Create, send, and track customer invoices
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Invoices
                </p>
                <p className="text-3xl font-bold">{totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Amount
                </p>
                <p className="text-3xl font-bold">
                  ₹{(totalAmount / 1000).toFixed(0)}K
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
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-3xl font-bold">
                  ₹{(paidAmount / 1000).toFixed(0)}K
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold">{overdueInvoices}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Date Range
              </label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            Manage and track your customer invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => {
              const StatusIcon = getStatusIcon(invoice.status);
              const isOverdue = invoice.status === "overdue";

              return (
                <div
                  key={invoice.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${isOverdue ? "border-red-200 bg-red-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100"
                            : invoice.status === "overdue"
                              ? "bg-red-100"
                              : invoice.status === "sent"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                        }`}
                      >
                        <StatusIcon
                          className={`w-5 h-5 ${
                            invoice.status === "paid"
                              ? "text-green-600"
                              : invoice.status === "overdue"
                                ? "text-red-600"
                                : invoice.status === "sent"
                                  ? "text-blue-600"
                                  : "text-gray-600"
                          }`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-medium">
                            {invoice.invoiceNumber}
                          </h3>
                          <Badge className={getStatusBadge(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() +
                              invoice.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {invoice.partyName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due:{" "}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {invoice.description}
                          </span>
                        </div>

                        {invoice.status === "overdue" && (
                          <div className="mt-2 text-sm text-red-600 font-medium">
                            ⚠️{" "}
                            {Math.ceil(
                              (new Date().getTime() -
                                new Date(invoice.dueDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days overdue
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium text-lg">
                        ₹{invoice.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.status === "paid" ? "Paid" : "Pending"}
                      </div>
                      {invoice.gstAmount > 0 && (
                        <div className="text-xs text-gray-400">
                          (Incl. GST ₹{invoice.gstAmount.toFixed(2)})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="mt-4 pt-4 border-t bg-gray-50 rounded p-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Invoice Date:</span>
                        <div className="font-medium">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <div className="font-medium">{invoice.quantity}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit Price:</span>
                        <div className="font-medium">
                          ₹{invoice.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          GST ({invoice.gstRate}%):
                        </span>
                        <div className="font-medium">
                          ₹{invoice.gstAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {invoice.status === "draft" && (
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    {(invoice.status === "draft" ||
                      invoice.status === "overdue") && (
                      <Button size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    )}
                    {invoice.status === "sent" && (
                      <Button size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or create a new invoice.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "finance"]}>
        <InvoicesPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
