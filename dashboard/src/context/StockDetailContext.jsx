import { createContext, useContext, useMemo, useState } from 'react';

const StockDetailContext = createContext(null);

export function StockDetailProvider({ children }) {
  const [selectedSymbol, setSelectedSymbol] = useState('');

  const openStockDetail = (input) => {
    const symbol = typeof input === 'string' ? input : input?.symbol;
    if (!symbol) {
      return;
    }

    setSelectedSymbol(symbol);
  };

  const closeStockDetail = () => {
    setSelectedSymbol('');
  };

  const value = useMemo(
    () => ({
      selectedSymbol,
      openStockDetail,
      closeStockDetail
    }),
    [selectedSymbol]
  );

  return <StockDetailContext.Provider value={value}>{children}</StockDetailContext.Provider>;
}

export const useStockDetail = () => useContext(StockDetailContext);
