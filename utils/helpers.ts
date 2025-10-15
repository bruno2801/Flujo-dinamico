export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const formatCurrency = (amount: number): string => {
    // Using 'es-ES' to get dot for thousands and comma for decimals, but we will customize it.
    const formatted = new Intl.NumberFormat('es-ES', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
    
    // Replace dot with a space for thousands and prepend the currency symbol.
    return `$ ${formatted.replace(/\./g, ' ')}`;
};

export const formatInputCurrency = (value: string): string => {
    if (!value) return '';
    // Keep only digits and a single comma
    let cleaned = value.replace(/[^\d,]/g, '');
    const parts = cleaned.split(',');
    if (parts.length > 2) {
        cleaned = parts[0] + ',' + parts.slice(1).join('');
    }

    const [integerPart, decimalPart] = cleaned.split(',');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    if (decimalPart !== undefined) {
        return `${formattedInteger},${decimalPart.substring(0, 2)}`;
    }
    
    return formattedInteger;
};

export const parseFormattedCurrency = (formatted: string): number => {
    if (!formatted) return 0;
    // Remove spaces (thousand separators) and replace comma (decimal separator) with a dot
    const cleaned = formatted.replace(/ /g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
};