"use client";

import { useState, useEffect } from "react";
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
import { Clock, Factory, CheckCircle, AlertCircle, Play } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

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

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/operator/jobs?operatorId=${operatorId}`
      );
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch jobs");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

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
          await fetchJobs();
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
        await fetchJobs();
        setShowUpdateModal(false);
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Job Progress Tracking
        </h1>
        <p className="text-gray-600">
          Update progress and manage job completion
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchJobs} className="mt-2" size="sm">
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {/* Jobs List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Jobs</h2>
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
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{job.title}</CardTitle>
                        <CardDescription className="text-sm">
                          Job #{job.job_number}
                        </CardDescription>
                      </div>
                      <Badge
                        className={`${getStatusColor(job.status)} text-white`}
                      >
                        {job.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">
                          {job.quantity.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-medium">
                          {new Date(job.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Client:</span>
                        <p className="font-medium">{job.parties.name}</p>
                      </div>

                      {job.machines && (
                        <div className="text-sm">
                          <span className="text-gray-500">Machine:</span>
                          <p className="font-medium flex items-center">
                            <Factory className="h-4 w-4 mr-1" />
                            {job.machines.name}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Specifications:</span>
                        <p className="text-xs">
                          {job.colors} • {job.paper_type} • {job.paper_size}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => selectJob(job)}
                        className="w-full"
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
              ))}
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