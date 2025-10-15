
import { generateUUID } from './utils/helpers';

export interface Entry {
    id: string;
    description: string;
    amount: number;
    isRecurrent: boolean;
    recurrenceCount: string; // Can be a number string or "infinite"
    type?: 'income' | 'expense_normal' | 'expense_card' | 'fijo' | 'variable' | 'card';
    masterId?: string; // If it's a recurrent copy
    recurrent?: boolean; // A flag to denote a copy
    recurrenceIndex?: number; // e.g., 2 for the 2nd occurrence in a series
}

export interface Income extends Entry {
    type: 'income';
}

export interface CardSubItem {
    id: string;
    description: string;
    amount: number;
    // --- ENHANCEMENT: Added recurrence properties to sub-items ---
    isRecurrent: boolean;
    recurrenceCount: string;
    masterId?: string;
    recurrent?: boolean;
    recurrenceIndex?: number;
}

export interface Expense extends Entry {
    type: 'fijo' | 'variable' | 'card';
    subItems?: CardSubItem[];
}

export interface MonthPlan {
    id: string;
    monthName: string;
    incomes: Income[];
    expenses: Expense[];
}

export interface CashFlowData {
    plan: MonthPlan[];
}

export interface ToastData {
    id: number;
    message: string;
    type: 'success' | 'error';
}
