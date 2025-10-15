import React, { useState } from 'react';
import { useCashFlow } from './hooks/useCashFlow';

// Components
import { Header } from './components/Header';
import { SummaryDashboard } from './components/SummaryDashboard';
import { MonthList } from './components/MonthList';
import { Toast } from './components/ui/Toast';

// Modals
import { AddMonthModal } from './components/modals/AddMonthModal';
import { AddEntryModal } from './components/modals/AddEntryModal';
import { CardItemModal } from './components/modals/CardItemModal';
import { ExportModal } from './components/modals/ExportModal';

import type { Expense, Entry, CardSubItem } from './types';

function App() {
    const {
        plan,
        toasts,
        showToast,
        addMonth,
        deleteMonth,
        addEntry,
        updateEntry,
        deleteEntry,
        getMasterEntry,
        getMasterCardEntry,
        addCardSubItem,
        updateCardSubItem,
        deleteCardSubItem,
        totalIncome,
        totalExpenses,
        netFlow,
        exportData,
    } = useCashFlow();

    // Modal States
    const [isAddMonthModalOpen, setAddMonthModalOpen] = useState(false);
    const [isAddEntryModalOpen, setAddEntryModalOpen] = useState(false);
    const [isCardModalOpen, setCardModalOpen] = useState(false);
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    
    // Context for modals
    const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
    const [selectedCardExpense, setSelectedCardExpense] = useState<Expense | null>(null);
    const [entryToEdit, setEntryToEdit] = useState<Entry | null>(null);

    // ADD / EDIT Modal Handlers
    const handleOpenAddEntryModal = (monthIndex: number) => {
        setSelectedMonthIndex(monthIndex);
        setEntryToEdit(null); // Ensure we are in "add" mode
        setAddEntryModalOpen(true);
    };

    const handleOpenEditModal = (monthIndex: number, entry: Entry) => {
        setSelectedMonthIndex(monthIndex);
        setEntryToEdit(entry);
        setAddEntryModalOpen(true);
    };
    
    const handleAddOrUpdateEntry = (entryData: Omit<Entry, 'id'> | Entry) => {
        if (selectedMonthIndex === null) return;

        let newCardExpense: Expense | null = null;

        if ('id' in entryData) { // It's an update
            updateEntry(entryData.id, entryData);
        } else { // It's a new entry
            const newFullEntry = addEntry(selectedMonthIndex, entryData);
            if (newFullEntry.type === 'card') {
                newCardExpense = newFullEntry as Expense;
            }
        }

        setAddEntryModalOpen(false);
        setEntryToEdit(null);
        
        if (newCardExpense) {
            handleOpenCardModal(selectedMonthIndex, newCardExpense);
        }
    };
    
    const handleOpenCardModal = (monthIndex: number, expense: Expense) => {
        setSelectedMonthIndex(monthIndex);
        setSelectedCardExpense(expense);
        setCardModalOpen(true);
    };

    const handleDeleteMonth = (monthIndex: number, monthName: string) => {
        if (plan.length <= 1) {
            showToast("No puedes eliminar el único mes del plan.", "error");
            return;
        }
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${monthName}" y todos sus movimientos?`)) {
            deleteMonth(monthIndex, monthName);
        }
    };

    return (
        <>
            <div className="bg-gray-50 min-h-screen font-sans">
                <main className="container mx-auto p-4 sm:p-6 md:p-8">
                    <Header />
                    <SummaryDashboard
                        totalIncome={totalIncome}
                        totalExpenses={totalExpenses}
                        netFlow={netFlow}
                        onAddMonth={() => setAddMonthModalOpen(true)}
                        onExport={() => setExportModalOpen(true)}
                    />
                    <MonthList
                        plan={plan}
                        onAddEntry={handleOpenAddEntryModal}
                        onEditEntry={handleOpenEditModal}
                        onDeleteEntry={deleteEntry}
                        onDeleteMonth={handleDeleteMonth}
                        onOpenCardModal={handleOpenCardModal}
                        getMasterCardEntry={getMasterCardEntry}
                        getMasterEntry={getMasterEntry}
                    />
                </main>
            </div>

            {/* Toasts Container */}
            <div className="fixed bottom-5 right-5 space-y-3 z-50">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} />
                ))}
            </div>

            {/* Modals */}
            {isAddMonthModalOpen && (
                <AddMonthModal 
                    onClose={() => setAddMonthModalOpen(false)}
                    onAddMonth={(name) => {
                        addMonth(name);
                        setAddMonthModalOpen(false);
                    }}
                />
            )}

            {isAddEntryModalOpen && selectedMonthIndex !== null && (
                 <AddEntryModal
                    onClose={() => setAddEntryModalOpen(false)}
                    onSubmit={handleAddOrUpdateEntry}
                    entryToEdit={entryToEdit}
                />
            )}
            
            {isCardModalOpen && selectedCardExpense !== null && selectedMonthIndex !== null && (
                <CardItemModal
                    key={selectedCardExpense.id} // Re-mount modal when expense changes
                    onClose={() => setCardModalOpen(false)}
                    expense={selectedCardExpense}
                    monthIndex={selectedMonthIndex}
                    onAddSubItem={addCardSubItem}
                    onUpdateSubItem={updateCardSubItem}
                    onDeleteSubItem={deleteCardSubItem}
                    getMasterEntry={getMasterEntry}
                />
            )}
            
            {isExportModalOpen && (
                <ExportModal
                    exportData={exportData}
                    onClose={() => setExportModalOpen(false)}
                    showToast={showToast}
                />
            )}
        </>
    );
}

export default App;