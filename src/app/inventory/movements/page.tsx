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
  Download,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reason: string;
  jobId?: string;
  supplierId?: string;
  supplierName?: string;
  date: string;
  performedBy: string;
  notes?: string;
  previousStock: number;
  newStock: number;
  reference?: string;
}

const demoMovements: StockMovement[] = [
  {
    id: "1",
    itemId: "1",
    itemName: "A4 Paper Premium",
    type: "in",
    quantity: 5000,
    unitCost: 0.5,
    totalCost: 2500,
    reason: "Purchase Order",
    supplierId: "1",
    supplierName: "Paper Suppliers Ltd",
    date: "2024-01-15",
    performedBy: "Amit Sharma",
    notes: "Monthly stock replenishment",
    previousStock: 2000,
    newStock: 7000,
    reference: "PO-2024-001",
  },
  {
    id: "2",
    itemId: "2",
    itemName: "Black Ink Cartridge",
    type: "out",
    quantity: 50,
    reason: "Production Use",
    jobId: "JOB-001",
    date: "2024-01-14",
    performedBy: "Priya Singh",
    notes: "Used for business card printing",
    previousStock: 200,
    newStock: 150,
    reference: "JOB-001",
  },
  {
    id: "3",
    itemId: "3",
    itemName: "Cyan Ink",
    type: "adjustment",
    quantity: -10,
    reason: "Stock Correction",
    date: "2024-01-13",
    performedBy: "Rajesh Kumar",
    notes: "Physical count discrepancy correction",
    previousStock: 110,
    newStock: 100,
    reference: "ADJ-001",
  },
  {
    id: "4",
    itemId: "4",
    itemName: "Lamination Film",
    type: "in",
    quantity: 100,
    unitCost: 25.0,
    totalCost: 2500,
    reason: "Purchase Order",
    supplierId: "2",
    supplierName: "Film Solutions",
    date: "2024-01-12",
    performedBy: "Amit Sharma",
    notes: "Emergency stock purchase",
    previousStock: 25,
    newStock: 125,
    reference: "PO-2024-002",
  },
  {
    id: "5",
    itemId: "5",
    itemName: "Binding Wire",
    type: "out",
    quantity: 200,
    reason: "Production Use",
    jobId: "JOB-002",
    date: "2024-01-11",
    performedBy: "Suresh Patel",
    notes: "Used for manual binding job",
    previousStock: 1000,
    newStock: 800,
    reference: "JOB-002",
  },
];

