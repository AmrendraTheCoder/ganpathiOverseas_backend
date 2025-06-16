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
  roles?: string[];
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        title: "Admin Overview",
        href: "/dashboard/admin",
        icon: LayoutDashboard,
        roles: ["admin"],
      },
      {
        title: "Supervisor View",
        href: "/dashboard/supervisor",
        icon: LayoutDashboard,
        roles: ["admin", "supervisor"],
      },
      {
        title: "Finance View",
        href: "/dashboard/finance",
        icon: LayoutDashboard,
        roles: ["admin", "finance"],
      },
      {
        title: "Operator View",
        href: "/dashboard/operator",
        icon: LayoutDashboard,
        roles: ["admin", "operator"],
      },
    ],
  },
  {
    title: "Job Management",
    icon: FileText,
    items: [
      {
        title: "All Jobs",
        href: "/jobs",
        icon: FileText,
        roles: ["admin", "supervisor", "operator"],
      },
      {
        title: "Create Job",
        href: "/jobs/create",
        icon: ClipboardList,
        roles: ["admin", "supervisor"],
      },
      {
        title: "Job Progress",
        href: "/jobs/progress",
        icon: TrendingUp,
        roles: ["admin", "supervisor", "operator"],
      },
      {
        title: "Job Reports",
        href: "/jobs/reports",
        icon: BarChart3,
        roles: ["admin", "supervisor"],
      },
    ],
  },
  {
    title: "Production Management",
    icon: Printer,
    items: [
      {
        title: "Machines",
        href: "/machines",
        icon: Printer,
        roles: ["admin", "supervisor", "operator"],
      },
      {
        title: "Production Schedule",
        href: "/production/schedule",
        icon: ClipboardList,
        roles: ["admin", "supervisor"],
      },
      {
        title: "Quality Control",
        href: "/production/quality",
        icon: Package,
        roles: ["admin", "supervisor", "operator"],
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
        roles: ["admin", "supervisor", "finance"],
      },
      {
        title: "Add Party",
        href: "/parties/create",
        icon: Building,
        roles: ["admin", "supervisor"],
      },
      {
        title: "CRM System",
        href: "/crm",
        icon: Users,
        roles: ["admin", "supervisor", "finance"],
      },
      {
        title: "Party Reports",
        href: "/parties/reports",
        icon: BarChart3,
        roles: ["admin", "finance"],
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
        roles: ["admin", "finance"],
      },
      {
        title: "Invoices",
        href: "/finance/invoices",
        icon: FileText,
        roles: ["admin", "finance"],
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: Receipt,
        roles: ["admin", "finance"],
      },
      {
        title: "Financial Reports",
        href: "/finance/reports",
        icon: BarChart3,
        roles: ["admin", "finance"],
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
        roles: ["admin", "supervisor", "finance"],
      },
      {
        title: "Stock Movements",
        href: "/inventory/movements",
        icon: TrendingUp,
        roles: ["admin", "supervisor", "finance"],
      },
      {
        title: "Suppliers",
        href: "/inventory/suppliers",
        icon: Building2,
        roles: ["admin", "finance"],
      },
      {
        title: "Purchase Orders",
        href: "/inventory/orders",
        icon: FileText,
        roles: ["admin", "finance"],
      },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      { title: "All Users", href: "/users", icon: Users, roles: ["admin"] },
      {
        title: "Add User",
        href: "/users/create",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "Roles & Permissions",
        href: "/users/roles",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    items: [
      {
        title: "Business Reports",
        href: "/reports",
        icon: BarChart3,
        roles: ["admin", "supervisor", "finance"],
      },
      {
        title: "Performance Analytics",
        href: "/analytics",
        icon: TrendingUp,
        roles: ["admin", "supervisor"],
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      {
        title: "General Settings",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
      },
      {
        title: "System Configuration",
        href: "/settings/system",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
];

const Sidebar = ({ collapsed = false }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Simple state management for expanded items
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["Dashboard", "Job Management"]);

  // Simple effect to auto-expand based on current route
  React.useEffect(() => {
    const newExpanded = ["Dashboard"];
    
    // Auto-expand relevant sections based on pathname
    if (pathname.startsWith("/jobs")) {
      newExpanded.push("Job Management");
    }
    if (pathname.startsWith("/machines") || pathname.startsWith("/production")) {
      newExpanded.push("Production Management");
    }
    if (pathname.startsWith("/parties") || pathname.startsWith("/crm")) {
      newExpanded.push("Customer Management");
    }
    if (pathname.startsWith("/finance") || pathname.startsWith("/expenses")) {
      newExpanded.push("Financial Management");
    }
    if (pathname.startsWith("/inventory")) {
      newExpanded.push("Inventory");
    }
    if (pathname.startsWith("/users")) {
      newExpanded.push("User Management");
    }
    if (pathname.startsWith("/reports") || pathname.startsWith("/analytics")) {
      newExpanded.push("Reports & Analytics");
    }
    if (pathname.startsWith("/settings")) {
      newExpanded.push("Settings");
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

  const hasAccess = (roles?: string[]) => {
    if (!roles || !user) return true;
    return roles.includes(user.role);
  };

  const filteredNavigation = navigationItems.filter(
    (item) =>
      hasAccess(item.roles) ||
      (item.items && item.items.some((subItem) => hasAccess(subItem.roles)))
  );

  const isItemActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
    logout();
    router.push("/sign-in");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Ganpathi Overseas
            </h1>
            <p className="text-xs text-gray-500">Job Management System</p>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && user && (
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
        {filteredNavigation.map((item) => {
          const isExpanded = expandedItems.includes(item.title);
          const hasVisibleItems = item.items?.some((subItem) =>
            hasAccess(subItem.roles)
          );

          if (!hasVisibleItems && item.items) return null;

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
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              ) : (
                <button
                  onClick={() => !collapsed && toggleExpanded(item.title)}
                  className={cn(
                    "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors text-left",
                    "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
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
                  {item.items
                    .filter((subItem) => hasAccess(subItem.roles))
                    .map((subItem) => (
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
                        <span>{subItem.title}</span>
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
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
