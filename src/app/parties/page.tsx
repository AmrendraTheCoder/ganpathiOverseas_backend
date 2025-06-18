"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  DollarSign,
  User,
  Download,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  demoParties,
  demoJobSheets,
  demoTransactions,
  getJobsByPartyId,
  getTransactionsByPartyId,
  Party,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import DatabaseConnectionStatus from "@/components/DatabaseConnectionStatus";

const PartiesPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredParties = demoParties.filter(
    (party) =>
      party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const getPartyStats = (partyId: string) => {
    const jobs = getJobsByPartyId(partyId);
    const transactions = getTransactionsByPartyId(partyId);

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) =>
        ["pending", "in_progress"].includes(j.status)
      ).length,
      totalOrders: transactions
        .filter((t) => t.type === "invoice")
        .reduce((sum, t) => sum + t.amount, 0),
      pendingPayments: transactions.filter(
        (t) => t.type === "invoice" && t.status === "pending"
      ).length,
    };
  };

  const PartyCard = ({ party }: { party: Party }) => {
    const stats = getPartyStats(party.id);
    const utilizationPercent = (party.currentBalance / party.creditLimit) * 100;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Building className="w-5 h-5 mr-2" />
                {party.name}
              </CardTitle>
              <CardDescription>
                {party.contactPerson && (
                  <span className="flex items-center mr-4">
                    <User className="w-4 h-4 mr-1" />
                    {party.contactPerson}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={party.isActive ? "default" : "secondary"}>
                {party.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant={utilizationPercent > 80 ? "destructive" : "outline"}
              >
                {utilizationPercent.toFixed(0)}% Credit Used
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <div className="space-y-1">
                {party.phone && (
                  <p className="text-sm flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {party.phone}
                  </p>
                )}
                {party.email && (
                  <p className="text-sm flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {party.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-sm flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {party.city}, {party.state}
              </p>
              {party.gstNumber && (
                <p className="text-xs text-muted-foreground">
                  GST: {party.gstNumber}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Financial</p>
              <div className="space-y-1">
                <p className="text-sm">
                  Balance: {formatCurrency(party.currentBalance)}
                </p>
                <p className="text-sm">
                  Limit: {formatCurrency(party.creditLimit)}
                </p>
                <p className="text-xs text-green-600">
                  Available:{" "}
                  {formatCurrency(party.creditLimit - party.currentBalance)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Activity</p>
              <div className="space-y-1">
                <p className="text-sm">{stats.totalJobs} Total Jobs</p>
                <p className="text-sm">{stats.activeJobs} Active Jobs</p>
                <p className="text-sm">
                  {stats.pendingPayments} Pending Payments
                </p>
              </div>
            </div>
          </div>

          {party.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Notes:</p>
              <p className="text-sm">{party.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Member since {new Date(party.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Parties Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer accounts and relationships
          </p>
          <div className="mt-2">
            <DatabaseConnectionStatus variant="compact" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Party
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoParties.length}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Parties
            </CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demoParties.filter((p) => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Credit Limit
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {(
                demoParties.reduce((sum, p) => sum + p.creditLimit, 0) / 1000
              ).toFixed(0)}
              K
            </div>
            <p className="text-xs text-muted-foreground">
              Total credit extended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {(
                demoParties.reduce((sum, p) => sum + p.currentBalance, 0) / 1000
              ).toFixed(0)}
              K
            </div>
            <p className="text-xs text-muted-foreground">Total receivables</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parties by name, contact, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Parties List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Parties ({filteredParties.length})
          </h2>
        </div>

        <div className="grid gap-4">
          {filteredParties.length > 0 ? (
            filteredParties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No parties found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No parties match your search criteria. Try adjusting your
                  search or add a new party.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Party
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Credit Utilization Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Utilization Overview</CardTitle>
          <CardDescription>
            Monitor party credit limits and utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoParties.map((party) => {
              const utilizationPercent =
                (party.currentBalance / party.creditLimit) * 100;
              const isHighUtilization = utilizationPercent > 80;

              return (
                <div
                  key={party.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{party.name}</h4>
                      <Badge
                        variant={isHighUtilization ? "destructive" : "outline"}
                      >
                        {utilizationPercent.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Current Balance:{" "}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(party.currentBalance)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Credit Limit:{" "}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(party.creditLimit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Available:{" "}
                        </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(
                            party.creditLimit - party.currentBalance
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Parties Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Parties Table View</CardTitle>
          <CardDescription>
            Detailed tabular view of all parties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Party Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Credit Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParties.map((party) => {
                const utilizationPercent =
                  (party.currentBalance / party.creditLimit) * 100;

                return (
                  <TableRow key={party.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{party.name}</p>
                        {party.gstNumber && (
                          <p className="text-sm text-muted-foreground">
                            GST: {party.gstNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {party.contactPerson && (
                          <p className="font-medium">{party.contactPerson}</p>
                        )}
                        {party.phone && (
                          <p className="text-sm text-muted-foreground">
                            {party.phone}
                          </p>
                        )}
                        {party.email && (
                          <p className="text-sm text-muted-foreground">
                            {party.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>
                          {party.city}, {party.state}
                        </p>
                        {party.postalCode && (
                          <p className="text-sm text-muted-foreground">
                            {party.postalCode}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          Balance: {formatCurrency(party.currentBalance)}
                        </p>
                        <p className="text-sm">
                          Limit: {formatCurrency(party.creditLimit)}
                        </p>
                        <Badge
                          variant={
                            utilizationPercent > 80
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {utilizationPercent.toFixed(0)}% used
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={party.isActive ? "default" : "secondary"}>
                        {party.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PartiesPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor", "finance"]}>
        <PartiesPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
