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
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  FileCheck,
  Clock,
  Receipt,
  Calculator,
  Building,
  Download,
  Eye,
  Edit,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

// Mock data for demonstration
const mockTaxReports = [
  {
    id: "1",
    report_name: "GST Return - March 2024",
    report_type: "GST",
    tax_period_start: "2024-03-01",
    tax_period_end: "2024-03-31",
    tax_year: 2024,
    gst_taxable_sales: 2000000,
    gst_output_tax: 360000,
    gst_input_tax: 180000,
    gst_net_payable: 180000,
    filing_due_date: "2024-04-20",
    filing_status: "FILED",
    filed_date: "2024-04-15",
    status: "FINALIZED",
    generated_at: "2024-04-01T10:00:00Z",
    generated_by: "Finance Team",
  },
  {
    id: "2",
    report_name: "Income Tax - FY 2023-24",
    report_type: "INCOME_TAX",
    tax_period_start: "2023-04-01",
    tax_period_end: "2024-03-31",
    tax_year: 2024,
    gross_income: 15000000,
    total_deductions: 3000000,
    taxable_income: 12000000,
    income_tax_liability: 3600000,
    advance_tax_paid: 3200000,
    tax_refund_due: 0,
    filing_due_date: "2024-07-31",
    filing_status: "PENDING",
    status: "DRAFT",
    generated_at: "2024-03-31T15:30:00Z",
    generated_by: "Finance Team",
  },
];

const mockSummary = {
  total_reports: 15,
  pending_filings: 4,
  filed_reports: 11,
  total_gst_payable: 2400000,
  total_income_tax: 3600000,
  by_type: {
    gst: 10,
    income_tax: 3,
    tds: 2,
  },
  by_year: {
    2023: 5,
    2024: 10,
  },
  overdue_reports: 1,
};

const mockComplianceData = [
  {
    type: "GST Monthly Return",
    due_date: "2024-04-20",
    status: "FILED",
    amount: 180000,
  },
  {
    type: "TDS Monthly Return",
    due_date: "2024-04-15",
    status: "FILED",
    amount: 45000,
  },
  {
    type: "Income Tax Quarterly",
    due_date: "2024-06-15",
    status: "PENDING",
    amount: 900000,
  },
  {
    type: "GST Annual Return",
    due_date: "2024-12-31",
    status: "PENDING",
    amount: 2160000,
  },
];

