import React, { useMemo } from 'react';
import type { MonthPlan, Expense, Entry } from '../types';
import { formatCurrency } from '../utils/helpers';
import { EntryList } from './EntryList';

interface MonthCardProps {
    monthData: MonthPlan;
    monthIndex: number;
    onAddEntry: (monthIndex: number) => void;
    onEditEntry: (monthIndex: number, entry: Entry) => void;
    onDeleteEntry: (monthIndex: number, entryId: string, type: 'income' | 'expense') => void;
    onDeleteMonth: (monthIndex: number, monthName: string) => void;
    onOpenCardModal: (monthIndex: number, expense: Expense) => void;
    getMasterCardEntry: (expense: Expense) => Expense | null;
    getMasterEntry: (entry: Entry) => Entry | null;
}

export const MonthCard: React.FC<MonthCardProps> = ({ monthData, monthIndex, onDeleteMonth, ...listProps }) => {
    const { totalIncome, totalExpenses, netFlow } = useMemo(() => {
        const income = monthData.incomes.reduce((sum, entry) => sum + entry.amount, 0);
        const expenses = monthData.expenses.reduce((sum, entry) => {
            if (entry.type === 'card') {
                // FIX: Calculate total directly from the current month's card entry.
                // The `entry` object already has the correct sub-items for the month after processing.
                const cardTotal = entry.subItems?.reduce((subSum, item) => subSum + item.amount, 0) || 0;
                return sum + cardTotal;
            }
            return sum + entry.amount;
        }, 0);
        return {
            totalIncome: income,
            totalExpenses: expenses,
            netFlow: income - expenses,
        };
    }, [monthData]);

    const isPositiveFlow = netFlow >= 0;

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md transition-shadow hover:shadow-xl">
            <div className="flex justify-between items-start mb-4 border-b pb-2">
                <h3 className="text-xl font-bold text-primary-blue">{monthData.monthName}</h3>
                <button onClick={() => onDeleteMonth(monthIndex, monthData.monthName)} className="text-gray-400 hover:text-red-600 p-1 rounded-full transition duration-150" aria-label="Eliminar Mes">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"></path></svg>
                </button>
            </div>
            
            <div className={`mb-4 p-3 rounded-lg ${isPositiveFlow ? 'bg-secondary-green/10' : 'bg-red-500/10'} border-l-4 ${isPositiveFlow ? 'border-secondary-green' : 'border-red-500'}`}>
                <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Saldo del Mes</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${isPositiveFlow ? 'bg-secondary-green' : 'bg-red-500'}`}>
                        {isPositiveFlow ? 'Ahorro' : 'Déficit'}
                    </span>
                </div>
                <p className={`text-2xl font-extrabold mt-1 ${isPositiveFlow ? 'text-secondary-green' : 'text-red-500'}`}>{formatCurrency(netFlow)}</p>
            </div>

            <div>
                <h4 className="text-lg font-bold text-secondary-green mb-2 flex justify-between items-center">
                    <span>Ingresos ({formatCurrency(totalIncome)})</span>
                    <button onClick={() => listProps.onAddEntry(monthIndex)} className="text-sm bg-secondary-green text-white px-3 py-1 rounded-full hover:bg-emerald-600 transition duration-150">
                        + Añadir
                    </button>
                </h4>
                <EntryList type="income" entries={monthData.incomes} monthIndex={monthIndex} {...listProps} />
            </div>

            <div className="mt-4">
                <h4 className="text-lg font-bold text-red-500 mb-2">Gastos ({formatCurrency(totalExpenses)})</h4>
                <EntryList type="expense" entries={monthData.expenses} monthIndex={monthIndex} {...listProps} />
            </div>
        </div>
    );
};