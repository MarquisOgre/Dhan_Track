import { Category } from '@/types/transaction';
import { Progress } from '@/components/ui/progress';

type BudgetItem = {
  category: Category;
  spent: number;
  budget: number;
  percentage: number;
  isOverBudget: boolean;
};

type BudgetProgressProps = {
  data: BudgetItem[];
};

export function BudgetProgress({ data }: BudgetProgressProps) {
  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0 });
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No budget data for this period</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.category.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.category.icon}</span>
              <span className="text-sm font-medium">{item.category.name}</span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-semibold ${item.isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(item.spent)}
              </span>
              <span className="text-sm text-muted-foreground"> / {formatCurrency(item.budget)}</span>
            </div>
          </div>
          <div className="relative">
            <Progress 
              value={item.percentage} 
              className={`h-2 ${item.isOverBudget ? '[&>div]:bg-destructive' : ''}`}
            />
            {item.isOverBudget && (
              <span className="absolute right-0 -top-5 text-xs text-destructive font-medium">
                Over by {formatCurrency(item.spent - item.budget)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {item.isOverBudget 
              ? `${(item.percentage).toFixed(0)}% of budget used` 
              : `₹${(item.budget - item.spent).toLocaleString('en-IN')} remaining`}
          </p>
        </div>
      ))}
    </div>
  );
}
