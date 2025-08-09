import { Receipt } from "../storage/receiptStorage";
export const formatCurrency = (
  amount: number,
  currencySymbol: string = "$"
): string => {
  return `${currencySymbol}${amount.toFixed(2)}`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateForInput = (date: string): string => {
  return new Date(date).toISOString().split("T")[0];
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCurrentMonth = (): { year: number; month: number } => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
};

export const getMonthlySpending = (
  receipts: Receipt[],
  year: number,
  month: number
): number => {
  return receipts
    .filter((receipt) => {
      const receiptDate = new Date(receipt.date);
      return (
        receiptDate.getFullYear() === year && receiptDate.getMonth() === month
      );
    })
    .reduce((total, receipt) => total + receipt.amount, 0);
};

export const getReceiptsByTag = (
  receipts: Receipt[],
  tag: string
): Receipt[] => {
  return receipts.filter((receipt) => receipt.tags.includes(tag));
};

export const getSpendingByCategory = (
  receipts: Receipt[],
  categories: any[]
): { [key: string]: number } => {
  const spending: { [key: string]: number } = {};

  receipts.forEach((receipt) => {
    receipt.tags.forEach((tag) => {
      if (spending[tag]) {
        spending[tag] += receipt.amount;
      } else {
        spending[tag] = receipt.amount;
      }
    });
  });

  return spending;
};

export const getTotalSpending = (receipts: Receipt[]): number => {
  return receipts.reduce((total, receipt) => total + receipt.amount, 0);
};

export const getRecentReceipts = (
  receipts: Receipt[],
  limit: number = 5
): Receipt[] => {
  return receipts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const validateReceipt = (
  receipt: Partial<Receipt>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!receipt.vendor || receipt.vendor.trim() === "") {
    errors.push("Vendor is required");
  }

  if (!receipt.amount || receipt.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (!receipt.date) {
    errors.push("Date is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
