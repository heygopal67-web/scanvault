import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Category, Receipt, ReceiptStorage } from "../storage/receiptStorage";

interface AppState {
  receipts: Receipt[];
  categories: Category[];
  isLoading: boolean;
  autoCleanEnabled: boolean;
  autoCleanDays: number;
  selectedCurrency: string;
  isInitialized: boolean;
}

type AppAction =
  | { type: "SET_RECEIPTS"; payload: Receipt[] }
  | { type: "ADD_RECEIPT"; payload: Receipt }
  | { type: "UPDATE_RECEIPT"; payload: Receipt }
  | { type: "DELETE_RECEIPT"; payload: string }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "TOGGLE_AUTO_CLEAN"; payload: boolean }
  | { type: "SET_AUTO_CLEAN_DAYS"; payload: number }
  | { type: "SET_CURRENCY"; payload: string }
  | { type: "SET_INITIALIZED"; payload: boolean };

const initialState: AppState = {
  receipts: [],
  categories: [],
  isLoading: true,
  autoCleanEnabled: false,
  autoCleanDays: 30,
  selectedCurrency: "$",
  isInitialized: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_RECEIPTS":
      return { ...state, receipts: action.payload };
    case "ADD_RECEIPT":
      return { ...state, receipts: [...state.receipts, action.payload] };
    case "UPDATE_RECEIPT":
      return {
        ...state,
        receipts: state.receipts.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case "DELETE_RECEIPT":
      return {
        ...state,
        receipts: state.receipts.filter((r) => r.id !== action.payload),
      };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "TOGGLE_AUTO_CLEAN":
      return { ...state, autoCleanEnabled: action.payload };
    case "SET_AUTO_CLEAN_DAYS":
      return { ...state, autoCleanDays: action.payload };
    case "SET_CURRENCY":
      return { ...state, selectedCurrency: action.payload };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loadReceipts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  saveReceipt: (receipt: Receipt) => Promise<void>;
  deleteReceipt: (receiptId: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  initializeApp: () => Promise<void>;
  runAutoClean: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadCategories = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const categories = await ReceiptStorage.getAllCategories();
      dispatch({ type: "SET_CATEGORIES", payload: categories });
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const loadReceipts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const receipts = await ReceiptStorage.getAllReceipts();
      dispatch({ type: "SET_RECEIPTS", payload: receipts });
    } catch (error) {
      console.error("Error loading receipts:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const initializeApp = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Load auto-clean settings
      const autoCleanSettings = await ReceiptStorage.getAutoCleanSettings();
      dispatch({
        type: "TOGGLE_AUTO_CLEAN",
        payload: autoCleanSettings.enabled,
      });
      dispatch({
        type: "SET_AUTO_CLEAN_DAYS",
        payload: autoCleanSettings.days,
      });

      // Load currency settings
      const currencySettings = await ReceiptStorage.getCurrencySettings();
      dispatch({
        type: "SET_CURRENCY",
        payload: currencySettings.currency,
      });

      await Promise.all([loadReceipts(), loadCategories()]);
      dispatch({ type: "SET_INITIALIZED", payload: true });
    } catch (error) {
      console.error("Error initializing app:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [loadReceipts, loadCategories]);

  const saveReceipt = async (receipt: Receipt) => {
    try {
      await ReceiptStorage.saveReceipt(receipt);
      if (state.receipts.find((r) => r.id === receipt.id)) {
        dispatch({ type: "UPDATE_RECEIPT", payload: receipt });
      } else {
        dispatch({ type: "ADD_RECEIPT", payload: receipt });
      }
    } catch (error) {
      console.error("Error saving receipt:", error);
      throw error;
    }
  };

  const deleteReceipt = async (receiptId: string) => {
    try {
      await ReceiptStorage.deleteReceipt(receiptId);
      dispatch({ type: "DELETE_RECEIPT", payload: receiptId });
    } catch (error) {
      console.error("Error deleting receipt:", error);
      throw error;
    }
  };

  const saveCategory = async (category: Category) => {
    try {
      await ReceiptStorage.saveCategory(category);
      if (state.categories.find((c) => c.id === category.id)) {
        // Update existing category
        dispatch({
          type: "SET_CATEGORIES",
          payload: state.categories.map((c) =>
            c.id === category.id ? category : c
          ),
        });
      } else {
        dispatch({ type: "ADD_CATEGORY", payload: category });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await ReceiptStorage.deleteCategory(categoryId);
      dispatch({ type: "DELETE_CATEGORY", payload: categoryId });
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  const runAutoClean = async () => {
    try {
      const result = await ReceiptStorage.cleanOldReceipts();
      if (result.deletedCount > 0) {
        // Refresh receipts list after auto-clean
        const updatedReceipts = await ReceiptStorage.getAllReceipts();
        dispatch({ type: "SET_RECEIPTS", payload: updatedReceipts });
      }
    } catch (error) {
      console.error("Error running auto-clean:", error);
      throw error;
    }
  };

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const value: AppContextType = {
    state,
    dispatch,
    loadReceipts,
    loadCategories,
    saveReceipt,
    deleteReceipt,
    saveCategory,
    deleteCategory,
    initializeApp,
    runAutoClean,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
