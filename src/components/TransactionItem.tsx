import { Transaction } from '@/types/transaction';
import { Trash2 } from 'lucide-react';

type TransactionItemProps = {
  transaction: Transaction;
  onDelete: (id: string) => void;
};

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isIncome = transaction.type === 'income';

  return (
    <div className="transaction-item group">
      <div 
        className="category-icon"
        style={{ backgroundColor: `${transaction.category.color}15` }}
      >
        <span>{transaction.category.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {transaction.description}
        </p>
        <p className="text-sm text-muted-foreground">
          {transaction.category.name} • {formatDate(transaction.date)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <p className={isIncome ? 'amount-income' : 'amount-expense'}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <button 
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
