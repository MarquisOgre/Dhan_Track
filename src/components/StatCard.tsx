import { TrendingUp, TrendingDown } from 'lucide-react';

type StatCardProps = {
  type: 'income' | 'expense';
  amount: number;
};

export function StatCard({ type, amount }: StatCardProps) {
  const formatCurrency = (value: number) => {
    return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const isIncome = type === 'income';
  const Icon = isIncome ? TrendingUp : TrendingDown;

  return (
    <div className={`stat-card ${isIncome ? 'stat-card-income' : 'stat-card-expense'} animate-slide-up`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="80" cy="20" r="60" fill="currentColor" />
        </svg>
      </div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-5 h-5" />
          <span className="font-medium opacity-90">
            {isIncome ? 'Income' : 'Expenses'}
          </span>
        </div>
        <p className="text-3xl font-bold font-display">
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}
