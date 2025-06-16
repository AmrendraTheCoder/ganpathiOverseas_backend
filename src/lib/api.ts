// API Service Layer for Database Integration
// This file contains all API endpoints that will connect to the backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post("/auth/login", credentials),
  logout: () => apiClient.post("/auth/logout", {}),
  getCurrentUser: () => apiClient.get("/auth/me"),
  refreshToken: () => apiClient.post("/auth/refresh", {}),
};

// Users API
export const usersAPI = {
  getAll: (params?: { role?: string; status?: string; search?: string }) =>
    apiClient.get(`/users${params ? `?${new URLSearchParams(params)}` : ""}`),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (userData: any) => apiClient.post("/users", userData),
  update: (id: string, userData: any) =>
    apiClient.put(`/users/${id}`, userData),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  updatePassword: (id: string, passwordData: any) =>
    apiClient.put(`/users/${id}/password`, passwordData),
};

// Parties (Customers) API
export const partiesAPI = {
  getAll: (params?: { search?: string; type?: string; status?: string }) =>
    apiClient.get(`/parties${params ? `?${new URLSearchParams(params)}` : ""}`),
  getById: (id: string) => apiClient.get(`/parties/${id}`),
  create: (partyData: any) => apiClient.post("/parties", partyData),
  update: (id: string, partyData: any) =>
    apiClient.put(`/parties/${id}`, partyData),
  delete: (id: string) => apiClient.delete(`/parties/${id}`),
  getTransactions: (id: string) => apiClient.get(`/parties/${id}/transactions`),
  getJobSheets: (id: string) => apiClient.get(`/parties/${id}/job-sheets`),
};

// Machines API
export const machinesAPI = {
  getAll: (params?: { type?: string; status?: string; search?: string }) =>
    apiClient.get(
      `/machines${params ? `?${new URLSearchParams(params)}` : ""}`
    ),
  getById: (id: string) => apiClient.get(`/machines/${id}`),
  create: (machineData: any) => apiClient.post("/machines", machineData),
  update: (id: string, machineData: any) =>
    apiClient.put(`/machines/${id}`, machineData),
  delete: (id: string) => apiClient.delete(`/machines/${id}`),
  updateStatus: (id: string, status: string) =>
    apiClient.put(`/machines/${id}/status`, { status }),
  getUtilization: (id: string, timeframe?: string) =>
    apiClient.get(
      `/machines/${id}/utilization${timeframe ? `?timeframe=${timeframe}` : ""}`
    ),
  scheduleMaintenance: (id: string, maintenanceData: any) =>
    apiClient.post(`/machines/${id}/maintenance`, maintenanceData),
};

// Job Sheets API
export const jobSheetsAPI = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    partyId?: string;
    machineId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) =>
    apiClient.get(
      `/job-sheets${params ? `?${new URLSearchParams(params)}` : ""}`
    ),
  getById: (id: string) => apiClient.get(`/job-sheets/${id}`),
  create: (jobData: any) => apiClient.post("/job-sheets", jobData),
  update: (id: string, jobData: any) =>
    apiClient.put(`/job-sheets/${id}`, jobData),
  delete: (id: string) => apiClient.delete(`/job-sheets/${id}`),
  updateStatus: (id: string, status: string, notes?: string) =>
    apiClient.put(`/job-sheets/${id}/status`, { status, notes }),
  assignMachine: (id: string, machineId: string) =>
    apiClient.put(`/job-sheets/${id}/assign-machine`, { machineId }),
  getProgress: (id: string) => apiClient.get(`/job-sheets/${id}/progress`),
  updateProgress: (id: string, progressData: any) =>
    apiClient.post(`/job-sheets/${id}/progress`, progressData),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params?: {
    type?: string;
    status?: string;
    partyId?: string;
    jobId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) =>
    apiClient.get(
      `/transactions${params ? `?${new URLSearchParams(params)}` : ""}`
    ),
  getById: (id: string) => apiClient.get(`/transactions/${id}`),
  create: (transactionData: any) =>
    apiClient.post("/transactions", transactionData),
  update: (id: string, transactionData: any) =>
    apiClient.put(`/transactions/${id}`, transactionData),
  delete: (id: string) => apiClient.delete(`/transactions/${id}`),
  markAsPaid: (id: string, paymentData: any) =>
    apiClient.put(`/transactions/${id}/mark-paid`, paymentData),
  generateInvoice: (jobId: string) =>
    apiClient.post(`/transactions/generate-invoice`, { jobId }),
  recordPayment: (invoiceId: string, paymentData: any) =>
    apiClient.post(`/transactions/record-payment`, {
      invoiceId,
      ...paymentData,
    }),
};

