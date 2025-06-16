"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Eye,
  FileText,
  User,
  Building2,
} from "lucide-react";
import { useState } from "react";
import {
  demoJobSheets,
  demoJobProgress,
  getUserById,
  getPartyById,
  getMachineById,
  type JobProgress,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";

function JobProgressPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const jobProgressMap = new Map<string, JobProgress[]>();
  demoJobProgress.forEach((progress) => {
    if (!jobProgressMap.has(progress.jobId)) {
      jobProgressMap.set(progress.jobId, []);
    }
    jobProgressMap.get(progress.jobId)!.push(progress);
  });

  const getJobProgress = (jobId: string) => {
    const progressSteps = jobProgressMap.get(jobId) || [];
    const stages = ["design", "prepress", "printing", "finishing"];
    const completedSteps = progressSteps.filter(
      (p) => p.status === "completed"
    ).length;
    const totalSteps = stages.length;
    return (completedSteps / totalSteps) * 100;
  };

  const getCurrentStage = (jobId: string) => {
    const progressSteps = jobProgressMap.get(jobId) || [];
    const inProgressStep = progressSteps.find(
      (p) => p.status === "in_progress"
    );
    const lastCompletedStep = progressSteps
      .filter((p) => p.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.startedAt).getTime() -
          new Date(a.completedAt || a.startedAt).getTime()
      )[0];

    return inProgressStep?.stage || lastCompletedStep?.stage || "pending";
  };

  const getStageIcon = (stage: string) => {
    const icons = {
      design: FileText,
      prepress: Clock,
      printing: Play,
      finishing: CheckCircle,
      completed: CheckCircle,
      pending: AlertTriangle,
    };
    return icons[stage as keyof typeof icons] || AlertTriangle;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    );
  };

  const getPriorityBadge = (priority: number) => {
    const labels = {
      1: { label: "Low", color: "bg-gray-100 text-gray-800" },
      2: { label: "Normal", color: "bg-blue-100 text-blue-800" },
      3: { label: "High", color: "bg-orange-100 text-orange-800" },
      4: { label: "Urgent", color: "bg-red-100 text-red-800" },
      5: { label: "Critical", color: "bg-red-200 text-red-900" },
    };
    return labels[priority as keyof typeof labels] || labels[2];
  };

  const filteredJobs = demoJobSheets.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || job.priority.toString() === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Job Progress Tracking
          </h1>
          <p className="text-gray-600">
            Monitor the progress of all print jobs
          </p>
        </div>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule View
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Search Jobs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by job title or number..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="1">Low</SelectItem>
                  <SelectItem value="2">Normal</SelectItem>
                  <SelectItem value="3">High</SelectItem>
                  <SelectItem value="4">Urgent</SelectItem>
                  <SelectItem value="5">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid gap-6">
        {filteredJobs.map((job) => {
          const progress = getJobProgress(job.id);
          const currentStage = getCurrentStage(job.id);
          const priority = getPriorityBadge(job.priority);
          const party = getPartyById(job.partyId);
          const assignedUser = getUserById(job.assignedTo || "");
          const StageIcon = getStageIcon(currentStage);
          const progressSteps = jobProgressMap.get(job.id) || [];

          return (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{job.title}</span>
                        <Badge className={getStatusBadge(job.status)}>
                          {job.status.replace("_", " ")}
                        </Badge>
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {job.jobNumber}
                        </span>
                        <span className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {party?.name}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {assignedUser?.name || "Unassigned"}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">Progress</div>
                      <div className="text-lg font-bold">
                        {progress.toFixed(0)}%
                      </div>
                    </div>
                    <StageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{progress.toFixed(0)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Stage Progress */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {["design", "prepress", "printing", "finishing"].map(
                      (stage, index) => {
                        const stageProgress = progressSteps.find(
                          (p) => p.stage === stage
                        );
                        const isCompleted =
                          stageProgress?.status === "completed";
                        const isInProgress =
                          stageProgress?.status === "in_progress";
                        const isNext =
                          !isCompleted && !isInProgress && index === 0; // First incomplete stage

                        return (
                          <div key={stage} className="text-center">
                            <div
                              className={`w-12 h-12 mx-auto rounded-full border-2 flex items-center justify-center mb-2 ${
                                isCompleted
                                  ? "bg-green-100 border-green-500 text-green-700"
                                  : isInProgress
                                    ? "bg-blue-100 border-blue-500 text-blue-700"
                                    : isNext
                                      ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                                      : "bg-gray-100 border-gray-300 text-gray-500"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : isInProgress ? (
                                <Play className="w-6 h-6" />
                              ) : (
                                <Clock className="w-6 h-6" />
                              )}
                            </div>
                            <div className="text-xs font-medium capitalize">
                              {stage}
                            </div>
                            <div className="text-xs text-gray-500">
                              {isCompleted
                                ? "Completed"
                                : isInProgress
                                  ? "In Progress"
                                  : isNext
                                    ? "Next"
                                    : "Pending"}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Timeline */}
                  {progressSteps.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">
                        Recent Activity
                      </h4>
                      <div className="space-y-2">
                        {progressSteps
                          .sort(
                            (a, b) =>
                              new Date(b.startedAt).getTime() -
                              new Date(a.startedAt).getTime()
                          )
                          .slice(0, 3)
                          .map((step, index) => (
                            <div
                              key={index}
                              className="flex items-center text-sm text-gray-600"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                              <span className="capitalize">{step.stage}</span>
                              <span className="mx-2">•</span>
                              <span className="capitalize">{step.status}</span>
                              <span className="mx-2">•</span>
                              <span>
                                {new Date(step.startedAt).toLocaleDateString()}
                              </span>
                              {step.notes && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="text-gray-500">
                                    {step.notes}
                                  </span>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {job.status === "in_progress" && (
                      <Button size="sm">Update Progress</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function JobProgressPage() {
  return (
    <DashboardPageLayout>
      <RoleBasedAccess allowedRoles={["admin", "supervisor", "operator"]}>
        <JobProgressPageContent />
      </RoleBasedAccess>
    </DashboardPageLayout>
  );
}
