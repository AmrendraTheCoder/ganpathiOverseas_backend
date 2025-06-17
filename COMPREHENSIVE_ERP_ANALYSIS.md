# Ganpathi Overseas ERP System - Comprehensive Analysis

## System Overview

A complete Enterprise Resource Planning (ERP) system for Ganpathi Overseas Job Management with role-based access control, comprehensive data management, and modern web interface.

## Navigation Structure

### Main Sidebar Navigation

```
├── Dashboard
│   ├── Admin Overview (/dashboard/admin)
│   ├── Supervisor View (/dashboard/supervisor)
│   ├── Finance View (/dashboard/finance)
│   └── Operator View (/dashboard/operator)
├── Job Management
│   ├── All Jobs (/jobs)
│   ├── Create Job (/jobs/create)
│   ├── Job Progress (/jobs/progress)
│   └── Job Reports (/jobs/reports)
├── Production Management
│   ├── Machines (/machines)
│   ├── Production Schedule (/production/schedule)
│   └── Quality Control (/production/quality)
├── Customer Management
│   ├── All Parties (/parties)
│   ├── Add Party (/parties/create)
│   ├── CRM System (/crm)
│   └── Party Reports (/parties/reports)
├── Financial Management
│   ├── Transactions (/finance/transactions)
│   ├── Invoices (/finance/invoices)
│   ├── Expenses (/expenses)
│   └── Financial Reports (/finance/reports)
├── Inventory
│   ├── All Items (/inventory)
│   ├── Stock Movements (/inventory/movements)
│   ├── Suppliers (/inventory/suppliers)
│   └── Purchase Orders (/inventory/orders)
├── User Management
│   ├── All Users (/users)
│   ├── Add User (/users/create)
│   └── Roles & Permissions (/users/roles)
├── Reports & Analytics
│   ├── Business Reports (/reports)
│   └── Performance Analytics (/analytics)
└── Settings
    ├── General Settings (/settings)
    └── System Configuration (/settings/system)
```

## Core Data Models

### User Interface

```typescript
interface User {
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
```

### Party (Customer/Supplier) Interface

```typescript
interface Party {
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
```

### Machine Interface

```typescript
interface Machine {
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
```

### Job Sheet Interface

```typescript
interface JobSheet {
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
```

### Transaction Interface

```typescript
interface Transaction {
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
```

### Expense Interface

```typescript
interface Expense {
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
```

## Form Analysis & Data Integration Points

### 1. Job Creation Form (/jobs/create)

**Form Fields:**

- Basic Information:

  - Job Title (required)
  - Description (textarea)
  - Customer/Party Selection (dropdown from parties table)
  - Priority Level (1-3: High, Medium, Low)
  - Quantity (number, required)
  - Due Date (date picker)

- Specifications:

  - Colors (text)
  - Paper Type (text)
  - Size (text)
  - Finishing Requirements (text)
  - Machine Assignment (dropdown from machines table)
  - Special Instructions (textarea)

- Pricing:
  - Estimated Cost (number)
  - Selling Price (number)

**Data Connections:**

- `parties` table for customer selection
- `machines` table for machine assignment
- `users` table for operator assignment
- Generates unique job number automatically

### 2. Job Sheet Form (/job-sheet-form)

**Form Fields:**

- Job Date (date, required)
- Party Name/Selection (dropdown, required)
- Description (textarea, required)
- Technical Specifications:
  - Sheet count (number)
  - Plate count (number, required)
  - Size (text, required)
  - Square Inches (decimal, required)
  - Paper Sheet count (number, required)
  - Impressions (number, required)
  - Rate (decimal, required)
- Cost Details:
  - Printing Cost (decimal, required)
  - UV Cost (decimal, optional)
  - Baking Cost (decimal, optional)
  - Auto-calculated Total Cost
- File Upload (images/PDFs)

**Data Connections:**

- `parties` table for customer lookup
- `job_sheets` table for storage
- File storage system for uploads
- Automatic cost calculations

