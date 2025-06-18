"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface DatabaseStatus {
  overall_status:
    | "ALL_SYSTEMS_GO"
    | "MOSTLY_WORKING"
    | "PARTIAL_SUCCESS"
    | "MAJOR_ISSUES"
    | "checking";
  summary: {
    total_checks: number;
    passed: number;
    failed: number;
  };
  timestamp: string;
}

interface DatabaseConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
  variant?: "full" | "compact" | "badge";
}

export default function DatabaseConnectionStatus({
  showDetails = false,
  className = "",
  variant = "compact",
}: DatabaseConnectionStatusProps) {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDatabaseStatus = async () => {
    try {
      setError(null);
      const response = await fetch("/api/db-verify");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.results) {
        setStatus(data.results);
      } else {
        throw new Error(data.message || "Database verification failed");
      }
    } catch (err: any) {
      console.error("Database status check failed:", err);
      setError(err.message);
      setStatus({
        overall_status: "MAJOR_ISSUES",
        summary: { total_checks: 0, passed: 0, failed: 1 },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkDatabaseStatus();
    toast.success("Database status refreshed");
  };

  const handleExecuteSchemaFix = async () => {
    try {
      setRefreshing(true);
      toast.info("Executing database schema fix...", { duration: 5000 });

      const response = await fetch("/api/db-setup-complete", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Database setup completed successfully!");
        await checkDatabaseStatus(); // Refresh status
      } else {
        toast.error(`Database setup failed: ${data.message}`);
        // Show manual instructions
        toast.info(
          "Manual setup required: Please run the migration file in Supabase Dashboard",
          { duration: 10000 }
        );
      }
    } catch (err: any) {
      toast.error(`Database setup error: ${err.message}`);
      toast.info(
        "Please run supabase/migrations/20241223000002_complete_finance_schema.sql manually",
        { duration: 10000 }
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const getStatusIcon = () => {
    if (loading || refreshing)
      return <Loader2 className="h-4 w-4 animate-spin" />;

    switch (status?.overall_status) {
      case "ALL_SYSTEMS_GO":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "MOSTLY_WORKING":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "PARTIAL_SUCCESS":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "MAJOR_ISSUES":
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status?.overall_status) {
      case "ALL_SYSTEMS_GO":
        return "bg-green-100 text-green-800 border-green-200";
      case "MOSTLY_WORKING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PARTIAL_SUCCESS":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MAJOR_ISSUES":
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusText = () => {
    if (loading) return "Checking...";
    if (error) return "Connection Error";

    switch (status?.overall_status) {
      case "ALL_SYSTEMS_GO":
        return "All Systems Go";
      case "MOSTLY_WORKING":
        return "Mostly Working";
      case "PARTIAL_SUCCESS":
        return "Partial Issues";
      case "MAJOR_ISSUES":
      default:
        return "Major Issues";
    }
  };

  // Badge variant - minimal display
  if (variant === "badge") {
    return (
      <Badge
        variant="outline"
        className={`${getStatusColor()} ${className}`}
        onClick={handleRefresh}
      >
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
    );
  }

  // Compact variant - inline status
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Database className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Database:</span>
        </div>
        <Badge variant="outline" className={getStatusColor()}>
          {getStatusIcon()}
          <span className="ml-1">{getStatusText()}</span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-6 w-6 p-0"
        >
          <RefreshCw
            className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
    );
  }

  // Full variant - detailed card
  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold">Database Status</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="font-medium">{getStatusText()}</div>
              {status && (
                <div className="text-sm text-gray-500">
                  {status.summary.passed}/{status.summary.total_checks} checks
                  passed
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {status && showDetails && (
            <div className="text-xs text-gray-500">
              Last checked: {new Date(status.timestamp).toLocaleTimeString()}
            </div>
          )}

          {status?.overall_status === "MAJOR_ISSUES" && (
            <div className="space-y-2">
              <Button
                onClick={handleExecuteSchemaFix}
                disabled={refreshing}
                className="w-full"
                size="sm"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Try Auto Fix
              </Button>
              <Button
                onClick={() => window.open("/database-setup", "_blank")}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Open Setup Guide
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
 