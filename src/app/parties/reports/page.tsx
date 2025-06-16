"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { useState } from "react";
import { demoParties, demoJobSheets, demoTransactions } from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

function PartiesReportsPageContent() {
  const [dateRange, setDateRange] = useState("month");
  const [tierFilter, setTierFilter] = useState("all");

  // Calculate party statistics
  const totalParties = demoParties.length;
  const activeParties = demoParties.filter((party) =>
    demoJobSheets.some((job) => job.partyId === party.id)
  ).length;

  const totalCreditLimit = demoParties.reduce(
    (sum, party) => sum + party.creditLimit,
    0
  );
  const totalOutstanding = demoParties.reduce(
    (sum, party) => sum + party.currentBalance,
    0
  );
  const creditUtilization = (totalOutstanding / totalCreditLimit) * 100;

  // Revenue by party
  const partyRevenue = demoParties
    .map((party) => {
      const jobs = demoJobSheets.filter((job) => job.partyId === party.id);
      const revenue = jobs.reduce(
        (sum, job) => sum + (job.sellingPrice || 0),
        0
      );
      const jobCount = jobs.length;
      return { ...party, revenue, jobCount };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Tier distribution
  const tierStats = demoParties.reduce(
    (acc, party) => {
      acc[party.tier] = (acc[party.tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Payment analysis
  const overdueParties = demoParties.filter(
    (party) => party.currentBalance > 0
  ).length;
  const creditRiskParties = demoParties.filter(
    (party) => party.currentBalance > party.creditLimit * 0.8
  ).length;

  const getTierColor = (tier: string) => {
    const colors = {
      premium: "bg-purple-100 text-purple-800",
      standard: "bg-blue-100 text-blue-800",
      basic: "bg-gray-100 text-gray-800",
    };
    return colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into customer relationships and performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-3xl font-bold">{totalParties}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
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
                <p className="text-3xl font-bold">{activeParties}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Credit Utilization
                </p>
                <p className="text-3xl font-bold">
                  {creditUtilization.toFixed(1)}%
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3% from last month
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-3xl font-bold">
                  ₹
                  {(
                    partyRevenue.reduce((sum, p) => sum + p.revenue, 0) /
                    partyRevenue.filter((p) => p.jobCount > 0).length /
                    1000
                  ).toFixed(0)}
                  K
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Customer Tier Distribution
            </CardTitle>
            <CardDescription>Breakdown by customer tier levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tierStats).map(([tier, count]) => {
                const percentage = (count / totalParties) * 100;

                return (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTierColor(tier)}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {count}
                      </span>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Credit Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Credit Risk Analysis
            </CardTitle>
            <CardDescription>
              Payment status and credit monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">High Risk</span>
                </div>
                <span className="text-sm font-medium">{creditRiskParties}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Overdue</span>
                </div>
                <span className="text-sm font-medium">{overdueParties}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Good Standing</span>
                </div>
                <span className="text-sm font-medium">
                  {totalParties - overdueParties}
                </span>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span>Total Outstanding:</span>
                  <span className="font-medium">
                    ₹{(totalOutstanding / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Credit Available:</span>
                  <span className="font-medium">
                    ₹{((totalCreditLimit - totalOutstanding) / 1000).toFixed(0)}
                    K
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Activity</CardTitle>
            <CardDescription>
              Recent customer engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">New Customers (This Month)</span>
                <Badge variant="outline">3</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Repeat Orders</span>
                <span className="text-sm font-medium">
                  {Math.round((activeParties / totalParties) * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Retention</span>
                <span className="text-sm font-medium">85%</span>
              </div>

              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Avg. Customer Lifetime:</span>
                    <span>2.3 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Satisfaction:</span>
                    <span>4.2/5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Customers by Revenue
          </CardTitle>
          <CardDescription>
            Best performing customers this period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partyRevenue.slice(0, 10).map((party, index) => (
              <div
                key={party.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{party.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{party.jobCount} orders</span>
                      <Badge className={getTierColor(party.tier)}>
                        {party.tier}
                      </Badge>
                      <span
                        className={
                          party.currentBalance > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        Balance: ₹{party.currentBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">
                    ₹{(party.revenue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg: ₹
                    {party.jobCount > 0
                      ? (party.revenue / party.jobCount / 1000).toFixed(0)
                      : 0}
                    K
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Distribution</CardTitle>
            <CardDescription>
              Revenue contribution by customer tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tierStats).map(([tier, count]) => {
                const tierRevenue = partyRevenue
                  .filter((p) => p.tier === tier)
                  .reduce((sum, p) => sum + p.revenue, 0);
                const totalRevenue = partyRevenue.reduce(
                  (sum, p) => sum + p.revenue,
                  0
                );
                const percentage =
                  totalRevenue > 0 ? (tierRevenue / totalRevenue) * 100 : 0;

                return (
                  <div key={tier} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge className={getTierColor(tier)}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)} ({count})
                      </Badge>
                      <span className="font-medium">
                        ₹{(tierRevenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-gray-500 text-right">
                      {percentage.toFixed(1)}% of total revenue
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Utilization by Tier</CardTitle>
            <CardDescription>
              Credit usage patterns across customer tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tierStats).map(([tier, count]) => {
                const tierParties = demoParties.filter((p) => p.tier === tier);
                const tierCreditLimit = tierParties.reduce(
                  (sum, p) => sum + p.creditLimit,
                  0
                );
                const tierOutstanding = tierParties.reduce(
                  (sum, p) => sum + p.currentBalance,
                  0
                );
                const utilization =
                  tierCreditLimit > 0
                    ? (tierOutstanding / tierCreditLimit) * 100
                    : 0;

                return (
                  <div key={tier} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge className={getTierColor(tier)}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </Badge>
                      <span className="font-medium">
                        {utilization.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={utilization} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Used: ₹{(tierOutstanding / 1000).toFixed(0)}K</span>
                      <span>
                        Limit: ₹{(tierCreditLimit / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PartiesReportsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor", "finance"]}>
        <PartiesReportsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
