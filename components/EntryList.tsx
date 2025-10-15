import React from 'react';
import type { Entry, Expense } from '../types';
import { formatCurrency } from '../utils/helpers';

interface EntryListProps {
    type: 'income' | 'expense';
    entries: Entry[];
    monthIndex: number;
    onEditEntry: (monthIndex: number, entry: Entry) => void;
    onDeleteEntry: (monthIndex: number, entryId: string, type: 'income' | 'expense') => void;
    onOpenCardModal: (monthIndex: number, expense: Expense) => void;
    getMasterCardEntry: (expense: Expense) => Expense | null;
    getMasterEntry: (entry: Entry) => Entry | null;
}

export const EntryList: React.FC<EntryListProps> = ({ type, entries, monthIndex, onEditEntry, onDeleteEntry, onOpenCardModal, getMasterCardEntry, getMasterEntry }) => {
    
    if (entries.length === 0) {
        return <p className="text-xs text-gray-400 italic px-2">No hay entradas.</p>;
    }

    const getRecurrenceBadge = (entry: Entry) => {
        const master = getMasterEntry(entry);
        if (!master) return null;

        const count = master.recurrenceCount;
        const total = count === 'indefinido' ? '∞' : count;
        const currentIndex = entry.recurrenceIndex || 1;

        return (
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                R ({currentIndex}/{total})
            </span>
        );
    };

    return (
        <ul className="space-y-1">
            {entries.map(entry => {
                const isCardExpense = entry.type === 'card';
                // FIX: Calculate total from the current month's card entry, which has the correct sub-items.
                const cardTotal = isCardExpense 
                    ? (entry as Expense).subItems?.reduce((sum, item) => sum + item.amount, 0) || 0
                    : entry.amount;
                
                return (
                    <li key={entry.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-gray-50 group">
                        <div className="flex-1 truncate flex items-center">
                            <span className="font-medium text-gray-800">{entry.description}</span>
                            {(entry.isRecurrent || entry.recurrent) && getRecurrenceBadge(entry)}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${type === 'income' ? 'text-secondary-green' : 'text-gray-700'}`}>
                                {formatCurrency(cardTotal)}
                            </span>
                            
                            {isCardExpense && (
                                // FIX: Pass the current month's entry to the modal, not the master card.
                                // This ensures the modal displays the correct sub-items for that specific month.
                                <button onClick={() => onOpenCardModal(monthIndex, entry as Expense)} className="text-xs text-blue-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                    Detalles
                                </button>
                            )}
                            
                            {!entry.recurrent && (
                                <>
                                 <button onClick={() => onEditEntry(monthIndex, entry)} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Editar entrada">
                                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                </button>
                               <button onClick={() => onDeleteEntry(monthIndex, entry.id, type)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Eliminar entrada">
                                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"></path></svg>
                               </button>
                               </>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};