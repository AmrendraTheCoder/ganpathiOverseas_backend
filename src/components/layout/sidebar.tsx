"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building,
  Users,
  DollarSign,
  Settings,
  TrendingUp,
  Printer,
  ClipboardList,
  Calculator,
  Package,
  BarChart3,
  LogOut,
  ChevronDown,
  ChevronRight,
  Building2,
  CreditCard,
  Receipt,
  Shield,
  UserCheck,
  Factory,
  Target,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  collapsed?: boolean;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
  badge?: string;
  description?: string;
}

// Role-specific navigation configurations
const getRoleBasedNavigation = (userRole: string): NavItem[] => {
  switch (userRole) {
    case "admin":
      return [
        {
          title: "Dashboard",
          href: "/dashboard/admin",
          icon: LayoutDashboard,
          description: "System overview & analytics",
        },
        {
          title: "Job Management",
          icon: FileText,
          items: [
            {
              title: "All Jobs",
              href: "/jobs",
              icon: FileText,
              description: "View and manage all jobs",
            },
            {
              title: "Create Job",
              href: "/jobs/create",
              icon: ClipboardList,
              description: "Create new job orders",
            },
            {
              title: "Job Progress",
              href: "/jobs/progress",
              icon: TrendingUp,
              description: "Track job progress",
            },
            {
              title: "Job Reports",
              href: "/jobs/reports",
              icon: BarChart3,
              description: "Job analytics & reports",
            },
          ],
        },
        {
          title: "Production Management",
          icon: Factory,
          items: [
            {
              title: "Machines",
              href: "/machines",
              icon: Printer,
              description: "Machine management",
            },
            {
              title: "Production Schedule",
              href: "/production/schedule",
              icon: ClipboardList,
              description: "Schedule production",
            },
            {
              title: "Quality Control",
              href: "/production/quality",
              icon: Target,
              description: "Quality assurance",
            },
          ],
        },
        {
          title: "Customer Management",
          icon: Building,
          items: [
            {
              title: "All Parties",
              href: "/parties",
              icon: Building,
              description: "Customer & supplier management",
            },
            {
              title: "Add Party",
              href: "/parties/create",
              icon: Building2,
              description: "Add new customers/suppliers",
            },
            {
              title: "CRM System",
              href: "/crm",
              icon: Users,
              description: "Customer relationship management",
            },
            {
              title: "Party Reports",
              href: "/parties/reports",
              icon: BarChart3,
              description: "Customer analytics",
            },
          ],
        },
        {
          title: "Financial Management",
          icon: DollarSign,
          items: [
            {
              title: "Transactions",
              href: "/finance/transactions",
              icon: CreditCard,
              description: "Financial transactions",
            },
            {
              title: "Invoices",
              href: "/finance/invoices",
              icon: FileText,
              description: "Invoice management",
            },
            {
              title: "Expenses",
              href: "/expenses",
              icon: Receipt,
              description: "Expense tracking",
            },
            {
              title: "Financial Reports",
              href: "/finance/reports",
              icon: BarChart3,
              description: "Financial analytics",
            },
          ],
        },
        {
          title: "Inventory Management",
          icon: Package,
          items: [
            {
              title: "All Items",
              href: "/inventory",
              icon: Package,
              description: "Inventory overview",
            },
            {
              title: "Stock Movements",
              href: "/inventory/movements",
              icon: TrendingUp,
              description: "Stock transactions",
            },
            {
              title: "Suppliers",
              href: "/inventory/suppliers",
              icon: Building2,
              description: "Supplier management",
            },
            {
              title: "Purchase Orders",
              href: "/inventory/orders",
              icon: FileText,
              description: "Purchase order management",
            },
          ],
        },
        {
          title: "User Management",
          icon: Shield,
          items: [
            {
              title: "All Users",
              href: "/users",
              icon: Users,
              description: "User management",
            },
            {
              title: "Add User",
              href: "/users/create",
              icon: UserCheck,
              description: "Create new users",
            },
            {
              title: "Roles & Permissions",
              href: "/users/roles",
              icon: Shield,
              description: "Manage roles & permissions",
            },
          ],
        },
        {
          title: "Reports & Analytics",
          icon: PieChart,
          items: [
            {
              title: "Business Reports",
              href: "/reports",
              icon: BarChart3,
              description: "Comprehensive business reports",
            },
            {
              title: "Performance Analytics",
              href: "/analytics",
              icon: TrendingUp,
              description: "Performance metrics",
            },
          ],
        },
        {
          title: "System Settings",
          icon: Settings,
          items: [
            {
              title: "General Settings",
              href: "/settings",
              icon: Settings,
              description: "System configuration",
            },
            {
              title: "System Configuration",
              href: "/settings/system",
              icon: Settings,
              description: "Advanced settings",
            },
          ],
        },
      ];

    case "supervisor":
      return [
        {
          title: "Dashboard",
          href: "/dashboard/supervisor",
          icon: LayoutDashboard,
          description: "Production overview",
        },
        {
          title: "Job Management",
          icon: FileText,
          items: [
            {
              title: "All Jobs",
              href: "/jobs",
              icon: FileText,
              description: "View and manage jobs",
            },
            {
              title: "Create Job",
              href: "/jobs/create",
              icon: ClipboardList,
              description: "Create new job orders",
            },
            {
              title: "Job Progress",
              href: "/jobs/progress",
              icon: TrendingUp,
              description: "Track job progress",
            },
            {
              title: "Job Reports",
              href: "/jobs/reports",
              icon: BarChart3,
              description: "Job performance reports",
            },
          ],
        },
        {
          title: "Production Management",
          icon: Factory,
          items: [
            {
              title: "Machines",
              href: "/machines",
              icon: Printer,
              description: "Machine monitoring",
            },
            {
              title: "Production Schedule",
              href: "/production/schedule",
              icon: ClipboardList,
              description: "Production planning",
            },
            {
              title: "Quality Control",
              href: "/production/quality",
              icon: Target,
              description: "Quality monitoring",
            },
          ],
        },
        {
          title: "Customer Management",
          icon: Building,
          items: [
            {
              title: "All Parties",
              href: "/parties",
              icon: Building,
              description: "Customer information",
            },
            {
              title: "Add Party",
              href: "/parties/create",
              icon: Building2,
              description: "Add new customers",
            },
            {
              title: "CRM System",
              href: "/crm",
              icon: Users,
              description: "Customer management",
            },
          ],
        },
        {
          title: "Inventory",
          icon: Package,
          items: [
            {
              title: "All Items",
              href: "/inventory",
              icon: Package,
              description: "Stock overview",
            },
            {
              title: "Stock Movements",
              href: "/inventory/movements",
              icon: TrendingUp,
              description: "Stock tracking",
            },
          ],
        },
        {
          title: "Reports",
          icon: BarChart3,
          items: [
            {
              title: "Production Reports",
              href: "/reports",
              icon: BarChart3,
              description: "Production analytics",
            },
            {
              title: "Performance Analytics",
              href: "/analytics",
              icon: TrendingUp,
              description: "Team performance",
            },
          ],
        },
      ];

    case "finance":
      return [
        {
          title: "Dashboard",
          href: "/dashboard/finance",
          icon: LayoutDashboard,
          description: "Financial overview",
        },
        {
          title: "Financial Management",
          icon: DollarSign,
          items: [
            {
              title: "Transactions",
              href: "/finance/transactions",
              icon: CreditCard,
              description: "Payment transactions",
            },
            {
              title: "Invoices",
              href: "/finance/invoices",
              icon: FileText,
              description: "Invoice management",
            },
            {
              title: "Expenses",
              href: "/expenses",
              icon: Receipt,
              description: "Expense tracking",
            },
            {
              title: "Financial Reports",
              href: "/finance/reports",
              icon: BarChart3,
              description: "Financial analytics",
            },
          ],
        },
        {
          title: "Customer Management",
          icon: Building,
          items: [
            {
              title: "All Parties",
              href: "/parties",
              icon: Building,
              description: "Customer accounts",
            },
            {
              title: "CRM System",
              href: "/crm",
              icon: Users,
              description: "Customer relationships",
            },
            {
              title: "Party Reports",
              href: "/parties/reports",
              icon: BarChart3,
              description: "Customer financial reports",
            },
          ],
        },
        {
          title: "Inventory",
          icon: Package,
          items: [
            {
              title: "All Items",
              href: "/inventory",
              icon: Package,
              description: "Inventory valuation",
            },
            {
              title: "Stock Movements",
              href: "/inventory/movements",
              icon: TrendingUp,
              description: "Cost tracking",
            },
            {
              title: "Suppliers",
              href: "/inventory/suppliers",
              icon: Building2,
              description: "Supplier payments",
            },
            {
              title: "Purchase Orders",
              href: "/inventory/orders",
              icon: FileText,
              description: "Purchase management",
            },
          ],
        },
        {
          title: "Reports",
          icon: BarChart3,
          items: [
            {
              title: "Financial Reports",
              href: "/reports",
              icon: BarChart3,
              description: "Financial analytics",
            },
          ],
        },
      ];

    case "operator":
      return [
        {
          title: "Dashboard",
          href: "/dashboard/operator",
          icon: LayoutDashboard,
          description: "My work overview",
        },
        {
          title: "My Jobs",
          icon: FileText,
          items: [
            {
              title: "Assigned Jobs",
              href: "/jobs",
              icon: FileText,
              description: "Jobs assigned to me",
            },
            {
              title: "Job Progress",
              href: "/jobs/progress",
              icon: TrendingUp,
              description: "Update job progress",
            },
          ],
        },
      ];

    default:
      return [];
  }
};

