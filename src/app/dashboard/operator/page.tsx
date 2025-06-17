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
import {
  Clock,
  Settings,
  Play,
  Pause,
  CheckCircle,
  FileText,
  Factory,
} from "lucide-react";

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

export default function OperatorDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock operator ID - in a real app this would come from auth
  const operatorId = "44444444-4444-4444-4444-444444444444";

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

  const handleJobAction = async (jobId: number, action: string) => {
    try {
      const response = await fetch("/api/operator/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          operatorId,
          action,
          data: { machineId: jobs.find((j) => j.id === jobId)?.machines?.id },
        }),
      });

      if (response.ok) {
        fetchJobs(); // Refresh jobs list
      }
    } catch (err) {
      console.error("Action failed:", err);
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

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return "bg-red-500";
    if (priority >= 2) return "bg-orange-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Operator Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your assigned jobs and track progress
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter((job) => job.status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter((job) => job.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Waiting to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Machines</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                Array.from(
                  new Set(jobs.map((job) => job.machines?.name).filter(Boolean))
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Assigned machines</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">My Assigned Jobs</h2>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                No jobs assigned to you at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {job.title}
                      <Badge
                        className={`${getStatusColor(job.status)} text-white text-xs`}
                      >
                        {job.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        className={`${getPriorityColor(job.priority)} text-white text-xs`}
                      >
                        Priority {job.priority}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Job #{job.job_number} • Due:{" "}
                      {new Date(job.due_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {job.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleJobAction(job.id, "start_job")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {job.status === "in_progress" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJobAction(job.id, "pause_job")}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleJobAction(job.id, "complete_job")
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">
                      Client
                    </h4>
                    <p className="text-sm">{job.parties.name}</p>
                    <p className="text-xs text-gray-500">{job.parties.phone}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">
                      Specifications
                    </h4>
                    <p className="text-sm">
                      Quantity: {job.quantity.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {job.colors} • {job.paper_size}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">
                      Paper
                    </h4>
                    <p className="text-sm">{job.paper_type}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">
                      Machine
                    </h4>
                    {job.machines ? (
                      <div>
                        <p className="text-sm">{job.machines.name}</p>
                        <p className="text-xs text-gray-500">
                          {job.machines.model}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
