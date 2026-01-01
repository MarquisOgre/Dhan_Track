import { Transaction } from '@/types/transaction';
import { TransactionItem } from './TransactionItem';

type TransactionListProps = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
};

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transactions yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first transaction to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TransactionItem transaction={transaction} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
