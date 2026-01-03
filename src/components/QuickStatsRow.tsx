import { TrendingUp, TrendingDown, Plus, Wallet, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type QuickStatsRowProps = {
  balance: number;
  income: number;
  expenses: number;
  onAddClick: () => void;
  onEditBalance?: () => void;
};

export function QuickStatsRow({ balance, income, expenses, onAddClick, onEditBalance }: QuickStatsRowProps) {
  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0 });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
      {/* Balance */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onEditBalance}
            className="card-elevated p-4 flex flex-col text-left hover:bg-muted/50 transition-colors group relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Balance</span>
              <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <p className="text-lg font-bold font-display text-foreground truncate">
              {formatCurrency(balance)}
            </p>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to edit balance</p>
        </TooltipContent>
      </Tooltip>

      {/* Income */}
      <div className="stat-card stat-card-income p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium opacity-90">Income</span>
        </div>
        <p className="text-lg font-bold font-display truncate">
          {formatCurrency(income)}
        </p>
      </div>

      {/* Expenses */}
      <div className="stat-card stat-card-expense p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs font-medium opacity-90">Expenses</span>
        </div>
        <p className="text-lg font-bold font-display truncate">
          {formatCurrency(expenses)}
        </p>
      </div>

      {/* Add Entry Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onAddClick}
            className="card-elevated p-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all duration-200 border-2 border-dashed border-primary/30 hover:border-primary group"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary">Add Entry</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add new income or expense</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
