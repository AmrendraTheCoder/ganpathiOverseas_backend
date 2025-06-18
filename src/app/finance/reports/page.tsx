"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  FileText,
  DollarSign,
  Calculator,
  RefreshCw,
  Filter,
  Eye,
  Building2,
  CreditCard,
  Target,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import DatabaseConnectionStatus from "@/components/DatabaseConnectionStatus";

interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  assets: number;
  liabilities: number;
  equity: number;
  cashFlow: number;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
}

interface ProfitLossData {
  category: string;
  current_period: number;
  previous_period: number;
  variance: number;
  variance_percent: number;
}

interface BalanceSheetData {
  account_type: string;
  account_name: string;
  current_balance: number;
  previous_balance: number;
  change: number;
}

interface CashFlowData {
  category: string;
  inflow: number;
  outflow: number;
  net_flow: number;
}

interface ReportSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  currentRatio: number;
}

function FinancialReportsPageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Report Data
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [profitLossData, setProfitLossData] = useState<ProfitLossData[]>([]);
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData[]>(
    []
  );
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, [dateRange, startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        period: dateRange,
      });

      const response = await fetch(`/api/finance/reports?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        setProfitLossData(data.profitLoss || []);
        setBalanceSheetData(data.balanceSheet || []);
        setCashFlowData(data.cashFlow || []);
        setChartData(data.chartData || []);
      } else {
        console.error("Failed to fetch reports:", data.error);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const now = new Date();

    switch (range) {
      case "week":
        const weekStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
        setStartDate(weekStart.toISOString().split("T")[0]);
        break;
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setStartDate(monthStart.toISOString().split("T")[0]);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        setStartDate(quarterStart.toISOString().split("T")[0]);
        break;
      case "year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        setStartDate(yearStart.toISOString().split("T")[0]);
        break;
    }
    setEndDate(now.toISOString().split("T")[0]);
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString()}`;
  };

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
  }: any) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && (
              <div className="flex items-center gap-2 mt-1">
                {trend?.icon && trend.icon}
                <p className={`text-xs ${trend?.color || "text-gray-500"}`}>
                  {subtitle}
                </p>
              </div>
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
            <p className="text-gray-500">Generating reports...</p>
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
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Financial Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive financial analysis and reporting
          </p>
          <div className="mt-2">
            <DatabaseConnectionStatus variant="compact" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchReports}
            className="bg-white shadow-md"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Quick Select</Label>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Button
              onClick={fetchReports}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            icon={DollarSign}
            color="text-green-600"
            subtitle={`Margin: ${formatPercentage(summary.profitMargin)}`}
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary.totalExpenses)}
            icon={CreditCard}
            color="text-red-600"
            subtitle="Operating costs"
          />
          <StatCard
            title="Net Profit"
            value={formatCurrency(summary.netProfit)}
            icon={TrendingUp}
            color={summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}
            trend={{
              icon:
                summary.netProfit >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                ),
              color: summary.netProfit >= 0 ? "text-green-500" : "text-red-500",
            }}
            subtitle={`${formatPercentage(summary.profitMargin)} margin`}
          />
          <StatCard
            title="Current Ratio"
            value={summary.currentRatio?.toFixed(2) || "0.00"}
            icon={Target}
            color="text-blue-600"
            subtitle="Liquidity measure"
          />
        </div>
      )}

      {/* Financial Reports Tabs */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial Statements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
              <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
              <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Expenses Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Revenue vs Expenses Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Interactive chart will render here</p>
                        <p className="text-sm">Revenue vs Expenses over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expense Breakdown Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Expense Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <PieChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Pie chart will render here</p>
                        <p className="text-sm">Expenses by category</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          Assets
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(summary?.totalAssets || 0)}
                        </p>
                      </div>
                      <Building2 className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">
                          Liabilities
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                          {formatCurrency(summary?.totalLiabilities || 0)}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          Equity
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(summary?.totalEquity || 0)}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profit & Loss Tab */}
            <TabsContent value="profit-loss" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Profit & Loss Statement
                </h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export P&L
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">
                        Current Period
                      </TableHead>
                      <TableHead className="text-right">
                        Previous Period
                      </TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead className="text-right">% Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitLossData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.category}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.current_period)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.previous_period)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${getVarianceColor(item.variance)}`}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {getVarianceIcon(item.variance)}
                            {formatCurrency(item.variance)}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${getVarianceColor(item.variance_percent)}`}
                        >
                          {formatPercentage(item.variance_percent)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {profitLossData.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No P&L Data Available
                  </h3>
                  <p className="text-gray-600">
                    Generate transactions to see profit & loss analysis.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Balance Sheet Tab */}
            <TabsContent value="balance-sheet" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Balance Sheet</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Balance Sheet
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assets */}
                <Card>
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-green-700">Assets</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableBody>
                        {balanceSheetData
                          .filter((item) => item.account_type === "ASSET")
                          .map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {item.account_name}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(item.current_balance)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Liabilities */}
                <Card>
                  <CardHeader className="bg-red-50">
                    <CardTitle className="text-red-700">Liabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableBody>
                        {balanceSheetData
                          .filter((item) => item.account_type === "LIABILITY")
                          .map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {item.account_name}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(item.current_balance)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Equity */}
                <Card>
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-blue-700">Equity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableBody>
                        {balanceSheetData
                          .filter((item) => item.account_type === "EQUITY")
                          .map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {item.account_name}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(item.current_balance)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Balance Verification */}
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h4 className="font-semibold mb-2">
                      Balance Sheet Verification
                    </h4>
                    <div className="flex justify-center items-center gap-4">
                      <span>
                        Assets: {formatCurrency(summary?.totalAssets || 0)}
                      </span>
                      <span>=</span>
                      <span>
                        Liabilities:{" "}
                        {formatCurrency(summary?.totalLiabilities || 0)}
                      </span>
                      <span>+</span>
                      <span>
                        Equity: {formatCurrency(summary?.totalEquity || 0)}
                      </span>
                      {Math.abs(
                        (summary?.totalAssets || 0) -
                          (summary?.totalLiabilities || 0) -
                          (summary?.totalEquity || 0)
                      ) < 1 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cash Flow Tab */}
            <TabsContent value="cash-flow" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Cash Flow Statement</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Cash Flow
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Cash Inflow</TableHead>
                      <TableHead className="text-right">Cash Outflow</TableHead>
                      <TableHead className="text-right">
                        Net Cash Flow
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashFlowData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.category}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          {formatCurrency(item.inflow)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {formatCurrency(item.outflow)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-bold ${
                            item.net_flow >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.net_flow >= 0 ? "+" : "-"}
                          {formatCurrency(item.net_flow)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cash Flow Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Cash Flow Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <LineChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Cash flow chart will render here</p>
                      <p className="text-sm">
                        Operating, Investing, and Financing activities
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {cashFlowData.length === 0 && (
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Cash Flow Data Available
                  </h3>
                  <p className="text-gray-600">
                    Record payments to see cash flow analysis.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button variant="outline" className="justify-start">
              <Eye className="h-4 w-4 mr-2" />
              Print Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FinancialReportsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "finance"]}>
        <FinancialReportsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
