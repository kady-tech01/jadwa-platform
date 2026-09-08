import React, { createContext, useContext, useState } from 'react';

// Comprehensive list of global currencies with symbols and approximate conversion rates relative to USD ($1)
export const Currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar', rate: 134.5 },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', rate: 3.75 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rate: 3.67 },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rate: 47.8 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155.2 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.91 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.23 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.4 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 5.15 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 91.2 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 32.3 },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', rate: 10.0 },
  { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar', rate: 3.12 },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', rate: 0.31 },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', rate: 3.64 },
];

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    const saved = localStorage.getItem('jadwa_currency');
    return saved ? JSON.parse(saved) : Currencies[0]; // Default: USD
  });

  const changeCurrency = (currencyCode) => {
    const currencyObj = Currencies.find((c) => c.code === currencyCode) || Currencies[0];
    setSelectedCurrency(currencyObj);
    localStorage.setItem('jadwa_currency', JSON.stringify(currencyObj));
  };

  // Helper function to format numbers into the selected currency
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return `${selectedCurrency.symbol}0`;
    const numericValue = Number(amount);
    return `${selectedCurrency.symbol}${numericValue.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, changeCurrency, formatAmount, Currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);