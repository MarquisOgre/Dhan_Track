import { Transaction, Category } from '@/hooks/useSupabaseTransactions';
import { TransactionItemWithEdit } from './TransactionItemWithEdit';

type TransactionListWithEditProps = {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
};

export function TransactionListWithEdit({ transactions, categories, onDelete, onEdit }: TransactionListWithEditProps) {
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
          <TransactionItemWithEdit 
            transaction={transaction} 
            onDelete={onDelete} 
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}
