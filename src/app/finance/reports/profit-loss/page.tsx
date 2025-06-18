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
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  BarChart3,
  Download,
  Eye,
  Edit,
  FileText,
  Target,
  Zap,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

// Mock data for demonstration
const mockPLReports = [
  {
    id: "1",
    report_name: "Q1 2024 Profit & Loss",
    period_start: "2024-01-01",
    period_end: "2024-03-31",
    period_type: "QUARTERLY",
    total_revenue: 2500000,
    total_cogs: 1500000,
    gross_profit: 1000000,
    total_operating_expenses: 600000,
    operating_income: 400000,
    net_income: 350000,
    status: "FINALIZED",
    generated_at: "2024-04-01T10:00:00Z",
    generated_by: "Finance Team",
  },
  {
    id: "2",
    report_name: "March 2024 P&L",
    period_start: "2024-03-01",
    period_end: "2024-03-31",
    period_type: "MONTHLY",
    total_revenue: 850000,
    total_cogs: 510000,
    gross_profit: 340000,
    total_operating_expenses: 200000,
    operating_income: 140000,
    net_income: 120000,
    status: "DRAFT",
    generated_at: "2024-03-31T15:30:00Z",
    generated_by: "Finance Team",
  },
];

const mockSummary = {
  total_reports: 12,
  avg_revenue: 2200000,
  avg_net_income: 180000,
  draft_reports: 3,
  finalized_reports: 9,
  by_period: {
    monthly: 8,
    quarterly: 3,
    yearly: 1,
  },
};

const mockPLData = {
  revenue: [
    { category: "Printing Services", amount: 1800000, percentage: 72 },
    { category: "Design Services", amount: 500000, percentage: 20 },
    { category: "Other Income", amount: 200000, percentage: 8 },
  ],
  expenses: [
    { category: "Raw Materials", amount: 900000, percentage: 60 },
    { category: "Labor Costs", amount: 400000, percentage: 26.7 },
    { category: "Overhead", amount: 200000, percentage: 13.3 },
  ],
  operating_expenses: [
    { category: "Salaries", amount: 300000, percentage: 50 },
    { category: "Rent & Utilities", amount: 150000, percentage: 25 },
    { category: "Marketing", amount: 100000, percentage: 16.7 },
    { category: "Other Expenses", amount: 50000, percentage: 8.3 },
  ],
};

const ProfitLossContent = () => {
  const [reports, setReports] = useState(mockPLReports);
  const [summary, setSummary] = useState(mockSummary);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
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
    period_start: "",
    period_end: "",
    period_type: "MONTHLY",
    generate_from_transactions: true,
  });

  useEffect(() => {
    checkDatabaseConnection();
    fetchReports();
  }, [selectedPeriod, selectedStatus]);

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
        ...(selectedPeriod !== "all" && { period_type: selectedPeriod }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
      });

      const response = await fetch(
        `/api/finance/reports/profit-loss?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setSummary(data.summary);
      } else {
        // Use mock data if API fails
        console.log("Using mock data for P&L reports");
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

      const response = await fetch("/api/finance/reports/profit-loss", {
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
          period_start: "",
          period_end: "",
          period_type: "MONTHLY",
          generate_from_transactions: true,
        });

        toast({
          title: "Report Created",
          description: "Profit & Loss report has been generated successfully.",
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
      case "PUBLISHED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Edit className="h-4 w-4" />;
      case "FINALIZED":
        return <CheckCircle className="h-4 w-4" />;
      case "PUBLISHED":
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const filteredReports = reports.filter((report) => {
    const matchesPeriod =
      selectedPeriod === "all" || report.period_type === selectedPeriod;
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;
    const matchesSearch = report.report_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesPeriod && matchesStatus && matchesSearch;
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
          <h1 className="text-3xl font-bold tracking-tight">
            Profit & Loss Reports
          </h1>
          <p className="text-muted-foreground">
            Generate and analyze profit & loss statements
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
                <DialogTitle>Generate Profit & Loss Report</DialogTitle>
                <DialogDescription>
                  Create a new profit & loss statement for the specified period
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="report_name">Report Name</Label>
                  <Input
                    id="report_name"
                    placeholder="e.g., Q1 2024 Profit & Loss"
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
                  <Label htmlFor="period_start">Period Start</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={newReport.period_start}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        period_start: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_end">Period End</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={newReport.period_end}
                    onChange={(e) =>
                      setNewReport({ ...newReport, period_end: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_type">Period Type</Label>
                  <Select
                    value={newReport.period_type}
                    onValueChange={(value) =>
                      setNewReport({ ...newReport, period_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
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
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_reports}</div>
            <p className="text-xs text-muted-foreground">
              {summary.finalized_reports} finalized, {summary.draft_reports}{" "}
              drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per reporting period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Net Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_net_income)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average profitability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(
                (summary.avg_net_income / summary.avg_revenue) * 100
              )}
            </div>
            <p className="text-xs text-muted-foreground">Average margin</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analysis">Financial Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
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
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="FINALIZED">Finalized</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Reports</CardTitle>
              <CardDescription>
                View and manage all profit & loss statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Net Income</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated</TableHead>
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
                        {new Date(report.period_start).toLocaleDateString()} -{" "}
                        {new Date(report.period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.period_type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(report.total_revenue)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(report.net_income)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(
                          (report.net_income / report.total_revenue) * 100
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(report.generated_at).toLocaleDateString()}
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

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Breakdown of revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPLData.revenue.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage}% of total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Expenses</CardTitle>
                <CardDescription>Operating expense breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPLData.operating_expenses.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage}% of total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>
                Revenue and profitability trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Trend Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Visual trend analysis will be displayed here
                </p>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Trends
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function ProfitLossPage() {
  return (
    <RoleBasedAccess allowedRoles={["admin", "finance", "supervisor"]}>
      <DashboardPageLayout>
        <ProfitLossContent />
      </DashboardPageLayout>
    </RoleBasedAccess>
  );
}
