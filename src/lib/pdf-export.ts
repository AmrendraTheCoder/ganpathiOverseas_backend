import jsPDF from "jspdf";
import "jspdf-autotable";

interface FinancialReportData {
  title: string;
  dateRange: string;
  revenue: number;
  expenses: number;
  profit: number;
  items?: Array<{
    description: string;
    amount: number;
    category?: string;
    date?: string;
  }>;
}

interface BalanceSheetData {
  assets: {
    current: Array<{ name: string; amount: number }>;
    fixed: Array<{ name: string; amount: number }>;
  };
  liabilities: Array<{ name: string; amount: number }>;
  equity: Array<{ name: string; amount: number }>;
}

export class PDFExporter {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(title: string, dateRange?: string) {
    // Company header
    this.doc.setFontSize(20);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Ganpathi Overseas", 20, 20);

    this.doc.setFontSize(12);
    this.doc.setFont(undefined, "normal");
    this.doc.text("Financial Report", 20, 30);

    // Report title
    this.doc.setFontSize(16);
    this.doc.setFont(undefined, "bold");
    this.doc.text(title, 20, 45);

    if (dateRange) {
      this.doc.setFontSize(10);
      this.doc.setFont(undefined, "normal");
      this.doc.text(`Period: ${dateRange}`, 20, 55);
    }

    // Add line separator
    this.doc.line(20, 60, 190, 60);

    return 70; // Return Y position for next content
  }

  private addFooter() {
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(8);
    this.doc.setFont(undefined, "normal");
    this.doc.text(
      `Generated on ${new Date().toLocaleDateString("en-IN")}`,
      20,
      pageHeight - 10
    );
    this.doc.text("Confidential - For internal use only", 150, pageHeight - 10);
  }

  exportProfitLossReport(data: FinancialReportData): void {
    let yPosition = this.addHeader("Profit & Loss Statement", data.dateRange);

    // Summary section
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Financial Summary", 20, yPosition);
    yPosition += 15;

    const summaryData = [
      ["Revenue", `₹${data.revenue.toLocaleString()}`],
      ["Expenses", `₹${data.expenses.toLocaleString()}`],
      ["Net Profit", `₹${data.profit.toLocaleString()}`],
      ["Profit Margin", `${((data.profit / data.revenue) * 100).toFixed(2)}%`],
    ];

    (this.doc as any).autoTable({
      startY: yPosition,
      head: [["Description", "Amount"]],
      body: summaryData,
      theme: "striped",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPosition = (this.doc as any).lastAutoTable.finalY + 20;

    // Detailed items if available
    if (data.items && data.items.length > 0) {
      this.doc.setFontSize(14);
      this.doc.setFont(undefined, "bold");
      this.doc.text("Detailed Breakdown", 20, yPosition);
      yPosition += 10;

      const itemsData = data.items.map((item) => [
        item.description,
        item.category || "N/A",
        item.date || "N/A",
        `₹${item.amount.toLocaleString()}`,
      ]);

      (this.doc as any).autoTable({
        startY: yPosition,
        head: [["Description", "Category", "Date", "Amount"]],
        body: itemsData,
        theme: "striped",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    this.addFooter();
    this.doc.save(`profit-loss-${new Date().toISOString().split("T")[0]}.pdf`);
  }

  exportBalanceSheet(data: BalanceSheetData): void {
    let yPosition = this.addHeader(
      "Balance Sheet",
      new Date().toLocaleDateString("en-IN")
    );

    // Assets section
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, "bold");
    this.doc.text("ASSETS", 20, yPosition);
    yPosition += 15;

    // Current Assets
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Current Assets", 25, yPosition);
    yPosition += 10;

    const currentAssetsData = data.assets.current.map((asset) => [
      asset.name,
      `₹${asset.amount.toLocaleString()}`,
    ]);

    (this.doc as any).autoTable({
      startY: yPosition,
      body: currentAssetsData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: "right" },
      },
    });

    yPosition = (this.doc as any).lastAutoTable.finalY + 10;

    // Fixed Assets
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Fixed Assets", 25, yPosition);
    yPosition += 10;

    const fixedAssetsData = data.assets.fixed.map((asset) => [
      asset.name,
      `₹${asset.amount.toLocaleString()}`,
    ]);

    (this.doc as any).autoTable({
      startY: yPosition,
      body: fixedAssetsData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: "right" },
      },
    });

    yPosition = (this.doc as any).lastAutoTable.finalY + 20;

    // Liabilities & Equity section
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, "bold");
    this.doc.text("LIABILITIES & EQUITY", 20, yPosition);
    yPosition += 15;

