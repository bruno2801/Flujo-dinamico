import React from 'react';
import type { MonthPlan, Expense, Entry } from '../types';
import { MonthCard } from './MonthCard';

interface MonthListProps {
    plan: MonthPlan[];
    onAddEntry: (monthIndex: number) => void;
    onEditEntry: (monthIndex: number, entry: Entry) => void;
    onDeleteEntry: (monthIndex: number, entryId: string, type: 'income' | 'expense') => void;
    onDeleteMonth: (monthIndex: number, monthName: string) => void;
    onOpenCardModal: (monthIndex: number, expense: Expense) => void;
    getMasterCardEntry: (expense: Expense) => Expense | null;
    getMasterEntry: (entry: Entry) => Entry | null;
}

export const MonthList: React.FC<MonthListProps> = ({ plan, ...props }) => {
    if (plan.length === 0) {
        return (
            <div className="text-center text-gray-500 text-lg mt-12 p-8 bg-white rounded-lg shadow">
                <p>Comienza a planificar tu futuro financiero.</p>
                <p className="font-semibold mt-2">Usa el botón "+ Añadir Mes al Plan" para empezar.</p>
            </div>
        );
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plan.map((month, index) => (
                <MonthCard 
                    key={month.id} 
                    monthData={month}
                    monthIndex={index}
                    {...props}
                />
            ))}
        </section>
    );
};