### 3. Party Creation Form (/parties/create)

**Form Fields:**

- Basic Information:

  - Company Name (required)
  - Email (email format)
  - Phone (required)
  - GST Number (text)
  - PAN Number (text)

- Address Information:

  - Street Address (textarea)
  - City (text)
  - State (text)
  - PIN Code (text)

- Contact Person:

  - Contact Person Name (text)
  - Contact Person Phone (text)
  - Contact Person Email (email)

- Business Details:

  - Business Type (dropdown)
  - Industry (text)
  - Website (URL)
  - Description (textarea)

- Financial Information:
  - Credit Limit (number)
  - Payment Terms (dropdown)
  - Customer Tier (dropdown: Premium, Standard, Basic)

**Data Connections:**

- `parties` table for storage
- GST validation integration
- Credit history tracking

### 4. User Creation Form (/users/create)

**Form Fields:**

- Personal Information:

  - Full Name (required)
  - Email Address (required, unique)
  - Phone Number (text)
  - Address (text)

- Emergency Contact:

  - Emergency Contact Name (text)
  - Emergency Contact Phone (text)

- Account Information:

  - Username (required, unique)
  - Password (required, min 8 chars)
  - Confirm Password (must match)
  - Role Selection (dropdown: admin, supervisor, finance, operator)
  - Account Status (active/inactive toggle)

- Employment Details:
  - Employee ID (text)
  - Department (text)
  - Designation (text)
  - Joining Date (date)
  - Salary (number)

**Data Connections:**

- `users` table for storage
- Password hashing
- Role-based permission assignment
- Employee ID generation

### 5. CRM Lead Management (/crm)

**Form Fields:**

- Lead Information:

  - Customer Name (required)
  - Company Name (text)
  - Email (email format)
  - Phone (required)
  - Lead Source (dropdown)

- Opportunity Details:

  - Deal Value (currency)
  - Probability (percentage 0-100)
  - Expected Close Date (date)
  - Lead Stage (dropdown)

- Communication:
  - Notes (textarea)
  - Next Follow-up Date (date)
  - Assigned To (user dropdown)

**Data Connections:**

- `leads` table for storage
- `users` table for assignment
- Integration with `parties` table when lead converts
- Activity tracking system

### 6. Inventory Management Forms (/inventory/\*)

#### Stock Movement Form (/inventory/movements)

**Form Fields:**

- Movement Type (dropdown: In, Out, Adjustment)
- Item Selection (searchable dropdown)
- Quantity (number, required)
- Unit Price (decimal)
- Reference Number (text)
- Notes (textarea)
- Movement Date (date)

#### Supplier Form (/inventory/suppliers)

**Form Fields:**

- Supplier Name (required)
- Contact Information (phone, email, address)
- Payment Terms (dropdown)
- Credit Limit (currency)
- GST Details
- Performance Ratings
- Contract Details

#### Purchase Order Form (/inventory/orders)

**Form Fields:**

- Supplier Selection (dropdown)
- Order Date (date)
- Expected Delivery (date)
- Priority (dropdown)
- Line Items:
  - Item Selection
  - Quantity
  - Unit Price
  - Line Total
- Terms & Conditions
- Special Instructions

### 7. Financial Management Forms

#### Transaction Form (/finance/transactions)

**Form Fields:**

- Transaction Type (dropdown: payment, invoice, credit, debit)
- Party Selection (dropdown)
- Amount (currency, required)
- Payment Method (dropdown)
- Reference Number (text)
- Transaction Date (date)
- Due Date (date, for invoices)
- Description (textarea)
- Job Reference (optional dropdown)

#### Expense Form (/expenses)

**Form Fields:**

- Expense Category (dropdown: ink, salary, electricity, rent, chemicals, maintenance, other)
- Description (required)
- Amount (currency, required)
- Expense Date (date)
- Vendor Name (text)
- Invoice Number (text)
- Payment Method (dropdown)
- Receipt Upload (file)
- Recurring Setup (checkbox + frequency)
- Job Assignment (optional dropdown)

