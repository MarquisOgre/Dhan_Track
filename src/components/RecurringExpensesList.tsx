import { useMemo } from 'react';
import { Check, Clock, RefreshCw } from 'lucide-react';
import { Transaction, RecurrenceType } from '@/hooks/useSupabaseTransactions';
import { Badge } from '@/components/ui/badge';

type RecurringExpensesListProps = {
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
};

type RecurringItem = {
  id: string;
  description: string;
  amount: number;
  category: Transaction['category'];
  recurrence: RecurrenceType;
  isPaid: boolean;
  paidDate?: Date;
};

const recurrenceLabels: Record<RecurrenceType, string> = {
  'one-time': 'One-time',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'monthly': 'Monthly',
  'yearly': 'Yearly',
};

export function RecurringExpensesList({ 
  transactions, 
  currentMonth, 
  currentYear 
}: RecurringExpensesListProps) {
  const recurringItems = useMemo(() => {
    // Get all recurring expense transactions (not one-time)
    const recurringExpenses = transactions.filter(
      t => t.type === 'expense' && t.recurrence !== 'one-time'
    );

    // Group by description + category to find unique recurring items
    const uniqueRecurring = new Map<string, RecurringItem>();

    recurringExpenses.forEach(t => {
      const key = `${t.description}-${t.category.id}-${t.recurrence}`;
      const transactionMonth = t.date.getMonth();
      const transactionYear = t.date.getFullYear();
      const isPaidThisMonth = transactionMonth === currentMonth && transactionYear === currentYear;

      if (!uniqueRecurring.has(key)) {
        uniqueRecurring.set(key, {
          id: t.id,
          description: t.description,
          amount: t.amount,
          category: t.category,
          recurrence: t.recurrence,
          isPaid: isPaidThisMonth,
          paidDate: isPaidThisMonth ? t.date : undefined,
        });
      } else if (isPaidThisMonth) {
        // Update if we found a paid instance for this month
        const existing = uniqueRecurring.get(key)!;
        uniqueRecurring.set(key, {
          ...existing,
          isPaid: true,
          paidDate: t.date,
        });
      }
    });

    return Array.from(uniqueRecurring.values()).sort((a, b) => {
      // Unpaid first, then by amount
      if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
      return b.amount - a.amount;
    });
  }, [transactions, currentMonth, currentYear]);

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0 });
  };

  if (recurringItems.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recurring expenses yet</p>
        <p className="text-xs mt-1">Add transactions with daily, weekly, monthly, or yearly recurrence</p>
      </div>
    );
  }

  const paidCount = recurringItems.filter(i => i.isPaid).length;
  const unpaidCount = recurringItems.length - paidCount;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <Check className="w-3 h-3 mr-1" />
          {paidCount} Paid
        </Badge>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <Clock className="w-3 h-3 mr-1" />
          {unpaidCount} Unpaid
        </Badge>
      </div>

      <div className="space-y-2">
        {recurringItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              item.isPaid 
                ? 'bg-primary/5 border border-primary/10' 
                : 'bg-destructive/5 border border-destructive/10'
            }`}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: item.category.color + '20' }}
            >
              {item.category.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{item.category.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {recurrenceLabels[item.recurrence]}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-sm">{formatCurrency(item.amount)}</p>
              {item.isPaid ? (
                <span className="text-xs text-primary flex items-center gap-1 justify-end">
                  <Check className="w-3 h-3" />
                  Paid
                </span>
              ) : (
                <span className="text-xs text-destructive flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  Unpaid
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
