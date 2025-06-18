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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
  MessageSquare,
  Search,
  Plus,
  Edit,
  Eye,
  Filter,
  Star,
  Building2,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  User,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DatabaseConnectionStatus from "@/components/DatabaseConnectionStatus";

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "prospect" | "churned";
  tier: "premium" | "standard" | "basic";
  totalRevenue: number;
  lastContact: string;
  lastOrder: string;
  creditLimit: number;
  outstandingAmount: number;
  satisfaction: number; // 1-5 rating
  assignedTo: string;
  source: string;
  industry: string;
  location: string;
  notes: string;
  tags: string[];
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";
  value: number;
  probability: number;
  source: string;
  assignedTo: string;
  createdAt: string;
  expectedCloseDate: string;
  lastActivity: string;
  notes: string;
  stage: string;
}

interface Interaction {
  id: string;
  customerId: string;
  type:
    | "call"
    | "email"
    | "meeting"
    | "quote"
    | "order"
    | "complaint"
    | "follow_up";
  subject: string;
  description: string;
  date: string;
  duration?: number;
  outcome: "positive" | "neutral" | "negative";
  followUpRequired: boolean;
  followUpDate?: string;
  performedBy: string;
  attachments?: string[];
}

const demoCustomers: Customer[] = [
  {
    id: "1",
    name: "Ravi Gupta",
    company: "ABC Corporation",
    email: "ravi@abccorp.com",
    phone: "+91 99888 77766",
    status: "active",
    tier: "premium",
    totalRevenue: 850000,
    lastContact: "2024-01-10",
    lastOrder: "2024-01-08",
    creditLimit: 500000,
    outstandingAmount: 45000,
    satisfaction: 5,
    assignedTo: "Priya Sharma",
    source: "Referral",
    industry: "Manufacturing",
    location: "Mumbai",
    notes: "Regular high-value client, excellent payment history",
    tags: ["VIP", "Manufacturing", "High-Volume"],
  },
  {
    id: "2",
    name: "Sunita Joshi",
    company: "XYZ Industries",
    email: "sunita@xyzind.com",
    phone: "+91 99888 77767",
    status: "active",
    tier: "standard",
    totalRevenue: 350000,
    lastContact: "2024-01-12",
    lastOrder: "2024-01-05",
    creditLimit: 300000,
    outstandingAmount: 125000,
    satisfaction: 4,
    assignedTo: "Amit Patel",
    source: "Website",
    industry: "Retail",
    location: "Delhi",
    notes: "Quarterly billing cycle, sometimes late payments",
    tags: ["Retail", "Quarterly-Billing"],
  },
  {
    id: "3",
    name: "Manoj Kumar",
    company: "Tech Solutions Pvt Ltd",
    email: "manoj@techsol.com",
    phone: "+91 99888 77768",
    status: "prospect",
    tier: "basic",
    totalRevenue: 75000,
    lastContact: "2024-01-14",
    lastOrder: "2023-12-20",
    creditLimit: 200000,
    outstandingAmount: 75000,
    satisfaction: 3,
    assignedTo: "Priya Sharma",
    source: "Cold Call",
    industry: "Technology",
    location: "Bangalore",
    notes: "Interested in premium services, price-sensitive",
    tags: ["Technology", "Price-Sensitive", "Prospect"],
  },
  {
    id: "4",
    name: "Kavita Singh",
    company: "Educational Institute",
    email: "kavita@education.com",
    phone: "+91 99888 77769",
    status: "inactive",
    tier: "basic",
    totalRevenue: 125000,
    lastContact: "2023-11-15",
    lastOrder: "2023-10-20",
    creditLimit: 100000,
    outstandingAmount: 0,
    satisfaction: 2,
    assignedTo: "Amit Patel",
    source: "Trade Show",
    industry: "Education",
    location: "Pune",
    notes: "Seasonal orders, budget constraints",
    tags: ["Education", "Seasonal", "Budget-Conscious"],
  },
];

