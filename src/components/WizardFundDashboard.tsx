import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@tarobase/js-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Users, Shield, Twitter, AlertTriangle } from 'lucide-react';
import { FundManagerList } from '@/components/FundManagerList';
import { DepositForm } from '@/components/DepositForm';
import { WithdrawForm } from '@/components/WithdrawForm';
import { PortfolioView } from '@/components/PortfolioView';
import { TradingDashboard } from '@/components/TradingDashboard';
import { TransactionHistory } from '@/components/TransactionHistory';
import { PerformanceChart } from '@/components/PerformanceChart';
import { EmergencyWithdraw } from '@/components/EmergencyWithdraw';
import { useMobile } from '@/hooks/use-mobile';
import { useTarobaseData } from '@/hooks/use-tarobase-data';
import { subscribeAllFundPools, subscribeManyUserAllocationsFunds, FundPoolsResponse, UserAllocationsFundsResponse } from '@/lib/tarobase';
import { SOL_DECIMALS } from '@/lib/constants';

type UserMode = 'user' | 'manager';

interface WizardFundDashboardProps {}

export const WizardFundDashboard: React.FC<WizardFundDashboardProps> = () => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [mode, setMode] = useState<UserMode>('user');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real fund pools data
  const { data: fundPools } = useTarobaseData<FundPoolsResponse[]>(
    subscribeAllFundPools,
    true,
    ''
  );

  // Fetch user allocations if user is connected
  const { data: userAllocations } = useTarobaseData<UserAllocationsFundsResponse[]>(
    subscribeManyUserAllocationsFunds,
    !!user,
    user?.address || ''
  );

  // Calculate real stats from data
  const stats = useMemo(() => {
    const totalTVL = fundPools?.reduce((sum, pool) => 
      sum + (pool.currentTvlLamports / Math.pow(10, parseInt(SOL_DECIMALS))), 0
    ) || 0;

    const userPortfolioValue = userAllocations?.reduce((sum, allocation) => {
      const pool = fundPools?.find(p => p.id === allocation.fundPoolId);
      if (!pool || pool.fundTokenSupply === 0) return sum;
      // Calculate user's share: (userTokens / totalSupply) * TVL
      const userShare = (allocation.fundTokenAmount / pool.fundTokenSupply) * (pool.currentTvlLamports / Math.pow(10, parseInt(SOL_DECIMALS)));
      return sum + userShare;
    }, 0) || 0;

    const totalManagers = fundPools?.length || 0;
    const activeAllocations = userAllocations?.length || 0;

    return {
      totalTVL,
      userPortfolioValue,
      totalManagers,
      activeAllocations
    };
  }, [fundPools, userAllocations, user]);

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Connect your wallet to access The Wizard Fund</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="container mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🧙‍♂️ The Wizard Fund
          </h1>
          <p className="text-muted-foreground mt-1">Decentralized Fund Management on Solana</p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={mode === 'user' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('user')}
            className="text-xs"
          >
            <Users className="w-4 h-4 mr-1" />
            User Mode
          </Button>
          <Button
            variant={mode === 'manager' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('manager')}
            className="text-xs"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Manager Mode
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total TVL</p>
                <p className="text-2xl font-bold">{stats.totalTVL.toFixed(2)} SOL</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{mode === 'user' ? 'Your Portfolio' : 'Managed Assets'}</p>
                <p className="text-2xl font-bold">{mode === 'user' ? stats.userPortfolioValue.toFixed(2) : '0.00'} SOL</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{mode === 'user' ? 'Active Managers' : 'Total Investors'}</p>
                <p className="text-2xl font-bold">{mode === 'user' ? stats.activeAllocations : '0'}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{mode === 'user' ? '30D Return' : 'Performance Fee'}</p>
                <p className="text-2xl font-bold text-green-600">{mode === 'user' ? '+12.5%' : '2.5%'}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${mode === 'user' ? 'grid-cols-6' : 'grid-cols-4'} ${isMobile ? 'text-xs' : ''}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {mode === 'user' && (
            <>
              <TabsTrigger value="managers">Managers</TabsTrigger>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </>
          )}
          {mode === 'manager' && (
            <>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart />
            <TransactionHistory limit={5} />
          </div>
          {mode === 'user' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FundManagerList limit={3} />
              </div>
              <EmergencyWithdraw />
            </div>
          )}
        </TabsContent>

        {mode === 'user' && (
          <>
            <TabsContent value="managers">
              <FundManagerList />
            </TabsContent>
            
            <TabsContent value="deposit">
              <DepositForm />
            </TabsContent>
            
            <TabsContent value="withdraw">
              <WithdrawForm />
            </TabsContent>
            
            <TabsContent value="portfolio">
              <PortfolioView />
            </TabsContent>
            
            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>
          </>
        )}

        {mode === 'manager' && (
          <>
            <TabsContent value="trading">
              <TradingDashboard />
            </TabsContent>
            
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Twitter className="w-5 h-5" />
                    Twitter Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Connect your Twitter account to verify your identity and build trust with investors.
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Not Verified
                    </Badge>
                    <Button className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Connect Twitter
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Verification Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Increased investor trust</li>
                      <li>• Higher visibility in manager listings</li>
                      <li>• Access to premium features</li>
                      <li>• Verified badge on your profile</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance">
              <div className="space-y-6">
                <PerformanceChart />
                <TransactionHistory />
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </motion.div>
  );
};

export default WizardFundDashboard;