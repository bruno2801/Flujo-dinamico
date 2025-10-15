import React, { useState, useMemo, useEffect } from 'react';
import type { Expense, CardSubItem, Entry } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, formatInputCurrency, parseFormattedCurrency } from '../../utils/helpers';

interface CardItemModalProps {
    onClose: () => void;
    expense: Expense;
    monthIndex: number;
    onAddSubItem: (monthIndex: number, expenseId: string, item: Omit<CardSubItem, 'id'>) => void;
    onUpdateSubItem: (masterCardId: string, item: CardSubItem) => void;
    onDeleteSubItem: (masterCardId: string, subItemId: string) => void;
    getMasterEntry: (entry: Entry | CardSubItem) => Entry | CardSubItem | null;
}

export const CardItemModal: React.FC<CardItemModalProps> = ({ onClose, expense, monthIndex, onAddSubItem, onUpdateSubItem, onDeleteSubItem, getMasterEntry }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [recurrenceCount, setRecurrenceCount] = useState('1');
    const [isInfinite, setIsInfinite] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    // FIX: Determine the master card ID. All mutations (add/update/delete) must target the master.
    const masterCardId = expense.masterId || expense.id;

    const totalCardAmount = useMemo(() => {
        // The `expense` prop now correctly contains the sub-items for the current month.
        return expense.subItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
    }, [expense.subItems]);
    
    const resetForm = () => {
        setDescription('');
        setAmount('');
        setIsRecurrent(false);
        setRecurrenceCount('1');
        setIsInfinite(false);
        setEditingItemId(null);
    };

    const handleEditClick = (item: CardSubItem) => {
        setEditingItemId(item.id);
        setDescription(item.description);
        setAmount(formatInputCurrency(item.amount.toString().replace('.', ',')));
        setIsRecurrent(item.isRecurrent);
        setIsInfinite(item.recurrenceCount === 'indefinido');
        setRecurrenceCount(item.recurrenceCount === 'indefinido' ? '1' : item.recurrenceCount);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || parseFormattedCurrency(amount) <= 0) return;
        
        const finalRecurrenceCount = isInfinite ? 'indefinido' : recurrenceCount;
        
        const subItemData = {
            description,
            amount: parseFormattedCurrency(amount),
            isRecurrent,
            recurrenceCount: isRecurrent ? finalRecurrenceCount : '0',
            recurrenceIndex: 1,
        };

        if (editingItemId) {
            const originalItem = expense.subItems?.find(si => si.id === editingItemId);
            // FIX: Use masterCardId for updates.
            onUpdateSubItem(masterCardId, { ...originalItem, ...subItemData, id: editingItemId });
        } else {
            // `onAddSubItem` is smart enough to find the master from any card copy ID.
            onAddSubItem(monthIndex, expense.id, subItemData);
        }
        
        resetForm();
    };

    const getRecurrenceBadge = (item: CardSubItem) => {
        const master = getMasterEntry(item) as CardSubItem;
        if (!master) return null;

        const count = master.recurrenceCount;
        const total = count === 'indefinido' ? '∞' : count;
        const currentIndex = item.recurrenceIndex || 1;

        return (
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                R ({currentIndex}/{total})
            </span>
        );
    };

    return (
        <Modal onClose={onClose} title={`Detalle de: ${expense.description}`}>
            <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    <h4 className="font-semibold text-gray-800">Gastos Registrados</h4>
                    {expense.subItems && expense.subItems.length > 0 ? (
                        expense.subItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-md group">
                                <span className="flex items-center">
                                    {item.description}
                                    {(item.isRecurrent || item.recurrent) && getRecurrenceBadge(item)}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-700">{formatCurrency(item.amount)}</span>
                                    {!item.recurrent && (
                                        <>
                                        <button onClick={() => handleEditClick(item)} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg></button>
                                        <button onClick={() => onDeleteSubItem(masterCardId, item.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"></path></svg></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : <p className="text-xs text-gray-500 italic">No hay gastos en esta tarjeta.</p>}
                </div>

                <div className="text-right font-bold text-lg text-primary-blue border-t pt-2">Total: {formatCurrency(totalCardAmount)}</div>

                <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t">
                     <h4 className="font-semibold text-gray-800">{editingItemId ? 'Editar Gasto' : 'Añadir Nuevo Gasto'}</h4>
                    <Input id="sub-description" label="Descripción" value={description} onChange={e => setDescription(e.target.value)} required />
                    <Input id="sub-amount" label="Monto" type="text" value={amount} onChange={e => setAmount(formatInputCurrency(e.target.value))} placeholder="0,00" required className="text-right"/>
                     <div className="pt-2">
                        <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={isRecurrent} onChange={e => setIsRecurrent(e.target.checked)} className="h-5 w-5 rounded text-secondary-green focus:ring-secondary-green"/><span className="font-medium text-gray-700 text-sm">¿Gasto recurrente en esta tarjeta?</span></label>
                        {isRecurrent && (
                            <div className="mt-3 pl-8 flex items-center space-x-4">
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={isInfinite} onChange={e => setIsInfinite(e.target.checked)} className="h-4 w-4 rounded text-secondary-green focus:ring-secondary-green" /><span className="text-sm">Indefinido</span></label>
                                {!isInfinite && (<>
                                    <label htmlFor="sub-recurrence-count" className="text-sm">Repetir por</label>
                                    <Input id="sub-recurrence-count" type="number" value={recurrenceCount} onChange={e => setRecurrenceCount(e.target.value)} min="1" className="w-20" />
                                    <label className="text-sm">mes(es).</label>
                                </>)}
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <Button type="submit" variant="secondary" className="w-full py-2">
                            {editingItemId ? 'Guardar Cambios' : '+ Añadir Gasto'}
                        </Button>
                        {editingItemId && <Button type="button" onClick={resetForm} className="w-full py-2 bg-gray-200 text-gray-700 hover:bg-gray-300">Cancelar Edición</Button>}
                    </div>
                </form>
            </div>
        </Modal>
    );
};