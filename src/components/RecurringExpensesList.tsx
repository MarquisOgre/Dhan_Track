import { Check, Clock, RefreshCw, Plus, Trash2, Pencil } from 'lucide-react';
import { RecurringExpense } from '@/hooks/useRecurringExpenses';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type RecurringExpensesListProps = {
  recurringExpenses: RecurringExpense[];
  currentMonth: number;
  currentYear: number;
  onCreateClick: () => void;
  onMarkAsPaid: (id: string) => void;
  onMarkAsUnpaid: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (expense: RecurringExpense) => void;
};

const recurrenceLabels: Record<string, string> = {
  'daily': 'Daily',
  'weekly': 'Weekly',
  'monthly': 'Monthly',
  'yearly': 'Yearly',
};

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function RecurringExpensesList({ 
  recurringExpenses,
  currentMonth,
  currentYear,
  onCreateClick,
  onMarkAsPaid,
  onMarkAsUnpaid,
  onDelete,
  onEdit,
}: RecurringExpensesListProps) {
  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0 });
  };

  const formatDueDate = (dueDay: number) => {
    return `${dueDay} ${monthNames[currentMonth]} ${currentYear}`;
  };

  const paidCount = recurringExpenses.filter(e => e.isPaid).length;
  const unpaidCount = recurringExpenses.length - paidCount;

  const handleTogglePaid = (expense: RecurringExpense) => {
    if (expense.isPaid) {
      onMarkAsUnpaid(expense.id);
    } else {
      onMarkAsPaid(expense.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Check className="w-3 h-3 mr-1" />
            {paidCount} Paid
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <Clock className="w-3 h-3 mr-1" />
            {unpaidCount} Unpaid
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCreateClick}
          className="border-primary text-primary hover:bg-primary/10 border-dashed"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Recurring Expenses
        </Button>
      </div>

      {/* Expenses List */}
      {recurringExpenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No recurring expenses yet</p>
          <p className="text-xs mt-1">Click "Create Recurring Expenses" to add one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurringExpenses.map((expense) => (
            <div
              key={expense.id}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                expense.isPaid 
                  ? 'bg-primary/5 border border-primary/10' 
                  : 'bg-destructive/5 border border-destructive/10'
              }`}
            >
              {/* Category Icon */}
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: expense.category.color + '20' }}
              >
                {expense.category.icon}
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{expense.description}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-0.5">
                  <span>{expense.category.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    {recurrenceLabels[expense.recurrence] || expense.recurrence}
                  </span>
                  <span>•</span>
                  <span className="text-foreground/70">Due: {formatDueDate(expense.dueDay)}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">{formatCurrency(expense.amount)}</p>
              </div>

              {/* Paid/Unpaid Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={expense.isPaid}
                  onCheckedChange={() => handleTogglePaid(expense)}
                  className="data-[state=checked]:bg-primary"
                />
                <span className={`text-xs font-medium w-12 ${
                  expense.isPaid ? 'text-primary' : 'text-destructive'
                }`}>
                  {expense.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>

              {/* Edit Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onEdit(expense)}
                className="shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Pencil className="w-4 h-4" />
              </Button>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Recurring Expense</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{expense.description}"? 
                      {expense.isPaid && " This will also delete the associated transaction."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(expense.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
