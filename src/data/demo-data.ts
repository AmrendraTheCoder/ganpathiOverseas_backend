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
    id: "44444444-4444-4444-4444-444444444444",
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
    id: "55555555-5555-5555-5555-555555555555",
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
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Global Enterprises Ltd",
    contactPerson: "Anjali Sharma",
    phone: "+91 99888 77769",
    email: "anjali@globalent.com",
    address: "321 Corporate Plaza, Nariman Point",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400021",
    gstNumber: "27GLOBL3456K4L5",
    creditLimit: 750000,
    currentBalance: 185000,
    isActive: true,
    notes: "Corporate client with high-volume requirements",
    createdAt: "2023-04-15T10:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Marketing Pro Agency",
    contactPerson: "Vikram Singh",
    phone: "+91 99888 77770",
    email: "vikram@marketingpro.com",
    address: "654 Creative Complex, Malad West",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400064",
    gstNumber: "27MKTPRO7890M5N6",
    creditLimit: 400000,
    currentBalance: 92000,
    isActive: true,
    notes: "Marketing agency with seasonal high demands",
    createdAt: "2023-05-20T10:00:00Z",
  },
  {
    id: "6",
    name: "Premium Packaging Co",
    contactPerson: "Deepika Patel",
    phone: "+91 99888 77771",
    email: "deepika@prempack.com",
    address: "987 Industrial Estate, Goregaon East",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400063",
    gstNumber: "27PREMPK1234O6P7",
    creditLimit: 600000,
    currentBalance: 145000,
    isActive: true,
    notes: "Packaging specialist, regular bulk orders",
    createdAt: "2023-06-10T10:00:00Z",
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
    operatorId: "44444444-4444-4444-4444-444444444444",
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
    operatorId: "55555555-5555-5555-5555-555555555555",
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
    operatorId: "44444444-4444-4444-4444-444444444444",
    hourlyRate: 150,
    notes: "Paper cutting and finishing operations",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Lamination Unit",
    type: "lamination",
    model: "GMP Saturn 540",
    serialNumber: "GMP540-2021-004",
    isActive: true,
    operatorId: "55555555-5555-5555-5555-555555555555",
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
    assignedTo: "44444444-4444-4444-4444-444444444444",
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
    assignedTo: "55555555-5555-5555-5555-555555555555",
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
    assignedTo: "44444444-4444-4444-4444-444444444444",
    designFiles: ["/files/job3-template.pdf"],
    specialInstructions: "Sequential numbering starting from 001",
    internalNotes: "Standard template, easy job",
    createdBy: "2",
    createdAt: "2024-01-15T14:00:00Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
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
    assignedTo: "55555555-5555-5555-5555-555555555555",
    machineId: "2",
    designFiles: ["/files/job4-design.pdf", "/files/job4-foil-layout.pdf"],
    specialInstructions:
      "Premium quality required, gold foil registration critical",
    internalNotes: "High-value client, ensure perfect execution",
    createdBy: "1",
    createdAt: "2024-01-14T09:00:00Z",
  },
  {
    id: "5",
    jobNumber: "JOB000005",
    title: "Corporate Annual Report",
    description: "150 page annual report with color graphs and charts",
    partyId: "1",
    status: "pending",
    priority: 5,
    quantity: 250,
    colors: "4+4",
    paperType: "Matt Art Paper 130gsm",
    size: "A4 Portrait",
    finishingRequirements: "Perfect Binding, Lamination",
    estimatedCost: 45000,
    actualCost: 0,
    sellingPrice: 65000,
    orderDate: "2024-01-16",
    dueDate: "2024-02-05",
    assignedTo: "44444444-4444-4444-4444-444444444444",
    machineId: "1",
    designFiles: ["/files/job5-report.pdf"],
    specialInstructions:
      "High quality print, color accuracy critical for charts",
    internalNotes: "Annual report - deadline cannot be missed",
    createdBy: "1",
    createdAt: "2024-01-16T14:30:00Z",
  },
  {
    id: "6",
    jobNumber: "JOB000006",
    title: "Product Catalog Design",
    description: "48 page full-color product catalog for electronics store",
    partyId: "2",
    status: "in_progress",
    priority: 3,
    quantity: 500,
    colors: "4+4",
    paperType: "Glossy Art Paper 150gsm",
    size: "A4 Landscape",
    finishingRequirements: "Saddle Stitching, UV Coating",
    estimatedCost: 28000,
    actualCost: 0,
    sellingPrice: 42000,
    orderDate: "2024-01-17",
    dueDate: "2024-01-28",
    startedAt: "2024-01-18T09:15:00Z",
    assignedTo: "44444444-4444-4444-4444-444444444444",
    machineId: "1",
    designFiles: ["/files/job6-catalog.pdf"],
    specialInstructions: "Product images must be sharp and vibrant",
    internalNotes: "Client is very particular about image quality",
    createdBy: "2",
    createdAt: "2024-01-17T11:20:00Z",
  },
  {
    id: "7",
    jobNumber: "JOB000007",
    title: "Restaurant Menu Cards",
    description: "200 laminated menu cards for upscale restaurant",
    partyId: "3",
    status: "completed",
    priority: 2,
    quantity: 200,
    colors: "4+4",
    paperType: "Card Stock 350gsm",
    size: '11" x 17"',
    finishingRequirements: "Thermal Lamination, Corner Rounding",
    estimatedCost: 8500,
    actualCost: 8200,
    sellingPrice: 13500,
    orderDate: "2024-01-08",
    dueDate: "2024-01-15",
    startedAt: "2024-01-09T10:00:00Z",
    completedAt: "2024-01-14T16:30:00Z",
    assignedTo: "55555555-5555-5555-5555-555555555555",
    machineId: "2",
    designFiles: ["/files/job7-menu.pdf"],
    completionPhotos: ["/files/job7-completed.jpg"],
    specialInstructions:
      "Food images must look appetizing, accurate colors essential",
    clientFeedback: "Perfect quality, customers love the new menus",
    internalNotes: "Regular customer, monthly menu updates needed",
    createdBy: "2",
    createdAt: "2024-01-08T13:45:00Z",
  },
  {
    id: "8",
    jobNumber: "JOB000008",
    title: "Event Posters",
    description: "50 large format posters for music festival",
    partyId: "1",
    status: "pending",
    priority: 4,
    quantity: 50,
    colors: "4+0",
    paperType: "Photo Paper 200gsm",
    size: '24" x 36"',
    finishingRequirements: "Large Format Printing, Weather Resistant Coating",
    estimatedCost: 12000,
    actualCost: 0,
    sellingPrice: 18000,
    orderDate: "2024-01-18",
    dueDate: "2024-01-25",
    assignedTo: "44444444-4444-4444-4444-444444444444",
    designFiles: ["/files/job8-poster.pdf"],
    specialInstructions: "Vibrant colors needed, outdoor display quality",
    internalNotes: "Rush job for weekend event",
    createdBy: "1",
    createdAt: "2024-01-18T16:00:00Z",
  },
  {
    id: "9",
    jobNumber: "JOB000009",
    title: "Company Letterheads",
    description: "2000 premium letterheads with embossed logo",
    partyId: "2",
    status: "completed",
    priority: 1,
    quantity: 2000,
    colors: "2+0",
    paperType: "Linen Textured Paper 120gsm",
    size: "A4",
    finishingRequirements: "Embossing, Premium Paper Stock",
    estimatedCost: 15000,
    actualCost: 14500,
    sellingPrice: 22000,
    orderDate: "2024-01-05",
    dueDate: "2024-01-12",
    startedAt: "2024-01-06T08:00:00Z",
    completedAt: "2024-01-11T17:00:00Z",
    assignedTo: "55555555-5555-5555-5555-555555555555",
    machineId: "1",
    designFiles: ["/files/job9-letterhead.pdf"],
    completionPhotos: ["/files/job9-completed.jpg"],
    specialInstructions: "Logo embossing must be crisp and well-aligned",
    clientFeedback: "Exceptional quality, exactly what we wanted",
    internalNotes: "Premium client, ensure top quality always",
    createdBy: "1",
    createdAt: "2024-01-05T10:30:00Z",
  },
  {
    id: "10",
    jobNumber: "JOB000010",
    title: "Training Manual Booklets",
    description: "100 copies of 80-page employee training manual",
    partyId: "3",
    status: "in_progress",
    priority: 2,
    quantity: 100,
    colors: "1+1",
    paperType: "Bond Paper 80gsm",
    size: "A4",
    finishingRequirements: "Perfect Binding, Plastic Coil",
    estimatedCost: 18000,
    actualCost: 0,
    sellingPrice: 25000,
    orderDate: "2024-01-19",
    dueDate: "2024-01-30",
    startedAt: "2024-01-20T09:00:00Z",
    assignedTo: "44444444-4444-4444-4444-444444444444",
    machineId: "1",
    designFiles: ["/files/job10-manual.pdf"],
    specialInstructions:
      "Text must be clearly readable, consistent page margins",
    internalNotes: "Educational content, ensure professional binding",
    createdBy: "2",
    createdAt: "2024-01-19T14:15:00Z",
  },
  {
    id: "11",
    jobNumber: "JOB000011",
    title: "Packaging Labels",
    description: "5000 product labels with barcode and nutrition info",
    partyId: "1",
    status: "pending",
    priority: 3,
    quantity: 5000,
    colors: "4+0",
    paperType: "Vinyl Sticker Material",
    size: '4" x 3"',
    finishingRequirements: "Die Cutting, Adhesive Backing",
    estimatedCost: 22000,
    actualCost: 0,
    sellingPrice: 32000,
    orderDate: "2024-01-20",
    dueDate: "2024-02-02",
    assignedTo: "55555555-5555-5555-5555-555555555555",
    designFiles: ["/files/job11-labels.pdf"],
    specialInstructions:
      "Barcode must be scannable, FDA compliant nutrition facts",
    internalNotes: "Food industry client, accuracy is critical",
    createdBy: "1",
    createdAt: "2024-01-20T11:45:00Z",
  },
  {
    id: "12",
    jobNumber: "JOB000012",
    title: "Medical Report Forms",
    description: "500 carbonless medical report forms in triplicate",
    partyId: "2",
    status: "completed",
    priority: 4,
    quantity: 500,
    colors: "2+1",
    paperType: "NCR 3-Part Forms",
    size: '8.5" x 11"',
    finishingRequirements: "Sequential Numbering, Perforated Edges",
    estimatedCost: 12000,
    actualCost: 11800,
    sellingPrice: 17500,
    orderDate: "2024-01-10",
    dueDate: "2024-01-20",
    startedAt: "2024-01-11T14:00:00Z",
    completedAt: "2024-01-18T15:30:00Z",
    assignedTo: "44444444-4444-4444-4444-444444444444",
    machineId: "1",
    designFiles: ["/files/job12-forms.pdf"],
    completionPhotos: ["/files/job12-completed.jpg"],
    specialInstructions:
      "Medical standards compliance required, clean carbon transfer",
    clientFeedback: "Forms work perfectly, carbon copies are clear",
    internalNotes: "Healthcare client, precision is essential",
    createdBy: "2",
    createdAt: "2024-01-10T16:20:00Z",
  },
  {
    id: "13",
    jobNumber: "JOB000013",
    title: "Conference Badges",
    description: "300 conference name badges with lanyards",
    partyId: "3",
    status: "pending",
    priority: 5,
    quantity: 300,
    colors: "4+0",
    paperType: "PVC Card Stock",
    size: '3.5" x 2.25"',
    finishingRequirements: "Lamination, Hole Punching, Lanyard Attachment",
    estimatedCost: 9000,
    actualCost: 0,
    sellingPrice: 13500,
    orderDate: "2024-01-21",
    dueDate: "2024-01-27",
    assignedTo: "55555555-5555-5555-5555-555555555555",
    designFiles: ["/files/job13-badges.pdf"],
    specialInstructions:
      "Urgent for tech conference, professional appearance required",
    internalNotes: "High priority - conference is next week",
    createdBy: "1",
    createdAt: "2024-01-21T09:30:00Z",
  },
  {
    id: "14",
    jobNumber: "JOB000014",
    title: "Sales Presentation Folders",
    description: "200 custom presentation folders with business card slots",
    partyId: "1",
    status: "in_progress",
    priority: 2,
    quantity: 200,
    colors: "4+4",
    paperType: "Cover Stock 300gsm",
    size: '9" x 12"',
    finishingRequirements: "Die Cutting, Gluing, Business Card Slits",
    estimatedCost: 16000,
    actualCost: 0,
    sellingPrice: 24000,
    orderDate: "2024-01-16",
    dueDate: "2024-01-26",
    startedAt: "2024-01-17T13:00:00Z",
    assignedTo: "44444444-4444-4444-4444-444444444444",
    machineId: "2",
    designFiles: ["/files/job14-folders.pdf"],
    specialInstructions:
      "Professional finish, precise die cutting for card slots",
    internalNotes: "Sales team needs these for trade show presentation",
    createdBy: "2",
    createdAt: "2024-01-16T15:45:00Z",
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
    id: "44444444-4444-4444-4444-444444444444",
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
    status: "paid",
    notes: "Work completed, payment received",
    createdAt: "2024-01-16T16:00:00Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    partyId: "3",
    type: "invoice",
    amount: 6500,
    description: "Invoice for Invoice Book Printing",
    transactionDate: "2024-01-15",
    jobId: "3",
    referenceNumber: "INV-2024-003",
    dueDate: "2024-02-14",
    status: "paid",
    notes: "Completed and paid",
    createdAt: "2024-01-15T15:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    partyId: "2",
    type: "payment",
    amount: 12000,
    description: "Payment received for Invoice INV-2024-002",
    transactionDate: "2024-01-22",
    paymentMethod: "bank",
    referenceNumber: "PAY-2024-002",
    status: "paid",
    notes: "Payment received for brochure printing",
    createdAt: "2024-01-22T14:00:00Z",
  },
  {
    id: "6",
    partyId: "3",
    type: "payment",
    amount: 6500,
    description: "Payment received for Invoice INV-2024-003",
    transactionDate: "2024-01-25",
    paymentMethod: "cash",
    referenceNumber: "PAY-2024-003",
    status: "paid",
    notes: "Cash payment for invoice books",
    createdAt: "2024-01-25T14:00:00Z",
  },
  {
    id: "7",
    partyId: "1",
    type: "invoice",
    amount: 85000,
    description: "Invoice for Wedding Invitation Cards - Bulk Order",
    transactionDate: "2024-01-18",
    referenceNumber: "INV-2024-004",
    dueDate: "2024-02-18",
    status: "paid",
    notes: "Large wedding order, premium finish",
    createdAt: "2024-01-18T16:00:00Z",
  },
  {
    id: "8",
    partyId: "1",
    type: "payment",
    amount: 85000,
    description: "Payment received for Invoice INV-2024-004",
    transactionDate: "2024-01-26",
    paymentMethod: "bank",
    referenceNumber: "PAY-2024-004",
    status: "paid",
    notes: "Full payment for wedding cards",
    createdAt: "2024-01-26T14:00:00Z",
  },
  {
    id: "9",
    partyId: "44444444-4444-4444-4444-444444444444",
    type: "invoice",
    amount: 125000,
    description: "Invoice for Corporate Annual Report - Premium Package",
    transactionDate: "2024-01-10",
    referenceNumber: "INV-2024-005",
    dueDate: "2024-02-10",
    status: "paid",
    notes: "High-end corporate printing job",
    createdAt: "2024-01-10T16:00:00Z",
  },
  {
    id: "10",
    partyId: "44444444-4444-4444-4444-444444444444",
    type: "payment",
    amount: 125000,
    description: "Payment received for Invoice INV-2024-005",
    transactionDate: "2024-01-28",
    paymentMethod: "bank",
    referenceNumber: "PAY-2024-005",
    status: "paid",
    notes: "Corporate payment received",
    createdAt: "2024-01-28T14:00:00Z",
  },
  {
    id: "11",
    partyId: "55555555-5555-5555-5555-555555555555",
    type: "invoice",
    amount: 45000,
    description: "Invoice for Marketing Brochures - Quarterly Campaign",
    transactionDate: "2024-01-12",
    referenceNumber: "INV-2024-006",
    dueDate: "2024-02-12",
    status: "paid",
    notes: "Marketing campaign materials",
    createdAt: "2024-01-12T16:00:00Z",
  },
  {
    id: "12",
    partyId: "55555555-5555-5555-5555-555555555555",
    type: "payment",
    amount: 45000,
    description: "Payment received for Invoice INV-2024-006",
    transactionDate: "2024-01-30",
    paymentMethod: "online",
    referenceNumber: "PAY-2024-006",
    status: "paid",
    notes: "Online payment received",
    createdAt: "2024-01-30T14:00:00Z",
  },
  {
    id: "13",
    partyId: "6",
    type: "invoice",
    amount: 75000,
    description: "Invoice for Product Packaging - Complete Set",
    transactionDate: "2024-01-08",
    referenceNumber: "INV-2024-007",
    dueDate: "2024-02-08",
    status: "paid",
    notes: "Complete packaging solution",
    createdAt: "2024-01-08T16:00:00Z",
  },
  {
    id: "14",
    partyId: "6",
    type: "payment",
    amount: 75000,
    description: "Payment received for Invoice INV-2024-007",
    transactionDate: "2024-01-29",
    paymentMethod: "bank",
    referenceNumber: "PAY-2024-007",
    status: "paid",
    notes: "Payment for packaging order",
    createdAt: "2024-01-29T14:00:00Z",
  },
  {
    id: "15",
    partyId: "2",
    type: "invoice",
    amount: 18500,
    description: "Invoice for Promotional Posters - January Batch",
    transactionDate: "2024-01-25",
    referenceNumber: "INV-2024-008",
    dueDate: "2024-02-25",
    status: "pending",
    notes: "Promotional material order",
    createdAt: "2024-01-25T16:00:00Z",
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
    operatorId: "44444444-4444-4444-4444-444444444444",
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
    operatorId: "55555555-5555-5555-5555-555555555555",
    notes: "UV coating and die cutting completed",
    timeSpentMinutes: 480,
    createdAt: "2024-01-12T09:00:00Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
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
    id: "55555555-5555-5555-5555-555555555555",
    jobId: "2",
    stage: "Printing",
    status: "in_progress",
    startedAt: "2024-01-14T08:00:00Z",
    operatorId: "55555555-5555-5555-5555-555555555555",
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
