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
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Download,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  User,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status:
    | "draft"
    | "sent"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  totalAmount: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  createdBy: string;
  approvedBy?: string;
  notes?: string;
  shippingAddress: string;
  paymentTerms: string;
  discount: number;
  tax: number;
  grandTotal: number;
}

const demoPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    orderNumber: "PO-2024-001",
    supplierId: "1",
    supplierName: "Paper Excellence Ltd",
    status: "delivered",
    priority: "medium",
    orderDate: "2024-01-05",
    expectedDelivery: "2024-01-08",
    actualDelivery: "2024-01-08",
    totalAmount: 50000,
    items: [
      {
        id: "1",
        name: "A4 Paper Premium",
        quantity: 5000,
        unitPrice: 8,
        totalPrice: 40000,
      },
      {
        id: "2",
        name: "A3 Paper",
        quantity: 1000,
        unitPrice: 10,
        totalPrice: 10000,
      },
    ],
    createdBy: "Amit Sharma",
    approvedBy: "Priya Singh",
    notes: "Monthly paper stock replenishment",
    shippingAddress: "Warehouse, Industrial Area",
    paymentTerms: "Net 30",
    discount: 2500,
    tax: 9000,
    grandTotal: 56500,
  },
  {
    id: "2",
    orderNumber: "PO-2024-002",
    supplierId: "2",
    supplierName: "Ink Solutions Pvt Ltd",
    status: "shipped",
    priority: "high",
    orderDate: "2024-01-10",
    expectedDelivery: "2024-01-15",
    totalAmount: 25000,
    items: [
      {
        id: "3",
        name: "Black Ink Cartridge",
        quantity: 50,
        unitPrice: 400,
        totalPrice: 20000,
      },
      {
        id: "4",
        name: "Cyan Ink",
        quantity: 25,
        unitPrice: 200,
        totalPrice: 5000,
      },
    ],
    createdBy: "Rajesh Kumar",
    approvedBy: "Amit Sharma",
    notes: "Urgent ink replacement for production",
    shippingAddress: "Production Floor A",
    paymentTerms: "Net 15",
    discount: 0,
    tax: 4500,
    grandTotal: 29500,
  },
  {
    id: "3",
    orderNumber: "PO-2024-003",
    supplierId: "3",
    supplierName: "Modern Machinery Co",
    status: "confirmed",
    priority: "low",
    orderDate: "2024-01-12",
    expectedDelivery: "2024-01-27",
    totalAmount: 150000,
    items: [
      {
        id: "5",
        name: "Cutting Blade Set",
        quantity: 10,
        unitPrice: 12000,
        totalPrice: 120000,
      },
      {
        id: "6",
        name: "Machine Oil",
        quantity: 20,
        unitPrice: 1500,
        totalPrice: 30000,
      },
    ],
    createdBy: "Suresh Patel",
    approvedBy: "Priya Singh",
    notes: "Quarterly maintenance supplies",
    shippingAddress: "Maintenance Workshop",
    paymentTerms: "Net 45",
    discount: 7500,
    tax: 27000,
    grandTotal: 169500,
  },
  {
    id: "4",
    orderNumber: "PO-2024-004",
    supplierId: "4",
    supplierName: "Finishing Touch Supplies",
    status: "sent",
    priority: "medium",
    orderDate: "2024-01-14",
    expectedDelivery: "2024-01-21",
    totalAmount: 35000,
    items: [
      {
        id: "7",
        name: "Lamination Film",
        quantity: 100,
        unitPrice: 250,
        totalPrice: 25000,
      },
      {
        id: "8",
        name: "Binding Wire",
        quantity: 500,
        unitPrice: 20,
        totalPrice: 10000,
      },
    ],
    createdBy: "Anjali Singh",
    notes: "Weekly finishing materials order",
    shippingAddress: "Finishing Department",
    paymentTerms: "Net 21",
    discount: 1750,
    tax: 6300,
    grandTotal: 39550,
  },
  {
    id: "5",
    orderNumber: "PO-2024-005",
    supplierId: "1",
    supplierName: "Paper Excellence Ltd",
    status: "draft",
    priority: "urgent",
    orderDate: "2024-01-15",
    expectedDelivery: "2024-01-18",
    totalAmount: 75000,
    items: [
      {
        id: "9",
        name: "Premium Cardstock",
        quantity: 2000,
        unitPrice: 25,
        totalPrice: 50000,
      },
      {
        id: "10",
        name: "Specialty Paper",
        quantity: 1000,
        unitPrice: 25,
        totalPrice: 25000,
      },
    ],
    createdBy: "Amit Sharma",
    notes: "Rush order for client project",
    shippingAddress: "Warehouse, Industrial Area",
    paymentTerms: "Net 30",
    discount: 3750,
    tax: 13500,
    grandTotal: 84750,
  },
];

function InventoryOrdersPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredOrders = demoPurchaseOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      sent: { color: "bg-blue-100 text-blue-800", label: "Sent" },
      confirmed: { color: "bg-yellow-100 text-yellow-800", label: "Confirmed" },
      shipped: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-green-100 text-green-800", label: "Low" },
      medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { color: "bg-orange-100 text-orange-800", label: "High" },
      urgent: { color: "bg-red-100 text-red-800", label: "Urgent" },
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="w-4 h-4" />;
      case "sent":
        return <ArrowRight className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Calculate summary statistics
  const totalOrders = demoPurchaseOrders.length;
  const pendingOrders = demoPurchaseOrders.filter((o) =>
    ["sent", "confirmed", "shipped"].includes(o.status)
  ).length;
  const totalValue = demoPurchaseOrders.reduce(
    (sum, o) => sum + o.grandTotal,
    0
  );
  const urgentOrders = demoPurchaseOrders.filter(
    (o) => o.priority === "urgent"
  ).length;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Purchase Orders
          </h1>
          <p className="text-gray-600">
            Manage inventory procurement and purchase orders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order for inventory procurement
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Paper Excellence Ltd</SelectItem>
                        <SelectItem value="2">Ink Solutions Pvt Ltd</SelectItem>
                        <SelectItem value="3">Modern Machinery Co</SelectItem>
                        <SelectItem value="4">
                          Finishing Touch Supplies
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                    <Input id="expectedDelivery" type="date" />
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
                <div>
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Textarea
                    id="shippingAddress"
                    placeholder="Enter shipping address"
                  />
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Order Items</Label>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <Label htmlFor="item1">Item</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paper">
                              A4 Paper Premium
                            </SelectItem>
                            <SelectItem value="ink">
                              Black Ink Cartridge
                            </SelectItem>
                            <SelectItem value="lamination">
                              Lamination Film
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity1">Quantity</Label>
                        <Input id="quantity1" type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label htmlFor="unitPrice1">Unit Price (₹)</Label>
                        <Input
                          id="unitPrice1"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="total1">Total (₹)</Label>
                        <Input
                          id="total1"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          readOnly
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="button" variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="subtotal">Subtotal (₹)</Label>
                    <Input
                      id="subtotal"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount (₹)</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax">Tax (₹)</Label>
                    <Input
                      id="tax"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or instructions..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save as Draft</Button>
                <Button>Create & Send</Button>
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
                  Total Orders
                </p>
                <p className="text-3xl font-bold">{totalOrders}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {pendingOrders}
                </p>
                <p className="text-xs text-yellow-600">In progress</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
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
                <p className="text-xs text-gray-500">Order value</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Urgent Orders
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {urgentOrders}
                </p>
                <p className="text-xs text-red-600">Require attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Complete list of all purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {order.items.length} items
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {order.supplierName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>
                            {new Date(
                              order.expectedDelivery
                            ).toLocaleDateString()}
                          </p>
                          {order.actualDelivery && (
                            <p className="text-sm text-green-600">
                              Delivered:{" "}
                              {new Date(
                                order.actualDelivery
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            ₹{order.grandTotal.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.paymentTerms}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === "draft" && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
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

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>
                Orders that are sent, confirmed, or shipped
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoPurchaseOrders
                  .filter((order) =>
                    ["sent", "confirmed", "shipped"].includes(order.status)
                  )
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{order.orderNumber}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{order.supplierName}</span>
                            <span>•</span>
                            <span>{order.items.length} items</span>
                            <span>•</span>
                            <span>
                              Expected:{" "}
                              {new Date(
                                order.expectedDelivery
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusBadge(order.status)}
                          {getPriorityBadge(order.priority)}
                        </div>
                        <div className="font-medium text-lg">
                          ₹{order.grandTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipped" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipped Orders</CardTitle>
              <CardDescription>
                Orders that are currently in transit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoPurchaseOrders
                  .filter((order) => order.status === "shipped")
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-purple-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Truck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{order.orderNumber}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{order.supplierName}</span>
                            <span>•</span>
                            <span>
                              Shipped:{" "}
                              {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>
                              ETA:{" "}
                              {new Date(
                                order.expectedDelivery
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-purple-100 text-purple-800 mb-1">
                          In Transit
                        </Badge>
                        <div className="font-medium text-lg">
                          ₹{order.grandTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivered Orders</CardTitle>
              <CardDescription>Successfully completed orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoPurchaseOrders
                  .filter((order) => order.status === "delivered")
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{order.orderNumber}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{order.supplierName}</span>
                            <span>•</span>
                            <span>
                              Delivered:{" "}
                              {order.actualDelivery &&
                                new Date(
                                  order.actualDelivery
                                ).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="text-green-600">On time</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 mb-1">
                          Completed
                        </Badge>
                        <div className="font-medium text-lg">
                          ₹{order.grandTotal.toLocaleString()}
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
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of orders by current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    demoPurchaseOrders.reduce(
                      (acc, order) => {
                        acc[order.status] = (acc[order.status] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  ).map(([status, count]) => {
                    const percentage = (count / totalOrders) * 100;
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status)}
                          <span className="capitalize font-medium">
                            {status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm">{count} orders</span>
                          <span className="text-sm text-gray-500">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers by Orders</CardTitle>
                <CardDescription>
                  Most frequent suppliers by order count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    demoPurchaseOrders.reduce(
                      (acc, order) => {
                        acc[order.supplierName] =
                          (acc[order.supplierName] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  )
                    .sort(([, a], [, b]) => b - a)
                    .map(([supplier, count], index) => (
                      <div
                        key={supplier}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium">{supplier}</span>
                        </div>
                        <Badge variant="outline">{count} orders</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function InventoryOrdersPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <InventoryOrdersPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
