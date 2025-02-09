import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Minus } from 'lucide-react';
import { MarketData } from '../types/market';

interface MarketTableProps {
  data: MarketData[];
  onSort: (column: keyof MarketData) => void;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
  if (trend === 'down') return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
  return <Minus className="w-5 h-5 text-gray-500" />;
};

export const MarketTable: React.FC<MarketTableProps> = ({ data, onSort }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Date', 'Day of Week', 'Open', 'Close', 'Change %', 'Change $', 'Trend'].map((header) => (
              <th
                key={header}
                onClick={() => onSort(header.toLowerCase().replace(/ /g, '') as keyof MarketData)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.dayOfWeek}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row.open}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row.close}</td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${row.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {row.percentageChange > 0 ? '+' : ''}{row.percentageChange}%
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${row.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {row.valueChange > 0 ? '+' : ''}${row.valueChange}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TrendIcon trend={row.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};