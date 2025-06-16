"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  Plus,
  ArrowLeft,
  FileText,
  Building2,
  Settings,
  Calculator,
  Package,
  Star,
  Clock,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { demoParties, demoMachines } from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

interface JobFormData {
  title: string;
  description: string;
  partyId: string;
  priority: number;
  quantity: number;
  colors: string;
  paperType: string;
  size: string;
  finishingRequirements: string;
  estimatedCost: number;
  sellingPrice: number;
  dueDate: Date | undefined;
  machineId: string;
  specialInstructions: string;
}

function CreateJobPageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    partyId: "",
    priority: 2,
    quantity: 1,
    colors: "",
    paperType: "",
    size: "",
    finishingRequirements: "",
    estimatedCost: 0,
    sellingPrice: 0,
    dueDate: undefined,
    machineId: "",
    specialInstructions: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real implementation, this would call an API
    console.log("Creating job:", formData);

    // Redirect to jobs list
    router.push("/jobs");
  };

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getPriorityLabel = (priority: number) => {
    const labels = {
      1: { label: "Low", color: "bg-gray-100 text-gray-800" },
      2: { label: "Normal", color: "bg-blue-100 text-blue-800" },
      3: { label: "High", color: "bg-orange-100 text-orange-800" },
      4: { label: "Urgent", color: "bg-red-100 text-red-800" },
      5: { label: "Critical", color: "bg-red-200 text-red-900" },
    };
    return labels[priority as keyof typeof labels] || labels[2];
  };

  const selectedParty = demoParties.find((p) => p.id === formData.partyId);
  const selectedMachine = demoMachines.find((m) => m.id === formData.machineId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
            <p className="text-gray-600">Add a new print job to the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Job Information
                </CardTitle>
                <CardDescription>
                  Basic details about the print job
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="e.g., Business Card Printing"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange(
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Detailed description of the job requirements..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority.toString()}
                      onValueChange={(value) =>
                        handleInputChange("priority", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Low Priority</SelectItem>
                        <SelectItem value="2">Normal Priority</SelectItem>
                        <SelectItem value="3">High Priority</SelectItem>
                        <SelectItem value="4">Urgent</SelectItem>
                        <SelectItem value="5">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="mt-2">
                      <Badge
                        className={getPriorityLabel(formData.priority).color}
                      >
                        {getPriorityLabel(formData.priority).label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dueDate
                            ? format(formData.dueDate, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dueDate}
                          onSelect={(date) =>
                            handleInputChange("dueDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Specifications
                </CardTitle>
                <CardDescription>
                  Technical specifications for the print job
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="colors">Colors</Label>
                    <Input
                      id="colors"
                      value={formData.colors}
                      onChange={(e) =>
                        handleInputChange("colors", e.target.value)
                      }
                      placeholder="e.g., 4+0, CMYK"
                    />
                  </div>
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) =>
                        handleInputChange("size", e.target.value)
                      }
                      placeholder="e.g., A4, 90mm x 54mm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paperType">Paper Type</Label>
                    <Input
                      id="paperType"
                      value={formData.paperType}
                      onChange={(e) =>
                        handleInputChange("paperType", e.target.value)
                      }
                      placeholder="e.g., Art Card 300gsm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="finishing">Finishing Requirements</Label>
                    <Input
                      id="finishing"
                      value={formData.finishingRequirements}
                      onChange={(e) =>
                        handleInputChange(
                          "finishingRequirements",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Lamination, UV Coating"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      handleInputChange("specialInstructions", e.target.value)
                    }
                    placeholder="Any special requirements or instructions..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing
                </CardTitle>
                <CardDescription>
                  Cost estimation and pricing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedCost">Estimated Cost (₹)</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.estimatedCost}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedCost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        handleInputChange(
                          "sellingPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                {formData.estimatedCost > 0 && formData.sellingPrice > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Profit Margin:
                      </span>
                      <span className="font-medium">
                        ₹
                        {(
                          formData.sellingPrice - formData.estimatedCost
                        ).toFixed(2)}
                        (
                        {(
                          ((formData.sellingPrice - formData.estimatedCost) /
                            formData.sellingPrice) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Customer
                </CardTitle>
                <CardDescription>
                  Select the customer for this job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    value={formData.partyId}
                    onValueChange={(value) =>
                      handleInputChange("partyId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoParties.map((party) => (
                        <SelectItem key={party.id} value={party.id}>
                          {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedParty && (
                    <div className="p-4 border rounded-lg space-y-2">
                      <h4 className="font-medium">{selectedParty.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedParty.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedParty.phone}
                      </p>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span>Credit Limit:</span>
                        <span>
                          ₹{selectedParty.creditLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current Balance:</span>
                        <span
                          className={
                            selectedParty.currentBalance > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          ₹{selectedParty.currentBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Machine Assignment
                </CardTitle>
                <CardDescription>
                  Assign a machine for production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    value={formData.machineId}
                    onValueChange={(value) =>
                      handleInputChange("machineId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoMachines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedMachine && (
                    <div className="p-4 border rounded-lg space-y-2">
                      <h4 className="font-medium">{selectedMachine.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {selectedMachine.type} Press
                      </p>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span>Hourly Rate:</span>
                        <span>₹{selectedMachine.hourlyRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge
                          variant={
                            selectedMachine.isActive ? "default" : "secondary"
                          }
                        >
                          {selectedMachine.isActive
                            ? "Available"
                            : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Quick Calculations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.quantity > 0 && formData.sellingPrice > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Per Unit Price:</span>
                      <span>
                        ₹
                        {(formData.sellingPrice / formData.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Value:</span>
                      <span className="font-medium">
                        ₹{formData.sellingPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">
                    Estimated Timeline
                  </p>
                  <p className="text-sm font-medium">2-3 business days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.partyId}
          >
            {isSubmitting ? "Creating..." : "Create Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor"]}>
        <CreateJobPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
