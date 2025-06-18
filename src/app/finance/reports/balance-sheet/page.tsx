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
  Scale,
  Building,
  CreditCard,
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
const mockBalanceSheetReports = [
  {
    id: "1",
    report_name: "Balance Sheet - March 2024",
    as_of_date: "2024-03-31",
    total_current_assets: 1500000,
    total_fixed_assets: 2800000,
    total_assets: 4300000,
    total_current_liabilities: 800000,
    total_long_term_liabilities: 1200000,
    total_liabilities: 2000000,
    total_equity: 2300000,
    total_liabilities_equity: 4300000,
    is_balanced: true,
    status: "FINALIZED",
    generated_at: "2024-04-01T10:00:00Z",
    generated_by: "Finance Team",
  },
  {
    id: "2",
    report_name: "Balance Sheet - February 2024",
    as_of_date: "2024-02-29",
    total_current_assets: 1400000,
    total_fixed_assets: 2900000,
    total_assets: 4300000,
    total_current_liabilities: 750000,
    total_long_term_liabilities: 1250000,
    total_liabilities: 2000000,
    total_equity: 2250000,
    total_liabilities_equity: 4250000,
    is_balanced: false,
    status: "DRAFT",
    generated_at: "2024-03-01T15:30:00Z",
    generated_by: "Finance Team",
  },
];

const mockSummary = {
  total_reports: 8,
  avg_total_assets: 4200000,
  avg_total_liabilities: 1950000,
  balanced_reports: 7,
  unbalanced_reports: 1,
  draft_reports: 2,
  finalized_reports: 6,
};

const mockBalanceSheetData = {
  current_assets: [
    { category: "Cash and Bank", amount: 500000, percentage: 33.3 },
    { category: "Accounts Receivable", amount: 600000, percentage: 40 },
    { category: "Inventory", amount: 300000, percentage: 20 },
    { category: "Prepaid Expenses", amount: 100000, percentage: 6.7 },
  ],
  fixed_assets: [
    { category: "Equipment", amount: 2000000, percentage: 71.4 },
    { category: "Furniture & Fixtures", amount: 500000, percentage: 17.9 },
    {
      category: "Accumulated Depreciation",
      amount: -300000,
      percentage: -10.7,
    },
  ],
  current_liabilities: [
    { category: "Accounts Payable", amount: 400000, percentage: 50 },
    { category: "Short-term Loans", amount: 200000, percentage: 25 },
    { category: "Accrued Expenses", amount: 200000, percentage: 25 },
  ],
  equity: [
    { category: "Owner Equity", amount: 2000000, percentage: 87 },
    { category: "Retained Earnings", amount: 300000, percentage: 13 },
  ],
};

const BalanceSheetContent = () => {
  const [reports, setReports] = useState(mockBalanceSheetReports);
  const [summary, setSummary] = useState(mockSummary);
  const [selectedReport, setSelectedReport] = useState(null);
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
    as_of_date: "",
    generate_from_transactions: true,
  });

  useEffect(() => {
    checkDatabaseConnection();
    fetchReports();
  }, [selectedStatus]);

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
        ...(selectedStatus !== "all" && { status: selectedStatus }),
      });

      const response = await fetch(
        `/api/finance/reports/balance-sheet?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setSummary(data.summary);
      } else {
        console.log("Using mock data for balance sheet reports");
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

      const response = await fetch("/api/finance/reports/balance-sheet", {
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
          as_of_date: "",
          generate_from_transactions: true,
        });

        toast({
          title: "Report Created",
          description: "Balance sheet report has been generated successfully.",
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

  const getBalanceIcon = (isBalanced: boolean) => {
    return isBalanced ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
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

  const calculateRatio = (numerator: number, denominator: number) => {
    return denominator !== 0 ? (numerator / denominator).toFixed(2) : "0.00";
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;
    const matchesSearch = report.report_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
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
            Balance Sheet Reports
          </h1>
          <p className="text-muted-foreground">
            Monitor financial position and balance sheet analysis
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
                <DialogTitle>Generate Balance Sheet Report</DialogTitle>
                <DialogDescription>
                  Create a new balance sheet as of a specific date
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="report_name">Report Name</Label>
                  <Input
                    id="report_name"
                    placeholder="e.g., Balance Sheet - March 2024"
                    value={newReport.report_name}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        report_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="as_of_date">As of Date</Label>
                  <Input
                    id="as_of_date"
                    type="date"
                    value={newReport.as_of_date}
                    onChange={(e) =>
                      setNewReport({ ...newReport, as_of_date: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
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
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_total_assets)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average across {summary.total_reports} reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Liabilities
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.avg_total_liabilities)}
            </div>
            <p className="text-xs text-muted-foreground">Average liabilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Debt-to-Equity
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateRatio(
                summary.avg_total_liabilities,
                summary.avg_total_assets - summary.avg_total_liabilities
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Financial leverage ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Balanced Reports
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.balanced_reports}/{summary.total_reports}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.unbalanced_reports} unbalanced reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analysis">Financial Analysis</TabsTrigger>
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
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
              <CardTitle>Balance Sheet Reports</CardTitle>
              <CardDescription>
                View and manage all balance sheet statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>As of Date</TableHead>
                    <TableHead className="text-right">Total Assets</TableHead>
                    <TableHead className="text-right">
                      Total Liabilities
                    </TableHead>
                    <TableHead className="text-right">Total Equity</TableHead>
                    <TableHead>Balanced</TableHead>
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
                        {new Date(report.as_of_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(report.total_assets)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(report.total_liabilities)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(report.total_equity)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getBalanceIcon(report.is_balanced)}
                          <span
                            className={
                              report.is_balanced
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {report.is_balanced ? "Balanced" : "Unbalanced"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
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
            {/* Current Assets Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Current Assets</CardTitle>
                <CardDescription>Breakdown of current assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBalanceSheetData.current_assets.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage}% of current assets
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

            {/* Current Liabilities */}
            <Card>
              <CardHeader>
                <CardTitle>Current Liabilities</CardTitle>
                <CardDescription>Current liabilities breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBalanceSheetData.current_liabilities.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{item.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.percentage}% of current liabilities
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Ratio</CardTitle>
                <CardDescription>
                  Current Assets / Current Liabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.88</div>
                <p className="text-sm text-muted-foreground">
                  Strong liquidity position
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Ratio</CardTitle>
                <CardDescription>
                  (Current Assets - Inventory) / Current Liabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.50</div>
                <p className="text-sm text-muted-foreground">
                  Good short-term liquidity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt-to-Assets</CardTitle>
                <CardDescription>
                  Total Liabilities / Total Assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0.47</div>
                <p className="text-sm text-muted-foreground">
                  Moderate leverage
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function BalanceSheetPage() {
  return (
    <RoleBasedAccess allowedRoles={["admin", "finance", "supervisor"]}>
      <DashboardPageLayout>
        <BalanceSheetContent />
      </DashboardPageLayout>
    </RoleBasedAccess>
  );
}
