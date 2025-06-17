import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Consistent date formatting to prevent hydration errors
export function formatDate(
  date: string | Date | null | undefined,
  options?: {
    format?: "short" | "long" | "numeric";
    includeTime?: boolean;
  }
): string {
  if (!date) return "Not set";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "Invalid date";

  const { format = "short", includeTime = false } = options || {};

  // Use consistent locale and format
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month:
      format === "long" ? "long" : format === "short" ? "short" : "2-digit",
    day: "2-digit",
  };

  if (includeTime) {
    dateOptions.hour = "2-digit";
    dateOptions.minute = "2-digit";
  }

  // Always use 'en-US' locale for consistency
  return dateObj.toLocaleDateString("en-US", dateOptions);
}

export function formatCurrency(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
