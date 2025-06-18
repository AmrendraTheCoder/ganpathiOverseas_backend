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
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import {
  PlusCircle,
  Search,
  Play,
  Clock,
  Globe,
  Lock,
  Code,
  Database,
  BarChart3,
  PieChart,
  Table as TableIcon,
  Calendar,
  Download,
  Eye,
  Edit,
  FileText,
  Copy,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

// Mock data for demonstration
const mockCustomReports = [
  {
    id: "1",
    report_name: "Monthly Revenue Analysis",
    report_type: "REVENUE_ANALYSIS",
    description: "Detailed monthly revenue breakdown by service type",
    report_template: "CHART",
    is_public: false,
    is_scheduled: true,
    schedule_frequency: "MONTHLY",
    last_generated_at: "2024-03-31T10:00:00Z",
    created_by: "Finance Team",
    created_at: "2024-01-15T10:00:00Z",
    status: "ACTIVE",
    custom_report_results: [
      {
        generated_at: "2024-03-31T10:00:00Z",
        row_count: 150,
        execution_time_ms: 250,
      },
    ],
  },
  {
    id: "2",
    report_name: "Customer Payment Trends",
    report_type: "PAYMENT_ANALYSIS",
    description:
      "Analysis of customer payment patterns and collection efficiency",
    report_template: "TABLE",
    is_public: true,
    is_scheduled: false,
    schedule_frequency: null,
    last_generated_at: "2024-03-25T15:30:00Z",
    created_by: "Admin User",
    created_at: "2024-02-10T15:30:00Z",
    status: "ACTIVE",
    custom_report_results: [
      {
        generated_at: "2024-03-25T15:30:00Z",
        row_count: 89,
        execution_time_ms: 180,
      },
    ],
  },
];

const mockSummary = {
  total_reports: 12,
  my_reports: 8,
  public_reports: 4,
  scheduled_reports: 5,
  active_reports: 11,
  by_type: {
    REVENUE_ANALYSIS: 4,
    PAYMENT_ANALYSIS: 3,
    EXPENSE_ANALYSIS: 2,
    CUSTOM_QUERY: 3,
  },
};

const mockTemplates = [
  {
    id: "revenue_monthly",
    name: "Monthly Revenue Report",
    type: "REVENUE_ANALYSIS",
    template: "CHART",
  },
  {
    id: "expense_breakdown",
    name: "Expense Breakdown",
    type: "EXPENSE_ANALYSIS",
    template: "PIE_CHART",
  },
  {
    id: "customer_analysis",
    name: "Customer Analysis",
    type: "CUSTOMER_ANALYSIS",
    template: "TABLE",
  },
  {
    id: "financial_overview",
    name: "Financial Overview",
    type: "FINANCIAL_OVERVIEW",
    template: "DASHBOARD",
  },
];

const CustomReportsContent = () => {
  const [reports, setReports] = useState(mockCustomReports);
  const [summary, setSummary] = useState(mockSummary);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showMyReports, setShowMyReports] = useState(false);
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
    report_type: "CUSTOM_QUERY",
    description: "",
    sql_query: "",
    parameters: {},
    report_template: "TABLE",
    period_start: "",
    period_end: "",
    filters: {},
    is_public: false,
    is_scheduled: false,
    schedule_frequency: "",
    execute_now: false,
  });

  useEffect(() => {
    checkDatabaseConnection();
    fetchReports();
  }, [selectedType, selectedStatus, showMyReports]);

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
        ...(showMyReports && { created_by: "current_user" }),
      });

      const response = await fetch(`/api/finance/reports/custom?${params}`);

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setSummary(data.summary);
      } else {
        console.log("Using mock data for custom reports");
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

      const response = await fetch("/api/finance/reports/custom", {
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
          report_type: "CUSTOM_QUERY",
          description: "",
          sql_query: "",
          parameters: {},
          report_template: "TABLE",
          period_start: "",
          period_end: "",
          filters: {},
          is_public: false,
          is_scheduled: false,
          schedule_frequency: "",
          execute_now: false,
        });

        toast({
          title: "Report Created",
          description: newReport.execute_now
            ? "Custom report created and executed successfully."
            : "Custom report created successfully.",
        });

        if (data.result) {
          // Show execution results if available
          console.log("Report results:", data.result);
        }
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

  const handleExecuteReport = async (reportId: string) => {
    try {
      setLoading(true);

      const response = await fetch("/api/finance/reports/custom", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: reportId, execute: true }),
      });

      if (response.ok) {
        const data = await response.json();

        toast({
          title: "Report Executed",
          description: `Report generated successfully with ${data.result?.length || 0} rows in ${data.execution_time || 0}ms.`,
        });

        // Update the report's last generated time
        setReports(
          reports.map((r) =>
            r.id === reportId
              ? { ...r, last_generated_at: new Date().toISOString() }
              : r
          )
        );
      } else {
        throw new Error("Failed to execute report");
      }
    } catch (error) {
      console.error("Error executing report:", error);
      toast({
        title: "Error",
        description: "Failed to execute report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "ARCHIVED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case "TABLE":
        return <TableIcon className="h-4 w-4" />;
      case "CHART":
        return <BarChart3 className="h-4 w-4" />;
      case "PIE_CHART":
        return <PieChart className="h-4 w-4" />;
      case "DASHBOARD":
        return <Database className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesType =
      selectedType === "all" || report.report_type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;
    const matchesSearch =
      report.report_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
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
          <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-muted-foreground">
            Create and manage custom financial reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Report</DialogTitle>
                <DialogDescription>
                  Build a custom report with SQL queries or predefined templates
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="report_name">Report Name</Label>
                  <Input
                    id="report_name"
                    placeholder="e.g., Monthly Revenue Analysis"
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
                      <SelectItem value="REVENUE_ANALYSIS">
                        Revenue Analysis
                      </SelectItem>
                      <SelectItem value="EXPENSE_ANALYSIS">
                        Expense Analysis
                      </SelectItem>
                      <SelectItem value="PAYMENT_ANALYSIS">
                        Payment Analysis
                      </SelectItem>
                      <SelectItem value="CUSTOMER_ANALYSIS">
                        Customer Analysis
                      </SelectItem>
                      <SelectItem value="FINANCIAL_OVERVIEW">
                        Financial Overview
                      </SelectItem>
                      <SelectItem value="CUSTOM_QUERY">Custom Query</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report_template">Template</Label>
                  <Select
                    value={newReport.report_template}
                    onValueChange={(value) =>
                      setNewReport({ ...newReport, report_template: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TABLE">Table</SelectItem>
                      <SelectItem value="CHART">Chart</SelectItem>
                      <SelectItem value="PIE_CHART">Pie Chart</SelectItem>
                      <SelectItem value="DASHBOARD">Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this report shows..."
                    value={newReport.description}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                {newReport.report_type === "CUSTOM_QUERY" && (
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="sql_query">SQL Query</Label>
                    <Textarea
                      id="sql_query"
                      placeholder="SELECT * FROM financial_transactions WHERE..."
                      className="font-mono text-sm min-h-[120px]"
                      value={newReport.sql_query}
                      onChange={(e) =>
                        setNewReport({
                          ...newReport,
                          sql_query: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Use parameters like {"${start_date}"} and {"${end_date}"}{" "}
                      for dynamic values
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="period_start">Period Start (Optional)</Label>
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
                  <Label htmlFor="period_end">Period End (Optional)</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={newReport.period_end}
                    onChange={(e) =>
                      setNewReport({ ...newReport, period_end: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_public"
                      checked={newReport.is_public}
                      onCheckedChange={(checked) =>
                        setNewReport({ ...newReport, is_public: checked })
                      }
                    />
                    <Label htmlFor="is_public" className="text-sm">
                      Make Public
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_scheduled"
                      checked={newReport.is_scheduled}
                      onCheckedChange={(checked) =>
                        setNewReport({ ...newReport, is_scheduled: checked })
                      }
                    />
                    <Label htmlFor="is_scheduled" className="text-sm">
                      Schedule
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="execute_now"
                      checked={newReport.execute_now}
                      onCheckedChange={(checked) =>
                        setNewReport({ ...newReport, execute_now: checked })
                      }
                    />
                    <Label htmlFor="execute_now" className="text-sm">
                      Execute Now
                    </Label>
                  </div>
                </div>
                {newReport.is_scheduled && (
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="schedule_frequency">
                      Schedule Frequency
                    </Label>
                    <Select
                      value={newReport.schedule_frequency}
                      onValueChange={(value) =>
                        setNewReport({
                          ...newReport,
                          schedule_frequency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateReport} disabled={loading}>
                  {loading ? "Creating..." : "Create Report"}
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
              {summary.active_reports} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Reports</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.my_reports}</div>
            <p className="text-xs text-muted-foreground">Private reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Public Reports
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.public_reports}</div>
            <p className="text-xs text-muted-foreground">Shared with team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.scheduled_reports}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-generated reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="builder">Query Builder</TabsTrigger>
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="REVENUE_ANALYSIS">
                  Revenue Analysis
                </SelectItem>
                <SelectItem value="EXPENSE_ANALYSIS">
                  Expense Analysis
                </SelectItem>
                <SelectItem value="PAYMENT_ANALYSIS">
                  Payment Analysis
                </SelectItem>
                <SelectItem value="CUSTOM_QUERY">Custom Query</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch
                id="show_my_reports"
                checked={showMyReports}
                onCheckedChange={setShowMyReports}
              />
              <Label htmlFor="show_my_reports" className="text-sm">
                My Reports Only
              </Label>
            </div>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>
                View and manage all custom reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.report_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.report_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTemplateIcon(report.report_template)}
                          <span className="text-sm">
                            {report.report_template}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {report.is_public ? (
                            <Globe className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-600" />
                          )}
                          <span className="text-sm">
                            {report.is_public ? "Public" : "Private"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.is_scheduled ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              {report.schedule_frequency}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Manual
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {report.last_generated_at ? (
                          <div>
                            <p className="text-sm">
                              {new Date(
                                report.last_generated_at
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {report.custom_report_results?.[0]?.row_count ||
                                0}{" "}
                              rows,
                              {report.custom_report_results?.[0]
                                ?.execution_time_ms || 0}
                              ms
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Never
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExecuteReport(report.id)}
                            disabled={loading}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Pre-built templates for common financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTemplateIcon(template.template)}
                          <CardTitle className="text-base">
                            {template.name}
                          </CardTitle>
                        </div>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {template.template}
                        </span>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Query Builder</CardTitle>
              <CardDescription>
                Build custom reports using a visual interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Query Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Visual query builder interface will be implemented here
                </p>
                <Button>
                  <Database className="h-4 w-4 mr-2" />
                  Launch Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function CustomReportsPage() {
  return (
    <RoleBasedAccess allowedRoles={["admin", "finance", "supervisor"]}>
      <DashboardPageLayout>
        <CustomReportsContent />
      </DashboardPageLayout>
    </RoleBasedAccess>
  );
}
