import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wallet, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseTransactions, Transaction } from '@/hooks/useSupabaseTransactions';
import { BalanceCard } from '@/components/BalanceCard';
import { StatCard } from '@/components/StatCard';
import { TransactionListWithEdit } from '@/components/TransactionListWithEdit';
import { SpendingChart } from '@/components/SpendingChart';
import { AddTransactionModalSupabase } from '@/components/AddTransactionModalSupabase';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { BudgetSettingsModal } from '@/components/BudgetSettingsModal';
import { BudgetProgress } from '@/components/BudgetProgress';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  const {
    transactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateCategoryBudget,
    totalBalance,
    totalIncome,
    totalExpenses,
    expensesByCategory,
    budgetProgress,
    filterPeriod,
    setFilterPeriod,
  } = useSupabaseTransactions();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">ExpenseTracker</h1>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MonthYearFilter 
              filterPeriod={filterPeriod} 
              onFilterChange={setFilterPeriod} 
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setBudgetModalOpen(true)}
              title="Budget Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => signOut()}
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <BalanceCard balance={totalBalance} />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard type="income" amount={totalIncome} />
              <StatCard type="expense" amount={totalExpenses} />
            </div>

            {/* Budget Progress */}
            {budgetProgress.length > 0 && (
              <section className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '75ms' }}>
                <h2 className="font-display font-semibold text-lg mb-4">Budget Status</h2>
                <BudgetProgress data={budgetProgress} />
              </section>
            )}

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

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="btn-fab"
        aria-label="Add transaction"
      >
        <Plus className="w-6 h-6" />
      </button>

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

      {/* Budget Settings Modal */}
      <BudgetSettingsModal
        categories={categories}
        open={budgetModalOpen}
        onOpenChange={setBudgetModalOpen}
        onUpdateBudget={updateCategoryBudget}
      />
    </div>
  );
};

export default Index;
