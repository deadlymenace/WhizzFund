import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowUpRight, ArrowDownRight, Loader2, Wallet } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useAuth } from '@tarobase/js-sdk';
import { useTarobaseData } from '@/hooks/use-tarobase-data';
import { 
  subscribeManyUserAllocationsFunds,
  subscribeAllFundPools,
  subscribeAllFundManagers,
  UserAllocationsFundsResponse,
  FundPoolsResponse,
  FundManagersResponse
} from '@/lib/tarobase';
import { SOL_DECIMALS } from '@/lib/constants';

interface PortfolioAllocation {
  id: string;
  manager: string;
  allocation: number;
  value: number;
  fundTokens: number;
  returns30d: number;
  returns1y: number;
  color: string;
}

interface PortfolioViewProps {}

export const PortfolioView: React.FC<PortfolioViewProps> = () => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [activeView, setActiveView] = useState<'overview' | 'allocations' | 'performance'>('overview');

  // Fetch user allocations
  const { data: userAllocations, loading: loadingAllocations } = useTarobaseData<UserAllocationsFundsResponse[]>(
    subscribeManyUserAllocationsFunds,
    !!user,
    user?.address || ''
  );

  // Fetch fund pools and managers
  const { data: fundPools } = useTarobaseData<FundPoolsResponse[]>(
    subscribeAllFundPools,
    true,
    ''
  );

  const { data: fundManagers } = useTarobaseData<FundManagersResponse[]>(
    subscribeAllFundManagers,
    true,
    ''
  );

  // Calculate portfolio allocations from real data
  const portfolioAllocations: PortfolioAllocation[] = useMemo(() => {
    if (!userAllocations || !fundPools || !fundManagers) return [];

    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

    const allocations = userAllocations.map((allocation, index) => {
      const pool = fundPools.find(p => p.id === allocation.fundPoolId);
      const manager = fundManagers.find(m => m.walletAddress === pool?.managerAddress);
      
      if (!pool) return null;

      // Calculate user's value in SOL
      const userShare = pool.fundTokenSupply > 0
        ? (allocation.fundTokenAmount / pool.fundTokenSupply) * (pool.currentTvlLamports / Math.pow(10, parseInt(SOL_DECIMALS)))
        : 0;

      const displayName = manager?.twitterHandle 
        ? manager.twitterHandle.replace('@', '') 
        : `${pool.managerAddress.slice(0, 4)}...${pool.managerAddress.slice(-4)}`;

      return {
        id: allocation.id,
        manager: displayName,
        allocation: 0, // Will calculate after getting total
        value: userShare,
        fundTokens: allocation.fundTokenAmount,
        returns30d: manager?.performanceScore || 0,
        returns1y: (manager?.performanceScore || 0) * 3,
        color: colors[index % colors.length]
      };
    }).filter(Boolean) as PortfolioAllocation[];

    // Calculate allocation percentages
    const totalValue = allocations.reduce((sum, a) => sum + a.value, 0);
    allocations.forEach(a => {
      a.allocation = totalValue > 0 ? (a.value / totalValue) * 100 : 0;
    });

    return allocations;
  }, [userAllocations, fundPools, fundManagers]);

  const totalValue = portfolioAllocations.reduce((sum, allocation) => sum + allocation.value, 0);
  const totalFundTokens = portfolioAllocations.reduce((sum, allocation) => sum + allocation.fundTokens, 0);
  const weightedReturn30d = portfolioAllocations.reduce((sum, allocation) => 
    sum + (allocation.returns30d * allocation.allocation / 100), 0
  );
  const weightedReturn1y = portfolioAllocations.reduce((sum, allocation) => 
    sum + (allocation.returns1y * allocation.allocation / 100), 0
  );

  const performanceData = portfolioAllocations.map(a => ({
    name: a.manager,
    return30d: a.returns30d,
    return1y: a.returns1y,
    allocation: a.allocation
  }));

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Connect your wallet to view your portfolio</p>
        </CardContent>
      </Card>
    );
  }

  if (loadingAllocations) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </CardContent>
      </Card>
    );
  }

  if (portfolioAllocations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">You don't have any active allocations yet</p>
          <Button>Make Your First Deposit</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{totalValue.toFixed(2)} SOL</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fund Tokens</p>
                <p className="text-2xl font-bold">{totalFundTokens.toLocaleString()}</p>
              </div>
              <Percent className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">30D Return</p>
                <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-5 h-5" />
                  +{weightedReturn30d.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">1Y Return</p>
                <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="w-5 h-5" />
                  +{weightedReturn1y.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Portfolio Content */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allocation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioAllocations}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="allocation"
                      >
                        {portfolioAllocations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {portfolioAllocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: allocation.color }}
                        />
                        <span className="text-sm font-medium">{allocation.manager}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{allocation.allocation}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  Rebalance Portfolio
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Add New Manager
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Withdraw Funds
                </Button>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Portfolio Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Diversification</span>
                      <span className="text-green-600">Good</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk Level</span>
                      <span className="text-yellow-600">Medium</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span className="text-green-600">Strong</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-6">
          <div className="space-y-4">
            {portfolioAllocations.map((allocation) => (
              <Card key={allocation.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{allocation.manager}</h3>
                      <p className="text-sm text-muted-foreground">
                        {allocation.fundTokens.toLocaleString()} fund tokens
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{allocation.value.toFixed(2)} SOL</p>
                      <p className="text-sm text-muted-foreground">{allocation.allocation}% of portfolio</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Allocation</span>
                      <span>{allocation.allocation}%</span>
                    </div>
                    <Progress value={allocation.allocation} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">30D Return</p>
                      <p className={`font-medium flex items-center gap-1 ${
                        allocation.returns30d >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {allocation.returns30d >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {allocation.returns30d >= 0 ? '+' : ''}{allocation.returns30d}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">1Y Return</p>
                      <p className="font-medium text-green-600">+{allocation.returns1y}%</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      Increase
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Decrease
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manager Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="return30d" fill="#8B5CF6" name="30D Return (%)" />
                    <Bar dataKey="return1y" fill="#06B6D4" name="1Y Return (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceData.map((manager, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{manager.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Allocation:</span>
                        <span>{manager.allocation}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">30D:</span>
                        <span className="text-green-600">+{manager.return30d}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">1Y:</span>
                        <span className="text-green-600">+{manager.return1y}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioView;