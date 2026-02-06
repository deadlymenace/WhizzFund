import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, AlertCircle, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useMobile } from '@/hooks/use-mobile';

interface Position {
  id: string;
  token: string;
  symbol: string;
  amount: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

interface TradingDashboardProps {}

export const TradingDashboard: React.FC<TradingDashboardProps> = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [tradeAmount, setTradeAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  /* Mock data */
  const fundStats = {
    totalAUM: 125000,
    investors: 23,
    performance30d: 12.5,
    performance1y: 45.2,
    sharpeRatio: 1.8,
    maxDrawdown: -8.3
  };

  const positions: Position[] = [
    { id: '1', token: 'Solana', symbol: 'SOL', amount: 450, value: 45000, pnl: 5600, pnlPercent: 14.2 },
    { id: '2', token: 'Jupiter', symbol: 'JUP', amount: 12000, value: 8400, pnl: -1200, pnlPercent: -12.5 },
    { id: '3', token: 'Raydium', symbol: 'RAY', amount: 800, value: 2400, pnl: 400, pnlPercent: 20.0 },
    { id: '4', token: 'Orca', symbol: 'ORCA', amount: 1500, value: 4500, pnl: 750, pnlPercent: 20.0 },
    { id: '5', token: 'Serum', symbol: 'SRM', amount: 5000, value: 1500, pnl: -300, pnlPercent: -16.7 }
  ];

  const performanceData = [
    { date: '2024-01', value: 100000, benchmark: 100000 },
    { date: '2024-02', value: 105000, benchmark: 102000 },
    { date: '2024-03', value: 108000, benchmark: 104000 },
    { date: '2024-04', value: 112000, benchmark: 106000 },
    { date: '2024-05', value: 118000, benchmark: 108000 },
    { date: '2024-06', value: 125000, benchmark: 110000 }
  ];

  const recentTrades = [
    { id: '1', type: 'BUY', token: 'SOL', amount: 50, price: 98.5, time: '2 hours ago', status: 'completed' },
    { id: '2', type: 'SELL', token: 'JUP', amount: 2000, price: 0.68, time: '4 hours ago', status: 'completed' },
    { id: '3', type: 'BUY', token: 'RAY', amount: 200, price: 2.95, time: '6 hours ago', status: 'completed' },
    { id: '4', type: 'SELL', token: 'ORCA', amount: 300, price: 3.2, time: '1 day ago', status: 'completed' }
  ];

  const availableTokens = [
    { symbol: 'SOL', name: 'Solana', price: 100.25 },
    { symbol: 'JUP', name: 'Jupiter', price: 0.72 },
    { symbol: 'RAY', name: 'Raydium', price: 3.15 },
    { symbol: 'ORCA', name: 'Orca', price: 3.45 },
    { symbol: 'SRM', name: 'Serum', price: 0.31 }
  ];

  const handleTrade = () => {
    if (!selectedToken || !tradeAmount) {
      toast.error('Please select a token and enter an amount');
      return;
    }

    const token = availableTokens.find(t => t.symbol === selectedToken);
    const amount = parseFloat(tradeAmount);
    const totalValue = token ? (amount * token.price) : 0;

    toast.success(`${tradeType.toUpperCase()} order placed: ${amount} ${selectedToken} (~$${totalValue.toFixed(2)})`);
    setTradeAmount('');
    setSelectedToken('');
  };

  return (
    <div className="space-y-6">
      {/* Fund Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total AUM</p>
                <p className="text-2xl font-bold">${fundStats.totalAUM.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investors</p>
                <p className="text-2xl font-bold">{fundStats.investors}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">30D Performance</p>
                <p className="text-2xl font-bold text-green-600">+{fundStats.performance30d}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold">{fundStats.sharpeRatio}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full grid-cols-4 ${isMobile ? 'text-xs' : ''}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fund Performance vs Benchmark</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, '']} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.3}
                        name="Fund Value"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="benchmark" 
                        stroke="#6B7280" 
                        fill="#6B7280" 
                        fillOpacity={0.1}
                        name="Benchmark"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={trade.type === 'BUY' ? 'default' : 'secondary'}
                          className={trade.type === 'BUY' ? 'bg-green-600' : 'bg-red-600'}
                        >
                          {trade.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{trade.amount} {trade.token}</p>
                          <p className="text-sm text-muted-foreground">@ ${trade.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{trade.time}</p>
                        <Badge variant="outline" className="text-xs">
                          {trade.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-medium">{position.token}</h4>
                        <p className="text-sm text-muted-foreground">{position.symbol}</p>
                      </div>
                      <div>
                        <p className="font-medium">{position.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">${position.value.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium flex items-center gap-1 ${
                        position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.pnl >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {position.pnl >= 0 ? '+' : ''}${position.pnl}
                      </p>
                      <p className={`text-sm ${
                        position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Execute Trade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    variant={tradeType === 'buy' ? 'default' : 'outline'}
                    onClick={() => setTradeType('buy')}
                    className="flex-1"
                  >
                    Buy
                  </Button>
                  <Button 
                    variant={tradeType === 'sell' ? 'default' : 'outline'}
                    onClick={() => setTradeType('sell')}
                    className="flex-1"
                  >
                    Sell
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Token</Label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose token" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center justify-between w-full">
                            <span>{token.name} ({token.symbol})</span>
                            <span className="ml-2 text-muted-foreground">${token.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleTrade} className="w-full" size="lg">
                  Execute {tradeType.toUpperCase()} Order
                </Button>
              </CardContent>
            </Card>

            {/* Market Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableTokens.map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{token.name}</h4>
                        <p className="text-sm text-muted-foreground">{token.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${token.price}</p>
                        <p className="text-sm text-green-600">+2.5%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Risk Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                    <p className="text-xl font-bold">{fundStats.sharpeRatio}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Max Drawdown</p>
                    <p className="text-xl font-bold text-red-600">{fundStats.maxDrawdown}%</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Volatility</p>
                    <p className="text-xl font-bold">18.5%</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Beta</p>
                    <p className="text-xl font-bold">1.2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">1 Week</span>
                    <span className="font-medium text-green-600">+3.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">1 Month</span>
                    <span className="font-medium text-green-600">+{fundStats.performance30d}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">3 Months</span>
                    <span className="font-medium text-green-600">+28.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">1 Year</span>
                    <span className="font-medium text-green-600">+{fundStats.performance1y}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">All Time</span>
                    <span className="font-medium text-green-600">+67.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingDashboard;