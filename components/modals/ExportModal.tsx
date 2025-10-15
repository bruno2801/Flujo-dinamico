
import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ExportModalProps {
    exportData: string;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ exportData, onClose, showToast }) => {
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(exportData).then(() => {
            showToast('¡Copiado al portapapeles!');
        }).catch(err => {
            showToast('Error al copiar.', 'error');
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <Modal onClose={onClose} title="Exportar Datos Detallados">
            <p className="text-sm text-gray-700 mb-4">
                Copia el contenido y pégalo en la celda A1 de Google Sheets o Excel. Los datos están separados por tabulaciones (TSV).
            </p>
            <textarea
                value={exportData}
                rows={15}
                className="w-full p-3 font-mono text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-blue"
                readOnly
            />
            <Button onClick={copyToClipboard} variant="secondary" className="mt-4 w-full py-2">
                Copiar Datos al Portapapeles
            </Button>
        </Modal>
    );
};
