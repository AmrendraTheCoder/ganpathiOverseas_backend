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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Building2,
  Banknote,
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
const mockCashFlowReports = [
  {
    id: "1",
    report_name: "Cash Flow - Q1 2024",
    period_start: "2024-01-01",
    period_end: "2024-03-31",
    period_type: "QUARTERLY",
    net_cash_from_operations: 450000,
    net_cash_from_investing: -200000,
    net_cash_from_financing: -100000,
    net_change_in_cash: 150000,
    beginning_cash_balance: 300000,
    ending_cash_balance: 450000,
    status: "FINALIZED",
    generated_at: "2024-04-01T10:00:00Z",
    generated_by: "Finance Team",
  },
  {
    id: "2",
    report_name: "Cash Flow - March 2024",
    period_start: "2024-03-01",
    period_end: "2024-03-31",
    period_type: "MONTHLY",
    net_cash_from_operations: 180000,
    net_cash_from_investing: -50000,
    net_cash_from_financing: -20000,
    net_change_in_cash: 110000,
    beginning_cash_balance: 340000,
    ending_cash_balance: 450000,
    status: "DRAFT",
    generated_at: "2024-03-31T15:30:00Z",
    generated_by: "Finance Team",
  },
];

const mockSummary = {
  total_reports: 10,
  avg_operating_cash: 420000,
  avg_investing_cash: -180000,
  avg_financing_cash: -90000,
  avg_net_change: 150000,
  positive_cash_flow: 8,
  negative_cash_flow: 2,
  draft_reports: 2,
  finalized_reports: 8,
  by_period: {
    monthly: 6,
    quarterly: 3,
    yearly: 1,
  },
};

const mockCashFlowData = {
  operating_activities: [
    { category: "Net Income", amount: 350000, percentage: 77.8 },
    { category: "Depreciation", amount: 80000, percentage: 17.8 },
    { category: "Working Capital Changes", amount: 20000, percentage: 4.4 },
  ],
  investing_activities: [
    { category: "Equipment Purchase", amount: -180000, percentage: 90 },
    { category: "Asset Sales", amount: -20000, percentage: 10 },
  ],
  financing_activities: [
    { category: "Loan Repayment", amount: -80000, percentage: 80 },
    { category: "Dividend Payment", amount: -20000, percentage: 20 },
  ],
};

const CashFlowContent = () => {
  const [reports, setReports] = useState(mockCashFlowReports);
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

      const response = await fetch(`/api/finance/reports/cash-flow?${params}`);

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setSummary(data.summary);
      } else {
        console.log("Using mock data for cash flow reports");
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

      const response = await fetch("/api/finance/reports/cash-flow", {
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
          description: "Cash flow report has been generated successfully.",
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

  const getCashFlowIcon = (amount: number) => {
    return amount >= 0 ? (
      <ArrowUpCircle className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownCircle className="h-4 w-4 text-red-600" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
            Cash Flow Reports
          </h1>
          <p className="text-muted-foreground">
            Track cash inflows and outflows across business activities
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
                <DialogTitle>Generate Cash Flow Report</DialogTitle>
                <DialogDescription>
                  Create a new cash flow statement for the specified period
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="report_name">Report Name</Label>
                  <Input
                    id="report_name"
                    placeholder="e.g., Cash Flow - Q1 2024"
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
            <CardTitle className="text-sm font-medium">
              Operating Cash Flow
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_operating_cash)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average from operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Investing Cash Flow
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_investing_cash)}
            </div>
            <p className="text-xs text-muted-foreground">
              Investment activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Financing Cash Flow
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_financing_cash)}
            </div>
            <p className="text-xs text-muted-foreground">
              Financing activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Cash Change
            </CardTitle>
            {summary.avg_net_change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_net_change)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.positive_cash_flow} positive,{" "}
              {summary.negative_cash_flow} negative
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analysis">Cash Flow Analysis</TabsTrigger>
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
              <CardTitle>Cash Flow Reports</CardTitle>
              <CardDescription>
                View and manage all cash flow statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Operating</TableHead>
                    <TableHead className="text-right">Investing</TableHead>
                    <TableHead className="text-right">Financing</TableHead>
                    <TableHead className="text-right">Net Change</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {getCashFlowIcon(report.net_cash_from_operations)}
                          <span className="font-semibold">
                            {formatCurrency(
                              Math.abs(report.net_cash_from_operations)
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {getCashFlowIcon(report.net_cash_from_investing)}
                          <span className="font-semibold">
                            {formatCurrency(
                              Math.abs(report.net_cash_from_investing)
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {getCashFlowIcon(report.net_cash_from_financing)}
                          <span className="font-semibold">
                            {formatCurrency(
                              Math.abs(report.net_cash_from_financing)
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {getCashFlowIcon(report.net_change_in_cash)}
                          <span
                            className={`font-bold ${report.net_change_in_cash >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(
                              Math.abs(report.net_change_in_cash)
                            )}
                          </span>
                        </div>
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

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Operating Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Activities</CardTitle>
                <CardDescription>
                  Cash from core business operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCashFlowData.operating_activities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage}% of operating cash
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

            {/* Investing Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Investing Activities</CardTitle>
                <CardDescription>Cash from asset investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCashFlowData.investing_activities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage}% of investing cash
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financing Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Financing Activities</CardTitle>
                <CardDescription>Cash from financing sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCashFlowData.financing_activities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage}% of financing cash
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
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
              <CardTitle>Cash Flow Trends</CardTitle>
              <CardDescription>
                Historical cash flow patterns and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">
                  Cash Flow Trend Analysis
                </h3>
                <p className="text-muted-foreground mb-4">
                  Visual cash flow trends will be displayed here
                </p>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function CashFlowPage() {
  return (
    <RoleBasedAccess allowedRoles={["admin", "finance", "supervisor"]}>
      <DashboardPageLayout>
        <CashFlowContent />
      </DashboardPageLayout>
    </RoleBasedAccess>
  );
}
