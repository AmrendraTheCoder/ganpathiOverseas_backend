"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Building2,
} from "lucide-react";

interface DashboardStats {
  totalJobSheets: number;
  totalParties: number;
  totalBalance: number;
  totalRevenue: number;
  monthlyRevenue: number;
  sheetsProcessed: number;
  impressions: number;
  pendingJobs: number;
  totalPayments: number;
  totalOrders: number;
  roi: number;
  estimatedCosts: number;
  grossProfit: number;
  transactionVolume: number;
}

interface DashboardStatsProps {
  stats: DashboardStats;
  loading: any;
}

const DashboardStatsComponent = memo(
  ({ stats, loading }: DashboardStatsProps) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const statsCards = [
      {
        title: "Total Job Sheets",
        value: stats.totalJobSheets,
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        change: "+12%",
        isPositive: true,
      },
      {
        title: "Active Parties",
        value: stats.totalParties,
        icon: Users,
        color: "text-green-600",
        bgColor: "bg-green-50",
        change: "+8%",
        isPositive: true,
      },
      {
        title: "Total Balance",
        value: formatCurrency(stats.totalBalance),
        icon: CreditCard,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        change: "+15%",
        isPositive: true,
      },
      {
        title: "Monthly Revenue",
        value: formatCurrency(stats.monthlyRevenue),
        icon: DollarSign,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        change: "+23%",
        isPositive: true,
      },
      {
        title: "Sheets Processed",
        value: stats.sheetsProcessed,
        icon: Activity,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        change: "+5%",
        isPositive: true,
      },
      {
        title: "Total Orders",
        value: stats.totalOrders,
        icon: Target,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        change: "+18%",
        isPositive: true,
      },
      {
        title: "Gross Profit",
        value: formatCurrency(stats.grossProfit),
        icon: TrendingUp,
        color: "text-teal-600",
        bgColor: "bg-teal-50",
        change: "+27%",
        isPositive: true,
      },
      {
        title: "ROI",
        value: `${stats.roi.toFixed(1)}%`,
        icon: Building2,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        change: "+3.2%",
        isPositive: true,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {loading.parties ||
                      loading.transactions ||
                      loading.jobSheets
                        ? "..."
                        : card.value}
                    </div>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          card.isPositive
                            ? "text-green-700 bg-green-100"
                            : "text-red-700 bg-red-100"
                        }`}
                      >
                        {card.isPositive ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {card.change}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
);

DashboardStatsComponent.displayName = "DashboardStats";

export default DashboardStatsComponent;
