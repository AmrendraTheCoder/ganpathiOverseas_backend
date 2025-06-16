// Demo Data for Ganpathi Overseas Enterprise Job Management System

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "finance" | "operator";
  password: string;
  phone?: string;
  address?: string;
  salary?: number;
  hireDate: string;
  isActive: boolean;
  avatar?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstNumber?: string;
  creditLimit: number;
  currentBalance: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  name: string;
  type:
    | "offset"
    | "digital"
    | "finishing"
    | "cutting"
    | "binding"
    | "lamination";
  model?: string;
  serialNumber?: string;
  isActive: boolean;
  maintenanceDate?: string;
  operatorId?: string;
  hourlyRate: number;
  notes?: string;
}

export interface JobSheet {
  id: string;
  jobNumber: string;
  title: string;
  description?: string;
  partyId: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: number;
  quantity: number;
  colors?: string;
  paperType?: string;
  size?: string;
  finishingRequirements?: string;
  estimatedCost: number;
  actualCost: number;
  sellingPrice: number;
  orderDate: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  assignedTo?: string;
  machineId?: string;
  designFiles?: string[];
  sampleImages?: string[];
  completionPhotos?: string[];
  specialInstructions?: string;
  clientFeedback?: string;
  internalNotes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category:
    | "ink"
    | "salary"
    | "electricity"
    | "rent"
    | "chemicals"
    | "maintenance"
    | "other";
  description: string;
  amount: number;
  expenseDate: string;
  jobId?: string;
  vendorName?: string;
  invoiceNumber?: string;
  paymentMethod: "cash" | "bank" | "cheque" | "online";
  receiptUrl?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  partyId: string;
  type: "invoice" | "payment" | "credit" | "debit";
  amount: number;
  description: string;
  transactionDate: string;
  jobId?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  invoiceUrl?: string;
  dueDate?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  notes?: string;
  createdAt: string;
}

export interface JobProgress {
  id: string;
  jobId: string;
  stage: string;
  status: "pending" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  operatorId?: string;
  notes?: string;
  timeSpentMinutes: number;
  createdAt: string;
}

// Demo Users
export const demoUsers: User[] = [
  {
    id: "1",
    username: "admin",
    name: "Rajesh Kumar",
    email: "admin@ganpathioverseas.com",
    role: "admin",
    password: "password",
    phone: "+91 98765 43210",
    address: "Mumbai, Maharashtra",
    salary: 80000,
    hireDate: "2020-01-15",
    isActive: true,
    status: "active",
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    avatar: "/avatars/admin.jpg",
  },
  {
    id: "2",
    username: "supervisor",
    name: "Priya Sharma",
    email: "supervisor@ganpathioverseas.com",
    role: "supervisor",
    password: "password",
    phone: "+91 98765 43211",
    address: "Mumbai, Maharashtra",
    salary: 60000,
    hireDate: "2020-03-10",
    isActive: true,
    status: "active",
    createdAt: "2020-03-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    avatar: "/avatars/supervisor.jpg",
  },
  {
    id: "3",
    username: "finance",
    name: "Amit Patel",
    email: "finance@ganpathioverseas.com",
    role: "finance",
    password: "password",
    phone: "+91 98765 43212",
    address: "Mumbai, Maharashtra",
    salary: 55000,
    hireDate: "2020-06-01",
    isActive: true,
    status: "active",
    createdAt: "2020-06-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    avatar: "/avatars/finance.jpg",
  },
  {
    id: "4",
    username: "operator1",
    name: "Suresh Yadav",
    email: "operator1@ganpathioverseas.com",
    role: "operator",
    password: "password",
    phone: "+91 98765 43213",
    address: "Mumbai, Maharashtra",
    salary: 35000,
    hireDate: "2021-02-15",
    isActive: true,
    status: "active",
    createdAt: "2021-02-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    avatar: "/avatars/operator1.jpg",
  },
  {
    id: "5",
    username: "operator2",
    name: "Deepak Singh",
    email: "operator2@ganpathioverseas.com",
    role: "operator",
    password: "password",
    phone: "+91 98765 43214",
    address: "Mumbai, Maharashtra",
    salary: 38000,
    hireDate: "2021-05-20",
    isActive: true,
    status: "active",
    createdAt: "2021-05-20T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    avatar: "/avatars/operator2.jpg",
  },
];

