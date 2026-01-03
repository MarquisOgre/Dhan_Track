import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type EditBalanceModalProps = {
  currentBalance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjust: (newBalance: number) => void;
};

export function EditBalanceModal({
  currentBalance,
  open,
  onOpenChange,
  onAdjust,
}: EditBalanceModalProps) {
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    if (open) {
      setNewBalance(currentBalance.toString());
    }
  }, [open, currentBalance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(newBalance);
    if (isNaN(balance)) return;
    onAdjust(balance);
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0 });
  };

  const difference = parseFloat(newBalance) - currentBalance;
  const isValid = !isNaN(parseFloat(newBalance));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Balance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="text-muted-foreground">Current Balance</p>
            <p className="font-bold text-lg">{formatCurrency(currentBalance)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newBalance">New Balance (₹)</Label>
            <Input
              id="newBalance"
              type="number"
              step="0.01"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="Enter new balance"
              required
            />
          </div>

          {isValid && difference !== 0 && (
            <div className={`p-3 rounded-lg text-sm ${
              difference > 0 
                ? 'bg-primary/10 text-primary' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              <p>
                This will create a{' '}
                <span className="font-semibold">
                  {difference > 0 ? 'Balance Adjustment (Income)' : 'Balance Adjustment (Expense)'}
                </span>
                {' '}of{' '}
                <span className="font-bold">{formatCurrency(Math.abs(difference))}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!isValid || difference === 0}
            >
              Update Balance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
