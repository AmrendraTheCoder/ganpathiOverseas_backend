# Ganpathi Overseas Management System

A comprehensive print shop management system built with Next.js 14, TypeScript, and Tailwind CSS. This system provides complete business management functionality including job tracking, customer management, financial operations, machine monitoring, and analytics.

## 🚀 Features

### Core Functionality

- **Multi-Role Authentication** - Admin, Supervisor, Finance, and Operator roles
- **Role-Based Dashboards** - Customized interfaces for each user type
- **Job Management** - Complete job lifecycle tracking with real-time status updates
- **Customer Management** - Party/customer database with credit monitoring
- **Machine Management** - Equipment tracking, utilization monitoring, and maintenance alerts
- **Financial Management** - Transactions, invoicing, expense tracking, and reporting
- **Analytics & Reports** - Comprehensive business intelligence and performance metrics

### User Roles & Access

#### Admin Dashboard

- Complete system overview
- User management
- Financial overview
- System settings and configuration
- Full access to all modules

#### Supervisor Dashboard

- Production management
- Job assignment and tracking
- Machine utilization monitoring
- Quality control oversight

#### Finance Dashboard

- Revenue and expense tracking
- Invoice management
- Payment processing
- Customer credit monitoring
- Financial reporting

#### Operator Dashboard

- Assigned job tracking
- Machine status monitoring
- Daily task management
- Performance metrics

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Layer**: Demo data with API-ready structure

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

1. **Clone the repository**

```bash
   git clone [repository-url]
   cd ganpathiOverseas_backend
```

2. **Install dependencies**

```bash
npm install
   # or
   yarn install
```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001/api

   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/ganpathi_overseas

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Application Configuration
   APP_NAME=Ganpathi Overseas Management System
   APP_VERSION=1.0.0
   APP_ENVIRONMENT=development
   ```

4. **Run the development server**

```bash
npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Login Credentials

| Role       | Username   | Password |
| ---------- | ---------- | -------- |
| Admin      | admin      | password |
| Supervisor | supervisor | password |
| Finance    | finance    | password |
| Operator   | operator1  | password |

## 🗃️ Database Integration

The system is currently running with demo data but includes a complete API service layer (`src/lib/api.ts`) ready for backend integration. The API endpoints are structured to work with:

- RESTful API design
- JWT authentication
- Role-based access control
- Comprehensive CRUD operations for all entities

### Database Schema

The system is designed to work with the following main entities:

- Users (authentication and role management)
- Parties (customers/clients)
- Machines (production equipment)
- Job Sheets (print jobs and orders)
- Transactions (financial records)
- Expenses (business expenses)
- Job Progress (workflow tracking)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Role-based dashboards
│   ├── jobs/             # Job management
│   ├── parties/          # Customer management
│   ├── machines/         # Machine management
│   ├── expenses/         # Expense management
│   ├── finance/          # Financial management
│   ├── reports/          # Analytics and reports
│   ├── settings/         # System configuration
│   └── users/            # User management
├── components/
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── contexts/             # React contexts
├── data/                 # Demo data and types
├── lib/                  # Utility functions and API
└── styles/               # Global styles
```

## 🎨 UI Components

The system uses a comprehensive component library built on Radix UI primitives:

- **Cards** - Information display containers
- **Tables** - Data presentation with sorting and filtering
- **Forms** - Input handling with validation
- **Navigation** - Sidebar and breadcrumb navigation
- **Badges** - Status and category indicators
- **Progress** - Visual progress indicators
- **Modals** - Overlay dialogs and confirmations

## 📊 Features Overview

### Job Management

- Create and assign print jobs
- Track progress through workflow stages
- Monitor deadlines and priorities
- Resource allocation and scheduling

### Customer Management

- Complete customer database
- Credit limit monitoring
- Transaction history
- Communication tracking

### Machine Management

- Real-time status monitoring
- Utilization tracking
- Maintenance scheduling
- Performance analytics

### Financial Management

- Invoice generation and tracking
- Payment processing
- Expense categorization and approval
- Profit/loss analysis

### Analytics & Reporting

- Business performance dashboards
- Financial reports
- Production metrics
- Customer analytics
- Export capabilities

## 🔄 Development Workflow

1. **Frontend Development** - Complete (current status)
2. **Backend API Development** - Ready for integration
3. **Database Setup** - Schema designed, ready for implementation
4. **Authentication System** - JWT-based, ready for backend
5. **File Upload System** - Structure in place
6. **Notification System** - Framework ready
7. **Testing** - Unit and integration tests
8. **Deployment** - Production deployment setup

## 🚦 Next Steps for Production

1. **Backend Development**

   - Set up Node.js/Express server or similar
   - Implement database with PostgreSQL/MySQL
   - Create API endpoints matching the frontend structure
   - Set up authentication middleware

2. **Database Migration**

   - Create database schema
   - Set up initial data seeding
   - Implement backup and restore functionality

3. **Security Implementation**

   - JWT token management
   - Password hashing
   - API rate limiting
   - Data validation and sanitization

4. **File Management**

   - Image upload for receipts and documents
   - PDF generation for invoices and reports
   - File storage and retrieval system

5. **Notification System**
   - Email notifications
   - SMS alerts
   - Push notifications
   - System alerts and reminders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software for Ganpathi Overseas.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Ganpathi Overseas Print Shop Management**