const demoLeads: Lead[] = [
  {
    id: "1",
    name: "Rajesh Mehta",
    company: "Future Enterprises",
    email: "rajesh@future.com",
    phone: "+91 99888 77770",
    status: "qualified",
    value: 200000,
    probability: 75,
    source: "Website",
    assignedTo: "Priya Sharma",
    createdAt: "2024-01-05",
    expectedCloseDate: "2024-02-15",
    lastActivity: "2024-01-12",
    notes: "Interested in large volume printing for new product launch",
    stage: "Proposal Sent",
  },
  {
    id: "2",
    name: "Neha Agarwal",
    company: "Creative Agency",
    email: "neha@creative.com",
    phone: "+91 99888 77771",
    status: "negotiation",
    value: 150000,
    probability: 60,
    source: "Referral",
    assignedTo: "Amit Patel",
    createdAt: "2024-01-08",
    expectedCloseDate: "2024-01-30",
    lastActivity: "2024-01-14",
    notes: "Price negotiation in progress, looking for long-term partnership",
    stage: "Contract Review",
  },
  {
    id: "3",
    name: "Vikram Sharma",
    company: "Startup Hub",
    email: "vikram@startup.com",
    phone: "+91 99888 77772",
    status: "new",
    value: 75000,
    probability: 25,
    source: "Social Media",
    assignedTo: "Priya Sharma",
    createdAt: "2024-01-14",
    expectedCloseDate: "2024-03-01",
    lastActivity: "2024-01-14",
    notes: "New startup, needs design and printing services",
    stage: "Initial Contact",
  },
];

const demoInteractions: Interaction[] = [
  {
    id: "1",
    customerId: "1",
    type: "call",
    subject: "Order Follow-up",
    description:
      "Discussed delivery timeline for business cards order. Customer satisfied with quality.",
    date: "2024-01-14",
    duration: 15,
    outcome: "positive",
    followUpRequired: false,
    performedBy: "Priya Sharma",
  },
  {
    id: "2",
    customerId: "2",
    type: "email",
    subject: "Payment Reminder",
    description: "Sent payment reminder for outstanding invoice INV-2024-001.",
    date: "2024-01-12",
    outcome: "neutral",
    followUpRequired: true,
    followUpDate: "2024-01-19",
    performedBy: "Amit Patel",
  },
  {
    id: "3",
    customerId: "3",
    type: "meeting",
    subject: "Service Presentation",
    description:
      "Presented premium printing services portfolio. Client interested but concerned about pricing.",
    date: "2024-01-10",
    duration: 60,
    outcome: "neutral",
    followUpRequired: true,
    followUpDate: "2024-01-17",
    performedBy: "Priya Sharma",
  },
  {
    id: "4",
    customerId: "1",
    type: "quote",
    subject: "Brochure Printing Quote",
    description:
      "Provided quote for 5000 tri-fold brochures. Customer requested modifications to design.",
    date: "2024-01-08",
    outcome: "positive",
    followUpRequired: true,
    followUpDate: "2024-01-15",
    performedBy: "Amit Patel",
  },
];

