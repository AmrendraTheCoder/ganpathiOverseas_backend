"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface TimeSeriesDataPoint {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueExpenseChartProps {
  data: TimeSeriesDataPoint[];
  period: "week" | "month" | "quarter" | "year";
}

interface ExpenseBreakdownChartProps {
  data: ChartDataPoint[];
}

interface CashFlowChartProps {
  data: TimeSeriesDataPoint[];
}

interface ProfitMarginChartProps {
  data: TimeSeriesDataPoint[];
}

// Revenue vs Expenses Line Chart
export const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({
  data,
  period,
}) => {
  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date);
      switch (period) {
        case "week":
          return date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
          });
        case "month":
          return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });
        case "quarter":
        case "year":
          return date.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          });
        default:
          return date.toLocaleDateString("en-IN");
      }
    }),
    datasets: [
      {
        label: "Revenue",
        data: data.map((item) => item.revenue),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Expenses",
        data: data.map((item) => item.expenses),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Revenue vs Expenses Trend (${period})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

// Expense Breakdown Pie Chart
export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({
  data,
}) => {
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
  ];

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((_, index) => colors[index % colors.length]),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Expense Breakdown by Category",
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// Cash Flow Bar Chart
export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Cash Inflow",
        data: data.map((item) => item.revenue),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
      },
      {
        label: "Cash Outflow",
        data: data.map((item) => -item.expenses),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Cash Flow Analysis",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

// Profit Margin Trend Chart
export const ProfitMarginChart: React.FC<ProfitMarginChartProps> = ({
  data,
}) => {
  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-IN", { month: "short" });
    }),
    datasets: [
      {
        label: "Profit Margin %",
        data: data.map((item) => {
          const margin =
            item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
          return Math.round(margin * 100) / 100;
        }),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(168, 85, 247)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Profit Margin Trend",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            return `Profit Margin: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return `${value}%`;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

// Monthly Performance Doughnut Chart
export const MonthlyPerformanceChart: React.FC<{
  revenue: number;
  expenses: number;
  target: number;
}> = ({ revenue, expenses, target }) => {
  const targetAchievement = target > 0 ? (revenue / target) * 100 : 0;

  const chartData = {
    labels: ["Achieved", "Remaining"],
    datasets: [
      {
        data: [
          Math.min(targetAchievement, 100),
          Math.max(0, 100 - targetAchievement),
        ],
        backgroundColor: [
          targetAchievement >= 100
            ? "#22c55e"
            : targetAchievement >= 75
              ? "#f59e0b"
              : "#ef4444",
          "#e5e7eb",
        ],
        borderColor: "#fff",
        borderWidth: 3,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Target Achievement",
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};
