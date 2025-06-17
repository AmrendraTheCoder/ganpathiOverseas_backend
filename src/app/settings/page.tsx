"use client";

import React, { useState } from "react";
import {
  Save,
  Settings,
  User,
  Shield,
  Database,
  Bell,
  Printer,
  Mail,
  Smartphone,
  Globe,
  Lock,
  Key,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

const SettingsPageContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "Ganpathi Overseas",
    companyEmail: "info@ganpathioverseas.com",
    companyPhone: "+91 98765 43210",
    companyAddress: "123 Industrial Area, Mumbai, Maharashtra 400001",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    jobStatusUpdates: true,
    paymentReminders: true,
    maintenanceAlerts: true,

    // Security Settings
    sessionTimeout: 30,
    passwordExpiry: 90,
    twoFactorAuth: false,
    loginAttempts: 5,

    // System Settings
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: 365,
    maintenanceMode: false,

    // Printing Settings
    defaultPrinter: "HP LaserJet Pro",
    paperSize: "A4",
    invoiceTemplate: "standard",
    reportFormat: "pdf",

    // UI Settings
    theme: "light",
    sidebarCollapsed: false,
    dashboardRefresh: 30,
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Here you would typically save to the backend
    console.log("Saving settings:", settings);
    // Show success message
  };

  const SettingsTab = ({
    id,
    title,
    icon: Icon,
    isActive,
    onClick,
  }: {
    id: string;
    title: string;
    icon: any;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700 font-medium"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{title}</span>
    </button>
  );

  const SettingItem = ({
    label,
    description,
    children,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences and business settings
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Settings Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SettingsTab
              id="general"
              title="General"
              icon={Settings}
              isActive={activeTab === "general"}
              onClick={() => setActiveTab("general")}
            />
            <SettingsTab
              id="notifications"
              title="Notifications"
              icon={Bell}
              isActive={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
            />
            <SettingsTab
              id="security"
              title="Security"
              icon={Shield}
              isActive={activeTab === "security"}
              onClick={() => setActiveTab("security")}
            />
            <SettingsTab
              id="system"
              title="System"
              icon={Database}
              isActive={activeTab === "system"}
              onClick={() => setActiveTab("system")}
            />
            <SettingsTab
              id="printing"
              title="Printing"
              icon={Printer}
              isActive={activeTab === "printing"}
              onClick={() => setActiveTab("printing")}
            />
            <SettingsTab
              id="appearance"
              title="Appearance"
              icon={Monitor}
              isActive={activeTab === "appearance"}
              onClick={() => setActiveTab("appearance")}
            />
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic company and system configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) =>
                        handleSettingChange("companyName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) =>
                        handleSettingChange("companyEmail", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      value={settings.companyPhone}
                      onChange={(e) =>
                        handleSettingChange("companyPhone", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) =>
                        handleSettingChange("timezone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">
                          Asia/Kolkata (IST)
                        </SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York (EST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={settings.companyAddress}
                    onChange={(e) =>
                      handleSettingChange("companyAddress", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) =>
                        handleSettingChange("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) =>
                        handleSettingChange("language", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  label="Email Notifications"
                  description="Receive notifications via email"
                >
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailNotifications", checked)
                    }
                  />
                </SettingItem>

                <SettingItem
                  label="SMS Notifications"
                  description="Receive notifications via SMS"
                >
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("smsNotifications", checked)
                    }
                  />
                </SettingItem>

                <SettingItem
                  label="Push Notifications"
                  description="Browser push notifications"
                >
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("pushNotifications", checked)
                    }
                  />
                </SettingItem>

                <Separator />

                <SettingItem
                  label="Job Status Updates"
                  description="Notifications for job progress changes"
                >
                  <Switch
                    checked={settings.jobStatusUpdates}
                    onCheckedChange={(checked) =>
                      handleSettingChange("jobStatusUpdates", checked)
                    }
                  />
                </SettingItem>

                <SettingItem
                  label="Payment Reminders"
                  description="Automatic payment reminder notifications"
                >
                  <Switch
                    checked={settings.paymentReminders}
                    onCheckedChange={(checked) =>
                      handleSettingChange("paymentReminders", checked)
                    }
                  />
                </SettingItem>

                <SettingItem
                  label="Maintenance Alerts"
                  description="Machine maintenance notifications"
                >
                  <Switch
                    checked={settings.maintenanceAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("maintenanceAlerts", checked)
                    }
                  />
                </SettingItem>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure authentication and access control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  label="Session Timeout"
                  description="Automatically log out after inactivity (minutes)"
                >
                  <Select
                    value={settings.sessionTimeout.toString()}
                    onValueChange={(value) =>
                      handleSettingChange("sessionTimeout", parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Password Expiry"
                  description="Force password change after specified days"
                >
                  <Select
                    value={settings.passwordExpiry.toString()}
                    onValueChange={(value) =>
                      handleSettingChange("passwordExpiry", parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Two-Factor Authentication"
                  description="Enable 2FA for enhanced security"
                >
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      handleSettingChange("twoFactorAuth", checked)
                    }
                  />
                </SettingItem>

                <SettingItem
                  label="Maximum Login Attempts"
                  description="Lock account after failed attempts"
                >
                  <Select
                    value={settings.loginAttempts.toString()}
                    onValueChange={(value) =>
                      handleSettingChange("loginAttempts", parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Security Recommendations
                      </h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Enable two-factor authentication</li>
                        <li>• Use strong passwords with regular updates</li>
                        <li>• Review user access permissions regularly</li>
                        <li>• Monitor login activities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          {activeTab === "system" && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Database, backup, and maintenance configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  label="Automatic Backup"
                  description="Enable automatic data backups"
                >
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) =>
                      handleSettingChange("autoBackup", checked)
                    }
                  />
                </SettingItem>

                <SettingItem
                  label="Backup Frequency"
                  description="How often to create backups"
                >
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) =>
                      handleSettingChange("backupFrequency", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Data Retention"
                  description="Keep data for specified days"
                >
                  <Select
                    value={settings.dataRetention.toString()}
                    onValueChange={(value) =>
                      handleSettingChange("dataRetention", parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="1095">3 years</SelectItem>
                      <SelectItem value="1825">5 years</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Maintenance Mode"
                  description="Enable maintenance mode for system updates"
                >
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      handleSettingChange("maintenanceMode", checked)
                    }
                  />
                </SettingItem>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Backup Management</h4>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Create Backup
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Restore Backup
                    </Button>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Info className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Last backup: Today at 3:00 AM (Size: 45.2 MB)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Printing Settings */}
          {activeTab === "printing" && (
            <Card>
              <CardHeader>
                <CardTitle>Printing Settings</CardTitle>
                <CardDescription>
                  Configure default printing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  label="Default Printer"
                  description="Primary printer for invoices and reports"
                >
                  <Select
                    value={settings.defaultPrinter}
                    onValueChange={(value) =>
                      handleSettingChange("defaultPrinter", value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HP LaserJet Pro">
                        HP LaserJet Pro
                      </SelectItem>
                      <SelectItem value="Canon PIXMA">Canon PIXMA</SelectItem>
                      <SelectItem value="Epson EcoTank">
                        Epson EcoTank
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Paper Size"
                  description="Default paper size for documents"
                >
                  <Select
                    value={settings.paperSize}
                    onValueChange={(value) =>
                      handleSettingChange("paperSize", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Invoice Template"
                  description="Default template for invoices"
                >
                  <Select
                    value={settings.invoiceTemplate}
                    onValueChange={(value) =>
                      handleSettingChange("invoiceTemplate", value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard Template
                      </SelectItem>
                      <SelectItem value="detailed">
                        Detailed Template
                      </SelectItem>
                      <SelectItem value="minimal">Minimal Template</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Report Format"
                  description="Default format for generated reports"
                >
                  <Select
                    value={settings.reportFormat}
                    onValueChange={(value) =>
                      handleSettingChange("reportFormat", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the user interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  label="Theme"
                  description="Choose between light and dark themes"
                >
                  <Select
                    value={settings.theme}
                    onValueChange={(value) =>
                      handleSettingChange("theme", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="w-4 h-4 mr-2" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="w-4 h-4 mr-2" />
                          Dark
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Collapsed Sidebar"
                  description="Start with sidebar collapsed"
                >
                  <Switch
                    checked={settings.sidebarCollapsed}
                    onCheckedChange={(checked) =>
                      handleSettingChange("sidebarCollapsed", checked)
                    }
                  />
                </SettingItem>

                <SettingItem
                  label="Dashboard Refresh"
                  description="Auto-refresh interval for dashboard (seconds)"
                >
                  <Select
                    value={settings.dashboardRefresh.toString()}
                    onValueChange={(value) =>
                      handleSettingChange("dashboardRefresh", parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Date Format"
                  description="Default date display format"
                >
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) =>
                      handleSettingChange("dateFormat", value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  label="Time Format"
                  description="12-hour or 24-hour time format"
                >
                  <Select
                    value={settings.timeFormat}
                    onValueChange={(value) =>
                      handleSettingChange("timeFormat", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin"]}>
        <SettingsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
};

export default SettingsPage;
