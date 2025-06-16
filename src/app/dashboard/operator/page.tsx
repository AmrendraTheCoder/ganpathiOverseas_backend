"use client";

import React from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Play,
  Pause,
  Square,
  Calendar,
  FileText,
  Timer,
  Target,
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
import { Progress } from "@/components/ui/progress";
import {
  getDashboardStats,
  demoJobSheets,
  demoJobProgress,
  demoMachines,
  getUserById,
  getMachineById,
  getPartyById,
  getJobProgressByJobId,
} from "@/data/demo-data";

const OperatorDashboard = () => {
  const currentUserId = "4"; // Current operator ID
  const stats = getDashboardStats("operator");

  const myJobs = demoJobSheets.filter(
    (job) => job.assignedTo === currentUserId
  );
  const todaysJobs = myJobs.filter(
    (job) =>
      job.startedAt &&
      new Date(job.startedAt).toDateString() === new Date().toDateString()
  );

  const myMachine = demoMachines.find(
    (machine) => machine.operatorId === currentUserId
  );
  const activeJob = myJobs.find((job) => job.status === "in_progress");

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      1: "bg-red-100 text-red-800",
      2: "bg-yellow-100 text-yellow-800",
      3: "bg-green-100 text-green-800",
    };
    const labels = { 1: "High", 2: "Medium", 3: "Low" };
    return {
      color:
        colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800",
      label: labels[priority as keyof typeof labels] || "Normal",
    };
  };

  const getJobProgress = (jobId: string) => {
    const progressSteps = getJobProgressByJobId(jobId);
    const totalSteps = 4;
    const completedSteps = progressSteps.filter(
      (p) => p.status === "completed"
    ).length;
    return (completedSteps / totalSteps) * 100;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    color = "blue",
  }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Operator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your assigned jobs and production tasks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" size="sm">
            <Timer className="mr-2 h-4 w-4" />
            Time Log
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Jobs"
          value={stats.assignedJobs}
          icon={ClipboardList}
          description="Total jobs assigned"
          color="blue"
        />
        <StatCard
          title="Completed Jobs"
          value={stats.completedJobs}
          icon={CheckCircle}
          description="Successfully finished"
          color="green"
        />
        <StatCard
          title="Jobs Today"
          value={stats.jobsToday}
          icon={Calendar}
          description="Scheduled for today"
          color="orange"
        />
        <StatCard
          title="Pending Jobs"
          value={stats.pendingJobs}
          icon={Clock}
          description="Waiting to start"
          color="yellow"
        />
      </div>

      {/* Current Machine Status */}
      {myMachine && (
        <Card>
          <CardHeader>
            <CardTitle>My Machine Status</CardTitle>
            <CardDescription>
              Current machine assignment and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{myMachine.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {myMachine.model} • {myMachine.type}
                  </p>
                  {activeJob && (
                    <p className="text-sm text-green-600 font-medium">
                      Currently running: {activeJob.title}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={activeJob ? "default" : "secondary"}>
                  {activeJob ? "Active" : "Idle"}
                </Badge>
                <Badge variant="outline">₹{myMachine.hourlyRate}/hr</Badge>
              </div>
            </div>
            {myMachine.maintenanceDate && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Next maintenance:{" "}
                  {new Date(myMachine.maintenanceDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Assigned Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>My Assigned Jobs</CardTitle>
            <CardDescription>Jobs currently assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myJobs.slice(0, 5).map((job) => {
                const progress = getJobProgress(job.id);
                const priority = getPriorityBadge(job.priority);
                const party = getPartyById(job.partyId);

                return (
                  <div
                    key={job.id}
                    className="space-y-3 border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{job.title}</p>
                          <Badge className={getStatusBadge(job.status)}>
                            {job.status.replace("_", " ")}
                          </Badge>
                          <Badge className={priority.color}>
                            {priority.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {job.jobNumber} • {party?.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {job.status === "pending" && (
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {job.status === "in_progress" && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Square className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Due:{" "}
                        {job.dueDate
                          ? new Date(job.dueDate).toLocaleDateString()
                          : "TBD"}
                      </span>
                      <span>Qty: {job.quantity}</span>
                    </div>
                    {job.specialInstructions && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md">
                        <p className="text-xs text-blue-800">
                          <strong>Instructions:</strong>{" "}
                          {job.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All My Jobs
            </Button>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>Jobs scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysJobs.length > 0 ? (
                todaysJobs.map((job) => {
                  const party = getPartyById(job.partyId);
                  const progressSteps = getJobProgressByJobId(job.id);
                  const currentStep = progressSteps.find(
                    (p) => p.status === "in_progress"
                  );

                  return (
                    <div key={job.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {party?.name} • {job.quantity} pieces
                          </p>
                        </div>
                        <Badge className={getStatusBadge(job.status)}>
                          {job.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {currentStep && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-xs text-blue-800">
                            <strong>Current Stage:</strong> {currentStep.stage}
                          </p>
                          <p className="text-xs text-blue-600">
                            Time spent:{" "}
                            {formatTime(currentStep.timeSpentMinutes)}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {job.startedAt
                            ? `Started: ${new Date(job.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : "Not started"}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Timer className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm">No jobs scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Job Details */}
      {activeJob && (
        <Card>
          <CardHeader>
            <CardTitle>Current Active Job</CardTitle>
            <CardDescription>Job currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{activeJob.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeJob.jobNumber}
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Client:</span>
                    <span className="text-sm font-medium">
                      {getPartyById(activeJob.partyId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quantity:</span>
                    <span className="text-sm font-medium">
                      {activeJob.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Paper Type:</span>
                    <span className="text-sm font-medium">
                      {activeJob.paperType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Size:</span>
                    <span className="text-sm font-medium">
                      {activeJob.size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Colors:</span>
                    <span className="text-sm font-medium">
                      {activeJob.colors}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Progress Tracking
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(getJobProgress(activeJob.id))}%</span>
                    </div>
                    <Progress
                      value={getJobProgress(activeJob.id)}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Job
                  </Button>
                  <Button variant="outline" size="sm">
                    <Target className="mr-2 h-4 w-4" />
                    Update Progress
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Production Summary</CardTitle>
          <CardDescription>
            Your production statistics and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">8.5</div>
              <p className="text-sm text-muted-foreground">Hours Today</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <p className="text-sm text-muted-foreground">Quality Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1.2K</div>
              <p className="text-sm text-muted-foreground">Units Produced</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">5</div>
              <p className="text-sm text-muted-foreground">Jobs This Week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used operator functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Play className="h-6 w-6" />
              <span className="text-xs">Start Job</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span className="text-xs">Update Progress</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Timer className="h-6 w-6" />
              <span className="text-xs">Log Time</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <AlertCircle className="h-6 w-6" />
              <span className="text-xs">Report Issue</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-xs">Mark Complete</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorDashboard;
