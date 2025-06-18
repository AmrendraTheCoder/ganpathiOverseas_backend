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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Mail,
  Phone,
  Send,
  Download,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  FileText,
  Target,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

// Mock data for demonstration
const mockReceivables = [
  {
    id: "1",
    invoice_number: "INV-2024-001",
    customer_name: "ABC Printing Co.",
    customer_email: "billing@abcprinting.com",
    invoice_date: "2024-01-15",
    due_date: "2024-02-14",
    original_amount: 125000,
    paid_amount: 25000,
    outstanding_amount: 100000,
    days_overdue: 15,
    status: "overdue",
    priority: "high",
    last_contact: "2024-01-28",
    payment_terms: "Net 30",
    job_number: "JOB-2024-001",
    notes: "Customer requested payment plan",
  },
  {
    id: "2",
    invoice_number: "INV-2024-002",
    customer_name: "XYZ Publishers",
    customer_email: "accounts@xyzpublishers.com",
    invoice_date: "2024-01-20",
    due_date: "2024-02-19",
    original_amount: 75000,
    paid_amount: 0,
    outstanding_amount: 75000,
    days_overdue: 0,
    status: "current",
    priority: "medium",
    last_contact: "2024-01-20",
    payment_terms: "Net 30",
    job_number: "JOB-2024-002",
    notes: "",
  },
  {
    id: "3",
    invoice_number: "INV-2024-003",
    customer_name: "Digital Media Ltd.",
    customer_email: "finance@digitalmedia.com",
    invoice_date: "2024-01-10",
    due_date: "2024-02-09",
    original_amount: 200000,
    paid_amount: 200000,
    outstanding_amount: 0,
    days_overdue: 0,
    status: "paid",
    priority: "low",
    last_contact: "2024-02-05",
    payment_terms: "Net 30",
    job_number: "JOB-2024-003",
    notes: "Paid in full",
  },
  {
    id: "4",
    invoice_number: "INV-2024-004",
    customer_name: "Creative Solutions",
    customer_email: "billing@creativesolutions.com",
    invoice_date: "2024-01-25",
    due_date: "2024-02-24",
    original_amount: 90000,
    paid_amount: 45000,
    outstanding_amount: 45000,
    days_overdue: 0,
    status: "partial",
    priority: "medium",
    last_contact: "2024-02-01",
    payment_terms: "Net 30",
    job_number: "JOB-2024-004",
    notes: "Partial payment received",
  },
];

const mockAgingReport = {
  current: { count: 5, amount: 250000 },
  days_1_30: { count: 3, amount: 180000 },
  days_31_60: { count: 2, amount: 120000 },
  days_61_90: { count: 1, amount: 85000 },
  over_90: { count: 1, amount: 60000 },
};

const mockSummary = {
  total_receivables: 695000,
  total_overdue: 265000,
  total_current: 430000,
  collection_rate: 78.5,
  average_days_to_pay: 42,
  largest_outstanding: 100000,
  customers_with_overdue: 4,
  total_customers: 12,
};

