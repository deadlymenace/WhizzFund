import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, Calculator, Info, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@tarobase/js-sdk';
import { useTarobaseData } from '@/hooks/use-tarobase-data';
import { 
  subscribeAllFundManagers, 
  subscribeAllFundPools,
  setFundPoolsDeposits,
  Address,
  Token,
  FundManagersResponse,
  FundPoolsResponse
} from '@/lib/tarobase';
import { SOL_DECIMALS } from '@/lib/constants';

interface DepositFormProps {}

export const DepositForm: React.FC<DepositFormProps> = () => {
  const { user } = useAuth();
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);

  // Fetch fund managers and pools
  const { data: fundManagersData } = useTarobaseData<FundManagersResponse[]>(
    subscribeAllFundManagers,
    true,
    ''
  );

  const { data: fundPoolsData } = useTarobaseData<FundPoolsResponse[]>(
    subscribeAllFundPools,
    true,
    ''
  );

  // Combine manager and pool data
  const managerOptions = useMemo(() => {
    if (!fundManagersData || !fundPoolsData) return [];
    
    return fundPoolsData.map(pool => {
      const manager = fundManagersData.find(m => m.walletAddress === pool.managerAddress);
      const displayName = manager?.twitterHandle 
        ? manager.twitterHandle.replace('@', '') 
        : `${pool.managerAddress.slice(0, 4)}...${pool.managerAddress.slice(-4)}`;
      
      return {
        poolId: pool.id,
        managerId: manager?.id || pool.managerAddress,
        name: `${displayName} - ${manager?.strategyDescription || 'Fund'}`,
        fee: manager ? manager.feePercentageBps / 100 : 0,
        minDeposit: 0.1, // Minimum 0.1 SOL
        currentTvl: pool.currentTvlLamports / Math.pow(10, parseInt(SOL_DECIMALS)),
        fundTokenSupply: pool.fundTokenSupply
      };
    });
  }, [fundManagersData, fundPoolsData]);

  const selectedPool = managerOptions.find(m => m.poolId === selectedPoolId);
  const depositAmountNum = parseFloat(depositAmount) || 0;
  
  // Calculate fund tokens based on TVL and supply
  const fundTokensToReceive = useMemo(() => {
    if (!selectedPool || depositAmountNum <= 0) return 0;
    
    // If pool is empty, mint tokens 1:1 with lamports
    if (selectedPool.currentTvl === 0 || selectedPool.fundTokenSupply === 0) {
      return depositAmountNum * Math.pow(10, parseInt(SOL_DECIMALS));
    }
    
    // Otherwise calculate proportionally: (deposit / currentTVL) * totalSupply
    return (depositAmountNum / selectedPool.currentTvl) * selectedPool.fundTokenSupply;
  }, [selectedPool, depositAmountNum]);
  
  const performanceFee = selectedPool ? (depositAmountNum * selectedPool.fee / 100) : 0;
  const netDeposit = depositAmountNum - performanceFee;

  const handleDeposit = async () => {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedPoolId || !depositAmount || depositAmountNum <= 0) {
      toast.error('Please select a fund and enter a valid deposit amount');
      return;
    }

    if (selectedPool && depositAmountNum < selectedPool.minDeposit) {
      toast.error(`Minimum deposit for this fund is ${selectedPool.minDeposit} SOL`);
      return;
    }

    setIsDepositing(true);
    
    try {
      // Create deposit record in Tarobase
      const depositId = `${user.address}-${Date.now()}`;
      const success = await setFundPoolsDeposits(
        selectedPoolId,
        depositId,
        {
          userAddress: Address.publicKey(user.address),
          amountLamports: Token.amount('SOL', depositAmountNum)
        }
      );

      if (success) {
        toast.success(
          `Successfully deposited ${depositAmount} SOL! You received ${Math.floor(fundTokensToReceive).toLocaleString()} fund tokens.`,
          { duration: 5000 }
        );
        setDepositAmount('');
        setSelectedPoolId('');
      } else {
        toast.error('Deposit failed. Please try again.');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Deposit SOL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="manager-select">Select Fund Manager</Label>
            <Select value={selectedPoolId} onValueChange={setSelectedPoolId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a fund manager" />
              </SelectTrigger>
              <SelectContent>
                {managerOptions.map((manager) => (
                  <SelectItem key={manager.poolId} value={manager.poolId}>
                    <div className="flex items-center justify-between w-full">
                      <span>{manager.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {manager.fee}% fee
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPool && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Minimum deposit: {selectedPool.minDeposit} SOL
                </p>
                <p className="text-sm text-muted-foreground">
                  Current TVL: {selectedPool.currentTvl.toFixed(2)} SOL
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Deposit Amount (SOL)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <Button 
            onClick={handleDeposit} 
            disabled={!user || !selectedPoolId || !depositAmount || isDepositing}
            className="w-full"
          >
            {isDepositing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Deposit...
              </div>
            ) : !user ? (
              'Connect Wallet to Deposit'
            ) : (
              'Deposit SOL'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Deposit Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPoolId && depositAmount ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Deposit Amount:</span>
                  <span className="font-medium">{depositAmount} SOL</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Performance Fee ({selectedPool?.fee}%):</span>
                  <span className="font-medium text-red-600">-{performanceFee.toFixed(4)} SOL</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Net Deposit:</span>
                  <span className="font-medium">{netDeposit.toFixed(4)} SOL</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fund Tokens to Receive:</span>
                  <span className="font-bold text-green-600">{Math.floor(fundTokensToReceive).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Fund Token Details</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Non-transferable SPL tokens</li>
                      <li>• Represent your share in the fund</li>
                      <li>• Can be redeemed for SOL at any time</li>
                      <li>• Subject to cooldown periods</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a manager and enter an amount to see calculations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositForm;