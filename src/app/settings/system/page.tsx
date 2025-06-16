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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Shield,
  Database,
  Mail,
  Bell,
  Globe,
  Palette,
  Monitor,
  HardDrive,
  Wifi,
  Lock,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Save,
  RotateCcw,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

function SystemSettingsPageContent() {
  const [systemSettings, setSystemSettings] = useState({
    companyName: "Ganpathi Overseas",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    maintenanceMode: false,
    debugMode: false,
    apiLogging: true,
    sessionTimeout: 30,
    maxFileSize: 10,
    allowRegistration: false,
    requireEmailVerification: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    twoFactorAuth: false,
    sessionExpiry: 24,
    ipWhitelist: "",
    maxLoginAttempts: 5,
    lockoutDuration: 15,
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackupEnabled: true,
    backupFrequency: "daily",
    retentionPeriod: 30,
    backupLocation: "cloud",
    lastBackup: "2024-01-15 02:00:00",
    backupSize: "2.4 GB",
  });

  const systemInfo = {
    version: "2.1.0",
    buildNumber: "20240115",
    serverTime: new Date().toLocaleString(),
    uptime: "15 days, 6 hours",
    cpuUsage: 23,
    memoryUsage: 67,
    diskUsage: 45,
    database: "PostgreSQL 15.2",
    nodeVersion: "18.19.0",
    environment: "production",
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    if (category === "system") {
      setSystemSettings((prev) => ({ ...prev, [key]: value }));
    } else if (category === "security") {
      setSecuritySettings((prev) => ({ ...prev, [key]: value }));
    } else if (category === "backup") {
      setBackupSettings((prev) => ({ ...prev, [key]: value }));
    }
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Disabled</Badge>
    );
  };

  const getHealthStatus = (percentage: number) => {
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Settings
          </h1>
          <p className="text-gray-600">
            Configure system preferences and administrative settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Config
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Status
                </p>
                <p className="text-xl font-bold text-green-600">Online</p>
                <p className="text-xs text-gray-500">
                  Uptime: {systemInfo.uptime}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p
                  className={`text-xl font-bold ${getHealthStatus(systemInfo.cpuUsage)}`}
                >
                  {systemInfo.cpuUsage}%
                </p>
                <p className="text-xs text-gray-500">Average load</p>
              </div>
              <Monitor className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Memory Usage
                </p>
                <p
                  className={`text-xl font-bold ${getHealthStatus(systemInfo.memoryUsage)}`}
                >
                  {systemInfo.memoryUsage}%
                </p>
                <p className="text-xs text-gray-500">RAM utilization</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                <p
                  className={`text-xl font-bold ${getHealthStatus(systemInfo.diskUsage)}`}
                >
                  {systemInfo.diskUsage}%
                </p>
                <p className="text-xs text-gray-500">Storage used</p>
              </div>
              <HardDrive className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Basic company and system configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={systemSettings.companyName}
                    onChange={(e) =>
                      handleSettingChange(
                        "system",
                        "companyName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={systemSettings.timezone}
                    onValueChange={(value) =>
                      handleSettingChange("system", "timezone", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">
                        Asia/Kolkata (IST)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York (EST)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London (GMT)
                      </SelectItem>
                      <SelectItem value="Asia/Tokyo">
                        Asia/Tokyo (JST)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={systemSettings.currency}
                    onValueChange={(value) =>
                      handleSettingChange("system", "currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Default Language</Label>
                  <Select
                    value={systemSettings.language}
                    onValueChange={(value) =>
                      handleSettingChange("system", "language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                      <SelectItem value="gu">Gujarati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Date format and system behavior settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={systemSettings.dateFormat}
                    onValueChange={(value) =>
                      handleSettingChange("system", "dateFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) =>
                      handleSettingChange(
                        "system",
                        "sessionTimeout",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxFileSize">Max File Upload Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) =>
                      handleSettingChange(
                        "system",
                        "maxFileSize",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowRegistration">
                      Allow User Registration
                    </Label>
                    <Switch
                      id="allowRegistration"
                      checked={systemSettings.allowRegistration}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "system",
                          "allowRegistration",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireEmailVerification">
                      Require Email Verification
                    </Label>
                    <Switch
                      id="requireEmailVerification"
                      checked={systemSettings.requireEmailVerification}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "system",
                          "requireEmailVerification",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>
                  Configure password requirements and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="passwordMinLength">
                    Minimum Password Length
                  </Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "passwordMinLength",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passwordRequireSpecial">
                      Require Special Characters
                    </Label>
                    <Switch
                      id="passwordRequireSpecial"
                      checked={securitySettings.passwordRequireSpecial}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "security",
                          "passwordRequireSpecial",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passwordRequireNumbers">
                      Require Numbers
                    </Label>
                    <Switch
                      id="passwordRequireNumbers"
                      checked={securitySettings.passwordRequireNumbers}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "security",
                          "passwordRequireNumbers",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passwordRequireUppercase">
                      Require Uppercase Letters
                    </Label>
                    <Switch
                      id="passwordRequireUppercase"
                      checked={securitySettings.passwordRequireUppercase}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "security",
                          "passwordRequireUppercase",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="twoFactorAuth">
                      Enable Two-Factor Authentication
                    </Label>
                    <Switch
                      id="twoFactorAuth"
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "security",
                          "twoFactorAuth",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>
                  Manage login security and access restrictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sessionExpiry">Session Expiry (hours)</Label>
                  <Input
                    id="sessionExpiry"
                    type="number"
                    value={securitySettings.sessionExpiry}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "sessionExpiry",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "maxLoginAttempts",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lockoutDuration">
                    Lockout Duration (minutes)
                  </Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "lockoutDuration",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="ipWhitelist">
                    IP Whitelist (one per line)
                  </Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "ipWhitelist",
                        e.target.value
                      )
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how the system sends notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Send notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "system",
                          "emailNotifications",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Send notifications via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={systemSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "system",
                          "smsNotifications",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  SMTP settings for outgoing emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input id="smtpHost" placeholder="smtp.gmail.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" placeholder="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtpSecurity">Security</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="smtpUsername">Username</Label>
                  <Input
                    id="smtpUsername"
                    placeholder="your-email@domain.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Backup Configuration</CardTitle>
                <CardDescription>
                  Automated backup settings and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackupEnabled">
                      Enable Automatic Backups
                    </Label>
                    <p className="text-sm text-gray-500">
                      Schedule regular system backups
                    </p>
                  </div>
                  <Switch
                    id="autoBackupEnabled"
                    checked={backupSettings.autoBackupEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "backup",
                        "autoBackupEnabled",
                        checked
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={backupSettings.backupFrequency}
                    onValueChange={(value) =>
                      handleSettingChange("backup", "backupFrequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retentionPeriod">
                    Retention Period (days)
                  </Label>
                  <Input
                    id="retentionPeriod"
                    type="number"
                    value={backupSettings.retentionPeriod}
                    onChange={(e) =>
                      handleSettingChange(
                        "backup",
                        "retentionPeriod",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="backupLocation">Backup Location</Label>
                  <Select
                    value={backupSettings.backupLocation}
                    onValueChange={(value) =>
                      handleSettingChange("backup", "backupLocation", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="cloud">Cloud Storage</SelectItem>
                      <SelectItem value="both">Local + Cloud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup Status</CardTitle>
                <CardDescription>
                  Current backup information and controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Backup:</span>
                    <span className="text-sm font-medium">
                      {backupSettings.lastBackup}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Backup Size:</span>
                    <span className="text-sm font-medium">
                      {backupSettings.backupSize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      Healthy
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Create Backup Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Restore from Backup
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verify Backup Integrity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Current system version and environment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Application Version:
                  </span>
                  <span className="text-sm font-medium">
                    {systemInfo.version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Build Number:</span>
                  <span className="text-sm font-medium">
                    {systemInfo.buildNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Environment:</span>
                  <Badge className="bg-green-100 text-green-800 capitalize">
                    {systemInfo.environment}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Server Time:</span>
                  <span className="text-sm font-medium">
                    {systemInfo.serverTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">System Uptime:</span>
                  <span className="text-sm font-medium">
                    {systemInfo.uptime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Database:</span>
                  <span className="text-sm font-medium">
                    {systemInfo.database}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Node.js Version:
                  </span>
                  <span className="text-sm font-medium">
                    {systemInfo.nodeVersion}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span
                      className={`text-sm font-medium ${getHealthStatus(systemInfo.cpuUsage)}`}
                    >
                      {systemInfo.cpuUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${systemInfo.cpuUsage < 50 ? "bg-green-600" : systemInfo.cpuUsage < 80 ? "bg-yellow-600" : "bg-red-600"}`}
                      style={{ width: `${systemInfo.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span
                      className={`text-sm font-medium ${getHealthStatus(systemInfo.memoryUsage)}`}
                    >
                      {systemInfo.memoryUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${systemInfo.memoryUsage < 50 ? "bg-green-600" : systemInfo.memoryUsage < 80 ? "bg-yellow-600" : "bg-red-600"}`}
                      style={{ width: `${systemInfo.memoryUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span
                      className={`text-sm font-medium ${getHealthStatus(systemInfo.diskUsage)}`}
                    >
                      {systemInfo.diskUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${systemInfo.diskUsage < 50 ? "bg-green-600" : systemInfo.diskUsage < 80 ? "bg-yellow-600" : "bg-red-600"}`}
                      style={{ width: `${systemInfo.diskUsage}%` }}
                    ></div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>
                  Advanced system controls and maintenance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">
                        Restrict system access for maintenance
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "system",
                          "maintenanceMode",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="debugMode">Debug Mode</Label>
                      <p className="text-sm text-gray-500">
                        Enable detailed logging for troubleshooting
                      </p>
                    </div>
                    <Switch
                      id="debugMode"
                      checked={systemSettings.debugMode}
                      onCheckedChange={(checked) =>
                        handleSettingChange("system", "debugMode", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="apiLogging">API Request Logging</Label>
                      <p className="text-sm text-gray-500">
                        Log all API requests and responses
                      </p>
                    </div>
                    <Switch
                      id="apiLogging"
                      checked={systemSettings.apiLogging}
                      onCheckedChange={(checked) =>
                        handleSettingChange("system", "apiLogging", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>
                  Critical system operations and utilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Optimize Database
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear System Cache
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export System Logs
                </Button>
                <Button variant="outline" className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  Generate Health Report
                </Button>
                <div className="border-t pt-3">
                  <Button
                    variant="outline"
                    className="w-full text-orange-600 hover:text-orange-700"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Restart System
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 mt-2"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Factory Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SystemSettingsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin"]}>
        <SystemSettingsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
