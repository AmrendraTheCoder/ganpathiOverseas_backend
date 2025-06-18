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
  MoreHorizontal,
  Mail,
  Trash2,
  RefreshCw,
  X,
  Calculator,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import DatabaseConnectionStatus from "@/components/DatabaseConnectionStatus";
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
import { Label } from "@/components/ui/label";

interface Invoice {
  id: string;
  invoice_number: string;
  party_id: string;
  job_sheet_id?: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  terms?: string;
  notes?: string;
  created_at: string;
  parties?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  job_sheets?: {
    job_number: string;
    description: string;
    quantity: number;
  };
  invoice_items: InvoiceItem[];
  days_overdue?: number;
  balance_due: number;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Party {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  totalOutstanding: number;
  overdueAmount: number;
  paidInvoices: number;
  draftInvoices: number;
  overdueInvoices: number;
}

function InvoicesPageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Form states
  const [newInvoice, setNewInvoice] = useState({
    party_id: "",
    job_sheet_id: "",
    due_date: "",
    terms: "",
    notes: "",
    items: [{ description: "", quantity: 1, unit_price: 0 }],
    tax_amount: 0,
    discount_amount: 0,
  });

  useEffect(() => {
    fetchInvoices();
    fetchParties();
  }, [currentPage, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/finance/invoices?${params}`);
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices);
        setSummary(data.summary);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error("Failed to fetch invoices:", data.error);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParties = async () => {
    try {
      const response = await fetch("/api/parties");
      const data = await response.json();
      if (response.ok) {
        setParties(data.parties || []);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const response = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInvoice),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setNewInvoice({
          party_id: "",
          job_sheet_id: "",
          due_date: "",
          terms: "",
          notes: "",
          items: [{ description: "", quantity: 1, unit_price: 0 }],
          tax_amount: 0,
          discount_amount: 0,
        });
        fetchInvoices();
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/finance/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoiceId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string, paidAmount: number) => {
    try {
      const response = await fetch("/api/finance/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoiceId,
          status: "PAID",
          paid_amount: paidAmount,
          payment_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
    }
  };

  const addInvoiceItem = () => {
    setNewInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unit_price: 0 }],
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return newInvoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + newInvoice.tax_amount - newInvoice.discount_amount;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4" />;
      case "SENT":
        return <Mail className="h-4 w-4" />;
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4" />;
      case "DRAFT":
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.parties?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="text-gray-500">Loading invoices...</p>
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
            Invoice Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and track customer invoices
          </p>
          <div className="mt-2">
            <DatabaseConnectionStatus variant="compact" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchInvoices}
            className="bg-white shadow-md"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-green-600 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Invoices"
            value={summary.totalInvoices}
            icon={FileText}
            color="text-blue-600"
            subtitle="All time"
          />
          <StatCard
            title="Total Amount"
            value={formatCurrency(summary.totalAmount)}
            icon={DollarSign}
            color="text-green-600"
            subtitle="Invoiced value"
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(summary.totalOutstanding)}
            icon={Clock}
            color="text-yellow-600"
            subtitle="Pending payments"
          />
          <StatCard
            title="Overdue"
            value={formatCurrency(summary.overdueAmount)}
            icon={AlertTriangle}
            color="text-red-600"
            subtitle="Requires attention"
          />
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invoices..."
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Invoices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.parties?.name}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.parties?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell>
                      <div>
                        <p>{formatDate(invoice.due_date)}</p>
                        {invoice.days_overdue && (
                          <p className="text-xs text-red-600">
                            {invoice.days_overdue} days overdue
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(invoice.total_amount)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(invoice.paid_amount)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-orange-600">
                      {formatCurrency(invoice.balance_due)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
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
                              setSelectedInvoice(invoice);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Print/PDF
                          </DropdownMenuItem>
                          {invoice.status === "DRAFT" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(invoice.id, "SENT")
                              }
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Invoice
                            </DropdownMenuItem>
                          )}
                          {(invoice.status === "SENT" ||
                            invoice.status === "OVERDUE") && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleMarkAsPaid(
                                  invoice.id,
                                  invoice.balance_due
                                )
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
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
              Showing {filteredInvoices.length} of {summary?.totalInvoices || 0}{" "}
              invoices
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

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new customer invoice
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="party">Customer *</Label>
                <Select
                  value={newInvoice.party_id}
                  onValueChange={(value) =>
                    setNewInvoice((prev) => ({ ...prev, party_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((party) => (
                      <SelectItem key={party.id} value={party.id}>
                        {party.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Invoice Items</Label>
                <Button type="button" onClick={addInvoiceItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {newInvoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-end"
                  >
                    <div className="col-span-5">
                      <Label>Description</Label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "unit_price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <div className="p-2 bg-gray-50 rounded-md text-right font-medium">
                        ₹{(item.quantity * item.unit_price).toLocaleString()}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {newInvoice.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvoiceItem(index)}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tax Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newInvoice.tax_amount}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      tax_amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Discount Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newInvoice.discount_amount}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      discount_amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Total Amount</Label>
                <div className="p-2 bg-blue-50 rounded-md text-right font-bold text-blue-700 text-lg">
                  {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Tax:</span>
                <span>+ {formatCurrency(newInvoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Discount:</span>
                <span>- {formatCurrency(newInvoice.discount_amount)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-blue-700">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            {/* Terms and Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="terms">Payment Terms</Label>
                <Textarea
                  placeholder="Payment terms and conditions..."
                  value={newInvoice.terms}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      terms: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={newInvoice.notes}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
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
                onClick={handleCreateInvoice}
                disabled={
                  !newInvoice.party_id ||
                  newInvoice.items.some((item) => !item.description)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete invoice information and payment history
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Invoice Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Number:</span>
                      <span className="font-mono">
                        {selectedInvoice.invoice_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(selectedInvoice.invoice_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span>{formatDate(selectedInvoice.due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedInvoice.status)}>
                        {selectedInvoice.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">
                        {selectedInvoice.parties?.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p>{selectedInvoice.parties?.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p>{selectedInvoice.parties?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Invoice Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.invoice_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  Financial Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>
                      -{formatCurrency(selectedInvoice.discount_amount)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid Amount:</span>
                    <span>{formatCurrency(selectedInvoice.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-orange-600">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(selectedInvoice.balance_due)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Notes */}
              {(selectedInvoice.terms || selectedInvoice.notes) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedInvoice.terms && (
                    <div>
                      <h3 className="font-semibold mb-2">Payment Terms</h3>
                      <p className="text-sm text-gray-600">
                        {selectedInvoice.terms}
                      </p>
                    </div>
                  )}
                  {selectedInvoice.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-sm text-gray-600">
                        {selectedInvoice.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
