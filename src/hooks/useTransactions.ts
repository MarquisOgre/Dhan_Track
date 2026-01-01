import { useState, useMemo } from 'react';
import { Transaction, categories, Category } from '@/types/transaction';

const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 50000,
    category: categories[0],
    description: 'Monthly salary',
    date: new Date(2026, 0, 1),
    recurrence: 'monthly',
  },
  {
    id: '2',
    type: 'expense',
    amount: 450,
    category: categories[1],
    description: 'Dinner at restaurant',
    date: new Date(2026, 0, 1),
    recurrence: 'one-time',
  },
  {
    id: '3',
    type: 'expense',
    amount: 300,
    category: categories[2],
    description: 'Uber rides',
    date: new Date(2025, 11, 31),
    recurrence: 'weekly',
  },
  {
    id: '4',
    type: 'expense',
    amount: 1200,
    category: categories[3],
    description: 'New headphones',
    date: new Date(2025, 11, 30),
    recurrence: 'one-time',
  },
  {
    id: '5',
    type: 'income',
    amount: 3500,
    category: categories[7],
    description: 'Freelance project',
    date: new Date(2025, 11, 28),
    recurrence: 'one-time',
  },
  {
    id: '6',
    type: 'expense',
    amount: 890,
    category: categories[5],
    description: 'Internet bill',
    date: new Date(2025, 11, 27),
    recurrence: 'monthly',
  },
  {
    id: '7',
    type: 'expense',
    amount: 2500,
    category: categories[10],
    description: 'Weekly groceries',
    date: new Date(2025, 11, 26),
    recurrence: 'weekly',
  },
];

export type FilterPeriod = {
  month: number;
  year: number;
} | 'all';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const filteredTransactions = useMemo(() => {
    if (filterPeriod === 'all') return transactions;
    
    return transactions.filter(t => {
      const transactionMonth = t.date.getMonth();
      const transactionYear = t.date.getFullYear();
      return transactionMonth === filterPeriod.month && transactionYear === filterPeriod.year;
    });
  }, [transactions, filterPeriod]);

  const { totalBalance, totalIncome, totalExpenses } = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses,
    };
  }, [filteredTransactions]);

  const expensesByCategory = useMemo(() => {
    const categoryTotals = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const key = t.category.id;
        if (!acc[key]) {
          acc[key] = { category: t.category, total: 0 };
        }
        acc[key].total += t.amount;
        return acc;
      }, {} as Record<string, { category: Category; total: number }>);
    
    return Object.values(categoryTotals).sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  const budgetProgress = useMemo(() => {
    return categories
      .filter(c => c.budget && c.budget > 0)
      .map(category => {
        const spent = filteredTransactions
          .filter(t => t.type === 'expense' && t.category.id === category.id)
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          category,
          spent,
          budget: category.budget!,
          percentage: Math.min((spent / category.budget!) * 100, 100),
          isOverBudget: spent > category.budget!,
        };
      })
      .filter(b => b.spent > 0)
      .sort((a, b) => b.percentage - a.percentage);
  }, [filteredTransactions]);

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    addTransaction,
    deleteTransaction,
    totalBalance,
    totalIncome,
    totalExpenses,
    expensesByCategory,
    budgetProgress,
    filterPeriod,
    setFilterPeriod,
  };
}
