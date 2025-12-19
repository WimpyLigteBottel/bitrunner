export type StockMarketSimplified = {
  price: number;
  date: number;
};

export type PricePoint = {
  symbol: string;
} & StockMarketSimplified;

export type TrendType =
  | "VERY_STRONG"
  | "STRONG"
  | "SAME"
  | "WEAK"
  | "VERY_WEAK"
  | "UNKOWN"
  ;

export type Trend = {
  up: number;
  down: number;
  trend: TrendType;
};
