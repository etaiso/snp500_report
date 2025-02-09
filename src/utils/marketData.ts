import { MarketData } from '../types/market';

const formatPrice = (price: number): number => 
  Number(price.toFixed(2));

const formatDate = (date: Date): string => 
  date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

const getDayOfWeek = (date: Date): string => 
  date.toLocaleDateString('en-US', { weekday: 'long' });

export const calculateDailyChanges = (open: number, close: number) => {
  const valueChange = formatPrice(close - open);
  const percentageChange = formatPrice((valueChange / open) * 100);
  const trend = valueChange > 0 ? 'up' : valueChange < 0 ? 'down' : 'neutral';
  
  return { valueChange, percentageChange, trend };
};

export const processMarketData = (rawData: any[]): MarketData[] => {
  return rawData
    .map(day => {
      const date = new Date(day.date);
      const { valueChange, percentageChange, trend } = calculateDailyChanges(day.open, day.close);

      return {
        date: formatDate(date),
        dayOfWeek: getDayOfWeek(date),
        open: formatPrice(day.open),
        close: formatPrice(day.close),
        percentageChange,
        valueChange,
        trend
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
};