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
  Package,
  PackageCheck,
  PackageMinus,
  AlertTriangle,
  TrendingUp,
  Search,
  Plus,
  Edit,
  Trash2,
  Truck,
  BarChart3,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

interface InventoryItem {
  id: string;
  name: string;
  category:
    | "paper"
    | "ink"
    | "chemical"
    | "plate"
    | "finishing"
    | "spare_parts"
    | "consumables";
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  supplierId: string;
  supplierName: string;
  location: string;
  lastRestocked: string;
  lastUsed: string;
  usageRate: number; // per day
  daysLeft: number;
  status: "in_stock" | "low_stock" | "out_of_stock" | "overstock";
  notes?: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  leadTime: number; // in days
  paymentTerms: string;
  isActive: boolean;
}

interface StockMovement {
  id: string;
  itemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reason: string;
  jobId?: string;
  supplierId?: string;
  date: string;
  performedBy: string;
  notes?: string;
}

const demoInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Art Card 300gsm",
    category: "paper",
    sku: "PAP-AC-300",
    currentStock: 250,
    minStock: 100,
    maxStock: 500,
    unit: "sheets",
    unitCost: 2.5,
    totalValue: 625,
    supplierId: "1",
    supplierName: "Paper Mill Ltd",
    location: "Warehouse A-1",
    lastRestocked: "2024-01-10",
    lastUsed: "2024-01-14",
    usageRate: 15,
    daysLeft: 17,
    status: "in_stock",
  },
  {
    id: "2",
    name: "Cyan Offset Ink",
    category: "ink",
    sku: "INK-OFF-CYN",
    currentStock: 25,
    minStock: 50,
    maxStock: 200,
    unit: "kg",
    unitCost: 450,
    totalValue: 11250,
    supplierId: "2",
    supplierName: "Ink Solutions",
    location: "Storage B-2",
    lastRestocked: "2023-12-15",
    lastUsed: "2024-01-13",
    usageRate: 2,
    daysLeft: 13,
    status: "low_stock",
  },
  {
    id: "3",
    name: "UV Coating Chemical",
    category: "chemical",
    sku: "CHM-UV-COT",
    currentStock: 0,
    minStock: 20,
    maxStock: 100,
    unit: "liters",
    unitCost: 180,
    totalValue: 0,
    supplierId: "3",
    supplierName: "Chemical Corp",
    location: "Storage C-1",
    lastRestocked: "2023-11-20",
    lastUsed: "2024-01-08",
    usageRate: 1.5,
    daysLeft: 0,
    status: "out_of_stock",
  },
  {
    id: "4",
    name: "Aluminum Plates",
    category: "plate",
    sku: "PLT-ALU-A3",
    currentStock: 120,
    minStock: 30,
    maxStock: 150,
    unit: "pieces",
    unitCost: 25,
    totalValue: 3000,
    supplierId: "4",
    supplierName: "Plate Manufacturers",
    location: "Storage D-1",
    lastRestocked: "2024-01-05",
    lastUsed: "2024-01-12",
    usageRate: 5,
    daysLeft: 24,
    status: "in_stock",
  },
  {
    id: "5",
    name: "Bond Paper 80gsm",
    category: "paper",
    sku: "PAP-BND-80",
    currentStock: 800,
    minStock: 200,
    maxStock: 600,
    unit: "sheets",
    unitCost: 0.8,
    totalValue: 640,
    supplierId: "1",
    supplierName: "Paper Mill Ltd",
    location: "Warehouse A-2",
    lastRestocked: "2024-01-08",
    lastUsed: "2024-01-14",
    usageRate: 45,
    daysLeft: 18,
    status: "overstock",
  },
  {
    id: "6",
    name: "Lamination Film",
    category: "finishing",
    sku: "FIN-LAM-GLO",
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unit: "meters",
    unitCost: 12,
    totalValue: 540,
    supplierId: "5",
    supplierName: "Finishing Materials",
    location: "Storage E-1",
    lastRestocked: "2023-12-28",
    lastUsed: "2024-01-11",
    usageRate: 3,
    daysLeft: 15,
    status: "in_stock",
  },
];

const demoSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Paper Mill Ltd",
    contactPerson: "Rajesh Agarwal",
    phone: "+91 99887 66554",
    email: "rajesh@papermill.com",
    address: "Industrial Area, Pune",
    rating: 4.5,
    leadTime: 7,
    paymentTerms: "30 days",
    isActive: true,
  },
  {
    id: "2",
    name: "Ink Solutions",
    contactPerson: "Priya Singh",
    phone: "+91 99887 66555",
    email: "priya@inksolutions.com",
    address: "Chemical Zone, Mumbai",
    rating: 4.2,
    leadTime: 5,
    paymentTerms: "15 days",
    isActive: true,
  },
  {
    id: "3",
    name: "Chemical Corp",
    contactPerson: "Amit Kumar",
    phone: "+91 99887 66556",
    email: "amit@chemicalcorp.com",
    address: "Industrial Park, Delhi",
    rating: 3.8,
    leadTime: 10,
    paymentTerms: "45 days",
    isActive: true,
  },
  {
    id: "4",
    name: "Plate Manufacturers",
    contactPerson: "Sunita Joshi",
    phone: "+91 99887 66557",
    email: "sunita@plates.com",
    address: "Manufacturing Hub, Bangalore",
    rating: 4.0,
    leadTime: 14,
    paymentTerms: "60 days",
    isActive: true,
  },
  {
    id: "5",
    name: "Finishing Materials",
    contactPerson: "Deepak Sharma",
    phone: "+91 99887 66558",
    email: "deepak@finishing.com",
    address: "Tech City, Hyderabad",
    rating: 4.3,
    leadTime: 12,
    paymentTerms: "30 days",
    isActive: true,
  },
];

const demoMovements: StockMovement[] = [
  {
    id: "1",
    itemId: "1",
    type: "out",
    quantity: 50,
    reason: "Job JOB000001 - Business Cards",
    jobId: "1",
    date: "2024-01-14",
    performedBy: "Suresh Yadav",
    notes: "Quality checked before use",
  },
  {
    id: "2",
    itemId: "2",
    type: "out",
    quantity: 5,
    reason: "Job JOB000002 - Brochure printing",
    jobId: "2",
    date: "2024-01-13",
    performedBy: "Deepak Singh",
  },
  {
    id: "3",
    itemId: "1",
    type: "in",
    quantity: 200,
    unitCost: 2.5,
    totalCost: 500,
    reason: "Regular restock",
    supplierId: "1",
    date: "2024-01-10",
    performedBy: "Amit Patel",
  },
  {
    id: "4",
    itemId: "4",
    type: "in",
    quantity: 50,
    unitCost: 25,
    totalCost: 1250,
    reason: "New stock delivery",
    supplierId: "4",
    date: "2024-01-05",
    performedBy: "Priya Sharma",
  },
];

function InventoryPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredInventory = demoInventory.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { color: "bg-green-100 text-green-800", label: "In Stock" },
      low_stock: { color: "bg-yellow-100 text-yellow-800", label: "Low Stock" },
      out_of_stock: { color: "bg-red-100 text-red-800", label: "Out of Stock" },
      overstock: { color: "bg-blue-100 text-blue-800", label: "Overstock" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      paper: Package,
      ink: Package,
      chemical: Package,
      plate: Package,
      finishing: Package,
      spare_parts: Package,
      consumables: Package,
    };
    const Icon = icons[category as keyof typeof icons] || Package;
    return <Icon className="w-4 h-4" />;
  };

  const getStockProgress = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const totalValue = demoInventory.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );
  const lowStockItems = demoInventory.filter(
    (item) => item.status === "low_stock" || item.status === "out_of_stock"
  ).length;
  const categoryCounts = demoInventory.reduce(
    (counts, item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Track and manage print shop materials and supplies
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Enter details for the new inventory item
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" placeholder="Enter item name" />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="Enter SKU" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paper">Paper</SelectItem>
                      <SelectItem value="ink">Ink</SelectItem>
                      <SelectItem value="chemical">Chemical</SelectItem>
                      <SelectItem value="plate">Plate</SelectItem>
                      <SelectItem value="finishing">Finishing</SelectItem>
                      <SelectItem value="spare_parts">Spare Parts</SelectItem>
                      <SelectItem value="consumables">Consumables</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="current">Current Stock</Label>
                  <Input id="current" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="min">Min Stock</Label>
                  <Input id="min" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="max">Max Stock</Label>
                  <Input id="max" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" placeholder="pieces, kg, liters" />
                </div>
                <div>
                  <Label htmlFor="cost">Unit Cost (₹)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Storage location" />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{demoInventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">
                  ₹{totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Truck className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold">
                  {demoSuppliers.filter((s) => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="paper">Paper</SelectItem>
                    <SelectItem value="ink">Ink</SelectItem>
                    <SelectItem value="chemical">Chemical</SelectItem>
                    <SelectItem value="plate">Plate</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                    <SelectItem value="spare_parts">Spare Parts</SelectItem>
                    <SelectItem value="consumables">Consumables</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="overstock">Overstock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage Rate</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(item.category)}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="text-gray-500">
                              {item.maxStock} max
                            </span>
                          </div>
                          <Progress
                            value={getStockProgress(
                              item.currentStock,
                              item.minStock,
                              item.maxStock
                            )}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            ₹{item.totalValue.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{item.unitCost} per {item.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.usageRate} per day</TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${item.daysLeft <= 7 ? "text-red-600" : item.daysLeft <= 14 ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {item.daysLeft} days
                        </span>
                      </TableCell>
                      <TableCell>{item.supplierName}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Package className="w-4 h-4" />
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

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
              <CardDescription>
                Track all inventory transactions and adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoMovements.map((movement) => {
                    const item = demoInventory.find(
                      (i) => i.id === movement.itemId
                    );
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {new Date(movement.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{item?.name || "Unknown Item"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              movement.type === "in"
                                ? "default"
                                : movement.type === "out"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {movement.type === "in"
                              ? "Stock In"
                              : movement.type === "out"
                                ? "Stock Out"
                                : "Adjustment"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              movement.type === "in"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {movement.type === "in" ? "+" : "-"}
                            {movement.quantity} {item?.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          {movement.totalCost ? `₹${movement.totalCost}` : "-"}
                        </TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.performedBy}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>
                Manage your supplier relationships and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-gray-500">
                            {supplier.address}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {supplier.contactPerson}
                          </p>
                          <p className="text-sm text-gray-500">
                            {supplier.phone}
                          </p>
                          <p className="text-sm text-gray-500">
                            {supplier.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{supplier.rating}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.leadTime} days</TableCell>
                      <TableCell>{supplier.paymentTerms}</TableCell>
                      <TableCell>
                        <Badge
                          variant={supplier.isActive ? "default" : "secondary"}
                        >
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
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

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Alerts</CardTitle>
                <CardDescription>
                  Items requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoInventory
                    .filter(
                      (item) =>
                        item.status === "low_stock" ||
                        item.status === "out_of_stock"
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.currentStock} {item.unit} remaining
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Inventory distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category)}
                        <span className="capitalize">
                          {category.replace("_", " ")}
                        </span>
                      </div>
                      <Badge variant="outline">{count} items</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reorder Suggestions</CardTitle>
              <CardDescription>
                Recommended items to reorder based on usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Suggested Order</TableHead>
                    <TableHead>Estimated Cost</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoInventory
                    .filter((item) => item.currentStock <= item.minStock)
                    .map((item) => {
                      const suggestedOrder = item.maxStock - item.currentStock;
                      const estimatedCost = suggestedOrder * item.unitCost;
                      const priority =
                        item.status === "out_of_stock" ? "High" : "Medium";

                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            {item.currentStock} {item.unit}
                          </TableCell>
                          <TableCell>
                            {suggestedOrder} {item.unit}
                          </TableCell>
                          <TableCell>
                            ₹{estimatedCost.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                priority === "High" ? "destructive" : "default"
                              }
                            >
                              {priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm">Create PO</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <InventoryPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