const ReceivablesContent = () => {
  const [receivables, setReceivables] = useState(mockReceivables);
  const [summary, setSummary] = useState(mockSummary);
  const [agingReport, setAgingReport] = useState(mockAgingReport);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  const [contactForm, setContactForm] = useState({
    type: "email",
    subject: "",
    message: "",
    template: "reminder",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "current":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      case "partial":
        return <TrendingUp className="h-4 w-4" />;
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleSendReminder = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setShowContactDialog(false);
    setContactForm({
      type: "email",
      subject: "",
      message: "",
      template: "reminder",
    });

    setLoading(false);
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent to ${selectedReceivable?.customer_name}`,
    });
  };

  const handleMarkAsPaid = (id: string) => {
    setReceivables(
      receivables.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "paid",
              outstanding_amount: 0,
              paid_amount: r.original_amount,
            }
          : r
      )
    );
    toast({
      title: "Payment Recorded",
      description: "Invoice marked as paid successfully.",
    });
  };

  const filteredReceivables = receivables.filter((receivable) => {
    const matchesStatus =
      selectedStatus === "all" || receivable.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || receivable.priority === selectedPriority;
    const matchesSearch =
      receivable.customer_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      receivable.invoice_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      receivable.job_number.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const messageTemplates = {
    reminder: `Dear [Customer Name],

This is a friendly reminder that Invoice [Invoice Number] for ₹[Amount] was due on [Due Date].

We would appreciate prompt payment to avoid any late fees. If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business.

Best regards,
Ganpathi Overseas`,

    overdue: `Dear [Customer Name],

Our records indicate that Invoice [Invoice Number] for ₹[Amount] is now [Days] days overdue.

Please arrange payment immediately to avoid any disruption to your account. If there are any issues with this invoice, please contact us right away.

Thank you for your immediate attention to this matter.

Best regards,
Ganpathi Overseas`,

    final: `Dear [Customer Name],

This is a final notice regarding Invoice [Invoice Number] for ₹[Amount], which is now significantly overdue.

If payment is not received within 7 days, we may need to take further action including engaging collection services.

Please contact us immediately to resolve this matter.

Best regards,
Ganpathi Overseas`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Accounts Receivable
          </h1>
          <p className="text-muted-foreground">
            Track outstanding invoices and manage customer payments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Statements
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Receivables
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(summary.total_receivables / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding from {summary.total_customers} customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Amount
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{(summary.total_overdue / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.customers_with_overdue} customers with overdue payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.collection_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Average collection efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Days to Pay
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.average_days_to_pay}
            </div>
            <p className="text-xs text-muted-foreground">
              Days from invoice to payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="aging">Aging Report</TabsTrigger>
          <TabsTrigger value="customer-statements">
            Customer Statements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, invoice, or job number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedPriority}
              onValueChange={setSelectedPriority}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Receivables Table */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Receivables</CardTitle>
              <CardDescription>
                Manage and track all outstanding customer payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceivables.map((receivable) => (
                    <TableRow key={receivable.id}>
                      <TableCell className="font-medium">
                        {receivable.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {receivable.customer_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {receivable.customer_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(receivable.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{receivable.original_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{receivable.outstanding_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(receivable.status)}>
                          {getStatusIcon(receivable.status)}
                          <span className="ml-1 capitalize">
                            {receivable.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPriorityColor(receivable.priority)}
                        >
                          {receivable.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {receivable.days_overdue > 0 ? (
                          <span className="text-red-600 font-medium">
                            {receivable.days_overdue} days
                          </span>
                        ) : (
                          <span className="text-green-600">Current</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReceivable(receivable);
                              setShowContactDialog(true);
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsPaid(receivable.id)}
                            disabled={receivable.status === "paid"}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging Report</CardTitle>
              <CardDescription>
                Breakdown of receivables by age categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Current</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(agingReport.current.amount / 100000).toFixed(1)}L
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agingReport.current.count} invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">1-30 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      ₹{(agingReport.days_1_30.amount / 100000).toFixed(1)}L
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agingReport.days_1_30.count} invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">31-60 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{(agingReport.days_31_60.amount / 100000).toFixed(1)}L
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agingReport.days_31_60.count} invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">61-90 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ₹{(agingReport.days_61_90.amount / 100000).toFixed(1)}L
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agingReport.days_61_90.count} invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Over 90 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-800">
                      ₹{(agingReport.over_90.amount / 100000).toFixed(1)}L
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agingReport.over_90.count} invoices
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer-statements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Account Statements</CardTitle>
              <CardDescription>
                Generate and send customer account statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Customer Statements</h3>
                <p className="text-muted-foreground mb-4">
                  Generate detailed account statements for customers
                </p>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Statements
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a payment reminder to {selectedReceivable?.customer_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Method</Label>
                <Select
                  value={contactForm.type}
                  onValueChange={(value) =>
                    setContactForm({ ...contactForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select
                  value={contactForm.template}
                  onValueChange={(value) => {
                    setContactForm({
                      ...contactForm,
                      template: value,
                      message: messageTemplates[value] || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Friendly Reminder</SelectItem>
                    <SelectItem value="overdue">Overdue Notice</SelectItem>
                    <SelectItem value="final">Final Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {contactForm.type === "email" && (
              <>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Payment Reminder - Invoice #..."
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Enter your message..."
                    rows={8}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            {contactForm.type === "phone" && (
              <div className="space-y-2">
                <Label>Call Notes</Label>
                <Textarea
                  placeholder="Notes from phone conversation..."
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowContactDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendReminder} disabled={loading}>
              {loading
                ? "Sending..."
                : contactForm.type === "email"
                  ? "Send Email"
                  : "Log Call"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function ReceivablesPage() {
  return (
    <RoleBasedAccess allowedRoles={["admin", "finance", "supervisor"]}>
      <DashboardPageLayout>
        <ReceivablesContent />
      </DashboardPageLayout>
    </RoleBasedAccess>
  );
}
