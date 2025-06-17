"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Pause,
  Play,
  Database,
  Save,
  X,
  PlayCircle,
  CheckCircle as CheckCircleIcon,
  AlertTriangle,
  Users,
  DollarSign,
  Target,
  Zap,
  Timer,
  Flame,
  Star,
  TrendingUp,
  Activity,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Package,
  Wrench,
  Award,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  demoJobSheets,
  getPartyById,
  getUserById,
  getMachineById,
  JobSheet,
  demoParties,
  demoMachines,
  demoUsers,
} from "@/data/demo-data";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { RoleBasedAccess } from "@/components/auth/RoleBasedAccess";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  parties: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  machines: {
    id: string;
    name: string;
    type: string;
    model: string;
  } | null;
  description: string;
  assigned_to: string;
  machine_id: string;
  started_at?: string;
  completed_at?: string;
}

interface TimeLog {
  id: string;
  job_id: string;
  operator_id: string;
  started_at: string;
  ended_at?: string;
  break_time_minutes: number;
  productivity_score?: number;
}

interface TimingSession {
  jobId: string;
  jobTitle: string;
  startTime: Date;
  elapsedTime: number;
  isPaused: boolean;
}

const JobsPageContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [currentTiming, setCurrentTiming] = useState<TimingSession | null>(
    null
  );
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Add a ref to track if a fetch is in progress
  const isFetching = useRef(false);
  const lastFetchTime = useRef(0);

  // Check for old cached user data and clear if necessary
  useEffect(() => {
    const checkAndClearOldData = () => {
      if (
        user &&
        (user.id === "4" || user.id === "5" || typeof user.id === "number")
      ) {
        console.log("🔄 Detected old user ID format, clearing cache...");
        localStorage.removeItem("currentUser");
        sessionStorage.clear();
        toast({
          title: "🔄 Cache Updated",
          description:
            "Please refresh the page and login again with updated credentials.",
          duration: 5000,
        });
        // Force page reload after showing the message
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return true;
      }
      return false;
    };

    if (user && checkAndClearOldData()) {
      return; // Stop execution if we're clearing cache
    }
  }, [user, toast]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (currentTiming && !currentTiming.isPaused) {
        setCurrentTiming((prev) =>
          prev
            ? {
                ...prev,
                elapsedTime: Date.now() - prev.startTime.getTime(),
              }
            : null
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentTiming]);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Set up periodic refresh with longer interval and proper cleanup
  useEffect(() => {
    if (!loading && user?.id) {
      const interval = setInterval(() => {
        fetchData();
      }, 120000); // Increased to every 2 minutes to reduce load
      return () => clearInterval(interval);
    }
  }, [loading, user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;

    // Throttle API calls - don't fetch if less than 5 seconds since last fetch
    const now = Date.now();
    if (now - lastFetchTime.current < 5000) {
      console.log("🚫 Throttling API call - too soon since last fetch");
      return;
    }

    // Prevent duplicate requests
    if (isFetching.current) {
      console.log("🚫 Fetch already in progress, skipping");
      return;
    }

    try {
      isFetching.current = true;
      lastFetchTime.current = now;
      setLoading(true);

      // Fetch all jobs (pending, in_progress, completed)
      const jobsEndpoint =
        user.role === "operator"
          ? `/api/operator/jobs?operatorId=${user.id}&includeCompleted=true`
          : "/api/job-sheets";

      const [jobsResponse, timeLogsResponse] = await Promise.all([
        fetch(jobsEndpoint),
        user.role === "operator"
          ? fetch(`/api/operator/time-logs?operatorId=${user.id}`)
          : Promise.resolve({ ok: true, json: () => ({ timeLogs: [] }) }),
      ]);

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        const allJobs = jobsData.jobs || jobsData || [];

        // Separate completed and active jobs
        const activeJobs = allJobs.filter(
          (job: Job) => job.status !== "completed"
        );
        const completed = allJobs.filter(
          (job: Job) => job.status === "completed"
        );

        setJobs(activeJobs);
        setCompletedJobs(completed);
      } else {
        const errorText = await jobsResponse.text();
        console.error("Failed to fetch jobs:", errorText);
        toast({
          title: "Warning",
          description: "Failed to fetch latest job data",
          variant: "destructive",
        });
      }

      if (timeLogsResponse.ok) {
        const timeLogsData = await timeLogsResponse.json();
        setTimeLogs(timeLogsData.timeLogs || []);

        // Find active job from time logs
        const activeLog = timeLogsData.timeLogs?.find(
          (log: TimeLog) => !log.ended_at
        );
        if (activeLog) {
          setActiveJobId(activeLog.job_id);
          // Set current timing if there's an active job
          const activeJob = jobs.find((j) => j.id === activeLog.job_id);
          if (activeJob) {
            setCurrentTiming({
              jobId: activeJob.id,
              jobTitle: activeJob.title,
              startTime: new Date(activeLog.started_at),
              elapsedTime:
                Date.now() - new Date(activeLog.started_at).getTime(),
              isPaused: false,
            });
          }
        } else {
          setActiveJobId(null);
          setCurrentTiming(null);
        }
      } else {
        console.error("Failed to fetch time logs");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Network error occurred while fetching data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const handleStartJob = async (job: Job) => {
    if (user?.role !== "operator") return;

    try {
      const response = await fetch("/api/operator/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clock_in",
          operatorId: user.id,
          jobId: job.id,
          machineId: job.machine_id,
          notes: `Started working on ${job.title}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "🚀 Job Started!",
          description: `Successfully started working on ${job.title}`,
        });

        setActiveJobId(job.id);
        setCurrentTiming({
          jobId: job.id,
          jobTitle: job.title,
          startTime: new Date(),
          elapsedTime: 0,
          isPaused: false,
        });
        setShowTimingModal(true);
        await fetchData();
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
    }
  };

  const handlePauseJob = async () => {
    if (!currentTiming) return;

    setCurrentTiming((prev) =>
      prev ? { ...prev, isPaused: !prev.isPaused } : null
    );

    toast({
      title: currentTiming.isPaused ? "⏯️ Job Resumed" : "⏸️ Job Paused",
      description: currentTiming.isPaused ? "Timer resumed" : "Timer paused",
    });
  };

  const handleCompleteJob = async (job: Job) => {
    if (user?.role !== "operator") return;

    try {
      // First clock out if this is the active job
      if (activeJobId === job.id) {
        await fetch("/api/operator/time-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "clock_out",
            operatorId: user.id,
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
          operatorId: user.id,
          jobId: job.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "🎉 Job Completed!",
          description: `Successfully completed ${job.title}`,
        });

        if (activeJobId === job.id) {
          setActiveJobId(null);
          setCurrentTiming(null);
          setShowTimingModal(false);
        }

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

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
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

  const getJobCardGradient = (job: Job) => {
    if (job.id === activeJobId) {
      return "bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 border-2 border-blue-400 shadow-2xl transform scale-105 transition-all duration-300";
    }
    switch (job.status) {
      case "pending":
        return "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-2 border-yellow-300 hover:border-yellow-400 hover:shadow-xl transition-all duration-300";
      case "in_progress":
        return "bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 border-2 border-blue-300 hover:border-blue-400 hover:shadow-xl transition-all duration-300";
      case "completed":
        return "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 hover:border-green-400 hover:shadow-xl transition-all duration-300";
      default:
        return "bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 border-2 border-gray-300 hover:border-gray-400 hover:shadow-xl transition-all duration-300";
    }
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getActiveTimeLog = (jobId: string) => {
    return timeLogs.find((log) => log.job_id === jobId && !log.ended_at);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.parties.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || job.priority.toString() === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredCompletedJobs = completedJobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.parties.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header with Live Time */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            My Jobs
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {currentTime.toLocaleDateString()} •
            <Clock className="h-4 w-4" />
            {currentTime.toLocaleTimeString()} •
            <Zap className="h-4 w-4 text-green-500" />
            Live Updates
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          className="bg-white shadow-md hover:shadow-lg"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Active Job Timer */}
      {currentTiming && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-100 to-cyan-100 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${currentTiming.isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse"}`}
                />
                <div>
                  <p className="font-semibold text-blue-900 flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    {currentTiming.jobTitle}
                  </p>
                  <p className="text-2xl font-mono font-bold text-blue-800">
                    {formatDuration(currentTiming.elapsedTime)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePauseJob} variant="outline" size="sm">
                  {currentTiming.isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => setShowTimingModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Section */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs, numbers, or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-200 focus:border-blue-400"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-blue-400">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-blue-400">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="1">Priority 1 (Low)</SelectItem>
                <SelectItem value="2">Priority 2</SelectItem>
                <SelectItem value="3">Priority 3</SelectItem>
                <SelectItem value="4">Priority 4</SelectItem>
                <SelectItem value="5">Priority 5 (High)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg shadow-md">
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">
                {filteredJobs.length} active jobs
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full bg-gradient-to-r from-blue-100 to-purple-100">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            Active Jobs ({filteredJobs.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            Completed Jobs ({filteredCompletedJobs.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Jobs */}
        <TabsContent value="active" className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No active jobs found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                className={`transition-all duration-300 ${getJobCardGradient(job)}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`border-2 ${getPriorityColor(job.priority)}`}
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Priority {job.priority}
                        </Badge>
                        {job.id === activeJobId && (
                          <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white animate-pulse">
                            🔥 ACTIVE NOW
                          </Badge>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-800">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-gray-600">
                          <FileText className="h-4 w-4" />
                          {job.job_number} •
                          <Users className="h-4 w-4" />
                          {job.parties.name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{job.selling_price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due:{" "}
                        {job.due_date ? formatDate(job.due_date) : "Not set"}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Active Job Timer Display */}
                  {job.id === activeJobId && currentTiming && (
                    <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border-2 border-blue-300 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500 p-2 rounded-lg animate-pulse">
                            <Timer className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-700">
                              Currently Running
                            </p>
                            <p className="text-xl font-mono font-bold text-blue-900">
                              {formatDuration(currentTiming.elapsedTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setShowTimingModal(true)}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 hover:border-blue-400 bg-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Timer
                          </Button>
                          <div className="flex items-center gap-2 text-sm">
                            <div
                              className={`h-2 w-2 rounded-full ${currentTiming.isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse"}`}
                            />
                            <span className="text-blue-700 font-medium">
                              {currentTiming.isPaused ? "Paused" : "Active"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white bg-opacity-70 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-xs font-medium">
                        QUANTITY
                      </p>
                      <p className="font-bold text-lg text-gray-800">
                        {job.quantity.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white bg-opacity-70 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-xs font-medium">
                        MACHINE
                      </p>
                      <p className="font-bold text-sm text-gray-800">
                        {job.machines?.name || "Not assigned"}
                      </p>
                    </div>
                    <div className="p-3 bg-white bg-opacity-70 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-xs font-medium">
                        COLORS
                      </p>
                      <p className="font-bold text-sm text-gray-800">
                        {job.colors || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 bg-white bg-opacity-70 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-xs font-medium">
                        PAPER TYPE
                      </p>
                      <p className="font-bold text-sm text-gray-800">
                        {job.paper_type || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {user?.role === "operator" && (
                      <>
                        {job.status === "pending" && job.id !== activeJobId && (
                          <Button
                            onClick={() => handleStartJob(job)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Job
                          </Button>
                        )}
                        {job.id === activeJobId && (
                          <Button
                            onClick={() => handleCompleteJob(job)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Job
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      onClick={() => setSelectedJob(job)}
                      variant="outline"
                      className="border-2 border-gray-300 hover:border-gray-400 bg-white shadow-md"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Jobs */}
        <TabsContent value="completed" className="space-y-4">
          {filteredCompletedJobs.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No completed jobs found
                </h3>
                <p className="text-gray-500">Completed jobs will appear here</p>
              </CardContent>
            </Card>
          ) : (
            filteredCompletedJobs.map((job) => (
              <Card key={job.id} className={getJobCardGradient(job)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getStatusColor(job.status)}>
                          ✅ COMPLETED
                        </Badge>
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Award className="h-3 w-3 mr-1" />
                          Priority {job.priority}
                        </Badge>
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-800">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-gray-600">
                          <FileText className="h-4 w-4" />
                          {job.job_number} •
                          <Users className="h-4 w-4" />
                          {job.parties.name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{job.selling_price.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Completed:{" "}
                        {job.completed_at
                          ? formatDate(job.completed_at)
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setSelectedJob(job)}
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-gray-400 bg-white shadow-md"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Timing Popup Modal */}
      <Dialog open={showTimingModal} onOpenChange={setShowTimingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-600" />
              Job Timer
            </DialogTitle>
            <DialogDescription>
              {currentTiming ? currentTiming.jobTitle : "No active job"}
            </DialogDescription>
          </DialogHeader>

          {currentTiming && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="text-4xl font-mono font-bold text-blue-800 mb-2">
                  {formatDuration(currentTiming.elapsedTime)}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div
                    className={`h-2 w-2 rounded-full ${currentTiming.isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse"}`}
                  />
                  {currentTiming.isPaused ? "Paused" : "Running"}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePauseJob}
                  variant="outline"
                  className="flex-1"
                >
                  {currentTiming.isPaused ? (
                    <Play className="h-4 w-4 mr-2" />
                  ) : (
                    <Pause className="h-4 w-4 mr-2" />
                  )}
                  {currentTiming.isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={() => setShowTimingModal(false)}
                  variant="outline"
                >
                  Minimize
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Job Details Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedJob?.title}
                </span>
                <Badge
                  className={`${getStatusColor(selectedJob?.status || "")} ml-3`}
                >
                  {selectedJob?.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {selectedJob?.job_number} •
              <Users className="h-4 w-4" />
              {selectedJob?.parties.name}
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              {/* Header Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      ₹{selectedJob.selling_price.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-700 font-medium">
                      Total Value
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {selectedJob.quantity.toLocaleString()}
                    </div>
                    <p className="text-sm text-blue-700 font-medium">
                      Quantity
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`text-3xl font-bold mb-1 ${getPriorityColor(selectedJob.priority)}`}
                    >
                      {selectedJob.priority}
                    </div>
                    <p className="text-sm text-purple-700 font-medium">
                      Priority Level
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Job Information */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Target className="h-5 w-5" />
                        Job Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-blue-700">
                            Status
                          </label>
                          <div className="mt-1">
                            <Badge
                              className={getStatusColor(selectedJob.status)}
                            >
                              {selectedJob.status
                                .replace("_", " ")
                                .toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-blue-700">
                            Due Date
                          </label>
                          <p className="font-semibold text-blue-900 flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {selectedJob.due_date
                              ? formatDate(selectedJob.due_date)
                              : "Not set"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-blue-700">
                          Description
                        </label>
                        <div className="mt-1 p-3 bg-white bg-opacity-70 rounded-lg border border-blue-200">
                          <p className="text-blue-900">
                            {selectedJob.description ||
                              "No description provided"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Specifications */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
                    <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <Wrench className="h-5 w-5" />
                        Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-orange-700">
                              Colors
                            </label>
                            <p className="font-semibold text-orange-900 bg-white bg-opacity-70 p-2 rounded border border-orange-200">
                              {selectedJob.colors || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-orange-700">
                              Paper Type
                            </label>
                            <p className="font-semibold text-orange-900 bg-white bg-opacity-70 p-2 rounded border border-orange-200">
                              {selectedJob.paper_type || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div>
                          {selectedJob.machines && (
                            <div>
                              <label className="text-sm font-medium text-orange-700">
                                Assigned Machine
                              </label>
                              <div className="mt-1 p-3 bg-white bg-opacity-70 rounded-lg border border-orange-200">
                                <p className="font-semibold text-orange-900 flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  {selectedJob.machines.name}
                                </p>
                                <p className="text-sm text-orange-700">
                                  {selectedJob.machines.type} •{" "}
                                  {selectedJob.machines.model}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Customer Information */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <Users className="h-5 w-5" />
                        Customer Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <div className="p-4 bg-white bg-opacity-70 rounded-lg border border-purple-200">
                        <p className="font-bold text-lg text-purple-900 flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5" />
                          {selectedJob.parties.name}
                        </p>

                        {selectedJob.parties.phone && (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-purple-100 p-2 rounded">
                              <Phone className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-purple-700 font-medium">
                                Phone
                              </p>
                              <p className="font-semibold text-purple-900">
                                {selectedJob.parties.phone}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedJob.parties.email && (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-purple-100 p-2 rounded">
                              <Mail className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-purple-700 font-medium">
                                Email
                              </p>
                              <p className="font-semibold text-purple-900">
                                {selectedJob.parties.email}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedJob.parties.address && (
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded">
                              <MapPin className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-purple-700 font-medium">
                                Address
                              </p>
                              <p className="font-semibold text-purple-900">
                                {selectedJob.parties.address}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Progress & Timeline */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-teal-50">
                    <CardHeader className="bg-gradient-to-r from-green-100 to-teal-100 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <Activity className="h-5 w-5" />
                        Progress & Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {selectedJob.started_at && (
                          <div className="flex items-center gap-3 p-3 bg-white bg-opacity-70 rounded-lg border border-green-200">
                            <div className="bg-green-100 p-2 rounded">
                              <Play className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-green-700 font-medium">
                                Started
                              </p>
                              <p className="font-semibold text-green-900">
                                {formatDate(selectedJob.started_at)}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedJob.completed_at && (
                          <div className="flex items-center gap-3 p-3 bg-white bg-opacity-70 rounded-lg border border-green-200">
                            <div className="bg-green-100 p-2 rounded">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-green-700 font-medium">
                                Completed
                              </p>
                              <p className="font-semibold text-green-900">
                                {formatDate(selectedJob.completed_at)}
                              </p>
                            </div>
                          </div>
                        )}

                        {!selectedJob.completed_at && selectedJob.due_date && (
                          <div className="flex items-center gap-3 p-3 bg-white bg-opacity-70 rounded-lg border border-green-200">
                            <div className="bg-yellow-100 p-2 rounded">
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm text-green-700 font-medium">
                                Due Date
                              </p>
                              <p className="font-semibold text-green-900">
                                {formatDate(selectedJob.due_date)}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedJob.id === activeJobId && currentTiming && (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border-2 border-blue-300">
                            <div className="bg-blue-500 p-2 rounded animate-pulse">
                              <Timer className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-blue-700 font-medium">
                                Currently Active
                              </p>
                              <p className="font-mono font-bold text-blue-900 text-lg">
                                {formatDuration(currentTiming.elapsedTime)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              {user?.role === "operator" && (
                <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex gap-3 justify-center">
                      {selectedJob.status === "pending" &&
                        selectedJob.id !== activeJobId && (
                          <Button
                            onClick={() => {
                              handleStartJob(selectedJob);
                              setSelectedJob(null);
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg px-8"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Job
                          </Button>
                        )}
                      {selectedJob.id === activeJobId && (
                        <Button
                          onClick={() => {
                            handleCompleteJob(selectedJob);
                            setSelectedJob(null);
                          }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg px-8"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Job
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedJob(null)}
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-gray-400 bg-white shadow-md px-8"
                      >
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function JobsPage() {
  return (
    <DashboardPageLayout>
      <JobsPageContent />
    </DashboardPageLayout>
  );
}
