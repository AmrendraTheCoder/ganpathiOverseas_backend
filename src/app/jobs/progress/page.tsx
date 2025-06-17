"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Factory,
  CheckCircle,
  AlertCircle,
  Play,
  RefreshCw,
  Pause,
} from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";
import { formatDate } from "@/lib/utils";

interface Job {
  id: number;
  title: string;
  job_number: string;
  quantity: number;
  due_date: string;
  status: string;
  priority: number;
  colors: string;
  paper_type: string;
  paper_size: string;
  parties: {
    name: string;
    phone: string;
    email: string;
  };
  machines: {
    id: number;
    name: string;
    type: string;
    model: string;
  } | null;
}

interface ProgressUpdate {
  jobId: number;
  stage: string;
  percentage: number;
  qualityRating: number;
  notes: string;
}

export default function JobProgress() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Progress form state
  const [progressData, setProgressData] = useState<ProgressUpdate>({
    jobId: 0,
    stage: "",
    percentage: 0,
    qualityRating: 5,
    notes: "",
  });

  // Mock operator ID - in a real app this would come from auth
  const operatorId = "44444444-4444-4444-4444-444444444444";

  const stages = [
    "setup",
    "printing",
    "cutting",
    "finishing",
    "quality_check",
    "packaging",
    "completed",
  ];

  // Real-time data fetching function
  const fetchJobs = useCallback(
    async (showLoadingState = false) => {
      try {
        if (showLoadingState) setLoading(true);

        const response = await fetch(
          `/api/operator/jobs?operatorId=${operatorId}&timestamp=${Date.now()}`
        );
        const data = await response.json();

        if (response.ok) {
          setJobs(data.jobs || []);
          setError(null);
          setLastUpdated(new Date());
        } else {
          setError(data.error || "Failed to fetch jobs");
        }
      } catch (err) {
        setError("Network error occurred");
      } finally {
        if (showLoadingState) setLoading(false);
      }
    },
    [operatorId]
  );

  // Initial fetch
  useEffect(() => {
    fetchJobs(true);
  }, [fetchJobs]);

  // Real-time updates every 60 seconds (further increased to reduce load)
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      fetchJobs(false); // Don't show loading state for real-time updates
    }, 60000); // 60 seconds - more conservative interval

    return () => clearInterval(interval);
  }, [fetchJobs, isRealTimeEnabled]);

  const selectJob = (job: Job) => {
    setSelectedJob(job);
    setProgressData({
      jobId: job.id,
      stage: job.status === "in_progress" ? "printing" : "setup",
      percentage:
        job.status === "completed"
          ? 100
          : job.status === "in_progress"
            ? 50
            : 0,
      qualityRating: 5,
      notes: "",
    });
    setShowUpdateModal(true);
  };

  const updateProgress = async () => {
    if (!selectedJob) return;

    try {
      setUpdating(true);

      // If progress is 100%, complete the job
      if (progressData.percentage === 100) {
        const response = await fetch("/api/operator/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: selectedJob.id,
            operatorId,
            action: "complete_job",
          }),
        });

        if (response.ok) {
          await fetchJobs(false);
          setSelectedJob(null);
          setShowUpdateModal(false);
        }
      } else {
        // Start job if it's pending
        if (selectedJob.status === "pending") {
          await fetch("/api/operator/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobId: selectedJob.id,
              operatorId,
              action: "start_job",
            }),
          });
        }

        // In a real app, you'd have a separate API for progress updates
        // For now, we'll just refresh the jobs
        await fetchJobs(false);
        setShowUpdateModal(false);
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Enhanced color schemes for different job purposes/statuses
  const getJobCardTheme = (job: Job) => {
    const isPriority = job.priority >= 3;
    const isUrgent =
      new Date(job.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000); // Due within 24 hours

    switch (job.status) {
      case "pending":
        return {
          cardBg: isPriority
            ? "bg-amber-50 border-amber-200"
            : "bg-blue-50 border-blue-200",
          headerBg: isPriority ? "bg-amber-100" : "bg-blue-100",
          badgeColor: isPriority ? "bg-amber-500" : "bg-blue-500",
          accent: isPriority ? "text-amber-700" : "text-blue-700",
        };
      case "in_progress":
        return {
          cardBg: isUrgent
            ? "bg-orange-50 border-orange-200"
            : "bg-green-50 border-green-200",
          headerBg: isUrgent ? "bg-orange-100" : "bg-green-100",
          badgeColor: isUrgent ? "bg-orange-500" : "bg-green-500",
          accent: isUrgent ? "text-orange-700" : "text-green-700",
        };
      case "completed":
        return {
          cardBg: "bg-emerald-50 border-emerald-200",
          headerBg: "bg-emerald-100",
          badgeColor: "bg-emerald-500",
          accent: "text-emerald-700",
        };
      default:
        return {
          cardBg: "bg-gray-50 border-gray-200",
          headerBg: "bg-gray-100",
          badgeColor: "bg-gray-500",
          accent: "text-gray-700",
        };
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 3)
      return {
        text: "High Priority",
        color: "bg-red-100 text-red-800 border-red-300",
      };
    if (priority >= 2)
      return {
        text: "Medium Priority",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    return {
      text: "Normal Priority",
      color: "bg-green-100 text-green-800 border-green-300",
    };
  };

  const getUrgencyIndicator = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursLeft <= 24 && hoursLeft > 0) {
      return {
        text: "Due Soon",
        color: "bg-red-100 text-red-800 border-red-300",
      };
    }
    if (hoursLeft <= 0) {
      return {
        text: "Overdue",
        color: "bg-red-200 text-red-900 border-red-400",
      };
    }
    return null;
  };

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
  };

  const manualRefresh = () => {
    fetchJobs(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading jobs...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Job Progress Tracking
            </h1>
            <p className="text-gray-600">
              Update progress and manage job completion
            </p>
          </div>

          {/* Real-time controls */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              onClick={manualRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={toggleRealTime}
              variant={isRealTimeEnabled ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isRealTimeEnabled ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRealTimeEnabled ? "Pause" : "Enable"} Real-time
            </Button>
          </div>
        </div>

        {/* Real-time indicator */}
        {isRealTimeEnabled && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">
              Real-time updates enabled
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={() => fetchJobs(false)} className="mt-2" size="sm">
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {/* Jobs List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Jobs ({jobs.length})</h2>
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No jobs assigned to you</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const theme = getJobCardTheme(job);
                const priority = getPriorityBadge(job.priority);
                const urgency = getUrgencyIndicator(job.due_date);

                return (
                  <Card
                    key={job.id}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${theme.cardBg}`}
                  >
                    <CardHeader
                      className={`pb-3 ${theme.headerBg} rounded-t-lg`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className={`text-base ${theme.accent}`}>
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-sm font-medium">
                            Job #{job.job_number}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge
                            className={`${theme.badgeColor} text-white text-xs`}
                          >
                            {job.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      {/* Priority and urgency indicators */}
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs ${priority.color}`}
                        >
                          {priority.text}
                        </Badge>
                        {urgency && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${urgency.color}`}
                          >
                            {urgency.text}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className={`font-medium ${theme.accent}`}>
                            {job.quantity.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Due Date:</span>
                          <p className={`font-medium ${theme.accent}`}>
                            {formatDate(job.due_date)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Client:</span>
                          <p className={`font-medium ${theme.accent}`}>
                            {job.parties.name}
                          </p>
                        </div>

                        {job.machines && (
                          <div className="text-sm">
                            <span className="text-gray-500">Machine:</span>
                            <p
                              className={`font-medium flex items-center ${theme.accent}`}
                            >
                              <Factory className="h-4 w-4 mr-1" />
                              {job.machines.name}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Specifications:</span>
                          <p className="text-xs text-gray-600">
                            {job.colors} • {job.paper_type} • {job.paper_size}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={() => selectJob(job)}
                          className={`w-full ${theme.badgeColor} hover:opacity-90`}
                          variant={
                            job.status === "pending" ? "default" : "outline"
                          }
                        >
                          {job.status === "pending" && (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          {job.status === "completed" && (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {job.status === "in_progress" && (
                            <Clock className="h-4 w-4 mr-2" />
                          )}

                          {job.status === "pending"
                            ? "Start Job"
                            : job.status === "completed"
                              ? "View Details"
                              : "Update Progress"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Progress Update Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Job Progress</DialogTitle>
            <DialogDescription>
              {selectedJob &&
                `Update progress for ${selectedJob.title} (Job #${selectedJob.job_number})`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Current Stage</Label>
              <Select
                value={progressData.stage}
                onValueChange={(value) =>
                  setProgressData({ ...progressData, stage: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage">Progress Percentage</Label>
              <div className="space-y-2">
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={progressData.percentage}
                  onChange={(e) =>
                    setProgressData({
                      ...progressData,
                      percentage: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter percentage (0-100)"
                />
                <Progress value={progressData.percentage} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Quality Rating (1-10)</Label>
              <Input
                id="quality"
                type="number"
                min="1"
                max="10"
                value={progressData.qualityRating}
                onChange={(e) =>
                  setProgressData({
                    ...progressData,
                    qualityRating: parseInt(e.target.value) || 5,
                  })
                }
                placeholder="Quality rating"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Progress Notes</Label>
              <Textarea
                id="notes"
                value={progressData.notes}
                onChange={(e) =>
                  setProgressData({ ...progressData, notes: e.target.value })
                }
                placeholder="Add any notes about the progress..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={updateProgress}
                disabled={updating}
                className="flex-1"
              >
                {updating
                  ? "Updating..."
                  : progressData.percentage === 100
                    ? "Complete Job"
                    : "Update Progress"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpdateModal(false)}
                disabled={updating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
