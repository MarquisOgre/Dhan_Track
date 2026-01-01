import { Wallet } from 'lucide-react';

type BalanceCardProps = {
  balance: number;
};

export function BalanceCard({ balance }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="card-elevated p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <span className="text-muted-foreground font-medium">Total Balance</span>
      </div>
      <p className="balance-display text-foreground">
        {formatCurrency(balance)}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Updated just now
      </p>
    </div>
  );
}