    // Liabilities
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Liabilities", 25, yPosition);
    yPosition += 10;

    const liabilitiesData = data.liabilities.map((liability) => [
      liability.name,
      `₹${liability.amount.toLocaleString()}`,
    ]);

    (this.doc as any).autoTable({
      startY: yPosition,
      body: liabilitiesData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: "right" },
      },
    });

    yPosition = (this.doc as any).lastAutoTable.finalY + 10;

    // Equity
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Equity", 25, yPosition);
    yPosition += 10;

    const equityData = data.equity.map((equity) => [
      equity.name,
      `₹${equity.amount.toLocaleString()}`,
    ]);

    (this.doc as any).autoTable({
      startY: yPosition,
      body: equityData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: "right" },
      },
    });

    this.addFooter();
    this.doc.save(
      `balance-sheet-${new Date().toISOString().split("T")[0]}.pdf`
    );
  }

  exportInvoice(invoiceData: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    customer: { name: string; address: string; email?: string; phone?: string };
    items: Array<{
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  }): void {
    let yPosition = this.addHeader(
      `Invoice #${invoiceData.invoiceNumber}`,
      `Date: ${invoiceData.date}`
    );

    // Customer details
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, "bold");
    this.doc.text("Bill To:", 20, yPosition);
    this.doc.setFont(undefined, "normal");
    this.doc.text(invoiceData.customer.name, 20, yPosition + 10);
    this.doc.text(invoiceData.customer.address, 20, yPosition + 20);
    if (invoiceData.customer.email) {
      this.doc.text(invoiceData.customer.email, 20, yPosition + 30);
    }
    if (invoiceData.customer.phone) {
      this.doc.text(invoiceData.customer.phone, 20, yPosition + 40);
    }

    // Invoice details
    this.doc.setFont(undefined, "bold");
    this.doc.text("Due Date:", 120, yPosition);
    this.doc.setFont(undefined, "normal");
    this.doc.text(invoiceData.dueDate, 120, yPosition + 10);

    yPosition += 60;

    // Items table
    const itemsData = invoiceData.items.map((item) => [
      item.description,
      item.quantity.toString(),
      `₹${item.rate.toLocaleString()}`,
      `₹${item.amount.toLocaleString()}`,
    ]);

    (this.doc as any).autoTable({
      startY: yPosition,
      head: [["Description", "Qty", "Rate", "Amount"]],
      body: itemsData,
      theme: "striped",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: { 3: { halign: "right" } },
    });

    yPosition = (this.doc as any).lastAutoTable.finalY + 10;

    // Totals
    const totalsData = [
      ["Subtotal", `₹${invoiceData.subtotal.toLocaleString()}`],
      ["Tax", `₹${invoiceData.tax.toLocaleString()}`],
      ["Discount", `₹${invoiceData.discount.toLocaleString()}`],
      ["Total", `₹${invoiceData.total.toLocaleString()}`],
    ];

    (this.doc as any).autoTable({
      startY: yPosition,
      body: totalsData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 140 },
        1: { cellWidth: 50, halign: "right" },
      },
      margin: { left: 100 },
    });

    this.addFooter();
    this.doc.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
  }
}

// Export utility functions
export const exportProfitLossReport = (data: FinancialReportData) => {
  const exporter = new PDFExporter();
  exporter.exportProfitLossReport(data);
};

export const exportBalanceSheet = (data: BalanceSheetData) => {
  const exporter = new PDFExporter();
  exporter.exportBalanceSheet(data);
};

export const exportInvoice = (invoiceData: any) => {
  const exporter = new PDFExporter();
  exporter.exportInvoice(invoiceData);
};