// Demo Parties
export const demoParties: Party[] = [
  {
    id: "1",
    name: "ABC Corporation",
    contactPerson: "Ravi Gupta",
    phone: "+91 99888 77766",
    email: "ravi@abccorp.com",
    address: "123 Business Park, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400069",
    gstNumber: "27ABCDE1234F1Z5",
    creditLimit: 500000,
    currentBalance: 45000,
    isActive: true,
    notes: "Regular client with good payment history",
    createdAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "XYZ Industries",
    contactPerson: "Sunita Joshi",
    phone: "+91 99888 77767",
    email: "sunita@xyzind.com",
    address: "456 Industrial Area, Powai",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400076",
    gstNumber: "27XYZAB5678G2H3",
    creditLimit: 300000,
    currentBalance: 125000,
    isActive: true,
    notes: "Large volume orders, quarterly billing",
    createdAt: "2023-02-20T10:00:00Z",
  },
  {
    id: "3",
    name: "Tech Solutions Pvt Ltd",
    contactPerson: "Manoj Kumar",
    phone: "+91 99888 77768",
    email: "manoj@techsol.com",
    address: "789 Tech Hub, Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400051",
    gstNumber: "27TECHP9012I3J4",
    creditLimit: 200000,
    currentBalance: 75000,
    isActive: true,
    notes: "Premium printing requirements, urgent deliveries",
    createdAt: "2023-03-10T10:00:00Z",
  },
];

// Demo Machines
export const demoMachines: Machine[] = [
  {
    id: "1",
    name: "Offset Press 1",
    type: "offset",
    model: "HP Indigo 12000",
    serialNumber: "HP12000-2022-001",
    isActive: true,
    maintenanceDate: "2024-01-15",
    operatorId: "4",
    hourlyRate: 500,
    notes: "Main production machine for large orders",
  },
  {
    id: "2",
    name: "Digital Press 1",
    type: "digital",
    model: "Xerox Versant 180",
    serialNumber: "XV180-2021-002",
    isActive: true,
    maintenanceDate: "2024-02-10",
    operatorId: "5",
    hourlyRate: 300,
    notes: "High quality digital printing for small batches",
  },
  {
    id: "3",
    name: "Cutting Machine",
    type: "cutting",
    model: "Polar 115X",
    serialNumber: "P115X-2020-003",
    isActive: true,
    maintenanceDate: "2023-12-20",
    operatorId: "4",
    hourlyRate: 150,
    notes: "Paper cutting and finishing operations",
  },
  {
    id: "4",
    name: "Lamination Unit",
    type: "lamination",
    model: "GMP Saturn 540",
    serialNumber: "GMP540-2021-004",
    isActive: true,
    operatorId: "5",
    hourlyRate: 200,
    notes: "Thermal and cold lamination",
  },
];

// Demo Job Sheets
export const demoJobSheets: JobSheet[] = [
  {
    id: "1",
    jobNumber: "JOB000001",
    title: "Business Card Printing",
    description: "1000 premium business cards with spot UV finish",
    partyId: "1",
    status: "completed",
    priority: 2,
    quantity: 1000,
    colors: "4+0",
    paperType: "Art Card 300gsm",
    size: "90mm x 54mm",
    finishingRequirements: "Spot UV, Die Cutting",
    estimatedCost: 3500,
    actualCost: 3200,
    sellingPrice: 5000,
    orderDate: "2024-01-10",
    dueDate: "2024-01-15",
    startedAt: "2024-01-11T09:00:00Z",
    completedAt: "2024-01-14T17:00:00Z",
    assignedTo: "4",
    machineId: "2",
    designFiles: ["/files/job1-design.pdf"],
    completionPhotos: ["/files/job1-completed.jpg"],
    specialInstructions: "Handle with care, premium finish required",
    clientFeedback: "Excellent quality, very satisfied",
    internalNotes: "Client wants to reorder 2000 more cards",
    createdBy: "2",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    jobNumber: "JOB000002",
    title: "Brochure Printing",
    description: "500 tri-fold brochures for marketing campaign",
    partyId: "2",
    status: "in_progress",
    priority: 1,
    quantity: 500,
    colors: "4+4",
    paperType: "Art Paper 150gsm",
    size: "A4",
    finishingRequirements: "Folding, Perfect Binding",
    estimatedCost: 8000,
    actualCost: 0,
    sellingPrice: 12000,
    orderDate: "2024-01-12",
    dueDate: "2024-01-18",
    startedAt: "2024-01-13T10:00:00Z",
    assignedTo: "5",
    machineId: "1",
    designFiles: ["/files/job2-design.pdf", "/files/job2-layout.ai"],
    specialInstructions: "Color matching critical, provide color proof",
    internalNotes: "Rush order, prioritize completion",
    createdBy: "2",
    createdAt: "2024-01-12T11:00:00Z",
  },
  {
    id: "3",
    jobNumber: "JOB000003",
    title: "Invoice Book Printing",
    description: "100 customized invoice books with carbon copy",
    partyId: "3",
    status: "pending",
    priority: 3,
    quantity: 100,
    colors: "2+1",
    paperType: "NCR Paper",
    size: "A5",
    finishingRequirements: "Binding, Numbering",
    estimatedCost: 4500,
    actualCost: 0,
    sellingPrice: 6500,
    orderDate: "2024-01-15",
    dueDate: "2024-01-22",
    assignedTo: "4",
    designFiles: ["/files/job3-template.pdf"],
    specialInstructions: "Sequential numbering starting from 001",
    internalNotes: "Standard template, easy job",
    createdBy: "2",
    createdAt: "2024-01-15T14:00:00Z",
  },
  {
    id: "4",
    jobNumber: "JOB000004",
    title: "Wedding Invitation Cards",
    description: "200 luxury wedding invitation cards with gold foiling",
    partyId: "1",
    status: "in_progress",
    priority: 1,
    quantity: 200,
    colors: "4+4",
    paperType: "Textured Card 350gsm",
    size: '6" x 9"',
    finishingRequirements: "Gold Foiling, Embossing, Die Cutting",
    estimatedCost: 15000,
    actualCost: 0,
    sellingPrice: 22000,
    orderDate: "2024-01-14",
    dueDate: "2024-01-25",
    startedAt: "2024-01-16T08:00:00Z",
    assignedTo: "5",
    machineId: "2",
    designFiles: ["/files/job4-design.pdf", "/files/job4-foil-layout.pdf"],
    specialInstructions:
      "Premium quality required, gold foil registration critical",
    internalNotes: "High-value client, ensure perfect execution",
    createdBy: "1",
    createdAt: "2024-01-14T09:00:00Z",
  },
];