function InventoryMovementsPageContent() {
  const [selectedTab, setSelectedTab] = useState("movements");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("month");

  const filteredMovements = demoMovements.filter((movement) => {
    const matchesSearch =
      movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || movement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case "out":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case "adjustment":
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const config = {
      in: { color: "bg-green-100 text-green-800", label: "Stock In" },
      out: { color: "bg-red-100 text-red-800", label: "Stock Out" },
      adjustment: { color: "bg-blue-100 text-blue-800", label: "Adjustment" },
    };
    const { color, label } = config[type as keyof typeof config];
    return (
      <Badge className={color}>
        {getMovementIcon(type)}
        <span className="ml-1">{label}</span>
      </Badge>
    );
  };

  // Calculate summary statistics
  const totalIn = demoMovements
    .filter((m) => m.type === "in")
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalOut = demoMovements
    .filter((m) => m.type === "out")
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalValue = demoMovements
    .filter((m) => m.totalCost)
    .reduce((sum, m) => sum + (m.totalCost || 0), 0);

  const adjustments = demoMovements.filter(
    (m) => m.type === "adjustment"
  ).length;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory Movements
          </h1>
          <p className="text-gray-600">
            Track all inventory transactions and stock movements
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record Movement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record Inventory Movement</DialogTitle>
                <DialogDescription>
                  Add a new inventory movement transaction
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item">Item</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">A4 Paper Premium</SelectItem>
                        <SelectItem value="2">Black Ink Cartridge</SelectItem>
                        <SelectItem value="3">Cyan Ink</SelectItem>
                        <SelectItem value="4">Lamination Film</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Movement Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Stock In</SelectItem>
                        <SelectItem value="out">Stock Out</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Unit Cost (₹)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="total">Total Cost (₹)</Label>
                    <Input
                      id="total"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase Order</SelectItem>
                        <SelectItem value="production">
                          Production Use
                        </SelectItem>
                        <SelectItem value="return">
                          Return to Supplier
                        </SelectItem>
                        <SelectItem value="damage">Damage/Loss</SelectItem>
                        <SelectItem value="adjustment">
                          Stock Adjustment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input id="reference" placeholder="PO/JOB/ADJ number" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Record Movement</Button>
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
                <p className="text-sm font-medium text-gray-600">Stock In</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalIn.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Units received</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Out</p>
                <p className="text-3xl font-bold text-red-600">
                  {totalOut.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Units consumed</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Movement value</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Adjustments</p>
                <p className="text-3xl font-bold text-orange-600">
                  {adjustments}
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="movements">All Movements</TabsTrigger>
          <TabsTrigger value="in">Stock In</TabsTrigger>
          <TabsTrigger value="out">Stock Out</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search movements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Movement Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Movements Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Movements</CardTitle>
              <CardDescription>
                Complete list of all inventory transactions
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
                    <TableHead>Stock Change</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {new Date(movement.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{movement.itemName}</p>
                          {movement.reference && (
                            <p className="text-sm text-gray-500">
                              Ref: {movement.reference}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getMovementBadge(movement.type)}</TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            movement.type === "in"
                              ? "text-green-600"
                              : movement.type === "out"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        >
                          {movement.type === "in"
                            ? "+"
                            : movement.type === "out"
                              ? "-"
                              : "±"}
                          {movement.quantity.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-500">
                            {movement.previousStock.toLocaleString()} →{" "}
                            {movement.newStock.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {movement.totalCost ? (
                          <div>
                            <div className="font-medium">
                              ₹{movement.totalCost.toLocaleString()}
                            </div>
                            {movement.unitCost && (
                              <div className="text-sm text-gray-500">
                                @₹{movement.unitCost.toFixed(2)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{movement.reason}</p>
                          {movement.supplierName && (
                            <p className="text-sm text-gray-500">
                              From: {movement.supplierName}
                            </p>
                          )}
                          {movement.jobId && (
                            <p className="text-sm text-gray-500">
                              Job: {movement.jobId}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {movement.performedBy}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock In Movements</CardTitle>
              <CardDescription>
                Inventory received from suppliers and other sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoMovements
                  .filter((m) => m.type === "in")
                  .map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <ArrowDownRight className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{movement.itemName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              +{movement.quantity.toLocaleString()} units
                            </span>
                            <span>
                              {new Date(movement.date).toLocaleDateString()}
                            </span>
                            {movement.supplierName && (
                              <span>From: {movement.supplierName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {movement.totalCost && (
                          <div className="font-medium text-lg">
                            ₹{movement.totalCost.toLocaleString()}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {movement.unitCost &&
                            `@₹${movement.unitCost.toFixed(2)}/unit`}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="out" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Out Movements</CardTitle>
              <CardDescription>
                Inventory consumed for production and other purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoMovements
                  .filter((m) => m.type === "out")
                  .map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-red-100 rounded-full">
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{movement.itemName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              -{movement.quantity.toLocaleString()} units
                            </span>
                            <span>
                              {new Date(movement.date).toLocaleDateString()}
                            </span>
                            <span>{movement.reason}</span>
                            {movement.jobId && (
                              <span>Job: {movement.jobId}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Stock: {movement.previousStock} → {movement.newStock}
                        </div>
                        <div className="text-sm text-gray-600">
                          By: {movement.performedBy}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Adjustments</CardTitle>
              <CardDescription>
                Inventory corrections and adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoMovements
                  .filter((m) => m.type === "adjustment")
                  .map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <RefreshCw className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{movement.itemName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              {movement.quantity > 0 ? "+" : ""}
                              {movement.quantity.toLocaleString()} units
                            </span>
                            <span>
                              {new Date(movement.date).toLocaleDateString()}
                            </span>
                            <span>{movement.reason}</span>
                          </div>
                          {movement.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              {movement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {movement.previousStock} → {movement.newStock}
                        </div>
                        <div className="text-sm text-gray-600">
                          By: {movement.performedBy}
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
                <CardTitle>Movement Trends</CardTitle>
                <CardDescription>
                  Inventory movement patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-3">
                    <div className="text-center p-4 bg-green-50 rounded">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Stock In</p>
                      <p className="text-2xl font-bold text-green-600">
                        {demoMovements.filter((m) => m.type === "in").length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded">
                      <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Stock Out</p>
                      <p className="text-2xl font-bold text-red-600">
                        {demoMovements.filter((m) => m.type === "out").length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Adjustments</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {adjustments}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Items by Movement</CardTitle>
                <CardDescription>
                  Most frequently moved inventory items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    demoMovements.reduce(
                      (acc, movement) => {
                        acc[movement.itemName] =
                          (acc[movement.itemName] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([itemName, count], index) => (
                      <div
                        key={itemName}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium">{itemName}</span>
                        </div>
                        <Badge variant="outline">{count} movements</Badge>
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

export default function InventoryMovementsPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <InventoryMovementsPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
