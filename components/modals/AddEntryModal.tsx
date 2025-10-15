import React, { useState, useEffect } from 'react';
import type { Entry } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatInputCurrency, parseFormattedCurrency } from '../../utils/helpers';

interface AddEntryModalProps {
    onClose: () => void;
    onSubmit: (entry: Omit<Entry, 'id'> | Entry) => void;
    entryToEdit?: Entry | null;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ onClose, onSubmit, entryToEdit }) => {
    const isEditing = !!entryToEdit;

    const [entryType, setEntryType] = useState<'income' | 'expense'>(entryToEdit?.type === 'income' ? 'income' : 'expense');
    const [expenseType, setExpenseType] = useState<'fijo' | 'variable' | 'card'>( (entryToEdit?.type === 'fijo' || entryToEdit?.type === 'variable' || entryToEdit?.type === 'card') ? entryToEdit.type : 'variable');
    const [description, setDescription] = useState(entryToEdit?.description || '');
    const [amount, setAmount] = useState(entryToEdit?.amount.toString().replace('.', ',') || '');

    // Recurrence state
    const [isRecurrent, setIsRecurrent] = useState(entryToEdit?.isRecurrent || false);
    const [recurrenceCount, setRecurrenceCount] = useState(entryToEdit?.recurrenceCount === 'indefinido' ? '1' : entryToEdit?.recurrenceCount || '1');
    const [isInfinite, setIsInfinite] = useState(entryToEdit?.recurrenceCount === 'indefinido' || false);

    useEffect(() => {
        if (entryToEdit) {
            setAmount(formatInputCurrency(entryToEdit.amount.toString().replace('.', ',')));
        }
    }, [entryToEdit]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(formatInputCurrency(e.target.value));
    };

    // Fix: Refactored handleSubmit to fix type inference issue and logic bugs.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        const parsedAmount = parseFormattedCurrency(amount);

        if (entryType === 'income' && parsedAmount <= 0) return;
        if (entryType === 'expense' && expenseType !== 'card' && parsedAmount <= 0) return;


        const finalRecurrenceCount = isInfinite ? 'indefinido' : recurrenceCount;

        const commonData = {
            description,
            isRecurrent,
            recurrenceCount: isRecurrent ? finalRecurrenceCount : '0',
            recurrenceIndex: entryToEdit?.recurrenceIndex || 1,
        };

        const entryData = entryType === 'income'
            ? {
                ...commonData,
                amount: parsedAmount,
                type: 'income' as const,
            }
            : {
                ...commonData,
                amount: expenseType === 'card' ? 0 : parsedAmount,
                type: expenseType,
                subItems: (entryToEdit as any)?.subItems || (expenseType === 'card' ? [] : undefined),
            };

        if (isEditing) {
            onSubmit({ ...entryToEdit, ...entryData });
        } else {
            onSubmit(entryData);
        }

        onClose();
    };

    return (
        <Modal onClose={onClose} title={isEditing ? "Editar Movimiento" : "Añadir Ingreso o Gasto"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Entry Type Switch */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setEntryType('income')} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition ${entryType === 'income' ? 'bg-secondary-green text-white shadow' : 'text-gray-600'}`}>Ingreso</button>
                    <button type="button" onClick={() => setEntryType('expense')} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition ${entryType === 'expense' ? 'bg-red-500 text-white shadow' : 'text-gray-600'}`}>Gasto</button>
                </div>

                {entryType === 'expense' && (
                    <div className="flex justify-around text-sm">
                        <label className="flex items-center space-x-2"><input type="radio" name="expenseType" value="fijo" checked={expenseType === 'fijo'} onChange={() => setExpenseType('fijo')} className="focus:ring-primary-blue text-primary-blue" /><span>Fijo</span></label>
                        <label className="flex items-center space-x-2"><input type="radio" name="expenseType" value="variable" checked={expenseType === 'variable'} onChange={() => setExpenseType('variable')} className="focus:ring-primary-blue text-primary-blue" /><span>Variable</span></label>
                        <label className="flex items-center space-x-2"><input type="radio" name="expenseType" value="card" checked={expenseType === 'card'} onChange={() => setExpenseType('card')} className="focus:ring-primary-blue text-primary-blue" /><span>Tarjeta</span></label>
                    </div>
                )}
                
                <Input id="description" label="Descripción" value={description} onChange={e => setDescription(e.target.value)} required autoFocus />
                
                {entryType === 'income' || expenseType !== 'card' ? (
                    <Input id="amount" label="Monto" type="text" value={amount} onChange={handleAmountChange} placeholder="0,00" required className="text-right"/>
                ) : (
                    <div className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p>Los gastos de tarjeta se detallan por separado. El monto total se calculará automáticamente.</p>
                    </div>
                 )}

                 <div className="pt-2 border-t">
                    <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={isRecurrent} onChange={e => setIsRecurrent(e.target.checked)} className="h-5 w-5 rounded text-secondary-green focus:ring-secondary-green"/><span className="font-medium text-gray-700">Movimiento recurrente</span></label>
                    {isRecurrent && (
                        <div className="mt-3 pl-8 flex items-center space-x-4">
                            <label className="flex items-center space-x-2"><input type="checkbox" checked={isInfinite} onChange={e => setIsInfinite(e.target.checked)} className="h-4 w-4 rounded text-secondary-green focus:ring-secondary-green" /><span className="text-sm">Indefinido</span></label>
                            {!isInfinite && (<>
                                <label htmlFor="recurrence-count" className="text-sm">Repetir por</label>
                                <Input id="recurrence-count" type="number" value={recurrenceCount} onChange={e => setRecurrenceCount(e.target.value)} min="1" className="w-20" />
                                <label className="text-sm">mes(es).</label>
                            </>)}
                        </div>
                    )}
                 </div>

                <Button type="submit" className="w-full py-3 mt-4">
                    {isEditing ? 'Guardar Cambios' : 'Añadir Movimiento'}
                </Button>
            </form>
        </Modal>
    );
};