// Demo Expenses
export const demoExpenses: Expense[] = [
  {
    id: "1",
    category: "ink",
    description: "CMYK Ink Set for Digital Press",
    amount: 12000,
    expenseDate: "2024-01-05",
    vendorName: "Print Supplies Co.",
    invoiceNumber: "PSC-2024-001",
    paymentMethod: "bank",
    isRecurring: false,
    notes: "High-quality ink for premium jobs",
    createdBy: "3",
    createdAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "2",
    category: "electricity",
    description: "Monthly Electricity Bill",
    amount: 25000,
    expenseDate: "2024-01-01",
    vendorName: "Mumbai Electricity Board",
    invoiceNumber: "MEB-2024-001",
    paymentMethod: "online",
    isRecurring: true,
    recurringFrequency: "monthly",
    notes: "Factory electricity consumption",
    createdBy: "3",
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "3",
    category: "maintenance",
    description: "Offset Press Service",
    amount: 8500,
    expenseDate: "2024-01-08",
    jobId: "1",
    vendorName: "HP Service Center",
    invoiceNumber: "HP-SVC-2024-001",
    paymentMethod: "cheque",
    isRecurring: false,
    notes: "Quarterly maintenance service",
    createdBy: "2",
    createdAt: "2024-01-08T11:00:00Z",
  },
  {
    id: "4",
    category: "salary",
    description: "Monthly Salaries - January 2024",
    amount: 268000,
    expenseDate: "2024-01-31",
    paymentMethod: "bank",
    isRecurring: true,
    recurringFrequency: "monthly",
    notes: "Staff salaries for January",
    createdBy: "1",
    createdAt: "2024-01-31T10:00:00Z",
  },
];

// Demo Transactions
export const demoTransactions: Transaction[] = [
  {
    id: "1",
    partyId: "1",
    type: "invoice",
    amount: 5000,
    description: "Invoice for Business Card Printing",
    transactionDate: "2024-01-14",
    jobId: "1",
    referenceNumber: "INV-2024-001",
    dueDate: "2024-02-13",
    status: "paid",
    notes: "Completed job, payment received",
    createdAt: "2024-01-14T17:30:00Z",
  },
  {
    id: "2",
    partyId: "1",
    type: "payment",
    amount: 5000,
    description: "Payment received for Invoice INV-2024-001",
    transactionDate: "2024-01-20",
    paymentMethod: "bank",
    referenceNumber: "PAY-2024-001",
    status: "paid",
    notes: "Payment received on time",
    createdAt: "2024-01-20T14:00:00Z",
  },
  {
    id: "3",
    partyId: "2",
    type: "invoice",
    amount: 12000,
    description: "Invoice for Brochure Printing",
    transactionDate: "2024-01-16",
    jobId: "2",
    referenceNumber: "INV-2024-002",
    dueDate: "2024-02-15",
    status: "pending",
    notes: "Work in progress, will invoice upon completion",
    createdAt: "2024-01-16T16:00:00Z",
  },
  {
    id: "4",
    partyId: "3",
    type: "invoice",
    amount: 6500,
    description: "Invoice for Invoice Book Printing",
    transactionDate: "2024-01-15",
    jobId: "3",
    referenceNumber: "INV-2024-003",
    dueDate: "2024-02-14",
    status: "pending",
    notes: "Awaiting job completion",
    createdAt: "2024-01-15T15:00:00Z",
  },
];

