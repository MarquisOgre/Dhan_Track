import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseTransactions, Transaction } from '@/hooks/useSupabaseTransactions';
import { useRecurringExpenses, RecurringExpense } from '@/hooks/useRecurringExpenses';
import { QuickStatsRow } from '@/components/QuickStatsRow';
import { TransactionListWithEdit } from '@/components/TransactionListWithEdit';
import { SpendingChart } from '@/components/SpendingChart';
import { AddTransactionModalSupabase } from '@/components/AddTransactionModalSupabase';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { EditBalanceModal } from '@/components/EditBalanceModal';
import { CreateRecurringExpenseModal } from '@/components/CreateRecurringExpenseModal';
import { EditRecurringExpenseModal } from '@/components/EditRecurringExpenseModal';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { ExportButton } from '@/components/ExportButton';
import { RecurringExpensesList } from '@/components/RecurringExpensesList';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [editRecurringExpense, setEditRecurringExpense] = useState<RecurringExpense | null>(null);

  const {
    transactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalBalance,
    totalIncome,
    totalExpenses,
    expensesByCategory,
    filterPeriod,
    setFilterPeriod,
    refreshTransactions,
  } = useSupabaseTransactions();

  const currentMonth = filterPeriod === 'all' ? new Date().getMonth() : filterPeriod.month;
  const currentYear = filterPeriod === 'all' ? new Date().getFullYear() : filterPeriod.year;

  const {
    recurringExpenses,
    addRecurringExpense,
    markAsPaid,
    markAsUnpaid,
    deleteRecurringExpense,
    updateRecurringExpense,
    duplicateRecurringExpense,
  } = useRecurringExpenses(categories, currentMonth, currentYear);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleMarkAsPaid = async (expenseId: string) => {
    const transaction = await markAsPaid(expenseId, currentMonth, currentYear);
    if (transaction) {
      refreshTransactions();
    }
  };

  const handleMarkAsUnpaid = async (expenseId: string) => {
    await markAsUnpaid(expenseId);
    refreshTransactions();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/favicon.png"
                alt="DhanTrack Logo"
                className="w-8 h-8 h-auto"
              />
            </div>

            <h1 className="font-display font-bold text-xl">
              DhanTrack
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <MonthYearFilter 
              filterPeriod={filterPeriod} 
              onFilterChange={setFilterPeriod} 
            />
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <SettingsIcon className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
              {user.email}
            </p>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats Row - Balance, Income, Expense, Add Entry */}
            <QuickStatsRow
              balance={totalBalance}
              income={totalIncome}
              expenses={totalExpenses}
              onAddClick={() => setModalOpen(true)}
              onEditBalance={() => setBalanceModalOpen(true)}
            />

            {/* Recurring Expenses */}
            <section className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <h2 className="font-display font-semibold text-lg mb-4">Recurring Expenses</h2>
              <RecurringExpensesList 
                recurringExpenses={recurringExpenses}
                currentMonth={currentMonth}
                currentYear={currentYear}
                onCreateClick={() => setRecurringModalOpen(true)}
                onMarkAsPaid={handleMarkAsPaid}
                onMarkAsUnpaid={handleMarkAsUnpaid}
                onDelete={deleteRecurringExpense}
                onEdit={setEditRecurringExpense}
                onDuplicate={duplicateRecurringExpense}
              />
            </section>

            {/* Spending Breakdown */}
            <section className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="font-display font-semibold text-lg mb-4">Spending Breakdown</h2>
              <SpendingChart data={expensesByCategory} />
            </section>

            {/* Recent Transactions */}
            <section className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Recent Transactions</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{transactions.length} total</span>
                  <ExportButton transactions={transactions} />
                </div>
              </div>
              <TransactionListWithEdit 
                transactions={transactions} 
                categories={categories}
                onDelete={deleteTransaction} 
                onEdit={setEditTransaction}
              />
            </section>
          </>
        )}
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModalSupabase
        categories={categories}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={addTransaction}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editTransaction}
        categories={categories}
        open={!!editTransaction}
        onOpenChange={(open) => !open && setEditTransaction(null)}
        onUpdate={updateTransaction}
      />

      {/* Create Recurring Expense Modal */}
      <CreateRecurringExpenseModal
        categories={categories}
        open={recurringModalOpen}
        onOpenChange={setRecurringModalOpen}
        onAdd={addRecurringExpense}
      />

      {/* Edit Recurring Expense Modal */}
      <EditRecurringExpenseModal
        expense={editRecurringExpense}
        categories={categories}
        open={!!editRecurringExpense}
        onOpenChange={(open) => !open && setEditRecurringExpense(null)}
        onUpdate={updateRecurringExpense}
      />

      {/* Edit Balance Modal */}
      <EditBalanceModal
        currentBalance={totalBalance}
        open={balanceModalOpen}
        onOpenChange={setBalanceModalOpen}
        onAdjust={(newBalance) => {
          const difference = newBalance - totalBalance;
          if (difference === 0) return;
          
          const adjustmentCategory = categories.find(c => c.name === 'Other') || categories[0];
          addTransaction({
            type: difference > 0 ? 'income' : 'expense',
            amount: Math.abs(difference),
            category: adjustmentCategory,
            description: 'Balance Adjustment',
            date: new Date(),
            recurrence: 'one-time',
          });
        }}
      />
      <Footer />
    </div>
  );
};

export default Index;
