export type StockMarketName = {
  name: string;
  symbol: string;
};

export type StockMarketRecord = {
  symbol: string;
  name: string;
  lastPrice: number;
  minPrice: number;
  maxPrice: number;
  sumPrice: number;
  count: number;
  trend: number; // positive = up, negative = down
};


export type StockMarket = {
  askPrice: number;
  bidPrice: number;
  volatility: number;
} & S4DataStockMarket &
  StockMarketName;

export interface S4DataStockMarket {
  increaseChance: number;
  decreaseChance: number;
}

export type Positions = {
  longShares: number;
  avgPriceLongShares: number;
  shortShares: number;
  avgPriceShortShares: number;
} & StockMarketName;

export const symbols = [
  "ECP",
  "MGCP",
  "BLD",
  "CLRK",
  "OMTK",
  "FSIG",
  "KGI",
  "FLCM",
  "STM",
  "DCOMM",
  "HLS",
  "VITA",
  "ICRS",
  "UNV",
  "AERO",
  "OMN",
  "SLRS",
  "GPH",
  "NVMD",
  "WDS",
  "LXO",
  "RHOC",
  "APHE",
  "SYSC",
  "CTK",
  "NTLK",
  "OMGA",
  "FNS",
  "JGN",
  "SGC",
  "CTYS",
  "MDYN",
  "TITN",
];