function CRMPageContent() {
  const [selectedTab, setSelectedTab] = useState("customers");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const filteredCustomers = demoCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;
    const matchesTier = tierFilter === "all" || customer.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
      prospect: { color: "bg-blue-100 text-blue-800", label: "Prospect" },
      churned: { color: "bg-red-100 text-red-800", label: "Churned" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      premium: { color: "bg-purple-100 text-purple-800", label: "Premium" },
      standard: { color: "bg-blue-100 text-blue-800", label: "Standard" },
      basic: { color: "bg-gray-100 text-gray-800", label: "Basic" },
    };
    const config = tierConfig[tier as keyof typeof tierConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getLeadStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: "bg-blue-100 text-blue-800", label: "New" },
      contacted: { color: "bg-yellow-100 text-yellow-800", label: "Contacted" },
      qualified: { color: "bg-green-100 text-green-800", label: "Qualified" },
      proposal: { color: "bg-purple-100 text-purple-800", label: "Proposal" },
      negotiation: {
        color: "bg-orange-100 text-orange-800",
        label: "Negotiation",
      },
      won: { color: "bg-green-100 text-green-800", label: "Won" },
      lost: { color: "bg-red-100 text-red-800", label: "Lost" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "meeting":
        return <Calendar className="w-4 h-4" />;
      case "quote":
        return <FileText className="w-4 h-4" />;
      case "order":
        return <CheckCircle2 className="w-4 h-4" />;
      case "complaint":
        return <AlertCircle className="w-4 h-4" />;
      case "follow_up":
        return <Clock className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    const colors = {
      positive: "text-green-600",
      neutral: "text-yellow-600",
      negative: "text-red-600",
    };
    return colors[outcome as keyof typeof colors] || "text-gray-600";
  };

  const totalCustomers = demoCustomers.length;
  const activeCustomers = demoCustomers.filter(
    (c) => c.status === "active"
  ).length;
  const totalRevenue = demoCustomers.reduce(
    (sum, c) => sum + c.totalRevenue,
    0
  );
  const avgSatisfaction =
    demoCustomers.reduce((sum, c) => sum + c.satisfaction, 0) /
    demoCustomers.length;
  const totalLeads = demoLeads.length;
  const qualifiedLeads = demoLeads.filter(
    (l) =>
      l.status === "qualified" ||
      l.status === "proposal" ||
      l.status === "negotiation"
  ).length;
  const pipelineValue = demoLeads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Relationship Management
          </h1>
          <p className="text-gray-600">
            Manage customer relationships, leads, and interactions
          </p>
          <div className="mt-2">
            <DatabaseConnectionStatus variant="compact" />
          </div>
        </div>
        <div className="flex space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Enter lead information to start tracking
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-name">Contact Name</Label>
                    <Input id="lead-name" placeholder="Enter contact name" />
                  </div>
                  <div>
                    <Label htmlFor="lead-company">Company</Label>
                    <Input id="lead-company" placeholder="Enter company name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-email">Email</Label>
                    <Input
                      id="lead-email"
                      type="email"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead-phone">Phone</Label>
                    <Input id="lead-phone" placeholder="Enter phone number" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="lead-value">Deal Value (₹)</Label>
                    <Input id="lead-value" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="lead-probability">Probability (%)</Label>
                    <Input
                      id="lead-probability"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead-source">Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="cold_call">Cold Call</SelectItem>
                        <SelectItem value="social_media">
                          Social Media
                        </SelectItem>
                        <SelectItem value="trade_show">Trade Show</SelectItem>
                        <SelectItem value="advertisement">
                          Advertisement
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="lead-notes">Notes</Label>
                  <Textarea
                    id="lead-notes"
                    placeholder="Additional notes about the lead..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Lead</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₹{(totalRevenue / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Satisfaction</p>
                <p className="text-2xl font-bold">
                  {avgSatisfaction.toFixed(1)}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold">{qualifiedLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold">
                  ₹{(pipelineValue / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">
                              {customer.company}
                            </p>
                            <p className="text-sm text-gray-500">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>{getTierBadge(customer.tier)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            ₹{customer.totalRevenue.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.industry}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            ₹{customer.outstandingAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Limit: ₹{customer.creditLimit.toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">
                            {customer.satisfaction}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(
                              customer.lastContact
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {customer.assignedTo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4" />
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

        <TabsContent value="leads" className="space-y-6">
          {/* Sales Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline</CardTitle>
              <CardDescription>
                Track leads through the sales process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-7">
                {[
                  "new",
                  "contacted",
                  "qualified",
                  "proposal",
                  "negotiation",
                  "won",
                  "lost",
                ].map((stage) => {
                  const stageLeads = demoLeads.filter(
                    (lead) => lead.status === stage
                  );
                  const stageValue = stageLeads.reduce(
                    (sum, lead) => sum + lead.value,
                    0
                  );

                  return (
                    <div
                      key={stage}
                      className="text-center p-4 border rounded-lg"
                    >
                      <h3 className="font-medium capitalize mb-2">
                        {stage.replace("_", " ")}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {stageLeads.length}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{(stageValue / 1000).toFixed(0)}K
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-gray-500">
                            {lead.company}
                          </p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getLeadStatusBadge(lead.status)}</TableCell>
                      <TableCell>₹{lead.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={lead.probability}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">{lead.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(lead.expectedCloseDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{lead.assignedTo}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
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

        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interactions</CardTitle>
              <CardDescription>
                Customer communication and activity history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoInteractions.map((interaction) => {
                  const customer = demoCustomers.find(
                    (c) => c.id === interaction.customerId
                  );
                  const IconComponent = getInteractionIcon(interaction.type);

                  return (
                    <div
                      key={interaction.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{interaction.subject}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {interaction.type.replace("_", " ")}
                            </Badge>
                            <span
                              className={`text-sm font-medium ${getOutcomeColor(interaction.outcome)}`}
                            >
                              {interaction.outcome}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {interaction.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>
                              {customer?.name} ({customer?.company})
                            </span>
                            <span>by {interaction.performedBy}</span>
                            <span>
                              {new Date(interaction.date).toLocaleDateString()}
                            </span>
                            {interaction.duration && (
                              <span>{interaction.duration} min</span>
                            )}
                          </div>
                          {interaction.followUpRequired && (
                            <Badge
                              variant="outline"
                              className="text-orange-600"
                            >
                              Follow-up:{" "}
                              {interaction.followUpDate
                                ? new Date(
                                    interaction.followUpDate
                                  ).toLocaleDateString()
                                : "TBD"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
                <CardDescription>
                  Customer distribution by tier and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Premium Customers</span>
                      <span>
                        {
                          demoCustomers.filter((c) => c.tier === "premium")
                            .length
                        }
                      </span>
                    </div>
                    <Progress
                      value={
                        (demoCustomers.filter((c) => c.tier === "premium")
                          .length /
                          totalCustomers) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Standard Customers</span>
                      <span>
                        {
                          demoCustomers.filter((c) => c.tier === "standard")
                            .length
                        }
                      </span>
                    </div>
                    <Progress
                      value={
                        (demoCustomers.filter((c) => c.tier === "standard")
                          .length /
                          totalCustomers) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Basic Customers</span>
                      <span>
                        {demoCustomers.filter((c) => c.tier === "basic").length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (demoCustomers.filter((c) => c.tier === "basic")
                          .length /
                          totalCustomers) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Industry</CardTitle>
                <CardDescription>
                  Revenue breakdown by customer industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Manufacturing", "Retail", "Technology", "Education"].map(
                    (industry) => {
                      const industryCustomers = demoCustomers.filter(
                        (c) => c.industry === industry
                      );
                      const industryRevenue = industryCustomers.reduce(
                        (sum, c) => sum + c.totalRevenue,
                        0
                      );
                      const percentage = (industryRevenue / totalRevenue) * 100;

                      return (
                        <div key={industry}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{industry}</span>
                            <span>
                              ₹{(industryRevenue / 100000).toFixed(1)}L (
                              {percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for customer relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Customer Acquisition Rate
                  </h3>
                  <p className="text-2xl font-bold text-green-600">+15%</p>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Customer Retention
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">87%</p>
                  <p className="text-xs text-gray-500">12-month rate</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Avg Revenue per Customer
                  </h3>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{(totalRevenue / totalCustomers / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-gray-500">lifetime value</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Lead Conversion Rate
                  </h3>
                  <p className="text-2xl font-bold text-orange-600">23%</p>
                  <p className="text-xs text-gray-500">qualified to won</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CRMPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor", "finance"]}>
        <CRMPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
