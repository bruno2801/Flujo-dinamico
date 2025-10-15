
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-blue mb-2">
                Flujo de Caja Dinámico 📊
            </h1>
            <p className="text-gray-500 mt-1 max-w-2xl mx-auto">
                Una herramienta moderna para planificar tus finanzas. Añade los períodos que necesites y registra tus ingresos y gastos de forma detallada.
            </p>
        </header>
    );
};
