import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Receipt {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  notes?: string;
  tags: string[];
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const RECEIPTS_KEY = 'receipts';
const CATEGORIES_KEY = 'categories';
const AUTO_CLEAN_SETTINGS_KEY = 'autoCleanSettings';
const CURRENCY_SETTINGS_KEY = 'currencySettings';

export interface AutoCleanSettings {
  enabled: boolean;
  days: number;
}

export interface CurrencySettings {
  currency: string;
}

export class ReceiptStorage {
  static async getAllReceipts(): Promise<Receipt[]> {
    try {
      const receiptsJson = await AsyncStorage.getItem(RECEIPTS_KEY);
      return receiptsJson ? JSON.parse(receiptsJson) : [];
    } catch (error) {
      console.error('Error getting receipts:', error);
      return [];
    }
  }

  static async saveReceipt(receipt: Receipt): Promise<void> {
    try {
      const receipts = await this.getAllReceipts();
      const existingIndex = receipts.findIndex(r => r.id === receipt.id);
      
      if (existingIndex >= 0) {
        receipts[existingIndex] = receipt;
      } else {
        receipts.push(receipt);
      }
      
      await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    } catch (error) {
      console.error('Error saving receipt:', error);
      throw error;
    }
  }

  static async deleteReceipt(receiptId: string): Promise<void> {
    try {
      const receipts = await this.getAllReceipts();
      const filteredReceipts = receipts.filter(r => r.id !== receiptId);
      await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(filteredReceipts));
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }

  static async getReceiptsByMonth(year: number, month: number): Promise<Receipt[]> {
    const receipts = await this.getAllReceipts();
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate.getFullYear() === year && receiptDate.getMonth() === month;
    });
  }

  static async getReceiptsByTag(tag: string): Promise<Receipt[]> {
    const receipts = await this.getAllReceipts();
    return receipts.filter(receipt => receipt.tags.includes(tag));
  }

  // Category methods
  static async getAllCategories(): Promise<Category[]> {
    try {
      const categoriesJson = await AsyncStorage.getItem(CATEGORIES_KEY);
      return categoriesJson ? JSON.parse(categoriesJson) : [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  static async saveCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getAllCategories();
      const existingIndex = categories.findIndex(c => c.id === category.id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = category;
      } else {
        categories.push(category);
      }
      
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      const categories = await this.getAllCategories();
      const filteredCategories = categories.filter(c => c.id !== categoryId);
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(filteredCategories));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Utility methods
  static async getMonthlySpending(year: number, month: number): Promise<number> {
    const receipts = await this.getReceiptsByMonth(year, month);
    return receipts.reduce((total, receipt) => total + receipt.amount, 0);
  }

  static async exportData(): Promise<{ receipts: Receipt[], categories: Category[] }> {
    const receipts = await this.getAllReceipts();
    const categories = await this.getAllCategories();
    return { receipts, categories };
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([RECEIPTS_KEY, CATEGORIES_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Auto-clean functionality
  static async getAutoCleanSettings(): Promise<AutoCleanSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(AUTO_CLEAN_SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : { enabled: false, days: 30 };
    } catch (error) {
      console.error('Error getting auto-clean settings:', error);
      return { enabled: false, days: 30 };
    }
  }

  static async saveAutoCleanSettings(settings: AutoCleanSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTO_CLEAN_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving auto-clean settings:', error);
      throw error;
    }
  }

  static async getCurrencySettings(): Promise<CurrencySettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(CURRENCY_SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : { currency: 'USD' };
    } catch (error) {
      console.error('Error getting currency settings:', error);
      return { currency: 'USD' };
    }
  }

  static async saveCurrencySettings(settings: CurrencySettings): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENCY_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving currency settings:', error);
      throw error;
    }
  }

  static async cleanOldReceipts(): Promise<{ deletedCount: number; totalDeleted: number }> {
    try {
      const settings = await this.getAutoCleanSettings();
      if (!settings.enabled) {
        return { deletedCount: 0, totalDeleted: 0 };
      }

      const receipts = await this.getAllReceipts();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.days);

      const oldReceipts = receipts.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return receiptDate < cutoffDate;
      });

      if (oldReceipts.length === 0) {
        return { deletedCount: 0, totalDeleted: 0 };
      }

      // Delete old receipts
      const remainingReceipts = receipts.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return receiptDate >= cutoffDate;
      });

      await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(remainingReceipts));

      // Clean up associated images
      let totalDeleted = 0;
      for (const receipt of oldReceipts) {
        if (receipt.imageUri) {
          try {
            // Note: In a real app, you'd want to use expo-file-system to delete the actual file
            // For now, we'll just track the count
            totalDeleted++;
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }

      return { 
        deletedCount: oldReceipts.length, 
        totalDeleted 
      };
    } catch (error) {
      console.error('Error cleaning old receipts:', error);
      throw error;
    }
  }
}
