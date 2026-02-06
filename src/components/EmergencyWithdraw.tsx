import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Shield, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyWithdrawProps {}

export const EmergencyWithdraw: React.FC<EmergencyWithdrawProps> = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /* Mock data */
  const totalPortfolioValue = 475.28; // SOL
  const emergencyFee = 0.05; // 5% emergency fee
  const estimatedReceived = totalPortfolioValue * (1 - emergencyFee);
  const cooldownPeriod = 24; // hours

  const handleEmergencyWithdraw = async () => {
    if (!confirmationChecked) {
      toast.error('Please confirm you understand the risks');
      return;
    }

    setIsProcessing(true);
    
    // Simulate emergency withdrawal processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Emergency withdrawal initiated! You will receive ~${estimatedReceived.toFixed(4)} SOL`);
      setIsEmergencyMode(false);
      setConfirmationChecked(false);
    }, 3000);
  };

  const handleToggleEmergencyMode = () => {
    setIsEmergencyMode(!isEmergencyMode);
    setConfirmationChecked(false);
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Shield className="w-5 h-5" />
          Emergency Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEmergencyMode ? (
          <>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900 mb-2">Emergency Withdrawal Available</p>
                  <p className="text-orange-700 mb-3">
                    In case of urgent need, you can withdraw all funds immediately, 
                    bypassing normal cooldown periods.
                  </p>
                  <ul className="text-orange-700 space-y-1 text-xs">
                    <li>• 5% emergency fee applies</li>
                    <li>• Immediate liquidity from all positions</li>
                    <li>• No cooldown period required</li>
                    <li>• Cannot be reversed once initiated</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">Total Portfolio</p>
                <p className="font-bold text-lg">{totalPortfolioValue.toFixed(4)} SOL</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">Emergency Fee</p>
                <p className="font-bold text-lg text-red-600">{(emergencyFee * 100)}%</p>
              </div>
            </div>
            
            <Button 
              onClick={handleToggleEmergencyMode}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Zap className="w-4 h-4 mr-2" />
              Initiate Emergency Withdrawal
            </Button>
          </>
        ) : (
          <>
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> Emergency withdrawal will liquidate all positions immediately. 
                This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Portfolio Value:</span>
                  <span className="font-medium">{totalPortfolioValue.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Emergency Fee (5%):</span>
                  <span className="font-medium text-red-600">-{(totalPortfolioValue * emergencyFee).toFixed(4)} SOL</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">You Will Receive:</span>
                    <span className="font-bold text-green-600">{estimatedReceived.toFixed(4)} SOL</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="emergency-confirm"
                  checked={confirmationChecked}
                  onCheckedChange={(checked) => setConfirmationChecked(checked as boolean)}
                />
                <label htmlFor="emergency-confirm" className="text-sm text-muted-foreground leading-relaxed">
                  I understand that this emergency withdrawal will:
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Liquidate all my fund positions immediately</li>
                    <li>• Charge a 5% emergency fee</li>
                    <li>• Cannot be reversed once initiated</li>
                    <li>• May result in suboptimal exit prices</li>
                  </ul>
                </label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleToggleEmergencyMode}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEmergencyWithdraw}
                variant="destructive"
                className="flex-1"
                disabled={!confirmationChecked || isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Confirm Emergency Withdrawal
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Processing time: ~2-5 minutes</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyWithdraw;