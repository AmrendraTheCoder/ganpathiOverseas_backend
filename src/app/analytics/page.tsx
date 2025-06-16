"use client";

import { useState } from "react";
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
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

function AnalyticsPageContent() {
  const [timeRange, setTimeRange] = useState("month");
  const [viewType, setViewType] = useState("overview");

  // Sample analytics data
  const revenueData = [
    { month: "Jan", revenue: 450000, expenses: 280000, profit: 170000 },
    { month: "Feb", revenue: 520000, expenses: 310000, profit: 210000 },
    { month: "Mar", revenue: 480000, expenses: 290000, profit: 190000 },
    { month: "Apr", revenue: 610000, expenses: 340000, profit: 270000 },
    { month: "May", revenue: 580000, expenses: 320000, profit: 260000 },
    { month: "Jun", revenue: 650000, expenses: 360000, profit: 290000 },
  ];

  const customerMetrics = {
    totalCustomers: 156,
    newCustomers: 12,
    activeCustomers: 134,
    churnRate: 3.2,
    averageOrderValue: 15600,
    customerLifetimeValue: 125000,
  };

  const productionMetrics = {
    totalJobs: 89,
    completedJobs: 76,
    onTimeDelivery: 91.2,
    machineUtilization: 87.5,
    defectRate: 2.1,
    productionEfficiency: 94.3,
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into business performance and trends
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">
                  ₹
                  {(
                    revenueData[revenueData.length - 1].revenue / 100000
                  ).toFixed(1)}
                  L
                </p>
                <p className="text-xs flex items-center mt-1">
                  {getTrendIcon(15.2)}
                  <span className={`ml-1 ${getTrendColor(15.2)}`}>
                    +15.2% from last month
                  </span>
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
                <p className="text-sm font-medium text-gray-600">
                  Active Customers
                </p>
                <p className="text-3xl font-bold">
                  {customerMetrics.activeCustomers}
                </p>
                <p className="text-xs flex items-center mt-1">
                  {getTrendIcon(8.5)}
                  <span className={`ml-1 ${getTrendColor(8.5)}`}>
                    +8.5% growth
                  </span>
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Jobs Completed
                </p>
                <p className="text-3xl font-bold">
                  {productionMetrics.completedJobs}
                </p>
                <p className="text-xs flex items-center mt-1">
                  {getTrendIcon(12.3)}
                  <span className={`ml-1 ${getTrendColor(12.3)}`}>
                    +12.3% efficiency
                  </span>
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  On-Time Delivery
                </p>
                <p className="text-3xl font-bold">
                  {productionMetrics.onTimeDelivery}%
                </p>
                <p className="text-xs flex items-center mt-1">
                  {getTrendIcon(2.1)}
                  <span className={`ml-1 ${getTrendColor(2.1)}`}>
                    +2.1% improvement
                  </span>
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="production">Production Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Profit Trend</CardTitle>
                <CardDescription>
                  Monthly revenue and profit analysis for the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((data, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {data.month}
                        </span>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-600">
                            ₹{(data.revenue / 1000).toFixed(0)}K
                          </span>
                          <span className="text-blue-600">
                            ₹{(data.profit / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Progress
                          value={(data.revenue / 700000) * 100}
                          className="h-2 flex-1"
                        />
                        <Progress
                          value={(data.profit / 300000) * 100}
                          className="h-2 flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key business performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-600">24.8%</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Goal Achievement</p>
                      <p className="text-2xl font-bold text-blue-600">91.2%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Customer Satisfaction
                        </span>
                        <span className="text-sm font-medium">4.8/5.0</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Machine Utilization
                        </span>
                        <span className="text-sm font-medium">
                          {productionMetrics.machineUtilization}%
                        </span>
                      </div>
                      <Progress
                        value={productionMetrics.machineUtilization}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Order Fulfillment
                        </span>
                        <span className="text-sm font-medium">94.5%</span>
                      </div>
                      <Progress value={94.5} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Order Value
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{(customerMetrics.averageOrderValue / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +18% from last period
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Customer Lifetime Value
                    </p>
                    <p className="text-2xl font-bold">
                      ₹
                      {(customerMetrics.customerLifetimeValue / 1000).toFixed(
                        0
                      )}
                      K
                    </p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +22% increase
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Production Efficiency
                    </p>
                    <p className="text-2xl font-bold">
                      {productionMetrics.productionEfficiency}%
                    </p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +5.2% optimization
                    </p>
                  </div>
                  <Settings className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Revenue distribution by service category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Printing Services</span>
                    <span className="font-medium">₹3.9L (60%)</span>
                  </div>
                  <Progress value={60} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Design & Layout</span>
                    <span className="font-medium">₹1.6L (25%)</span>
                  </div>
                  <Progress value={25} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Binding & Finishing</span>
                    <span className="font-medium">₹0.7L (10%)</span>
                  </div>
                  <Progress value={10} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Additional Services</span>
                    <span className="font-medium">₹0.3L (5%)</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Goals</CardTitle>
                <CardDescription>
                  Progress towards monthly targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Current Month Progress
                    </p>
                    <p className="text-3xl font-bold text-green-600">₹6.5L</p>
                    <p className="text-sm text-gray-600">Target: ₹7.0L</p>
                    <Progress value={92.8} className="h-3 mt-2" />
                    <p className="text-xs text-green-600 mt-1">
                      92.8% of target achieved
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Last Month:</span>
                      <div className="font-medium text-green-600">
                        ₹5.8L (82.8%)
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Best Month:</span>
                      <div className="font-medium">₹6.5L (92.8%)</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Average:</span>
                      <div className="font-medium">₹5.5L (78.5%)</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Remaining:</span>
                      <div className="font-medium text-orange-600">
                        ₹0.5L (7.2%)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>
                  Customer acquisition and retention metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold text-blue-600">
                        {customerMetrics.totalCustomers}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm text-gray-600">New</p>
                      <p className="text-xl font-bold text-green-600">
                        {customerMetrics.newCustomers}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded">
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-xl font-bold text-orange-600">
                        {customerMetrics.activeCustomers}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Customer Retention Rate
                      </span>
                      <span className="text-sm font-medium">96.8%</span>
                    </div>
                    <Progress value={96.8} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Churn Rate</span>
                      <span className="text-sm font-medium text-red-600">
                        {customerMetrics.churnRate}%
                      </span>
                    </div>
                    <Progress
                      value={customerMetrics.churnRate}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
                <CardDescription>
                  Customer distribution by value tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium">Premium Customers</p>
                      <p className="text-sm text-gray-600">₹50K+ orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">18</p>
                      <p className="text-sm text-gray-500">11.5%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium">Regular Customers</p>
                      <p className="text-sm text-gray-600">₹10K-50K orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">87</p>
                      <p className="text-sm text-gray-500">55.8%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <p className="font-medium">Basic Customers</p>
                      <p className="text-sm text-gray-600">Under ₹10K orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">51</p>
                      <p className="text-sm text-gray-500">32.7%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Production Metrics</CardTitle>
                <CardDescription>
                  Key production performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {productionMetrics.totalJobs}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {productionMetrics.completedJobs}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Machine Utilization
                      </span>
                      <span className="text-sm font-medium">
                        {productionMetrics.machineUtilization}%
                      </span>
                    </div>
                    <Progress
                      value={productionMetrics.machineUtilization}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        On-Time Delivery
                      </span>
                      <span className="text-sm font-medium">
                        {productionMetrics.onTimeDelivery}%
                      </span>
                    </div>
                    <Progress
                      value={productionMetrics.onTimeDelivery}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Quality Rate</span>
                      <span className="text-sm font-medium">
                        {(100 - productionMetrics.defectRate).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={100 - productionMetrics.defectRate}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Analysis</CardTitle>
                <CardDescription>
                  Production efficiency and optimization insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Overall Efficiency
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {productionMetrics.productionEfficiency}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Setup Time Optimization</span>
                      <span className="text-sm font-medium text-green-600">
                        +12%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Material Waste Reduction</span>
                      <span className="text-sm font-medium text-green-600">
                        -8%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Energy Consumption</span>
                      <span className="text-sm font-medium text-green-600">
                        -5%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Labor Productivity</span>
                      <span className="text-sm font-medium text-green-600">
                        +18%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Trends & Forecasts</CardTitle>
              <CardDescription>
                Predictive analytics and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Revenue Forecast</p>
                    <p className="text-xl font-bold text-green-600">₹7.8L</p>
                    <p className="text-xs text-gray-500">
                      Next month prediction
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Customer Growth</p>
                    <p className="text-xl font-bold text-blue-600">+15%</p>
                    <p className="text-xs text-gray-500">Projected increase</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Order Volume</p>
                    <p className="text-xl font-bold text-purple-600">+22%</p>
                    <p className="text-xs text-gray-500">Expected growth</p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Seasonal Trends</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <span className="text-sm font-medium">
                          Q1 Performance
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          Above Average
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                        <span className="text-sm font-medium">Q2 Forecast</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          Strong Growth
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span className="text-sm font-medium">Peak Season</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          Q3-Q4
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Market Insights</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded">
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Digital Printing Demand
                          </p>
                          <p className="text-xs text-gray-500">
                            +28% industry growth
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded">
                        <ArrowUpRight className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Eco-Friendly Materials
                          </p>
                          <p className="text-xs text-gray-500">
                            +45% customer preference
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Custom Design Services
                          </p>
                          <p className="text-xs text-gray-500">
                            Emerging opportunity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor", "finance"]}>
        <AnalyticsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
