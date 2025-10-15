import { useState, useMemo } from 'react';
import type { MonthPlan, CashFlowData, Entry, Expense, CardSubItem, ToastData, Income } from '../types';
import { generateUUID } from '../utils/helpers';

const initialPlan: MonthPlan[] = [];

const initialData: CashFlowData = {
    plan: initialPlan,
};

export const useCashFlow = () => {
    const [plan, setPlan] = useState<MonthPlan[]>(initialData.plan);
    const [toasts, setToasts] = useState<ToastData[]>([]);

    // Toast logic
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    const reprocessPlan = (action: (currentPlan: MonthPlan[]) => MonthPlan[]) => {
        setPlan(prevPlan => {
            const modifiedPlan = action(prevPlan);
            return processRecurrentEntries(modifiedPlan);
        });
    };

    // Plan-level operations
    const addMonth = (monthName: string) => {
        const newMonth: MonthPlan = {
            id: generateUUID(),
            monthName,
            incomes: [],
            expenses: [],
        };
        reprocessPlan(prevPlan => [...prevPlan, newMonth]);
        showToast(`Mes "${monthName}" añadido.`);
    };

    const deleteMonth = (monthIndex: number, monthName: string) => {
        reprocessPlan(prevPlan => prevPlan.filter((_, index) => index !== monthIndex));
        showToast(`Mes "${monthName}" eliminado.`, 'error');
    };
    
    // Entry-level operations
    const addEntry = (monthIndex: number, entry: Omit<Entry, 'id'>): Entry => {
        const newEntry: Entry = { ...entry, id: generateUUID(), recurrenceIndex: 1 };
        
        reprocessPlan(prevPlan => {
            const updatedPlan = JSON.parse(JSON.stringify(prevPlan));
            const targetMonth = updatedPlan[monthIndex];
            if (newEntry.type === 'income') {
                targetMonth.incomes.push(newEntry as Income);
            } else {
                targetMonth.expenses.push(newEntry as Expense);
            }
            return updatedPlan;
        });
        showToast(`Entrada "${entry.description}" añadida.`);
        return newEntry;
    };

    const updateEntry = (entryId: string, updatedEntryData: Entry) => {
        reprocessPlan(prevPlan => {
            return prevPlan.map(month => ({
                ...month,
                incomes: month.incomes.map(i => i.id === entryId ? {...updatedEntryData, type: 'income'} as Income : i),
                expenses: month.expenses.map(e => e.id === entryId ? {...updatedEntryData, type: e.type} as Expense : e),
            }));
        });
        showToast(`Entrada "${updatedEntryData.description}" actualizada.`);
    };

    const deleteEntry = (monthIndex: number, entryId: string, type: 'income' | 'expense') => {
        let entryDescription = '';
        reprocessPlan(prevPlan => {
            const planCopy = JSON.parse(JSON.stringify(prevPlan));
            const entryToDelete = 
                type === 'income' 
                ? planCopy[monthIndex].incomes.find((i: Income) => i.id === entryId)
                : planCopy[monthIndex].expenses.find((e: Expense) => e.id === entryId);
            
            if (!entryToDelete) return planCopy;

            entryDescription = entryToDelete.description;

            // If it's a master recurrent entry, delete all its copies first
            if (entryToDelete.isRecurrent) {
                return planCopy.map((month: MonthPlan) => ({
                    ...month,
                    incomes: month.incomes.filter((i: Income) => i.masterId !== entryId && i.id !== entryId),
                    expenses: month.expenses.filter((e: Expense) => e.masterId !== entryId && e.id !== entryId),
                }));
            }
            
            // Just delete the single entry
            if (type === 'income') {
                planCopy[monthIndex].incomes = planCopy[monthIndex].incomes.filter((i: Income) => i.id !== entryId);
            } else {
                planCopy[monthIndex].expenses = planCopy[monthIndex].expenses.filter((e: Expense) => e.id !== entryId);
            }
            return planCopy;
        });
        showToast(`"${entryDescription}" eliminado.`, 'error');
    };

    const getMasterEntry = (entry: Entry | CardSubItem): (Entry | CardSubItem | null) => {
        if (!entry.masterId) return entry.isRecurrent ? entry : null;

        for (const month of plan) {
            const allEntries: (Entry | CardSubItem)[] = [...month.incomes, ...month.expenses];
            const found = allEntries.find(e => e.id === entry.masterId);
            if (found) return found;

            for (const expense of month.expenses) {
                if (expense.type === 'card' && expense.subItems) {
                    const foundSubItem = expense.subItems.find(si => si.id === entry.masterId);
                    if (foundSubItem) return foundSubItem;
                }
            }
        }
        return null;
    };

     const getMasterCardEntry = (expense: Expense): Expense | null => {
        if (expense.type !== 'card') return null;
        if (!expense.masterId) return expense;
        for (const month of plan) {
            const found = month.expenses.find(e => e.id === expense.masterId);
            if (found && found.type === 'card') return found;
        }
        return null;
    };
    
    // Card sub-item operations
    const addCardSubItem = (monthIndex: number, expenseId: string, item: Omit<CardSubItem, 'id'>) => {
        const newItem: CardSubItem = { ...item, id: generateUUID(), recurrenceIndex: 1 };
        
        reprocessPlan(prevPlan => {
            const planCopy = JSON.parse(JSON.stringify(prevPlan));
            
            let clickedExpense: Expense | undefined;
            for (const month of planCopy) {
                clickedExpense = month.expenses.find((e: Expense) => e.id === expenseId);
                if (clickedExpense) break;
            }
    
            if (!clickedExpense) {
                console.error("Could not find the card expense to add an item to.");
                return planCopy;
            }
    
            const masterId = clickedExpense.masterId || clickedExpense.id;
    
            let masterCardFoundAndUpdated = false;
            for (const month of planCopy) {
                const masterExpense = month.expenses.find((e: Expense) => e.id === masterId);
                if (masterExpense && masterExpense.type === 'card') {
                    if (!masterExpense.subItems) {
                        masterExpense.subItems = [];
                    }
                    masterExpense.subItems.push(newItem);
                    masterCardFoundAndUpdated = true;
                    break; 
                }
            }

            if (!masterCardFoundAndUpdated) {
                console.error("Could not find the master card to add the sub-item.");
            }
    
            return planCopy;
        });
        showToast(`Sub-item "${item.description}" añadido a la tarjeta.`);
    };
    
    const updateCardSubItem = (masterCardId: string, updatedSubItem: CardSubItem) => {
         reprocessPlan(prevPlan => {
            return prevPlan.map(month => {
                return {
                    ...month,
                    expenses: month.expenses.map(expense => {
                        if (expense.id === masterCardId && expense.type === 'card' && expense.subItems) {
                            return {
                                ...expense,
                                subItems: expense.subItems.map(si => si.id === updatedSubItem.id ? updatedSubItem : si)
                            };
                        }
                        return expense;
                    })
                };
            });
        });
        showToast(`Sub-item "${updatedSubItem.description}" actualizado.`);
    };

    const deleteCardSubItem = (masterCardId: string, subItemId: string) => {
        let subItemDescription = '';
        reprocessPlan(prevPlan => {
            const planCopy = JSON.parse(JSON.stringify(prevPlan));
            let masterSubItem: CardSubItem | undefined;
            
            // Find the master card and the subitem to get its properties
            for (const month of planCopy) {
                const card = month.expenses.find((e: Expense) => e.id === masterCardId);
                if (card && card.subItems) {
                    masterSubItem = card.subItems.find((si: CardSubItem) => si.id === subItemId);
                    if (masterSubItem) break;
                }
            }

            if (!masterSubItem) return planCopy;
            subItemDescription = masterSubItem.description;

            // If it's a recurrent master, delete all its copies throughout the plan
            if (masterSubItem.isRecurrent) {
                planCopy.forEach((month: MonthPlan) => {
                    month.expenses.forEach((expense: Expense) => {
                        if (expense.type === 'card' && expense.subItems) {
                           expense.subItems = expense.subItems.filter((si: CardSubItem) => si.masterId !== subItemId && si.id !== subItemId);
                        }
                    });
                });
            } else {
                // Just delete the single instance
                for (const month of planCopy) {
                    const card = month.expenses.find((e: Expense) => e.id === masterCardId);
                    if (card && card.subItems) {
                        card.subItems = card.subItems.filter((si: CardSubItem) => si.id !== subItemId);
                        break;
                    }
                }
            }
            return planCopy;
        });
        showToast(`"${subItemDescription}" eliminado de la tarjeta.`, 'error');
    };
    
    // Recurrence logic
    const processRecurrentEntries = (currentPlan: MonthPlan[]): MonthPlan[] => {
        let newPlan = JSON.parse(JSON.stringify(currentPlan.map(month => ({
            ...month,
            incomes: month.incomes.filter(i => !i.recurrent),
            expenses: month.expenses.filter(e => !e.recurrent),
        }))));
        
        newPlan.forEach((month: MonthPlan) => {
            month.expenses.forEach((expense: Expense) => {
                if (expense.type === 'card' && expense.subItems) {
                    expense.subItems = expense.subItems.filter(si => !si.recurrent);
                }
            });
        });

        const allMasterEntries: { entry: Entry, monthIndex: number }[] = [];
        newPlan.forEach((month: MonthPlan, monthIndex: number) => {
            month.incomes.forEach(entry => {
                if (entry.isRecurrent) allMasterEntries.push({ entry, monthIndex });
            });
            month.expenses.forEach(entry => {
                if (entry.isRecurrent) allMasterEntries.push({ entry, monthIndex });
            });
        });
        
        allMasterEntries.forEach(({ entry, monthIndex }) => {
            const countStr = entry.recurrenceCount;
            const recurrenceCount = countStr === 'indefinido' ? newPlan.length - monthIndex : parseInt(countStr, 10);
            
            for (let i = 1; i < recurrenceCount; i++) {
                const targetMonthIndex = monthIndex + i;
                if (targetMonthIndex < newPlan.length) {
                    const recurrentEntry: Entry = {
                        ...JSON.parse(JSON.stringify(entry)),
                        id: `${entry.id}-rec-${i}`,
                        isRecurrent: false,
                        recurrent: true,
                        masterId: entry.id,
                        recurrenceIndex: i + 1,
                    };
                    if (entry.type === 'card') {
                      (recurrentEntry as Expense).subItems = [];
                    }

                    if (recurrentEntry.type === 'income') {
                        newPlan[targetMonthIndex].incomes.push(recurrentEntry);
                    } else {
                        newPlan[targetMonthIndex].expenses.push(recurrentEntry as Expense);
                    }
                }
            }
        });
        
        newPlan.forEach((month: MonthPlan, monthIndex: number) => {
            month.expenses.forEach((expense: Expense) => {
                if (expense.type === 'card' && expense.subItems && !expense.recurrent) {
                    const masterCard = expense;
                    
                    masterCard.subItems.forEach(subItem => {
                        if (subItem.isRecurrent) {
                           const countStr = subItem.recurrenceCount;
                           const subRecurrenceLimit = countStr === 'indefinido' ? Infinity : parseInt(countStr, 10);
                           
                           // A sub-item's recurrence is also capped by its parent card's recurrence.
                           const parentRecurrenceLimit = masterCard.isRecurrent 
                                ? (masterCard.recurrenceCount === 'indefinido' ? Infinity : parseInt(masterCard.recurrenceCount, 10)) 
                                : 1;

                           // The loop should iterate up to the minimum of its own limit and its parent's limit.
                           // `i` represents the copy number, starting from the 1st copy (2nd occurrence).
                           for (let i = 1; i < Math.min(subRecurrenceLimit, parentRecurrenceLimit); i++) {
                                const targetMonthIndex = monthIndex + i;

                                if (targetMonthIndex >= newPlan.length) break;

                                const parentCardMasterId = masterCard.id;
                                const targetCardCopy = newPlan[targetMonthIndex].expenses.find((e: Expense) => e.masterId === parentCardMasterId);

                                if(targetCardCopy && targetCardCopy.type === 'card') {
                                    const recurrentSubItem: CardSubItem = {
                                        ...subItem,
                                        id: `${subItem.id}-rec-${i}`,
                                        isRecurrent: false,
                                        recurrent: true,
                                        masterId: subItem.id,
                                        recurrenceIndex: i + 1,
                                    };
                                    if(!targetCardCopy.subItems) {
                                        targetCardCopy.subItems = [];
                                    }
                                    if (!targetCardCopy.subItems.some((si: CardSubItem) => si.id === recurrentSubItem.id)) {
                                         targetCardCopy.subItems.push(recurrentSubItem);
                                    }
                                } else {
                                    break;
                                }
                           }
                        }
                    });
                }
            });
        });
        
        return newPlan;
    };
    
    // Derived state
    const processedPlan = useMemo(() => processRecurrentEntries(plan), [plan]);

    const { totalIncome, totalExpenses, netFlow } = useMemo(() => {
        let income = 0;
        let expenses = 0;
        processedPlan.forEach(month => {
            income += month.incomes.reduce((sum, entry) => sum + entry.amount, 0);
            expenses += month.expenses.reduce((sum, entry) => {
                // FIX: Calculate total from the current month's entry, not the master.
                // The `entry` object from `processedPlan` already contains the correct sub-items for that month.
                 if (entry.type === 'card') {
                    const cardTotal = entry.subItems?.reduce((subSum, item) => subSum + item.amount, 0) || 0;
                    return sum + cardTotal;
                }
                return sum + entry.amount;
            }, 0);
        });
        return { totalIncome: income, totalExpenses: expenses, netFlow: income - expenses };
    }, [processedPlan]);

    // Export logic
    const exportData = useMemo(() => {
        let tsv = "Mes\tTipo\tCategoría\tDescripción\tMonto\tEs Recurrente (Maestro)\tRecurrencias\n";
        processedPlan.forEach(month => {
            month.incomes.forEach(i => {
                const master = getMasterEntry(i) || i;
                tsv += `${month.monthName}\tIngreso\t-\t${i.description}\t${i.amount}\t${master.isRecurrent}\t${master.isRecurrent ? master.recurrenceCount : '-'}\n`;
            });
            month.expenses.forEach(e => {
                if (e.type === 'card') {
                    // FIX: Iterate over the current month's sub-items for accurate export.
                    e.subItems?.forEach(si => {
                        const masterSubItem = getMasterEntry(si) as CardSubItem || si;
                         tsv += `${month.monthName}\tGasto\tTarjeta (${e.description})\t${si.description}\t${si.amount}\t${masterSubItem.isRecurrent}\t${masterSubItem.isRecurrent ? masterSubItem.recurrenceCount : '-'}\n`;
                    });
                } else {
                     const master = getMasterEntry(e) || e;
                     tsv += `${month.monthName}\tGasto\t${e.type}\t${e.description}\t${e.amount}\t${master.isRecurrent}\t${master.isRecurrent ? master.recurrenceCount : '-'}\n`;
                }
            });
        });
        return tsv;
    }, [processedPlan]);
    

    return {
        plan: processedPlan,
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
    };
};