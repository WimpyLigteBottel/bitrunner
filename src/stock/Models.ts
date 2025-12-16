export type StockMarketSimplified = {
  price: number;
  date: number;
};

export type PricePoint = {
  symbol: string;
} & StockMarketSimplified;
