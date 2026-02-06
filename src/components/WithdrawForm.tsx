import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ArrowLeftRight, Calculator, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@tarobase/js-sdk';
import { useTarobaseData } from '@/hooks/use-tarobase-data';
import {
  subscribeManyUserAllocationsFunds,
  subscribeAllFundPools,
  subscribeAllFundManagers,
  setUserAllocationsFundsWithdrawals,
  UserAllocationsFundsResponse,
  FundPoolsResponse,
  FundManagersResponse
} from '@/lib/tarobase';
import { SOL_DECIMALS, WITHDRAWAL_COOLDOWN_SECONDS } from '@/lib/constants';

interface WithdrawFormProps {}

export const WithdrawForm: React.FC<WithdrawFormProps> = () => {
  const { user } = useAuth();
  const [selectedAllocationId, setSelectedAllocationId] = useState<string>('');
  const [withdrawPercentage, setWithdrawPercentage] = useState<number[]>([25]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch user allocations
  const { data: userAllocations, loading } = useTarobaseData<UserAllocationsFundsResponse[]>(
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

  // Transform data for display
  const userFunds = useMemo(() => {
    if (!userAllocations || !fundPools || !fundManagers) return [];

    return userAllocations.map(allocation => {
      const pool = fundPools.find(p => p.id === allocation.fundPoolId);
      const manager = fundManagers.find(m => m.walletAddress === pool?.managerAddress);
      
      if (!pool) return null;

      const displayName = manager?.twitterHandle 
        ? manager.twitterHandle.replace('@', '') 
        : `${pool.managerAddress.slice(0, 4)}...${pool.managerAddress.slice(-4)}`;

      // Calculate current value
      const currentValue = pool.fundTokenSupply > 0
        ? (allocation.fundTokenAmount / pool.fundTokenSupply) * (pool.currentTvlLamports / Math.pow(10, parseInt(SOL_DECIMALS)))
        : 0;

      // Check cooldown
      const cooldownSeconds = parseInt(WITHDRAWAL_COOLDOWN_SECONDS);
      const lastWithdrawal = allocation.lastWithdrawalTimestamp || 0;
      const now = Math.floor(Date.now() / 1000); // Convert to seconds
      const cooldownEnd = lastWithdrawal + cooldownSeconds;
      const canWithdraw = now >= cooldownEnd;

      return {
        id: allocation.id,
        allocationId: allocation.id,
        fundPoolId: allocation.fundPoolId,
        manager: `${displayName} - ${manager?.strategyDescription || 'Fund'}`,
        fundTokens: allocation.fundTokenAmount,
        currentValue,
        cooldownEnd: canWithdraw ? null : cooldownEnd * 1000, // Convert back to ms
        canWithdraw
      };
    }).filter(Boolean);
  }, [userAllocations, fundPools, fundManagers]);

  const selectedFundData = userFunds.find(f => f?.id === selectedAllocationId);
  const withdrawAmount = selectedFundData ? (selectedFundData.currentValue * withdrawPercentage[0] / 100) : 0;
  const tokensToRedeem = selectedFundData ? (selectedFundData.fundTokens * withdrawPercentage[0] / 100) : 0;

  const handleWithdraw = async () => {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedAllocationId || withdrawPercentage[0] <= 0) {
      toast.error('Please select a fund and withdrawal amount');
      return;
    }

    if (selectedFundData && !selectedFundData.canWithdraw) {
      toast.error('This fund is currently in cooldown period');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create withdrawal record
      const withdrawalId = `${user.address}-${Date.now()}`;
      const success = await setUserAllocationsFundsWithdrawals(
        user.address,
        selectedFundData!.fundPoolId,
        withdrawalId,
        {
          fundTokenAmount: Math.floor(tokensToRedeem)
        }
      );

      if (success) {
        toast.success(
          `Successfully withdrew ${withdrawAmount.toFixed(4)} SOL! Burned ${Math.floor(tokensToRedeem).toLocaleString()} fund tokens.`,
          { duration: 5000 }
        );
        setSelectedAllocationId('');
        setWithdrawPercentage([25]);
      } else {
        toast.error('Withdrawal failed. Please try again.');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRebalance = () => {
    toast.info('Rebalancing feature coming soon! This will allow you to move funds between managers.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            Withdraw from Fund
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fund-select">Select Fund to Withdraw From</Label>
            <Select value={selectedAllocationId} onValueChange={setSelectedAllocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a fund" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="p-2 text-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                    Loading...
                  </div>
                ) : userFunds.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">
                    No funds to withdraw
                  </div>
                ) : (
                  userFunds.map((fund) => fund && (
                  <SelectItem key={fund.id} value={fund.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{fund.manager}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="outline">
                          {fund.currentValue.toFixed(2)} SOL
                        </Badge>
                        {!fund.canWithdraw && (
                          <Badge variant="destructive" className="text-xs">
                            Cooldown
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedFundData && !selectedFundData.canWithdraw && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                <Clock className="w-4 h-4" />
                <span>Cooldown ends in ~24 hours</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Withdrawal Percentage: {withdrawPercentage[0]}%</Label>
            <Slider
              value={withdrawPercentage}
              onValueChange={setWithdrawPercentage}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawPercentage([percent])}
                  className="flex-1"
                >
                  {percent}%
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleWithdraw} 
              disabled={!user || !selectedAllocationId || isProcessing || (selectedFundData && !selectedFundData.canWithdraw)}
              className="flex-1"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Withdrawal...
                </div>
              ) : !user ? (
                'Connect Wallet to Withdraw'
              ) : (
                'Withdraw SOL'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRebalance}
              disabled={!selectedAllocationId}
            >
              Rebalance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Withdrawal Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedAllocationId && selectedFundData ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Fund Value:</span>
                  <span className="font-medium">{selectedFundData.currentValue.toFixed(4)} SOL</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fund Tokens Held:</span>
                  <span className="font-medium">{selectedFundData.fundTokens.toLocaleString()}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Withdrawal Amount:</span>
                  <span className="font-bold text-green-600">{withdrawAmount.toFixed(4)} SOL</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tokens to Redeem:</span>
                  <span className="font-medium text-red-600">{tokensToRedeem.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Remaining Value:</span>
                  <span className="font-medium">{(selectedFundData.currentValue - withdrawAmount).toFixed(4)} SOL</span>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 mb-1">Withdrawal Notes</p>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• Fund tokens will be permanently burned</li>
                      <li>• Withdrawal may trigger cooldown period</li>
                      <li>• Consider rebalancing instead of full withdrawal</li>
                      <li>• Gas fees will be deducted from withdrawal</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a fund to see withdrawal impact</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawForm;