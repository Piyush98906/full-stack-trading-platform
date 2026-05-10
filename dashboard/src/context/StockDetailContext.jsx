import { createContext, useContext, useMemo, useState } from 'react';

const StockDetailContext = createContext(null);

export function StockDetailProvider({ children }) {
  const [selectedStock, setSelectedStock] = useState(null);

  const openStockDetail = (input) => {
    const stock =
      typeof input === 'string'
        ? { symbol: input }
        : input?.symbol
          ? { ...input }
          : null;

    if (!stock?.symbol) {
      return;
    }

    setSelectedStock(stock);
  };

  const closeStockDetail = () => {
    setSelectedStock(null);
  };

  const value = useMemo(
    () => ({
      selectedStock,
      openStockDetail,
      closeStockDetail
    }),
    [selectedStock]
  );

  return <StockDetailContext.Provider value={value}>{children}</StockDetailContext.Provider>;
}

export const useStockDetail = () => useContext(StockDetailContext);
