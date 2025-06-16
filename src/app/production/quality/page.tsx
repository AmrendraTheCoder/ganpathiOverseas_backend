"use client";

import React, { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  FileText,
  Camera,
  Settings,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  demoJobSheets,
  demoMachines,
  demoUsers,
  getUserById,
  getMachineById,
  getPartyById,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

// Generate quality control data
const generateQualityData = () => {
  const qualityInspections = [];
  const defectTypes = [
    "Color Mismatch",
    "Print Quality",
    "Alignment Issue",
    "Material Defect",
    "Size Variance",
    "Finishing Issue",
    "Coating Problem",
    "Binding Error",
  ];

  demoJobSheets.forEach((job, index) => {
    const machine = demoMachines[index % demoMachines.length];
    const inspector =
      demoUsers.find((user) => user.role === "supervisor") || demoUsers[0];
    const party = getPartyById(job.partyId);

    // Generate multiple inspections per job
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const inspectionDate = new Date();
      inspectionDate.setDate(
        inspectionDate.getDate() - Math.floor(Math.random() * 30)
      );

      const passRate = 75 + Math.random() * 20; // 75-95% pass rate
      const totalItems = 100 + Math.floor(Math.random() * 400); // 100-500 items
      const passedItems = Math.floor(totalItems * (passRate / 100));
      const failedItems = totalItems - passedItems;

      const hasDefects = Math.random() > 0.7;
      const defects = hasDefects
        ? [
            {
              type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
              count: Math.floor(Math.random() * 10) + 1,
              severity: ["Low", "Medium", "High"][
                Math.floor(Math.random() * 3)
              ],
            },
          ]
        : [];

      qualityInspections.push({
        id: `qc-${job.id}-${i}`,
        jobId: job.id,
        jobNumber: job.jobNumber,
        jobTitle: job.title,
        partyName: party?.name || "Unknown",
        machineId: machine.id,
        machineName: machine.name,
        inspectorId: inspector.id,
        inspectorName: inspector.name,
        inspectionDate,
        status:
          passRate >= 90 ? "passed" : passRate >= 75 ? "conditional" : "failed",
        totalItems,
        passedItems,
        failedItems,
        passRate: passRate.toFixed(1),
        defects,
        notes: hasDefects
          ? "Quality issues detected requiring attention"
          : "No issues found",
        stage: ["Raw Material", "In Process", "Final Inspection"][
          Math.floor(Math.random() * 3)
        ],
        priority: job.priority,
        batchNumber: `B${String(index + 1).padStart(4, "0")}`,
      });
    }
  });

  return qualityInspections.sort(
    (a, b) => b.inspectionDate.getTime() - a.inspectionDate.getTime()
  );
};

function QualityControlPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("inspections");

  const qualityData = generateQualityData();

  const filteredInspections = qualityData.filter((inspection) => {
    const matchesSearch =
      inspection.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || inspection.status === statusFilter;
    const matchesStage =
      stageFilter === "all" || inspection.stage === stageFilter;

    return matchesSearch && matchesStatus && matchesStage;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: "bg-green-100 text-green-800",
      conditional: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return (
      variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "conditional":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Calculate metrics
  const totalInspections = qualityData.length;
  const passedInspections = qualityData.filter(
    (i) => i.status === "passed"
  ).length;
  const failedInspections = qualityData.filter(
    (i) => i.status === "failed"
  ).length;
  const overallPassRate =
    totalInspections > 0
      ? ((passedInspections / totalInspections) * 100).toFixed(1)
      : "0";

  const totalDefects = qualityData.reduce(
    (sum, inspection) =>
      sum +
      inspection.defects.reduce(
        (defectSum, defect) => defectSum + defect.count,
        0
      ),
    0
  );

  const averagePassRate =
    qualityData.length > 0
      ? (
          qualityData.reduce(
            (sum, inspection) => sum + parseFloat(inspection.passRate),
            0
          ) / qualityData.length
        ).toFixed(1)
      : "0";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Control</h1>
          <p className="text-gray-600">
            Monitor and manage production quality standards and inspections
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Inspection
          </Button>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inspections
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInspections}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallPassRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {passedInspections} of {totalInspections} passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Defects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalDefects}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all inspections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Quality Score
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {averagePassRate}%
            </div>
            <p className="text-xs text-muted-foreground">Quality performance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="defects">Defect Analysis</TabsTrigger>
          <TabsTrigger value="trends">Quality Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inspections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="Raw Material">Raw Material</SelectItem>
                    <SelectItem value="In Process">In Process</SelectItem>
                    <SelectItem value="Final Inspection">
                      Final Inspection
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inspections Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Quality Inspections ({filteredInspections.length})
              </CardTitle>
              <CardDescription>
                Recent quality control inspections and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inspection</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.slice(0, 10).map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {inspection.batchNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Items: {inspection.totalItems}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {inspection.jobNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {inspection.jobTitle.substring(0, 30)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{inspection.partyName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                          {inspection.machineName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{inspection.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(inspection.status)}>
                          {getStatusIcon(inspection.status)}
                          <span className="ml-1 capitalize">
                            {inspection.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={parseFloat(inspection.passRate)}
                            className="w-16"
                          />
                          <span className="text-sm font-medium">
                            {inspection.passRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          {inspection.inspectorName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {inspection.inspectionDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Defect Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Color Mismatch",
                    "Print Quality",
                    "Alignment Issue",
                    "Material Defect",
                  ].map((defectType, index) => {
                    const count = Math.floor(Math.random() * 20) + 1;
                    const percentage = ((count / 50) * 100).toFixed(1);
                    return (
                      <div
                        key={defectType}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{defectType}</div>
                          <div className="text-sm text-muted-foreground">
                            {count} occurrences
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={parseFloat(percentage)}
                            className="w-20"
                          />
                          <span className="text-sm">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {qualityData
                    .filter((i) => i.defects.some((d) => d.severity === "High"))
                    .slice(0, 5)
                    .map((inspection) => (
                      <div
                        key={inspection.id}
                        className="border rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">
                            {inspection.jobNumber}
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            High Priority
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {inspection.defects.map((d) => d.type).join(", ")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Machine: {inspection.machineName}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Quality Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+2.3%</div>
                <p className="text-sm text-muted-foreground">
                  Quality improvement this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                  Defect Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-1.8%</div>
                <p className="text-sm text-muted-foreground">
                  Defect reduction this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">94.2%</div>
                <p className="text-sm text-muted-foreground">
                  Overall process efficiency
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Reports</CardTitle>
                <CardDescription>
                  Generate and download quality reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Daily Quality Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Weekly Quality Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Monthly Trend Analysis
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Defect Analysis Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common quality control actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  Photo Inspection
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Batch
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Quality Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function QualityControlPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <QualityControlPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