// Demo Job Progress
export const demoJobProgress: JobProgress[] = [
  {
    id: "1",
    jobId: "1",
    stage: "Design Review",
    status: "completed",
    startedAt: "2024-01-11T09:00:00Z",
    completedAt: "2024-01-11T10:30:00Z",
    operatorId: "2",
    notes: "Design approved by client",
    timeSpentMinutes: 90,
    createdAt: "2024-01-11T09:00:00Z",
  },
  {
    id: "2",
    jobId: "1",
    stage: "Printing",
    status: "completed",
    startedAt: "2024-01-11T11:00:00Z",
    completedAt: "2024-01-11T15:00:00Z",
    operatorId: "4",
    notes: "Printed 1000 cards successfully",
    timeSpentMinutes: 240,
    createdAt: "2024-01-11T11:00:00Z",
  },
  {
    id: "3",
    jobId: "1",
    stage: "Finishing",
    status: "completed",
    startedAt: "2024-01-12T09:00:00Z",
    completedAt: "2024-01-14T17:00:00Z",
    operatorId: "5",
    notes: "UV coating and die cutting completed",
    timeSpentMinutes: 480,
    createdAt: "2024-01-12T09:00:00Z",
  },
  {
    id: "4",
    jobId: "2",
    stage: "Pre-press",
    status: "completed",
    startedAt: "2024-01-13T10:00:00Z",
    completedAt: "2024-01-13T12:00:00Z",
    operatorId: "2",
    notes: "Files prepared and plates made",
    timeSpentMinutes: 120,
    createdAt: "2024-01-13T10:00:00Z",
  },
  {
    id: "5",
    jobId: "2",
    stage: "Printing",
    status: "in_progress",
    startedAt: "2024-01-14T08:00:00Z",
    operatorId: "5",
    notes: "Currently printing 500 brochures",
    timeSpentMinutes: 180,
    createdAt: "2024-01-14T08:00:00Z",
  },
];

// Dashboard Stats
export const getDashboardStats = (userRole: string) => {
  const baseStats = {
    totalUsers: demoUsers.filter((u) => u.isActive).length,
    totalJobs: demoJobSheets.length,
    activeJobs: demoJobSheets.filter((j) =>
      ["pending", "in_progress"].includes(j.status)
    ).length,
    completedJobs: demoJobSheets.filter((j) => j.status === "completed").length,
    totalParties: demoParties.filter((p) => p.isActive).length,
    totalRevenue: demoTransactions
      .filter((t) => t.type === "payment" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0),
    pendingInvoices: demoTransactions.filter(
      (t) => t.type === "invoice" && t.status === "pending"
    ).length,
    monthlyExpenses: demoExpenses
      .filter((e) => new Date(e.expenseDate) >= new Date("2024-01-01"))
      .reduce((sum, e) => sum + e.amount, 0),
    totalMachines: demoMachines.filter((m) => m.isActive).length,
  };

  switch (userRole) {
    case "admin":
      return baseStats;
    case "supervisor":
      return {
        totalJobs: baseStats.totalJobs,
        activeJobs: baseStats.activeJobs,
        completedToday: 1,
        myJobs: 2,
        overdueJobs: 0,
      };
    case "finance":
      return {
        totalRevenue: baseStats.totalRevenue,
        pendingInvoices: baseStats.pendingInvoices,
        overdueInvoices: 0,
        monthlyExpenses: baseStats.monthlyExpenses,
        monthlyRevenue: 5000,
        totalParties: baseStats.totalParties,
      };
    case "operator":
      return {
        assignedJobs: 2,
        completedJobs: 1,
        jobsToday: 1,
        pendingJobs: 1,
      };
    default:
      return baseStats;
  }
};

// Helper functions
export const getUserById = (id: string): User | undefined => {
  return demoUsers.find((user) => user.id === id);
};

export const getPartyById = (id: string): Party | undefined => {
  return demoParties.find((party) => party.id === id);
};

export const getMachineById = (id: string): Machine | undefined => {
  return demoMachines.find((machine) => machine.id === id);
};

export const getJobSheetById = (id: string): JobSheet | undefined => {
  return demoJobSheets.find((job) => job.id === id);
};

export const getJobsByPartyId = (partyId: string): JobSheet[] => {
  return demoJobSheets.filter((job) => job.partyId === partyId);
};

export const getTransactionsByPartyId = (partyId: string): Transaction[] => {
  return demoTransactions.filter(
    (transaction) => transaction.partyId === partyId
  );
};

export const getJobProgressByJobId = (jobId: string): JobProgress[] => {
  return demoJobProgress.filter((progress) => progress.jobId === jobId);
};

export const getExpensesByJobId = (jobId: string): Expense[] => {
  return demoExpenses.filter((expense) => expense.jobId === jobId);
};
