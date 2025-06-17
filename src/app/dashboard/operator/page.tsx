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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle,
  FileText,
  Timer,
  Calendar,
  BarChart3,
  RefreshCw,
  StopCircle,
  PlayCircle,
  Coffee,
  Star,
  TrendingUp,
  Activity,
  ClipboardList,
  Zap,
  AlertCircle,
  Target,
  Award,
  Users,
  Package,
  Eye,
  Play,
  Pause,
} from "lucide-react";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import { formatDate, formatTime } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  title: string;
  job_number: string;
  quantity: number;
  due_date: string;
  status: string;
  priority: number;
  colors: string;
  paper_type: string;
  selling_price: number;
  parties: { name: string; phone: string; email: string; address: string };
  machines: {
    id: string;
    name: string;
    type: string;
    model: string;
  } | null;
  started_at?: string;
  completed_at?: string;
  description: string;
  assigned_to: string;
  machine_id: string;
}

interface TimeLog {
  id: string;
  job_id: string;
  operator_id: string;
  machine_id?: string;
  started_at: string;
  ended_at?: string;
  break_time_minutes: number;
  notes?: string;
  productivity_score?: number;
  job_sheets: {
    id: string;
    job_number: string;
    title: string;
    status: string;
  };
  machines?: {
    id: string;
    name: string;
    type: string;
    model: string;
  };
}

