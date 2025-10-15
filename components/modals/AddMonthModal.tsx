
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddMonthModalProps {
    onClose: () => void;
    onAddMonth: (name: string) => void;
}

export const AddMonthModal: React.FC<AddMonthModalProps> = ({ onClose, onAddMonth }) => {
    const [monthName, setMonthName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (monthName.trim()) {
            onAddMonth(monthName.trim());
        }
    };

    return (
        <Modal onClose={onClose} title="Nombrar Nuevo Período">
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <Input
                        id="new-month-name"
                        label="Nombre del Mes o Período"
                        value={monthName}
                        onChange={(e) => setMonthName(e.target.value)}
                        placeholder="Ej: Octubre 2025 o Q4"
                        required
                        autoFocus
                    />
                </div>
                <Button type="submit" className="w-full py-3">
                    Crear Mes
                </Button>
            </form>
        </Modal>
    );
};
