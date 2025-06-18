"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

// Mock data for demonstration
const mockBudgets = [
  {
    id: "1",
    category: "Raw Materials",
    department: "Production",
    monthly_limit: 500000,
    annual_limit: 6000000,
    current_spent: 420000,
    remaining_budget: 80000,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    status: "warning",
    utilization_percentage: 84,
    days_remaining: 15,
    variance: 80000,
    variance_percentage: 16,
    notifications_enabled: true,
    approval_required: true,
    created_by: "Admin",
    created_at: "2024-01-01",
  },
  {
    id: "2",
    category: "Labor Costs",
    department: "Production",
    monthly_limit: 350000,
    annual_limit: 4200000,
    current_spent: 280000,
    remaining_budget: 70000,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    status: "active",
    utilization_percentage: 80,
    days_remaining: 15,
    variance: 70000,
    variance_percentage: 20,
    notifications_enabled: true,
    approval_required: false,
    created_by: "Manager",
    created_at: "2024-01-01",
  },
  {
    id: "3",
    category: "Marketing",
    department: "Sales",
    monthly_limit: 100000,
    annual_limit: 1200000,
    current_spent: 110000,
    remaining_budget: -10000,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    status: "exceeded",
    utilization_percentage: 110,
    days_remaining: 15,
    variance: -10000,
    variance_percentage: -10,
    notifications_enabled: true,
    approval_required: true,
    created_by: "Admin",
    created_at: "2024-01-01",
  },
  {
    id: "4",
    category: "Office Supplies",
    department: "Admin",
    monthly_limit: 25000,
    annual_limit: 300000,
    current_spent: 15000,
    remaining_budget: 10000,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    status: "active",
    utilization_percentage: 60,
    days_remaining: 15,
    variance: 10000,
    variance_percentage: 40,
    notifications_enabled: false,
    approval_required: false,
    created_by: "Admin",
    created_at: "2024-01-01",
  },
];

const mockSummary = {
  total_allocated: 975000,
  total_spent: 825000,
  total_remaining: 150000,
  total_budgets: 4,
  active_budgets: 2,
  warning_budgets: 1,
  exceeded_budgets: 1,
};

