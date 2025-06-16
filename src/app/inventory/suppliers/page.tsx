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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Building2,
  Star,
  Clock,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  CreditCard,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  gstNumber?: string;
  rating: number;
  leadTime: number; // in days
  paymentTerms: string;
  isActive: boolean;
  category: string;
  totalOrders: number;
  totalValue: number;
  onTimeDelivery: number; // percentage
  qualityRating: number;
  lastOrderDate: string;
  creditLimit: number;
  outstandingAmount: number;
  contractStart?: string;
  contractEnd?: string;
}

const demoSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Paper Excellence Ltd",
    contactPerson: "Ramesh Kumar",
    phone: "+91 98765 43210",
    email: "ramesh@paperexcellence.com",
    address: "Industrial Area, Phase 2",
    city: "Mumbai",
    state: "Maharashtra",
    gstNumber: "27AAAAA0000A1Z5",
    rating: 4.5,
    leadTime: 3,
    paymentTerms: "Net 30",
    isActive: true,
    category: "Paper & Stationery",
    totalOrders: 156,
    totalValue: 2850000,
    onTimeDelivery: 92,
    qualityRating: 4.3,
    lastOrderDate: "2024-01-10",
    creditLimit: 500000,
    outstandingAmount: 125000,
    contractStart: "2023-01-01",
    contractEnd: "2024-12-31",
  },
  {
    id: "2",
    name: "Ink Solutions Pvt Ltd",
    contactPerson: "Priya Sharma",
    phone: "+91 98765 43211",
    email: "priya@inksolutions.com",
    address: "Tech Park, Sector 5",
    city: "Pune",
    state: "Maharashtra",
    gstNumber: "27BBBBB0000B1Z5",
    rating: 4.2,
    leadTime: 5,
    paymentTerms: "Net 15",
    isActive: true,
    category: "Inks & Chemicals",
    totalOrders: 89,
    totalValue: 1450000,
    onTimeDelivery: 88,
    qualityRating: 4.1,
    lastOrderDate: "2024-01-08",
    creditLimit: 300000,
    outstandingAmount: 75000,
    contractStart: "2023-06-01",
    contractEnd: "2025-05-31",
  },
  {
    id: "3",
    name: "Modern Machinery Co",
    contactPerson: "Suresh Patel",
    phone: "+91 98765 43212",
    email: "suresh@modernmachinery.com",
    address: "Industrial Estate",
    city: "Ahmedabad",
    state: "Gujarat",
    gstNumber: "24CCCCC0000C1Z5",
    rating: 4.7,
    leadTime: 15,
    paymentTerms: "Net 45",
    isActive: true,
    category: "Machinery & Equipment",
    totalOrders: 23,
    totalValue: 5650000,
    onTimeDelivery: 95,
    qualityRating: 4.8,
    lastOrderDate: "2023-12-15",
    creditLimit: 1000000,
    outstandingAmount: 0,
    contractStart: "2022-01-01",
    contractEnd: "2026-12-31",
  },
  {
    id: "4",
    name: "Finishing Touch Supplies",
    contactPerson: "Anjali Singh",
    phone: "+91 98765 43213",
    email: "anjali@finishingtouch.com",
    address: "Commercial Complex",
    city: "Delhi",
    state: "Delhi",
    gstNumber: "07DDDDD0000D1Z5",
    rating: 3.8,
    leadTime: 7,
    paymentTerms: "Net 21",
    isActive: true,
    category: "Finishing Materials",
    totalOrders: 67,
    totalValue: 890000,
    onTimeDelivery: 82,
    qualityRating: 3.9,
    lastOrderDate: "2024-01-05",
    creditLimit: 200000,
    outstandingAmount: 45000,
  },
  {
    id: "5",
    name: "Quality Parts International",
    contactPerson: "Vikram Reddy",
    phone: "+91 98765 43214",
    email: "vikram@qualityparts.com",
    address: "Export Promotion Zone",
    city: "Bangalore",
    state: "Karnataka",
    gstNumber: "29EEEEE0000E1Z5",
    rating: 4.4,
    leadTime: 10,
    paymentTerms: "Net 30",
    isActive: false,
    category: "Spare Parts",
    totalOrders: 34,
    totalValue: 1200000,
    onTimeDelivery: 90,
    qualityRating: 4.2,
    lastOrderDate: "2023-11-20",
    creditLimit: 350000,
    outstandingAmount: 85000,
    contractStart: "2023-01-01",
    contractEnd: "2023-12-31",
  },
];

function SuppliersPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSuppliers = demoSuppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || supplier.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && supplier.isActive) ||
      (statusFilter === "inactive" && !supplier.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge
        className={
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }
      >
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 80) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Calculate summary statistics
  const totalSuppliers = demoSuppliers.length;
  const activeSuppliers = demoSuppliers.filter((s) => s.isActive).length;
  const totalValue = demoSuppliers.reduce((sum, s) => sum + s.totalValue, 0);
  const avgRating =
    demoSuppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers;
  const totalOutstanding = demoSuppliers.reduce(
    (sum, s) => sum + s.outstandingAmount,
    0
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supplier Management
          </h1>
          <p className="text-gray-600">
            Manage supplier relationships and procurement processes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Supplier Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter supplier information and contact details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierName">Company Name</Label>
                    <Input
                      id="supplierName"
                      placeholder="Supplier company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Primary contact name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@supplier.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Complete address" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="State" />
                  </div>
                  <div>
                    <Label htmlFor="gst">GST Number</Label>
                    <Input id="gst" placeholder="GST registration number" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paper">
                          Paper & Stationery
                        </SelectItem>
                        <SelectItem value="ink">Inks & Chemicals</SelectItem>
                        <SelectItem value="machinery">
                          Machinery & Equipment
                        </SelectItem>
                        <SelectItem value="finishing">
                          Finishing Materials
                        </SelectItem>
                        <SelectItem value="parts">Spare Parts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="leadTime">Lead Time (Days)</Label>
                    <Input id="leadTime" type="number" placeholder="5" />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="net15">Net 15</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net45">Net 45</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Initial Rating</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Stars - Excellent</SelectItem>
                        <SelectItem value="4">4 Stars - Good</SelectItem>
                        <SelectItem value="3">3 Stars - Average</SelectItem>
                        <SelectItem value="2">
                          2 Stars - Below Average
                        </SelectItem>
                        <SelectItem value="1">1 Star - Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Supplier</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Suppliers
                </p>
                <p className="text-3xl font-bold">{totalSuppliers}</p>
                <p className="text-xs text-gray-500">Registered vendors</p>
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
                  Active Suppliers
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {activeSuppliers}
                </p>
                <p className="text-xs text-green-600">
                  {((activeSuppliers / totalSuppliers) * 100).toFixed(0)}%
                  active
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
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold">
                  ₹{(totalValue / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-gray-500">Procurement value</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
                <div className="flex mt-1">{getRatingStars(avgRating)}</div>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">All Suppliers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search suppliers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Paper & Stationery">
                      Paper & Stationery
                    </SelectItem>
                    <SelectItem value="Inks & Chemicals">
                      Inks & Chemicals
                    </SelectItem>
                    <SelectItem value="Machinery & Equipment">
                      Machinery & Equipment
                    </SelectItem>
                    <SelectItem value="Finishing Materials">
                      Finishing Materials
                    </SelectItem>
                    <SelectItem value="Spare Parts">Spare Parts</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <CardDescription>{supplier.category}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(supplier.isActive)}
                      <div className="flex">
                        {getRatingStars(supplier.rating)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center text-sm">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">
                        {supplier.contactPerson}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {supplier.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {supplier.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {supplier.city}, {supplier.state}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Total Orders</p>
                      <p className="font-medium">{supplier.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Value</p>
                      <p className="font-medium">
                        ₹{(supplier.totalValue / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lead Time</p>
                      <p className="font-medium">{supplier.leadTime} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Terms</p>
                      <p className="font-medium">{supplier.paymentTerms}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        On-time Delivery
                      </span>
                      <span className="text-sm font-medium">
                        {supplier.onTimeDelivery}%
                      </span>
                    </div>
                    <Progress value={supplier.onTimeDelivery} className="h-2" />
                  </div>

                  {supplier.outstandingAmount > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-800">
                          Outstanding
                        </span>
                        <span className="font-medium text-yellow-800">
                          ₹{supplier.outstandingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm">
                      <Package className="w-4 h-4 mr-2" />
                      Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Metrics</CardTitle>
              <CardDescription>
                Performance analysis and ratings for all suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>On-time Delivery</TableHead>
                    <TableHead>Quality Rating</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoSuppliers
                    .sort((a, b) => b.rating - a.rating)
                    .map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-500">
                              {supplier.category}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {getRatingStars(supplier.rating)}
                            </div>
                            <span className="text-sm">{supplier.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={supplier.onTimeDelivery}
                              className="w-16"
                            />
                            <Badge
                              className={getPerformanceBadge(
                                supplier.onTimeDelivery
                              )}
                            >
                              {supplier.onTimeDelivery}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {getRatingStars(supplier.qualityRating)}
                            </div>
                            <span className="text-sm">
                              {supplier.qualityRating}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.totalOrders}</TableCell>
                        <TableCell>
                          ₹{(supplier.totalValue / 100000).toFixed(1)}L
                        </TableCell>
                        <TableCell>
                          {new Date(
                            supplier.lastOrderDate
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>
                Recent procurement orders from suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoSuppliers
                  .filter((s) => s.isActive)
                  .slice(0, 5)
                  .map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{supplier.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{supplier.category}</span>
                            <span>•</span>
                            <span>Lead time: {supplier.leadTime} days</span>
                            <span>•</span>
                            <span>
                              Last order:{" "}
                              {new Date(
                                supplier.lastOrderDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-lg">
                          ₹
                          {(
                            supplier.totalValue /
                            supplier.totalOrders /
                            1000
                          ).toFixed(0)}
                          K
                        </div>
                        <div className="text-sm text-gray-500">
                          Avg order value
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Distribution</CardTitle>
                <CardDescription>
                  Suppliers by category and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    demoSuppliers.reduce(
                      (acc, supplier) => {
                        acc[supplier.category] =
                          (acc[supplier.category] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  ).map(([category, count]) => {
                    const percentage = (count / totalSuppliers) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            {category}
                          </span>
                          <span className="text-sm">{count} suppliers</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-gray-500 text-right">
                          {percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                <CardDescription>Pending payments to suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="w-8 h-8 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium">Total Outstanding</p>
                        <p className="text-sm text-gray-600">
                          Across all suppliers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        ₹{(totalOutstanding / 100000).toFixed(1)}L
                      </p>
                      <p className="text-sm text-gray-500">
                        {
                          demoSuppliers.filter((s) => s.outstandingAmount > 0)
                            .length
                        }{" "}
                        suppliers
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {demoSuppliers
                      .filter((s) => s.outstandingAmount > 0)
                      .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
                      .map((supplier) => (
                        <div
                          key={supplier.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <span className="font-medium">{supplier.name}</span>
                          <span className="text-red-600 font-medium">
                            ₹{supplier.outstandingAmount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <SuppliersPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