### 8. Settings Configuration (/settings)

**Form Sections:**

- General Settings:

  - Company Information (name, email, phone, address)
  - System Preferences (timezone, currency, language)

- Notification Settings:

  - Email Notifications (toggle)
  - SMS Notifications (toggle)
  - Push Notifications (toggle)
  - Specific Alert Types (toggles)

- Security Settings:

  - Session Timeout (minutes)
  - Password Expiry (days)
  - Two-Factor Auth (toggle)
  - Login Attempt Limits

- System Settings:

  - Auto Backup (toggle + frequency)
  - Data Retention (days)
  - Maintenance Mode (toggle)

- Printing Settings:

  - Default Printer Selection
  - Paper Size Preferences
  - Invoice Template Selection
  - Report Format Preferences

- UI/Appearance:
  - Theme Selection (light/dark)
  - Sidebar Preferences
  - Dashboard Refresh Rate
  - Date/Time Format

## Database Integration Requirements

### Primary Tables Needed:

1. **users** - User authentication and profile management
2. **parties** - Customer and supplier information
3. **machines** - Production equipment management
4. **job_sheets** - Core job management
5. **transactions** - Financial transaction records
6. **expenses** - Expense tracking
7. **inventory_items** - Stock management
8. **inventory_movements** - Stock transaction history
9. **suppliers** - Supplier management
10. **purchase_orders** - Purchase order management
11. **leads** - CRM lead management
12. **roles** - Role and permission management
13. **settings** - System configuration
14. **job_progress** - Job stage tracking
15. **file_uploads** - Document and image storage

### Key Relationships:

- `job_sheets.party_id` → `parties.id`
- `job_sheets.machine_id` → `machines.id`
- `job_sheets.assigned_to` → `users.id`
- `job_sheets.created_by` → `users.id`
- `transactions.party_id` → `parties.id`
- `transactions.job_id` → `job_sheets.id`
- `expenses.job_id` → `job_sheets.id`
- `expenses.created_by` → `users.id`
- `job_progress.job_id` → `job_sheets.id`
- `job_progress.operator_id` → `users.id`

### API Endpoints Required:

- `POST /api/job-sheet` - Create/Update job sheets
- `GET /api/parties` - List all parties
- `POST /api/parties` - Create new party
- `GET /api/users` - List users (role-based)
- `POST /api/users` - Create new user
- `GET /api/machines` - List machines
- `POST /api/transactions` - Record financial transactions
- `POST /api/expenses` - Record expenses
- `GET /api/reports/*` - Various report endpoints
- `POST /api/upload` - File upload handling

## Role-Based Access Control

### Admin Role:

- Full system access
- User management
- System settings
- All reports and analytics
- Financial data access

### Supervisor Role:

- Job management (create, edit, assign)
- Production oversight
- Machine management
- Progress tracking
- Team performance reports

### Finance Role:

- Financial transactions
- Invoice management
- Expense tracking
- Financial reports
- Party payment management

### Operator Role:

- View assigned jobs
- Update job progress
- Machine operation logs
- Basic reporting

## Integration Points for Backend Development

### Authentication & Authorization:

- JWT token-based authentication
- Role-based middleware
- Session management
- Password hashing (bcrypt)

### File Management:

- Image upload for job samples
- PDF upload for job specifications
- Receipt upload for expenses
- Document storage system

### Real-time Updates:

- WebSocket connections for live job updates
- Notification system
- Dashboard real-time metrics

### Reporting & Analytics:

- PDF report generation
- Excel export functionality
- Chart data APIs
- Dashboard metrics calculations

### Data Validation:

- Input sanitization
- Business rule validation
- Duplicate detection
- Data integrity checks

### Backup & Recovery:

- Automated database backups
- Data export functionality
- System restore capabilities

This comprehensive analysis provides a complete blueprint for connecting the frontend forms with backend database systems, ensuring all data points are properly integrated and managed within the ERP system.
