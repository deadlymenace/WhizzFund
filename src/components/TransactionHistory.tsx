import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Filter, Download, ArrowUpRight, ArrowDownLeft, RefreshCw, Loader2 } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useAuth } from '@tarobase/js-sdk';
import { useTarobaseData } from '@/hooks/use-tarobase-data';
import {
  subscribeManyTransactions,
  subscribeAllFundManagers,
  TransactionsResponse,
  FundManagersResponse
} from '@/lib/tarobase';
import { SOL_DECIMALS } from '@/lib/constants';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'rebalance' | 'fee' | 'reward';
  amount: number;
  token: string;
  manager?: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

interface TransactionHistoryProps {
  limit?: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ limit }) => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch transactions for current user
  const { data: transactionsData, loading } = useTarobaseData<TransactionsResponse[]>(
    subscribeManyTransactions,
    !!user,
    user ? `userAddress = "${user.address}"` : ''
  );

  // Fetch fund managers for display
  const { data: fundManagers } = useTarobaseData<FundManagersResponse[]>(
    subscribeAllFundManagers,
    true,
    ''
  );

  // Transform Tarobase data to component format
  const transactions: Transaction[] = useMemo(() => {
    if (!transactionsData) return [];

    return transactionsData.map(tx => {
      const manager = fundManagers?.find(m => m.walletAddress === tx.fundPoolId);
      const displayName = manager?.twitterHandle 
        ? manager.twitterHandle.replace('@', '') 
        : tx.fundPoolId ? `${tx.fundPoolId.slice(0, 4)}...${tx.fundPoolId.slice(-4)}` : 'Unknown';

      return {
        id: tx.id,
        type: tx.txType as any,
        amount: tx.amountLamports / Math.pow(10, parseInt(SOL_DECIMALS)),
        token: 'SOL',
        manager: manager?.strategyDescription ? `${displayName} - ${manager.strategyDescription}` : displayName,
        timestamp: tx.tarobase_created_at, // Already in milliseconds
        status: 'completed' as const,
        txHash: tx.id // Using transaction ID as hash
      };
    }).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
  }, [transactionsData, fundManagers]);

  // Keep mock data for demonstration when no user is connected
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 100,
      token: 'SOL',
      manager: 'Alex Chen - DeFi Yield Farming',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'completed',
      txHash: '5KJp7z8X9vN2qR4mT6wE3sL1nY8pQ7rF9cV4bH2jM6xA'
    },
    {
      id: '2',
      type: 'reward',
      amount: 12.5,
      token: 'SOL',
      manager: 'Sarah Williams - Conservative Growth',
      timestamp: Date.now() - 7200000, // 2 hours ago
      status: 'completed',
      txHash: '8NmQ3x7Y2vP5tR9mW4eE6sL8nY1pQ4rF2cV7bH5jM9xD'
    },
    {
      id: '3',
      type: 'withdraw',
      amount: 50,
      token: 'SOL',
      manager: 'Emma Thompson - NFT & Gaming',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'completed',
      txHash: '2LpR6z9X4vN8qT5mY3wE7sL2nY5pQ1rF6cV9bH8jM3xF'
    },
    {
      id: '4',
      type: 'fee',
      amount: 2.5,
      token: 'SOL',
      manager: 'Alex Chen - DeFi Yield Farming',
      timestamp: Date.now() - 172800000, // 2 days ago
      status: 'completed',
      txHash: '9QmT4x8Y5vP2tR6mZ7wE4sL9nY3pQ8rF1cV2bH6jM4xG'
    },
    {
      id: '5',
      type: 'rebalance',
      amount: 75,
      token: 'SOL',
      manager: 'David Park - Arbitrage & MEV',
      timestamp: Date.now() - 259200000, // 3 days ago
      status: 'completed',
      txHash: '7HnS5z2X6vN9qU8mV4wE1sL7nY6pQ3rF8cV1bH9jM7xH'
    },
    {
      id: '6',
      type: 'deposit',
      amount: 200,
      token: 'SOL',
      manager: 'Emma Thompson - NFT & Gaming',
      timestamp: Date.now() - 345600000, // 4 days ago
      status: 'completed',
      txHash: '3MqU7x1Y8vP6tS2mX5wE9sL3nY7pQ5rF4cV8bH1jM8xI'
    },
    {
      id: '7',
      type: 'reward',
      amount: 18.9,
      token: 'SOL',
      manager: 'Emma Thompson - NFT & Gaming',
      timestamp: Date.now() - 432000000, // 5 days ago
      status: 'completed',
      txHash: '6LpV8z4X1vN3qW9mY2wE6sL4nY9pQ2rF7cV3bH4jM1xJ'
    },
    {
      id: '8',
      type: 'deposit',
      amount: 150,
      token: 'SOL',
      manager: 'Sarah Williams - Conservative Growth',
      timestamp: Date.now() - 518400000, // 6 days ago
      status: 'completed',
      txHash: '1KoW9z7X5vN7qX3mZ8wE2sL1nY2pQ6rF3cV6bH7jM5xK'
    }
  ];

  // Use real transactions if available, otherwise mock data for display
  const displayTransactions = user && transactions.length > 0 ? transactions : mockTransactions;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'withdraw': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'rebalance': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'fee': return <ArrowUpRight className="w-4 h-4 text-orange-600" />;
      case 'reward': return <ArrowDownLeft className="w-4 h-4 text-purple-600" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-800';
      case 'withdraw': return 'bg-red-100 text-red-800';
      case 'rebalance': return 'bg-blue-100 text-blue-800';
      case 'fee': return 'bg-orange-100 text-orange-800';
      case 'reward': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const filteredTransactions = displayTransactions
    .filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
      if (searchTerm && !tx.manager?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .slice(0, limit || displayTransactions.length);

  const handleExport = () => {
    // Mock export functionality
    const csvContent = filteredTransactions.map(tx => 
      `${tx.type},${tx.amount},${tx.token},${tx.manager || ''},${new Date(tx.timestamp).toISOString()},${tx.status}`
    ).join('\n');
    
    console.log('Exporting transactions:', csvContent);
    // In a real app, this would trigger a file download
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
            {limit && <Badge variant="secondary">{filteredTransactions.length} of {displayTransactions.length}</Badge>}
          </CardTitle>
          {!limit && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!limit && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdraw">Withdrawals</SelectItem>
                <SelectItem value="rebalance">Rebalances</SelectItem>
                <SelectItem value="fee">Fees</SelectItem>
                <SelectItem value="reward">Rewards</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading transactions...</span>
          </div>
        ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getTypeIcon(transaction.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={getTypeColor(transaction.type)}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="font-medium">
                    {transaction.amount} {transaction.token}
                  </p>
                  {transaction.manager && (
                    <p className="text-sm text-muted-foreground truncate">
                      {transaction.manager}
                    </p>
                  )}
                  {!isMobile && transaction.txHash && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {transaction.txHash.slice(0, 8)}...{transaction.txHash.slice(-8)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-muted-foreground">
                  {formatTime(transaction.timestamp)}
                </p>
                {isMobile && transaction.txHash && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {transaction.txHash.slice(0, 6)}...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        )}

        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
          </div>
        )}

        {limit && displayTransactions.length > limit && (
          <div className="mt-4 text-center">
            <Button variant="outline">
              View All {displayTransactions.length} Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;