const TaxReportsContent = () => {
  const [reports, setReports] = useState(mockTaxReports);
  const [summary, setSummary] = useState(mockSummary);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFilingStatus, setSelectedFilingStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({
    connected: true,
    lastChecked: new Date(),
  });

  const [newReport, setNewReport] = useState({
    report_name: "",
    report_type: "GST",
    tax_period_start: "",
    tax_period_end: "",
    tax_year: new Date().getFullYear(),
    filing_due_date: "",
    generate_from_transactions: true,
  });

  useEffect(() => {
    checkDatabaseConnection();
    fetchReports();
  }, [selectedType, selectedStatus, selectedFilingStatus]);

  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch("/api/db-check");
      const data = await response.json();
      setDbStatus({
        connected: data.connected,
        lastChecked: new Date(),
      });
    } catch (error) {
      setDbStatus({
        connected: false,
        lastChecked: new Date(),
      });
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        ...(selectedType !== "all" && { report_type: selectedType }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
        ...(selectedFilingStatus !== "all" && {
          filing_status: selectedFilingStatus,
        }),
      });

      const response = await fetch(`/api/finance/reports/tax?${params}`);

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setSummary(data.summary);
      } else {
        console.log("Using mock data for tax reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports. Using cached data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/finance/reports/tax", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReport),
      });

      if (response.ok) {
        const data = await response.json();
        setReports([data.report, ...reports]);
        setShowCreateDialog(false);
        setNewReport({
          report_name: "",
          report_type: "GST",
          tax_period_start: "",
          tax_period_end: "",
          tax_year: new Date().getFullYear(),
          filing_due_date: "",
          generate_from_transactions: true,
        });

        toast({
          title: "Report Created",
          description: "Tax report has been generated successfully.",
        });
      } else {
        throw new Error("Failed to create report");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "FINALIZED":
        return "bg-green-100 text-green-800";
      case "FILED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFilingStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800";
      case "FILED":
        return "bg-green-100 text-green-800";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFilingStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "FILED":
        return <FileCheck className="h-4 w-4" />;
      case "REVIEWED":
        return <Eye className="h-4 w-4" />;
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "GST":
        return <Receipt className="h-4 w-4" />;
      case "INCOME_TAX":
        return <Calculator className="h-4 w-4" />;
      case "TDS":
        return <Building className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === "PENDING" && new Date(dueDate) < new Date();
  };

  const filteredReports = reports.filter((report) => {
    const matchesType =
      selectedType === "all" || report.report_type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;
    const matchesFilingStatus =
      selectedFilingStatus === "all" ||
      report.filing_status === selectedFilingStatus;
    const matchesSearch = report.report_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesFilingStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Database Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${dbStatus.connected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-sm text-muted-foreground">
            Database: {dbStatus.connected ? "Connected" : "Disconnected"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkDatabaseConnection}
            className="p-1"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Reports</h1>
          <p className="text-muted-foreground">
            Manage GST, income tax, TDS and compliance reporting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate Tax Report</DialogTitle>
                <DialogDescription>
                  Create a new tax report for compliance and filing
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="report_name">Report Name</Label>
                  <Input
                    id="report_name"
                    placeholder="e.g., GST Return - March 2024"
                    value={newReport.report_name}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        report_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report_type">Report Type</Label>
                  <Select
                    value={newReport.report_type}
                    onValueChange={(value) =>
                      setNewReport({ ...newReport, report_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST</SelectItem>
                      <SelectItem value="INCOME_TAX">Income Tax</SelectItem>
                      <SelectItem value="TDS">TDS</SelectItem>
                      <SelectItem value="PROFESSIONAL_TAX">
                        Professional Tax
                      </SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_year">Tax Year</Label>
                  <Input
                    id="tax_year"
                    type="number"
                    value={newReport.tax_year}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        tax_year: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_start">Period Start</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={newReport.tax_period_start}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        tax_period_start: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_end">Period End</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={newReport.tax_period_end}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        tax_period_end: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filing_due_date">Filing Due Date</Label>
                  <Input
                    id="filing_due_date"
                    type="date"
                    value={newReport.filing_due_date}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        filing_due_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generate_method">Generation Method</Label>
                  <Select
                    value={
                      newReport.generate_from_transactions
                        ? "transactions"
                        : "manual"
                    }
                    onValueChange={(value) =>
                      setNewReport({
                        ...newReport,
                        generate_from_transactions: value === "transactions",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactions">
                        From Transactions
                      </SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateReport} disabled={loading}>
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tax Liability
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                summary.total_gst_payable + summary.total_income_tax
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              GST + Income Tax combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Filings
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending_filings}</div>
            <p className="text-xs text-muted-foreground">
              {summary.overdue_reports} overdue,{" "}
              {summary.pending_filings - summary.overdue_reports} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filed Reports</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.filed_reports}</div>
            <p className="text-xs text-muted-foreground">
              Successfully filed this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (summary.filed_reports / summary.total_reports) * 100
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">On-time filing rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Tax Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Calendar</TabsTrigger>
          <TabsTrigger value="summary">Tax Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GST">GST</SelectItem>
                <SelectItem value="INCOME_TAX">Income Tax</SelectItem>
                <SelectItem value="TDS">TDS</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedFilingStatus}
              onValueChange={setSelectedFilingStatus}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filing Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FILED">Filed</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Report Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="FINALIZED">Finalized</SelectItem>
                <SelectItem value="FILED">Filed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>
                View and manage all tax reports and compliance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tax Period</TableHead>
                    <TableHead className="text-right">Tax Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Filing Status</TableHead>
                    <TableHead>Report Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.report_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(report.report_type)}
                          <Badge variant="outline">{report.report_type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(report.tax_period_start).toLocaleDateString()}{" "}
                        - {new Date(report.tax_period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {report.report_type === "GST"
                          ? formatCurrency(report.gst_net_payable || 0)
                          : formatCurrency(report.income_tax_liability || 0)}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center space-x-2 ${isOverdue(report.filing_due_date, report.filing_status) ? "text-red-600" : ""}`}
                        >
                          {isOverdue(
                            report.filing_due_date,
                            report.filing_status
                          ) && <AlertTriangle className="h-4 w-4" />}
                          <span>
                            {new Date(
                              report.filing_due_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getFilingStatusColor(report.filing_status)}
                        >
                          {getFilingStatusIcon(report.filing_status)}
                          <span className="ml-1">{report.filing_status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Calendar</CardTitle>
              <CardDescription>
                Upcoming tax filing deadlines and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockComplianceData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getTypeIcon(item.type.split(" ")[0])}
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <Badge className={getFilingStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Summary by Type</CardTitle>
                <CardDescription>
                  Breakdown of tax liabilities by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Receipt className="h-4 w-4" />
                      <span>GST</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(summary.total_gst_payable)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Income Tax</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(summary.total_income_tax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Total Tax Liability</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(
                        summary.total_gst_payable + summary.total_income_tax
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filing Status Overview</CardTitle>
                <CardDescription>Current status of tax filings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Reports</span>
                    <span className="font-semibold">
                      {summary.total_reports}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Filed Reports</span>
                    <span className="font-semibold text-green-600">
                      {summary.filed_reports}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending Reports</span>
                    <span className="font-semibold text-orange-600">
                      {summary.pending_filings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overdue Reports</span>
                    <span className="font-semibold text-red-600">
                      {summary.overdue_reports}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function TaxReportsPage() {
  return (
    <RoleBasedAccess allowedRoles={["admin", "finance", "supervisor"]}>
      <DashboardPageLayout>
        <TaxReportsContent />
      </DashboardPageLayout>
    </RoleBasedAccess>
  );
}
