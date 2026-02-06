import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

interface PerformanceChartProps {}

export const PerformanceChart: React.FC<PerformanceChartProps> = () => {
  const isMobile = useMobile();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  /* Mock data */
  const performanceData = {
    '7d': [
      { date: '2024-01-01', value: 100, benchmark: 100 },
      { date: '2024-01-02', value: 102, benchmark: 101 },
      { date: '2024-01-03', value: 98, benchmark: 99 },
      { date: '2024-01-04', value: 105, benchmark: 102 },
      { date: '2024-01-05', value: 108, benchmark: 104 },
      { date: '2024-01-06', value: 106, benchmark: 103 },
      { date: '2024-01-07', value: 112, benchmark: 105 }
    ],
    '30d': [
      { date: '2024-01-01', value: 100, benchmark: 100 },
      { date: '2024-01-05', value: 105, benchmark: 102 },
      { date: '2024-01-10', value: 108, benchmark: 104 },
      { date: '2024-01-15', value: 112, benchmark: 106 },
      { date: '2024-01-20', value: 118, benchmark: 108 },
      { date: '2024-01-25', value: 115, benchmark: 107 },
      { date: '2024-01-30', value: 125, benchmark: 110 }
    ],
    '90d': [
      { date: '2023-11-01', value: 100, benchmark: 100 },
      { date: '2023-11-15', value: 105, benchmark: 102 },
      { date: '2023-12-01', value: 110, benchmark: 104 },
      { date: '2023-12-15', value: 115, benchmark: 106 },
      { date: '2024-01-01', value: 120, benchmark: 108 },
      { date: '2024-01-15', value: 125, benchmark: 110 },
      { date: '2024-01-30', value: 135, benchmark: 112 }
    ],
    '1y': [
      { date: '2023-02-01', value: 100, benchmark: 100 },
      { date: '2023-04-01', value: 110, benchmark: 105 },
      { date: '2023-06-01', value: 120, benchmark: 110 },
      { date: '2023-08-01', value: 125, benchmark: 112 },
      { date: '2023-10-01', value: 130, benchmark: 115 },
      { date: '2023-12-01', value: 140, benchmark: 118 },
      { date: '2024-01-30', value: 145, benchmark: 120 }
    ],
    'all': [
      { date: '2022-01-01', value: 100, benchmark: 100 },
      { date: '2022-06-01', value: 120, benchmark: 110 },
      { date: '2023-01-01', value: 130, benchmark: 115 },
      { date: '2023-06-01', value: 140, benchmark: 120 },
      { date: '2024-01-01', value: 150, benchmark: 125 },
      { date: '2024-01-30', value: 165, benchmark: 130 }
    ]
  };

  const currentData = performanceData[timeRange];
  const latestValue = currentData[currentData.length - 1];
  const firstValue = currentData[0];
  const totalReturn = ((latestValue.value - firstValue.value) / firstValue.value) * 100;
  const benchmarkReturn = ((latestValue.benchmark - firstValue.benchmark) / firstValue.benchmark) * 100;
  const outperformance = totalReturn - benchmarkReturn;

  const timeRangeLabels = {
    '7d': '7 Days',
    '30d': '30 Days',
    '90d': '90 Days',
    '1y': '1 Year',
    'all': 'All Time'
  };

  const formatTooltipValue = (value: number, name: string) => {
    const percentage = ((value - 100) / 100) * 100;
    return [`${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`, name];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Chart
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {Object.entries(timeRangeLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={timeRange === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(key as TimeRange)}
                  className={`text-xs ${isMobile ? 'px-2' : 'px-3'}`}
                >
                  {isMobile ? key.toUpperCase() : label}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            >
              {chartType === 'line' ? 'Area' : 'Line'}
            </Button>
          </div>
        </div>
        
        {/* Performance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Fund Return</p>
            <p className={`text-lg font-bold flex items-center gap-1 ${
              totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </p>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Benchmark Return</p>
            <p className={`text-lg font-bold ${
              benchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {benchmarkReturn >= 0 ? '+' : ''}{benchmarkReturn.toFixed(2)}%
            </p>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Outperformance</p>
            <p className={`text-lg font-bold ${
              outperformance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {outperformance >= 0 ? '+' : ''}{outperformance.toFixed(2)}%
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return isMobile ? 
                      `${date.getMonth() + 1}/${date.getDate()}` :
                      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `${((value - 100)).toFixed(0)}%`}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                  name="Fund Performance"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#6B7280" 
                  fill="#6B7280" 
                  fillOpacity={0.1}
                  name="Benchmark"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            ) : (
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return isMobile ? 
                      `${date.getMonth() + 1}/${date.getDate()}` :
                      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `${((value - 100)).toFixed(0)}%`}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  name="Fund Performance"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#6B7280" 
                  name="Benchmark"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full" />
            <span>Fund Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-gray-600 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(to right, #6B7280 0, #6B7280 3px, transparent 3px, transparent 8px)' }} />
            <span>Benchmark</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;