const BudgetManagementContent = () => {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [summary, setSummary] = useState(mockSummary);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newBudget, setNewBudget] = useState({
    category: "",
    department: "",
    monthly_limit: "",
    annual_limit: "",
    period_start: "",
    period_end: "",
    notifications_enabled: true,
    approval_required: false,
    description: "",
  });

  const departments = ["Production", "Sales", "Admin", "Finance", "HR", "IT"];
  const categories = [
    "Raw Materials",
    "Labor Costs",
    "Marketing",
    "Office Supplies",
    "Utilities",
    "Equipment",
    "Training",
    "Travel",
    "Software",
    "Maintenance",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "exceeded":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "exceeded":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateBudget = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const budgetData = {
      ...newBudget,
      id: Date.now().toString(),
      current_spent: 0,
      remaining_budget: parseFloat(newBudget.monthly_limit),
      status: "active",
      utilization_percentage: 0,
      days_remaining: 30,
      variance: parseFloat(newBudget.monthly_limit),
      variance_percentage: 100,
      created_by: "Current User",
      created_at: new Date().toISOString(),
    };
    
    setBudgets([...budgets, budgetData]);
    setShowCreateDialog(false);
    setNewBudget({
      category: "",
      department: "",
      monthly_limit: "",
      annual_limit: "",
      period_start: "",
      period_end: "",
      notifications_enabled: true,
      approval_required: false,
      description: "",
    });
    
    setLoading(false);
    toast({
      title: "Budget Created",
      description: "New budget has been created successfully.",
    });
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter((budget) => budget.id !== budgetId));
    toast({
      title: "Budget Deleted",
      description: "Budget has been deleted successfully.",
    });
  };

  const filteredBudgets = budgets.filter((budget) => {
    const matchesDepartment =
      selectedDepartment === "all" || budget.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || budget.status === selectedStatus;
    const matchesSearch =
      budget.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Budget Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and control departmental budgets and spending
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set up a new budget for department spending control
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newBudget.category}
                    onValueChange={(value) =>
                      setNewBudget({ ...newBudget, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newBudget.department}
                    onValueChange={(value) =>
                      setNewBudget({ ...newBudget, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_limit">Monthly Limit (₹)</Label>
                  <Input
                    id="monthly_limit"
                    type="number"
                    placeholder="50000"
                    value={newBudget.monthly_limit}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        monthly_limit: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_limit">Annual Limit (₹)</Label>
                  <Input
                    id="annual_limit"
                    type="number"
                    placeholder="600000"
                    value={newBudget.annual_limit}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        annual_limit: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_start">Period Start</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={newBudget.period_start}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        period_start: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_end">Period End</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={newBudget.period_end}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, period_end: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Budget description or notes..."
                    value={newBudget.description}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newBudget.notifications_enabled}
                      onCheckedChange={(checked) =>
                        setNewBudget({
                          ...newBudget,
                          notifications_enabled: checked,
                        })
                      }
                    />
                    <Label>Enable Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newBudget.approval_required}
                      onCheckedChange={(checked) =>
                        setNewBudget({
                          ...newBudget,
                          approval_required: checked,
                        })
                      }
                    />
                    <Label>Require Approval</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateBudget} disabled={loading}>
                  {loading ? "Creating..." : "Create Budget"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Allocated
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(summary.total_allocated / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              Across {summary.total_budgets} budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(summary.total_spent / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              {((summary.total_spent / summary.total_allocated) * 100).toFixed(
                1
              )}
              % of allocated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(summary.total_remaining / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              Available for spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span className="text-xs">{summary.active_budgets}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span className="text-xs">{summary.warning_budgets}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span className="text-xs">{summary.exceeded_budgets}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active / Warning / Exceeded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search budgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="exceeded">Exceeded</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBudgets.map((budget) => (
          <Card key={budget.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{budget.category}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    {budget.department}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(budget.status)}>
                    {getStatusIcon(budget.status)}
                    <span className="ml-1 capitalize">{budget.status}</span>
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Budget Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Spent: ₹{budget.current_spent.toLocaleString()}</span>
                    <span>Limit: ₹{budget.monthly_limit.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={Math.min(budget.utilization_percentage, 100)} 
                    className={`h-3 ${
                      budget.utilization_percentage >= 100
                        ? "[&>div]:bg-red-500"
                        : budget.utilization_percentage >= 80
                          ? "[&>div]:bg-yellow-500"
                          : "[&>div]:bg-green-500"
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>
                      {budget.utilization_percentage.toFixed(1)}% utilized
                    </span>
                    <span>
                      ₹{Math.abs(budget.remaining_budget).toLocaleString()}{" "}
                      {budget.remaining_budget >= 0 ? "remaining" : "over"}
                    </span>
                  </div>
                </div>

                {/* Budget Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monthly Limit</p>
                    <p className="font-medium">
                      ₹{budget.monthly_limit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Annual Limit</p>
                    <p className="font-medium">
                      ₹{budget.annual_limit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Days Remaining</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {budget.days_remaining}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Variance</p>
                    <p
                      className={`font-medium ${budget.variance >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {budget.variance >= 0 ? "+" : ""}₹
                      {budget.variance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Settings */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    {budget.notifications_enabled && (
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Notifications
                      </span>
                    )}
                    {budget.approval_required && (
                      <span className="flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Approval Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBudgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No budgets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ||
              selectedDepartment !== "all" ||
              selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Create your first budget to get started"}
            </p>
            {!(
              searchTerm ||
              selectedDepartment !== "all" ||
              selectedStatus !== "all"
            ) && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default function BudgetManagement() {
  return (
    <RoleBasedAccess allowedRoles={["admin", "finance", "supervisor"]}>
      <DashboardPageLayout>
        <BudgetManagementContent />
      </DashboardPageLayout>
    </RoleBasedAccess>
  );
}