// Expenses API
export const expensesAPI = {
  getAll: (params?: {
    category?: string;
    status?: string;
    submittedBy?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) =>
    apiClient.get(
      `/expenses${params ? `?${new URLSearchParams(params)}` : ""}`
    ),
  getById: (id: string) => apiClient.get(`/expenses/${id}`),
  create: (expenseData: any) => apiClient.post("/expenses", expenseData),
  update: (id: string, expenseData: any) =>
    apiClient.put(`/expenses/${id}`, expenseData),
  delete: (id: string) => apiClient.delete(`/expenses/${id}`),
  approve: (id: string, notes?: string) =>
    apiClient.put(`/expenses/${id}/approve`, { notes }),
  reject: (id: string, reason: string) =>
    apiClient.put(`/expenses/${id}/reject`, { reason }),
  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("receipt", file);
    return apiClient.post(`/expenses/${id}/receipt`, formData);
  },
};

// Analytics/Reports API
export const analyticsAPI = {
  getDashboardStats: (role: string, dateRange?: string) =>
    apiClient.get(
      `/analytics/dashboard/${role}${dateRange ? `?range=${dateRange}` : ""}`
    ),
  getRevenueTrends: (timeframe: string) =>
    apiClient.get(`/analytics/revenue-trends?timeframe=${timeframe}`),
  getProductionMetrics: (timeframe: string) =>
    apiClient.get(`/analytics/production-metrics?timeframe=${timeframe}`),
  getMachineUtilization: (timeframe: string) =>
    apiClient.get(`/analytics/machine-utilization?timeframe=${timeframe}`),
  getExpenseBreakdown: (timeframe: string) =>
    apiClient.get(`/analytics/expense-breakdown?timeframe=${timeframe}`),
  getCustomerAnalytics: (timeframe: string) =>
    apiClient.get(`/analytics/customer-analytics?timeframe=${timeframe}`),
  generateReport: (reportType: string, params: any) =>
    apiClient.post("/analytics/generate-report", { reportType, ...params }),
  exportData: (entity: string, format: string, filters?: any) =>
    apiClient.post("/analytics/export", { entity, format, filters }),
};

// Settings API
export const settingsAPI = {
  getAll: () => apiClient.get("/settings"),
  update: (settings: any) => apiClient.put("/settings", settings),
  getBackupStatus: () => apiClient.get("/settings/backup-status"),
  createBackup: () => apiClient.post("/settings/create-backup", {}),
  restoreBackup: (backupId: string) =>
    apiClient.post("/settings/restore-backup", { backupId }),
};

// File Upload API
export const fileAPI = {
  upload: (file: File, category: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return apiClient.post("/files/upload", formData);
  },
  delete: (fileId: string) => apiClient.delete(`/files/${fileId}`),
  getDownloadUrl: (fileId: string) =>
    `${API_BASE_URL}/files/${fileId}/download`,
};

// Notifications API
export const notificationsAPI = {
  getAll: (params?: { read?: boolean; type?: string; limit?: number }) =>
    apiClient.get(
      `/notifications${params ? `?${new URLSearchParams(params)}` : ""}`
    ),
  markAsRead: (id: string) => apiClient.put(`/notifications/${id}/read`, {}),
  markAllAsRead: () => apiClient.put("/notifications/mark-all-read", {}),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
};

// Health Check API
export const healthAPI = {
  check: () => apiClient.get("/health"),
  database: () => apiClient.get("/health/database"),
  services: () => apiClient.get("/health/services"),
};

// Export all APIs
export const api = {
  auth: authAPI,
  users: usersAPI,
  parties: partiesAPI,
  machines: machinesAPI,
  jobSheets: jobSheetsAPI,
  transactions: transactionsAPI,
  expenses: expensesAPI,
  analytics: analyticsAPI,
  settings: settingsAPI,
  files: fileAPI,
  notifications: notificationsAPI,
  health: healthAPI,
};

export default api;
