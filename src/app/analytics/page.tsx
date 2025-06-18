"use client";

import React, { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Clock,
  Target,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Settings,
  CheckCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import { toast } from "@/components/ui/use-toast";

// Mock analytics data
const mockAnalyticsData = {
  overview: {
    totalRevenue: 12450000,
    totalExpenses: 8820000,
    netProfit: 3630000,
    profitMargin: 29.2,
    growthRate: 15.3,
    customerCount: 142,
    avgOrderValue: 87676,
    revenuePerCustomer: 87676
  },
  trends: {
    revenue: [
      { month: "Jan", value: 1800000, previous: 1650000 },
      { month: "Feb", value: 1950000, previous: 1700000 },
      { month: "Mar", value: 2100000, previous: 1850000 },
      { month: "Apr", value: 2050000, previous: 1900000 },
      { month: "May", value: 2200000, previous: 2000000 },
      { month: "Jun", value: 2350000, previous: 2100000 }
    ],
    expenses: [
      { month: "Jan", value: 1350000, previous: 1200000 },
      { month: "Feb", value: 1420000, previous: 1280000 },
      { month: "Mar", value: 1480000, previous: 1320000 },
      { month: "Apr", value: 1520000, previous: 1400000 },
      { month: "May", value: 1580000, previous: 1450000 },
      { month: "Jun", value: 1470000, previous: 1380000 }
    ]
  },
  kpis: [
    { name: "Revenue Growth", value: 15.3, target: 12, unit: "%", trend: "up", status: "good" },
    { name: "Profit Margin", value: 29.2, target: 25, unit: "%", trend: "up", status: "excellent" },
    { name: "Customer Acquisition", value: 18, target: 15, unit: "customers", trend: "up", status: "good" },
    { name: "Cost Efficiency", value: 0.71, target: 0.75, unit: "ratio", trend: "up", status: "good" },
    { name: "Cash Flow Ratio", value: 2.4, target: 2.0, unit: "x", trend: "stable", status: "good" },
    { name: "ROI", value: 34.8, target: 30, unit: "%", trend: "up", status: "excellent" }
  ],
  revenueBreakdown: [
    { source: "Job Sheets", amount: 8500000, percentage: 68.3, growth: 12.5 },
    { source: "Service Contracts", amount: 2800000, percentage: 22.5, growth: 18.2 },
    { source: "Consulting", amount: 950000, percentage: 7.6, growth: 25.8 },
    { source: "Others", amount: 200000, percentage: 1.6, growth: -5.2 }
  ],
  expenseAnalysis: [
    { category: "Raw Materials", amount: 3680000, percentage: 41.7, variance: 2.3 },
    { category: "Labor", amount: 2450000, percentage: 27.8, variance: -1.5 },
    { category: "Utilities", amount: 920000, percentage: 10.4, variance: 5.8 },
    { category: "Equipment", amount: 780000, percentage: 8.8, variance: -3.2 },
    { category: "Other Operating", amount: 990000, percentage: 11.2, variance: 1.8 }
  ],
  forecasting: {
    nextQuarter: {
      predictedRevenue: 7200000,
      confidence: 85,
      factors: ["Seasonal trends", "Historical patterns", "Market conditions"]
    },
    yearEnd: {
      predictedRevenue: 26800000,
      predictedProfit: 8200000,
      confidence: 78
    }
  },
  alerts: [
    { type: "opportunity", message: "Revenue growth accelerating - consider capacity expansion", priority: "medium" },
    { type: "warning", message: "Utility costs increased 5.8% above budget", priority: "high" },
    { type: "info", message: "Q2 profit margin exceeded target by 4.2%", priority: "low" },
    { type: "success", message: "Customer acquisition rate 20% above target", priority: "low" }
  ]
};

function AdvancedAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("quarter");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated successfully.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-50";
      case "good": return "text-blue-600 bg-blue-50";
      case "warning": return "text-yellow-600 bg-yellow-50";
      case "poor": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business intelligence and predictive insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alert Bar */}
      {mockAnalyticsData.alerts.length > 0 && (
        <div className="grid gap-2">
          {mockAnalyticsData.alerts.slice(0, 2).map((alert, index) => (
            <div
              key={index}
              className={`flex items-center p-3 rounded-lg border text-sm ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                alert.type === 'opportunity' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 mr-2" />}
              {alert.type === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
              {alert.type === 'opportunity' && <Zap className="h-4 w-4 mr-2" />}
              {alert.type === 'info' && <Eye className="h-4 w-4 mr-2" />}
              <span className="font-medium">{alert.message}</span>
              <Badge variant="secondary" className="ml-auto">
                {alert.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(mockAnalyticsData.overview.totalRevenue / 10000000).toFixed(1)}Cr
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+{mockAnalyticsData.overview.growthRate}% from last period</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(mockAnalyticsData.overview.netProfit / 10000000).toFixed(1)}Cr
            </div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <span>{mockAnalyticsData.overview.profitMargin}% margin</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalyticsData.overview.customerCount}
            </div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <span>₹{(mockAnalyticsData.overview.revenuePerCustomer / 1000).toFixed(0)}K avg value</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="flex items-center text-xs text-orange-600 mt-1">
              <span>Operational efficiency</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Revenue Trend Analysis
                </CardTitle>
                <CardDescription>Monthly revenue vs previous year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Revenue Trend Chart</p>
                    <p className="text-xs text-gray-400 mt-1">Interactive visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Key metrics comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium">Revenue Growth</p>
                        <p className="text-sm text-muted-foreground">Above target by 3.3%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">15.3%</p>
                      <p className="text-xs text-muted-foreground">Target: 12%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Profit Margin</p>
                        <p className="text-sm text-muted-foreground">Excellent performance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">29.2%</p>
                      <p className="text-xs text-muted-foreground">Target: 25%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium">Customer Growth</p>
                        <p className="text-sm text-muted-foreground">New customers acquired</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">+18</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-orange-600 mr-3" />
                      <div>
                        <p className="font-medium">Efficiency Score</p>
                        <p className="text-sm text-muted-foreground">Operational efficiency</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">94.2%</p>
                      <p className="text-xs text-muted-foreground">Industry avg: 87%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue sources and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.revenueBreakdown.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{source.source}</span>
                        <div className="text-right">
                          <span className="font-bold">₹{(source.amount / 1000000).toFixed(1)}M</span>
                          <span className={`ml-2 text-xs ${source.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {source.growth >= 0 ? '+' : ''}{source.growth}%
                          </span>
                        </div>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{source.percentage}% of total revenue</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Detailed revenue insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Revenue Breakdown Chart</p>
                    <p className="text-xs text-gray-400 mt-1">Visual breakdown coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Analysis</CardTitle>
                <CardDescription>Category-wise expense breakdown and variance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.expenseAnalysis.map((expense, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{expense.category}</span>
                        <div className="text-right">
                          <span className="font-bold">₹{(expense.amount / 1000000).toFixed(1)}M</span>
                          <span className={`ml-2 text-xs ${expense.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {expense.variance >= 0 ? '+' : ''}{expense.variance}%
                          </span>
                        </div>
                      </div>
                      <Progress value={expense.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{expense.percentage}% of total expenses</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Trends</CardTitle>
                <CardDescription>Monthly expense patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Expense Trend Chart</p>
                    <p className="text-xs text-gray-400 mt-1">Monthly comparison coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAnalyticsData.kpis.map((kpi, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{kpi.name}</CardTitle>
                    {getTrendIcon(kpi.trend)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-end space-x-2">
                      <span className="text-2xl font-bold">
                        {kpi.value}{kpi.unit}
                      </span>
                      <Badge className={getStatusColor(kpi.status)}>
                        {kpi.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span>Target: {kpi.target}{kpi.unit}</span>
                      </div>
                      <Progress 
                        value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {((kpi.value / kpi.target) * 100).toFixed(1)}% of target achieved
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Revenue Forecasting
                </CardTitle>
                <CardDescription>Predictive analysis based on historical data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Next Quarter Prediction</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      ₹{(mockAnalyticsData.forecasting.nextQuarter.predictedRevenue / 10000000).toFixed(1)}Cr
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {mockAnalyticsData.forecasting.nextQuarter.confidence}% confidence
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">Year-End Projection</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Revenue:</span>
                        <span className="text-lg font-bold text-green-600 ml-2">
                          ₹{(mockAnalyticsData.forecasting.yearEnd.predictedRevenue / 10000000).toFixed(1)}Cr
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Profit:</span>
                        <span className="text-lg font-bold text-green-600 ml-2">
                          ₹{(mockAnalyticsData.forecasting.yearEnd.predictedProfit / 10000000).toFixed(1)}Cr
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {mockAnalyticsData.forecasting.yearEnd.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Key Factors</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {mockAnalyticsData.forecasting.nextQuarter.factors.map((factor, index) => (
                        <li key={index} className="flex items-center">
                          <Clock className="h-3 w-3 mr-2" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Charts</CardTitle>
                <CardDescription>Visual forecasting models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Predictive Analytics Chart</p>
                    <p className="text-xs text-gray-400 mt-1">ML-powered forecasting coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor", "finance"]}>
        <AdvancedAnalytics />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
