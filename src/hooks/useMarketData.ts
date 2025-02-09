import { useState, useEffect } from 'react';
import { MarketData, MarketState } from '../types/market';
import { processMarketData } from '../utils/marketData';

const CACHE_KEY = 'sp500_market_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const useMarketData = () => {
  const [state, setState] = useState<MarketState>({
    data: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Calculate date range for last 30 days
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - (30 * 24 * 60 * 60); // 30 days ago
      
      const yahooFinanceUrl = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${startDate}&period2=${endDate}&interval=1d`;
      const proxyUrl = CORS_PROXY + encodeURIComponent(yahooFinanceUrl);
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.chart?.result?.[0]?.indicators?.quote?.[0]) {
        throw new Error('Invalid data format received from Yahoo Finance');
      }

      const { timestamp, indicators } = data.chart.result[0];
      const quote = indicators.quote[0];

      if (!timestamp || !quote.open || !quote.close) {
        throw new Error('Missing required data fields from Yahoo Finance');
      }

      // Filter out any invalid data points and create raw data array
      const rawData = timestamp
        .map((time: number, index: number) => {
          const openPrice = quote.open[index];
          const closePrice = quote.close[index];

          // Skip if either price is null, undefined, or NaN
          if (openPrice == null || closePrice == null || isNaN(openPrice) || isNaN(closePrice)) {
            return null;
          }

          return {
            date: new Date(time * 1000).toISOString(),
            open: Number(openPrice.toFixed(2)),  // Ensure we're working with numbers
            close: Number(closePrice.toFixed(2)) // Ensure we're working with numbers
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (rawData.length === 0) {
        throw new Error('No valid market data found');
      }

      const processedData = processMarketData(rawData);
      
      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: processedData,
        timestamp: Date.now()
      }));

      setState({
        data: processedData,
        loading: false,
        error: null,
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch market data. Please try again later.'
      }));
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setState({
            data,
            loading: false,
            error: null,
            lastUpdated: new Date(timestamp).toLocaleTimeString()
          });
          return;
        }
      } catch (error) {
        console.error('Error parsing cached data:', error);
        localStorage.removeItem(CACHE_KEY); // Clear invalid cache
      }
    }
    fetchData();

    const interval = setInterval(fetchData, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  const sortData = (column: keyof MarketData) => {
    setState(prev => ({
      ...prev,
      data: [...prev.data].sort((a, b) => {
        if (typeof a[column] === 'string') {
          return (a[column] as string).localeCompare(b[column] as string);
        }
        return (a[column] as number) - (b[column] as number);
      })
    }));
  };

  return { ...state, sortData, refreshData: fetchData };
};