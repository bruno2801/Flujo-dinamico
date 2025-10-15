
import React from 'react';
import { formatCurrency } from '../utils/helpers';
import { Button } from './ui/Button';

interface SummaryDashboardProps {
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
    onAddMonth: () => void;
    onExport: () => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
    totalIncome,
    totalExpenses,
    netFlow,
    onAddMonth,
    onExport,
}) => {

    const getNetFlowCardColor = () => {
        if (netFlow > 0) return 'bg-secondary-green';
        if (netFlow < 0) return 'bg-red-500';
        return 'bg-primary-blue';
    }

    return (
        <section className="bg-white rounded-xl p-6 mb-10 shadow-lg">
            <h2 className="text-2xl font-bold text-primary-blue mb-4 border-b pb-2">Resumen Total del Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                    <p className="text-sm font-semibold text-gray-500">Ingresos Totales</p>
                    <p className="text-3xl font-bold text-secondary-green mt-1">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                    <p className="text-sm font-semibold text-gray-500">Gastos Totales</p>
                    <p className="text-3xl font-bold text-red-500 mt-1">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className={`text-white p-4 rounded-lg shadow-lg ${getNetFlowCardColor()}`}>
                    <p className="text-sm font-semibold opacity-80">Ahorro / Déficit Neto</p>
                    <p className="text-3xl font-bold mt-1">{formatCurrency(netFlow)}</p>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                <Button onClick={onAddMonth} variant="primary" className="py-3 px-6">
                    <span className="text-xl mr-2">+</span> Añadir Mes al Plan
                </Button>
                <Button onClick={onExport} variant="secondary" className="py-3 px-6">
                    <span className="text-xl mr-2">⬇️</span> Exportar Datos
                </Button>
            </div>
        </section>
    );
};