const Sidebar = ({ collapsed = false }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Simple state management for expanded items
  const [expandedItems, setExpandedItems] = React.useState<string[]>([
    "Dashboard",
  ]);

  // Get role-specific navigation
  const navigationItems = user ? getRoleBasedNavigation(user.role) : [];

  // Simple effect to auto-expand based on current route
  React.useEffect(() => {
    const newExpanded = ["Dashboard"];

    // Auto-expand relevant sections based on pathname
    if (pathname.startsWith("/jobs")) {
      newExpanded.push("Job Management", "My Jobs");
    }
    if (
      pathname.startsWith("/machines") ||
      pathname.startsWith("/production")
    ) {
      newExpanded.push("Production Management", "Production");
    }
    if (pathname.startsWith("/parties") || pathname.startsWith("/crm")) {
      newExpanded.push("Customer Management");
    }
    if (pathname.startsWith("/finance") || pathname.startsWith("/expenses")) {
      newExpanded.push("Financial Management");
    }
    if (pathname.startsWith("/inventory")) {
      newExpanded.push("Inventory Management", "Inventory");
    }
    if (pathname.startsWith("/users")) {
      newExpanded.push("User Management");
    }
    if (pathname.startsWith("/reports") || pathname.startsWith("/analytics")) {
      newExpanded.push("Reports & Analytics", "Reports");
    }
    if (pathname.startsWith("/settings")) {
      newExpanded.push("System Settings");
    }

    setExpandedItems(newExpanded);
  }, [pathname]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
    logout();
    router.push("/sign-in");
  };

  if (!user) return null;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-start h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Ganpathi Overseas
            </h1>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">
              Job Management System
            </p>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isExpanded = expandedItems.includes(item.title);

          return (
            <div key={item.title}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isItemActive(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={!collapsed ? undefined : item.description}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex-1">
                      <span>{item.title}</span>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => !collapsed && toggleExpanded(item.title)}
                  className={cn(
                    "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors text-left",
                    "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={!collapsed ? undefined : item.title}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </button>
              )}

              {/* Sub-items */}
              {item.items && !collapsed && isExpanded && (
                <div className="mt-1 space-y-1">
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.href!}
                      className={cn(
                        "group flex items-center pl-8 pr-2 py-2 text-sm rounded-md transition-colors",
                        isItemActive(subItem.href)
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <span>{subItem.title}</span>
                        {subItem.description && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {subItem.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer - Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={cn(
            "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors",
            "text-gray-600 hover:bg-red-50 hover:text-red-700"
          )}
          title={!collapsed ? undefined : "Sign Out"}
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