const OperatorDashboardContent = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Modal states
  const [showStartJobModal, setShowStartJobModal] = useState(false);
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form states
  const [startJobNotes, setStartJobNotes] = useState("");
  const [clockOutNotes, setClockOutNotes] = useState("");
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [breakNotes, setBreakNotes] = useState("");
  const [productivityScore, setProductivityScore] = useState(5);

  const { toast } = useToast();

  // Mock operator ID - in production, this would come from authentication
  const operatorId = "44444444-4444-4444-4444-444444444444";

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data only once on mount and when operatorId changes
  useEffect(() => {
    if (operatorId) {
      fetchData();
    }
  }, [operatorId]);

  // Set up periodic refresh only if not loading and data is successfully fetched
  useEffect(() => {
    if (!loading && jobs.length >= 0) {
      const interval = setInterval(() => {
        fetchData();
      }, 60000); // Reduced to every 60 seconds instead of 30
      return () => clearInterval(interval);
    }
  }, [loading, jobs.length]);

  const fetchData = async () => {
    if (!operatorId) return;

    try {
      await Promise.all([fetchJobs(), fetchTimeLogs()]);
    } catch (error) {
      console.error("Error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(
        `/api/operator/jobs?operatorId=${operatorId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs");
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchTimeLogs = async () => {
    try {
      const response = await fetch(
        `/api/operator/time-logs?operatorId=${operatorId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTimeLogs(data.timeLogs || []);

      // Find active job from time logs
      const activeLog = data.timeLogs?.find((log: TimeLog) => !log.ended_at);
      setActiveJobId(activeLog?.job_id || null);
    } catch (err: any) {
      console.error("Error fetching time logs:", err);
    }
  };

  const handleStartJob = async (job: Job) => {
    setSelectedJob(job);
    setShowStartJobModal(true);
  };

  const confirmStartJob = async () => {
    if (!selectedJob) return;

    try {
      setLoading(true);

      // Clock in for the job
      const response = await fetch("/api/operator/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clock_in",
          operatorId,
          jobId: selectedJob.id,
          machineId: selectedJob.machine_id,
          notes: startJobNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "🚀 Job Started!",
          description: `Successfully started working on ${selectedJob.title}`,
        });

        await fetchData();
        setShowStartJobModal(false);
        setStartJobNotes("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start job",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await fetch("/api/operator/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clock_out",
          operatorId,
          jobId: activeJobId,
          notes: clockOutNotes,
          productivityScore,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "⏰ Clocked Out",
          description: "Successfully clocked out of current job",
        });

        await fetchData();
        setShowClockOutModal(false);
        setClockOutNotes("");
        setProductivityScore(5);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to clock out",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCompleteJob = async (job: Job) => {
    try {
      // First clock out if this is the active job
      if (activeJobId === job.id) {
        await fetch("/api/operator/time-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "clock_out",
            operatorId,
            jobId: job.id,
            notes: "Job completed",
            productivityScore: 8,
          }),
        });
      }

      // Then mark job as completed
      const response = await fetch("/api/operator/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_job",
          operatorId,
          jobId: job.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "🎉 Job Completed!",
          description: `Successfully completed ${job.title}`,
        });

        await fetchData();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to complete job",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAddBreak = async () => {
    try {
      const response = await fetch("/api/operator/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_break",
          operatorId,
          jobId: activeJobId,
          breakMinutes,
          notes: breakNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "☕ Break Added",
          description: `Added ${breakMinutes} minute break`,
        });

        await fetchData();
        setShowBreakModal(false);
        setBreakMinutes(15);
        setBreakNotes("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add break",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg";
      case "in_progress":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg";
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-600 font-bold animate-pulse";
    if (priority >= 3) return "text-orange-600 font-semibold";
    return "text-green-600 font-medium";
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getActiveTimeLog = () => {
    return timeLogs.find((log) => !log.ended_at);
  };

  const getTodaysTimeLogs = () => {
    const today = new Date().toDateString();
    return timeLogs.filter(
      (log) => new Date(log.started_at).toDateString() === today
    );
  };

  const calculateTodaysStats = () => {
    const todaysLogs = getTodaysTimeLogs();
    let totalTime = 0;
    let totalBreakTime = 0;
    let completedJobs = 0;

    todaysLogs.forEach((log) => {
      const start = new Date(log.started_at);
      const end = log.ended_at ? new Date(log.ended_at) : new Date();
      const duration = end.getTime() - start.getTime();

      totalTime += duration;
      totalBreakTime += (log.break_time_minutes || 0) * 60 * 1000;

      if (log.ended_at && log.job_sheets?.status === "completed") {
        completedJobs++;
      }
    });

    // Add current active session
    const activeLog = getActiveTimeLog();
    if (activeLog) {
      const start = new Date(activeLog.started_at);
      const activeDuration = new Date().getTime() - start.getTime();
      totalTime += activeDuration;
      totalBreakTime += (activeLog.break_time_minutes || 0) * 60 * 1000;
    }

    const workingTime = totalTime - totalBreakTime;

    return {
      totalTime: Math.floor(totalTime / (1000 * 60 * 60)) || 0,
      workingTime: Math.floor(workingTime / (1000 * 60 * 60)) || 0,
      breakTime: Math.floor(totalBreakTime / (1000 * 60)) || 0,
      completedJobs,
      efficiency:
        workingTime > 0 ? Math.round((workingTime / totalTime) * 100) : 0,
    };
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient = "from-blue-500 to-blue-600",
    iconColor = "text-white",
  }: any) => (
    <Card
      className={`bg-gradient-to-br ${gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-white opacity-90">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-500">Loading operator dashboard...</p>
        </div>
      </div>
    );
  }

  const activeTimeLog = getActiveTimeLog();
  const activeJob = jobs.find((job) => job.id === activeJobId);
  const todaysStats = calculateTodaysStats();

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Operator Dashboard
          </h1>
          <p className="text-gray-600 flex items-center gap-2 mt-2">
            <Activity className="h-4 w-4 text-green-500" />
            <Calendar className="h-4 w-4" />
            {formatDate(currentTime)} •
            <Clock className="h-4 w-4" />
            {formatTime(currentTime)} •
            <Zap className="h-4 w-4 text-blue-500" />
            Live Updates
          </p>
        </div>
        <div className="flex gap-2">
          {activeJobId ? (
            <>
              <Button
                onClick={() => setShowClockOutModal(true)}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
              <Button
                onClick={() => setShowBreakModal(true)}
                className="bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white shadow-lg"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Break
              </Button>
            </>
          ) : (
            <Button
              onClick={fetchData}
              variant="outline"
              className="bg-white shadow-md border-2 border-blue-200 hover:border-blue-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Active Job Alert */}
      {activeJob && activeTimeLog && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-100 to-cyan-100 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-semibold text-blue-900 flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Currently working on: {activeJob.title}
                  </p>
                  <p className="text-lg font-mono font-bold text-blue-800">
                    ⏱️ {formatDuration(activeTimeLog.started_at)}
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white animate-pulse">
                🔥 ACTIVE - {activeJob.job_number}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-100 to-purple-100">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="jobs"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            My Jobs
          </TabsTrigger>
          <TabsTrigger
            value="timesheet"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            Time Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Today's Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Time"
              value={`${todaysStats.totalTime}h`}
              icon={Clock}
              gradient="from-blue-500 via-blue-600 to-blue-700"
            />
            <StatCard
              title="Working Time"
              value={`${todaysStats.workingTime}h`}
              icon={Activity}
              gradient="from-green-500 via-emerald-600 to-green-700"
            />
            <StatCard
              title="Completed Jobs"
              value={todaysStats.completedJobs}
              icon={CheckCircle}
              gradient="from-purple-500 via-purple-600 to-indigo-700"
            />
            <StatCard
              title="Efficiency"
              value={`${todaysStats.efficiency}%`}
              icon={TrendingUp}
              gradient="from-orange-500 via-red-500 to-pink-600"
            />
          </div>

          {/* Current Jobs Quick View */}
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-blue-600" />
                Your Assigned Jobs
              </CardTitle>
              <CardDescription className="text-gray-600">
                Jobs currently assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No jobs assigned yet
                  </h3>
                  <p className="text-gray-500">
                    Check back later for new assignments
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job, index) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${index === 0 ? "bg-green-500 animate-pulse" : index === 1 ? "bg-blue-500" : "bg-yellow-500"}`}
                        />
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {job.title}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {job.job_number} •
                            <Users className="h-3 w-3" />
                            {job.parties.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {job.status === "pending" &&
                          job.id !== activeJobId &&
                          !activeJobId && (
                            <Button
                              onClick={() => handleStartJob(job)}
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          )}
                        {job.id === activeJobId && (
                          <Button
                            onClick={() => handleCompleteJob(job)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          onClick={() => setSelectedJob(job)}
                          variant="outline"
                          size="sm"
                          className="border-2 border-gray-300 hover:border-gray-400 bg-white shadow-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                  {jobs.length > 3 && (
                    <div className="text-center pt-4">
                      <Button
                        onClick={() => setActiveTab("jobs")}
                        variant="outline"
                        className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 hover:border-blue-300"
                      >
                        View All {jobs.length} Jobs
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(job.priority)}
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Priority {job.priority}
                        </Badge>
                        {job.id === activeJobId && (
                          <Badge
                            variant="default"
                            className="bg-blue-100 text-blue-800"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>
                        {job.job_number} • {job.parties.name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ₹{job.selling_price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due:{" "}
                        {job.due_date ? formatDate(job.due_date) : "Not set"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="font-medium">{job.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Machine</p>
                        <p className="font-medium">
                          {job.machines?.name || "Not assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Paper Type</p>
                        <p className="font-medium">
                          {job.paper_type || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Colors</p>
                        <p className="font-medium">
                          {job.colors || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {job.description && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Description
                        </p>
                        <p className="text-sm">{job.description}</p>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-end gap-2">
                      {job.status === "pending" &&
                        job.id !== activeJobId &&
                        !activeJobId && (
                          <Button
                            onClick={() => handleStartJob(job)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Job
                          </Button>
                        )}

                      {(job.status === "in_progress" ||
                        job.id === activeJobId) && (
                        <Button
                          onClick={() => handleCompleteJob(job)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timesheet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Logs</CardTitle>
              <CardDescription>Your time tracking history</CardDescription>
            </CardHeader>
            <CardContent>
              {timeLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Timer className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No time logs yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${log.ended_at ? "bg-green-500" : "bg-blue-500 animate-pulse"}`}
                        />
                        <div>
                          <p className="font-medium">{log.job_sheets.title}</p>
                          <p className="text-sm text-gray-500">
                            {log.job_sheets.job_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatDuration(log.started_at, log.ended_at)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.break_time_minutes > 0 &&
                            `${log.break_time_minutes}m break`}
                          {log.productivity_score && (
                            <span className="ml-2">
                              <Star className="h-3 w-3 inline" />{" "}
                              {log.productivity_score}/10
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Start Job Modal */}
      <Dialog open={showStartJobModal} onOpenChange={setShowStartJobModal}>
        <DialogContent className="sm:max-w-[520px] bg-white border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <PlayCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Start New Job
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              You're about to begin work on{" "}
              <strong className="text-green-600">"{selectedJob?.title}"</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              {/* Job Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border border-green-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  Job Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Number:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedJob.job_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedJob.parties.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedJob.quantity.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Machine:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedJob.machines?.name || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time tracking info with icon */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Time Tracking Enabled
                    </h4>
                    <p className="text-sm text-blue-700">
                      Starting this job will begin automatic time tracking.
                      Ensure you're ready to begin work immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Section with improved styling */}
              <div className="space-y-3">
                <Label
                  htmlFor="start-notes"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Starting Notes (Optional)
                </Label>
                <Textarea
                  id="start-notes"
                  value={startJobNotes}
                  onChange={(e) => setStartJobNotes(e.target.value)}
                  placeholder="Add setup requirements, materials needed, special instructions..."
                  className="min-h-[90px] border-gray-200 focus:border-green-400 focus:ring-green-400"
                />
                <p className="text-xs text-gray-500">
                  These notes will be saved with your time log
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowStartJobModal(false)}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStartJob}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Working
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Clock Out Modal */}
      <Dialog open={showClockOutModal} onOpenChange={setShowClockOutModal}>
        <DialogContent className="sm:max-w-[550px] bg-white border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <StopCircle className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Clock Out & Complete Session
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Finalize your work session and record your progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current session info with better styling */}
            {activeTimeLog && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Current Session Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Working Time:</span>
                    <span className="font-bold text-blue-900">
                      {formatDuration(activeTimeLog.started_at)}
                    </span>
                  </div>
                  {activeTimeLog.break_time_minutes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Break Time:</span>
                      <span className="font-bold text-blue-900">
                        {activeTimeLog.break_time_minutes} minutes
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work Summary with icon */}
            <div className="space-y-3">
              <Label
                htmlFor="clock-out-notes"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                Work Summary <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="clock-out-notes"
                value={clockOutNotes}
                onChange={(e) => setClockOutNotes(e.target.value)}
                placeholder="Describe what you accomplished: tasks completed, issues encountered, next steps..."
                className="min-h-[120px] border-gray-200 focus:border-red-400 focus:ring-red-400"
                required
              />
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">
                  Be specific about your accomplishments
                </span>
                <span
                  className={`${clockOutNotes.length < 20 ? "text-red-500" : "text-green-600"}`}
                >
                  {clockOutNotes.length}/500
                </span>
              </div>
            </div>

            {/* Productivity Score with visual indicators */}
            <div className="space-y-4">
              <Label
                htmlFor="productivity-score"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Star className="h-4 w-4 text-yellow-500" />
                Productivity Rating <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-3">
                <Select
                  value={productivityScore.toString()}
                  onValueChange={(value) =>
                    setProductivityScore(parseInt(value))
                  }
                >
                  <SelectTrigger className="border-gray-200 focus:border-yellow-400 focus:ring-yellow-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[...Array(i + 1)].map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className="h-3 w-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="font-medium">{i + 1}</span>
                          <span className="text-gray-500 text-sm">
                            {i + 1 <= 3
                              ? "(Below Average)"
                              : i + 1 <= 6
                                ? "(Average)"
                                : i + 1 <= 8
                                  ? "(Good)"
                                  : "(Excellent)"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-700">
                    <strong>Rating Guide:</strong> Consider work quality,
                    efficiency, problem-solving, and meeting expectations
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowClockOutModal(false)}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClockOut}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!clockOutNotes.trim() || clockOutNotes.length < 10}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Complete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Break Modal */}
      <Dialog open={showBreakModal} onOpenChange={setShowBreakModal}>
        <DialogContent className="sm:max-w-[480px] bg-white border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Coffee className="h-8 w-8 text-orange-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Record Break Time
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Add break time to your current work session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Break Duration with quick select buttons */}
            <div className="space-y-3">
              <Label
                htmlFor="break-minutes"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Timer className="h-4 w-4 text-orange-600" />
                Break Duration (minutes) <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((minutes) => (
                  <Button
                    key={minutes}
                    variant={breakMinutes === minutes ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBreakMinutes(minutes)}
                    type="button"
                    className={
                      breakMinutes === minutes
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "border-orange-200 text-orange-700 hover:bg-orange-50"
                    }
                  >
                    {minutes}m
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="break-minutes"
                  type="number"
                  value={breakMinutes}
                  onChange={(e) =>
                    setBreakMinutes(parseInt(e.target.value) || 15)
                  }
                  min="1"
                  max="240"
                  className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  or custom
                </span>
              </div>
            </div>

            {/* Break Reason with improved styling */}
            <div className="space-y-3">
              <Label
                htmlFor="break-notes"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Break Reason (Optional)
              </Label>
              <Select value={breakNotes} onValueChange={setBreakNotes}>
                <SelectTrigger className="border-gray-200 focus:border-orange-400 focus:ring-orange-400">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lunch Break">🍽️ Lunch Break</SelectItem>
                  <SelectItem value="Tea/Coffee Break">
                    ☕ Tea/Coffee Break
                  </SelectItem>
                  <SelectItem value="Personal Break">
                    🚶 Personal Break
                  </SelectItem>
                  <SelectItem value="Equipment Issue">
                    🔧 Equipment Issue
                  </SelectItem>
                  <SelectItem value="Material Issue">
                    📦 Material Issue
                  </SelectItem>
                  <SelectItem value="Meeting">👥 Meeting</SelectItem>
                  <SelectItem value="Other">📝 Other</SelectItem>
                </SelectContent>
              </Select>
              {breakNotes === "Other" && (
                <Input
                  placeholder="Enter custom reason..."
                  value={breakNotes}
                  onChange={(e) => setBreakNotes(e.target.value)}
                  className="mt-2 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                />
              )}
            </div>

            {/* Break info with better styling */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    Important Note
                  </p>
                  <p className="text-xs text-orange-700">
                    Break time will be recorded and deducted from your
                    productive hours. Your work session will continue after
                    recording this break.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowBreakModal(false)}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBreak}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Record Break
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function OperatorDashboard() {
  return (
    <RoleBasedAccess allowedRoles={["operator"]}>
      <OperatorDashboardContent />
    </RoleBasedAccess>
  );
}
