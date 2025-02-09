export interface MarketData {
  date: string;
  dayOfWeek: string;
  open: number;
  close: number;
  percentageChange: number;
  valueChange: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface MarketState {
  data: MarketData[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}