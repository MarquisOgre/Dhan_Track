import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { BalanceCard } from '@/components/BalanceCard';
import { StatCard } from '@/components/StatCard';
import { TransactionList } from '@/components/TransactionList';
import { SpendingChart } from '@/components/SpendingChart';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { BudgetProgress } from '@/components/BudgetProgress';
import { MonthYearFilter } from '@/components/MonthYearFilter';

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    totalBalance,
    totalIncome,
    totalExpenses,
    expensesByCategory,
    budgetProgress,
    filterPeriod,
    setFilterPeriod,
  } = useTransactions();

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
              <p className="text-xs text-muted-foreground">Manage your finances</p>
            </div>
          </div>
          <MonthYearFilter 
            filterPeriod={filterPeriod} 
            onFilterChange={setFilterPeriod} 
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
            <span className="text-sm text-muted-foreground">{transactions.length} total</span>
          </div>
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        </section>
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
      <AddTransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={addTransaction}
      />
    </div>
  );
};

export default Index;
