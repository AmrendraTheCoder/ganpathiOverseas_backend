"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Database,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import DatabaseConnectionStatus from "@/components/DatabaseConnectionStatus";

export default function DatabaseSetupPage() {
  const [migrationSQL, setMigrationSQL] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [migrationSql, setMigrationSql] = useState<string>("");
  const [isForceSetupLoading, setIsForceSetupLoading] = useState(false);
  const [verification, setVerification] = useState<any>(null);

  useEffect(() => {
    fetchMigrationSQL();
    fetchVerification();
  }, []);

  const fetchVerification = async () => {
    try {
      const response = await fetch("/api/db-verify");
      const data = await response.json();
      setVerification(data);
    } catch (error) {
      console.error("Failed to fetch verification:", error);
    }
  };

  const fetchMigrationSQL = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get-migration-sql");
      const data = await response.json();

      if (data.success) {
        setMigrationSQL(data.migrationSQL);
      } else {
        toast.error("Failed to load migration SQL");
      }
    } catch (error) {
      toast.error("Error loading migration SQL");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(migrationSQL);
      setCopied(true);
      toast.success("SQL copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Failed to copy SQL");
    }
  };

  const openSupabaseDashboard = () => {
    // This would typically open the user's Supabase dashboard
    window.open("https://supabase.com/dashboard", "_blank");
  };

  const handleForceSetup = async () => {
    setIsForceSetupLoading(true);
    try {
      const response = await fetch("/api/force-db-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Force setup completed! " + result.message);

        // Show results
        toast.info(
          `Created ${result.results.created_tables.length} tables, added ${result.results.added_columns.length} columns`
        );

        // Refresh verification
        setTimeout(fetchVerification, 2000);
      } else {
        toast.error("Force setup failed: " + result.message);

        if (result.results?.errors) {
          console.log("Setup errors:", result.results.errors);
        }
      }
    } catch (error) {
      console.error("Force setup error:", error);
      toast.error("Failed to execute force setup");
    } finally {
      setIsForceSetupLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Database Setup
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete your database setup by running the migration SQL in your
          Supabase Dashboard. This will create all necessary tables for the
          finance and customer management system.
        </p>

        {/* Current Status */}
        <div className="flex justify-center">
          <DatabaseConnectionStatus variant="full" showDetails={true} />
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Current Status:{" "}
          {verification?.status === "ALL_SYSTEMS_GO"
            ? "✅ All systems operational"
            : "❌ Database issues detected"}
        </p>

        {verification?.status !== "ALL_SYSTEMS_GO" && (
          <div className="space-y-6">
            {/* Force Setup Option */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🚀 Quick Fix Option
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Try automated database setup first. This attempts to create
                missing tables and columns programmatically.
              </p>
              <Button
                onClick={handleForceSetup}
                disabled={isForceSetupLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isForceSetupLoading ? "Setting up..." : "🔧 Try Force Setup"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Make sure you have access to your
                Supabase Dashboard before proceeding.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold">Step-by-Step Guide:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Copy the SQL content below</li>
                  <li>Open your Supabase Dashboard</li>
                  <li>
                    Navigate to <strong>SQL Editor</strong>
                  </li>
                  <li>Create a new query</li>
                  <li>Paste the SQL content</li>
                  <li>
                    Click <strong>"Run"</strong> to execute
                  </li>
                  <li>Return here and refresh status</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">What this migration creates:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Chart of Accounts (46 accounts)</li>
                  <li>Financial Transactions table</li>
                  <li>All 5 Finance Report tables</li>
                  <li>Missing job_sheets columns</li>
                  <li>Indexes for performance</li>
                  <li>Sample data for testing</li>
                  <li>RLS policies for security</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={openSupabaseDashboard} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Supabase Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SQL Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Migration SQL</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {migrationSQL.split("\n").length} lines
              </Badge>
              <Button
                onClick={handleCopySQL}
                disabled={loading || !migrationSQL}
                variant="outline"
                size="sm"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy SQL
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Database className="h-8 w-8 animate-pulse mx-auto mb-2 text-blue-500" />
                <p className="text-gray-500">Loading migration SQL...</p>
              </div>
            </div>
          ) : (
            <Textarea
              value={migrationSQL}
              readOnly
              className="font-mono text-sm h-96 resize-none"
              placeholder="Migration SQL will appear here..."
            />
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>After Running the Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Once you've successfully run the migration in Supabase, you can:
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">✅ Finance Features</h4>
                <ul className="text-sm space-y-1">
                  <li>• View Financial Reports</li>
                  <li>• Manage Transactions</li>
                  <li>• Generate Invoices</li>
                  <li>• Track Profit & Loss</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">✅ Enhanced Features</h4>
                <ul className="text-sm space-y-1">
                  <li>• Complete Job Sheets</li>
                  <li>• Customer Management</li>
                  <li>• Real-time Dashboard</li>
                  <li>• Tax Reporting</li>
                </ul>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                The database status indicator will automatically update to show
                "All Systems Go" once the migration is complete.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
