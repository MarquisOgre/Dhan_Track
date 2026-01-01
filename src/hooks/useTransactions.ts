import { useState, useMemo } from 'react';
import { Transaction, categories } from '@/types/transaction';

const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    category: categories[0],
    description: 'Monthly salary',
    date: new Date(2026, 0, 1),
  },
  {
    id: '2',
    type: 'expense',
    amount: 45.50,
    category: categories[1],
    description: 'Dinner at restaurant',
    date: new Date(2026, 0, 1),
  },
  {
    id: '3',
    type: 'expense',
    amount: 30,
    category: categories[2],
    description: 'Uber rides',
    date: new Date(2025, 11, 31),
  },
  {
    id: '4',
    type: 'expense',
    amount: 120,
    category: categories[3],
    description: 'New headphones',
    date: new Date(2025, 11, 30),
  },
  {
    id: '5',
    type: 'income',
    amount: 350,
    category: categories[7],
    description: 'Freelance project',
    date: new Date(2025, 11, 28),
  },
  {
    id: '6',
    type: 'expense',
    amount: 89,
    category: categories[5],
    description: 'Internet bill',
    date: new Date(2025, 11, 27),
  },
  {
    id: '7',
    type: 'expense',
    amount: 65,
    category: categories[10],
    description: 'Weekly groceries',
    date: new Date(2025, 11, 26),
  },
];

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

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

  const { totalBalance, totalIncome, totalExpenses } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses,
    };
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const key = t.category.id;
        if (!acc[key]) {
          acc[key] = { category: t.category, total: 0 };
        }
        acc[key].total += t.amount;
        return acc;
      }, {} as Record<string, { category: typeof categories[0]; total: number }>);
    
    return Object.values(categoryTotals).sort((a, b) => b.total - a.total);
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    totalBalance,
    totalIncome,
    totalExpenses,
    expensesByCategory,
  };
}
