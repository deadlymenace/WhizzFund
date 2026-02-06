import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Users, Shield, Twitter, Star, Loader2 } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useTarobaseData } from '@/hooks/use-tarobase-data';
import { subscribeAllFundManagers, subscribeAllFundPools, FundManagersResponse, FundPoolsResponse } from '@/lib/tarobase';
import { SOL_DECIMALS } from '@/lib/constants';

interface FundManager {
  id: string;
  name: string;
  walletAddress: string;
  avatar?: string;
  strategy: string;
  aum: number;
  performanceFee: number;
  returns30d: number;
  returns1y: number;
  investors: number;
  verified: boolean;
  twitterHandle?: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  minDeposit: number;
  poolId?: string;
}

interface FundManagerListProps {
  limit?: number;
}

export const FundManagerList: React.FC<FundManagerListProps> = ({ limit }) => {
  const isMobile = useMobile();
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  // Fetch fund managers and pools from Tarobase
  const { data: fundManagersData, loading: loadingManagers } = useTarobaseData<FundManagersResponse[]>(
    subscribeAllFundManagers,
    true,
    ''
  );

  const { data: fundPoolsData } = useTarobaseData<FundPoolsResponse[]>(
    subscribeAllFundPools,
    true,
    ''
  );

  // Transform Tarobase data to component format
  const managers: FundManager[] = useMemo(() => {
    if (!fundManagersData) return [];

    return fundManagersData.map(manager => {
      const pool = fundPoolsData?.find(p => p.managerAddress === manager.walletAddress);
      const aum = pool ? pool.currentTvlLamports / Math.pow(10, parseInt(SOL_DECIMALS)) : 0;
      
      // Extract name from wallet address (first 4 and last 4 chars) or use Twitter handle
      const displayName = manager.twitterHandle 
        ? manager.twitterHandle.replace('@', '') 
        : `${manager.walletAddress.slice(0, 4)}...${manager.walletAddress.slice(-4)}`;

      // Calculate risk level based on fee percentage
      let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
      if (manager.feePercentageBps < 150) riskLevel = 'Low';
      else if (manager.feePercentageBps > 250) riskLevel = 'High';

      return {
        id: manager.id,
        name: displayName,
        walletAddress: manager.walletAddress,
        strategy: manager.strategyDescription,
        aum: aum,
        performanceFee: manager.feePercentageBps / 100, // Convert basis points to percentage
        returns30d: manager.performanceScore || 0, // Using performance score as 30d return
        returns1y: (manager.performanceScore || 0) * 3, // Mock 1y return as 3x 30d
        investors: 0, // TODO: Calculate from user allocations
        verified: manager.twitterVerified,
        twitterHandle: manager.twitterHandle,
        riskLevel,
        minDeposit: 1, // Default minimum
        poolId: pool?.id
      };
    });
  }, [fundManagersData, fundPoolsData]);

  const displayedManagers = limit ? managers.slice(0, limit) : managers;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Fund Managers
          {limit && <Badge variant="secondary">{displayedManagers.length} of {managers.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingManagers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading fund managers...</span>
          </div>
        ) : managers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No fund managers available yet.</p>
          </div>
        ) : (
        <div className="space-y-4">
          {displayedManagers.map((manager) => (
            <div
              key={manager.id}
              className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                selectedManager === manager.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedManager(selectedManager === manager.id ? null : manager.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={manager.avatar} />
                    <AvatarFallback>{manager.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{manager.name}</h4>
                      {manager.verified && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-blue-600" />
                          {manager.twitterHandle && <Twitter className="w-4 h-4 text-blue-400" />}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{manager.strategy}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className={getRiskColor(manager.riskLevel)}>
                        {manager.riskLevel} Risk
                      </Badge>
                      <Badge variant="outline">
                        {manager.performanceFee}% Fee
                      </Badge>
                      <Badge variant="outline">
                        Min: {manager.minDeposit} SOL
                      </Badge>
                    </div>
                    
                    {!isMobile && (
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">AUM</p>
                          <p className="font-medium">${manager.aum.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">30D Return</p>
                          <p className={`font-medium flex items-center gap-1 ${
                            manager.returns30d >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {manager.returns30d >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {manager.returns30d >= 0 ? '+' : ''}{manager.returns30d}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">1Y Return</p>
                          <p className="font-medium text-green-600">+{manager.returns1y}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Investors</p>
                          <p className="font-medium">{manager.investors}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" className="whitespace-nowrap">
                    Allocate Funds
                  </Button>
                  {selectedManager === manager.id && (
                    <Button size="sm" variant="outline" className="whitespace-nowrap">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
              
              {isMobile && selectedManager === manager.id && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">AUM</p>
                    <p className="font-medium">${manager.aum.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">30D Return</p>
                    <p className={`font-medium flex items-center gap-1 ${
                      manager.returns30d >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {manager.returns30d >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {manager.returns30d >= 0 ? '+' : ''}{manager.returns30d}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">1Y Return</p>
                    <p className="font-medium text-green-600">+{manager.returns1y}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Investors</p>
                    <p className="font-medium">{manager.investors}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
        
        {!loadingManagers && limit && managers.length > limit && (
          <div className="mt-4 text-center">
            <Button variant="outline">
              View All {managers.length} Managers
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FundManagerList;