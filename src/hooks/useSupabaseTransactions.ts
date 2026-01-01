import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type TransactionType = 'income' | 'expense';
export type RecurrenceType = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: Date;
  recurrence: RecurrenceType;
};

export type FilterPeriod = {
  month: number;
  year: number;
} | 'all';

export const defaultCategories: Category[] = [
  { id: 'salary', name: 'Salary', icon: '💰', color: 'hsl(160 84% 39%)' },
  { id: 'food', name: 'Food', icon: '🍔', color: 'hsl(30 90% 55%)', budget: 5000 },
  { id: 'transport', name: 'Transport', icon: '🚗', color: 'hsl(200 80% 50%)', budget: 3000 },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'hsl(330 80% 55%)', budget: 4000 },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'hsl(280 70% 55%)', budget: 2000 },
  { id: 'bills', name: 'Bills', icon: '📄', color: 'hsl(220 70% 50%)', budget: 5000 },
  { id: 'health', name: 'Health', icon: '💊', color: 'hsl(0 70% 55%)', budget: 2000 },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: 'hsl(170 70% 45%)' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: 'hsl(350 80% 60%)', budget: 1000 },
  { id: 'investment', name: 'Investment', icon: '📈', color: 'hsl(140 60% 45%)' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: 'hsl(100 60% 45%)', budget: 8000 },
  { id: 'other', name: 'Other', icon: '📦', color: 'hsl(220 10% 50%)', budget: 2000 },
];

export const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: 'one-time', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function useSupabaseTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  // Load categories
  useEffect(() => {
    if (!user) return;

    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      if (data && data.length > 0) {
        setCategories(data.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          budget: c.budget ? Number(c.budget) : undefined,
        })));
      } else {
        // Initialize default categories for new user
        const categoriesToInsert = defaultCategories.map(c => ({
          user_id: user.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          budget: c.budget || null,
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('categories')
          .insert(categoriesToInsert)
          .select();

        if (!insertError && inserted) {
          setCategories(inserted.map(c => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            budget: c.budget ? Number(c.budget) : undefined,
          })));
        }
      }
    };

    loadCategories();
  }, [user]);

  // Load transactions
  useEffect(() => {
    if (!user || categories.length === 0) return;

    const loadTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading transactions:', error);
        toast.error('Failed to load transactions');
      } else if (data) {
        setTransactions(data.map(t => {
          const category = categories.find(c => c.id === t.category_id) || defaultCategories[11];
          return {
            id: t.id,
            type: t.type as TransactionType,
            amount: Number(t.amount),
            category,
            description: t.description,
            date: new Date(t.date),
            recurrence: t.recurrence as RecurrenceType,
          };
        }));
      }
      setLoading(false);
    };

    loadTransactions();
  }, [user, categories]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category.id,
        description: transaction.description,
        date: transaction.date.toISOString().split('T')[0],
        recurrence: transaction.recurrence,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      return;
    }

    if (data) {
      setTransactions(prev => [{
        id: data.id,
        type: data.type as TransactionType,
        amount: Number(data.amount),
        category: transaction.category,
        description: data.description,
        date: new Date(data.date),
        recurrence: data.recurrence as RecurrenceType,
      }, ...prev]);
      toast.success('Transaction added!');
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) return;

    const updateData: Record<string, unknown> = {};
    if (updates.type) updateData.type = updates.type;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.category) updateData.category_id = updates.category.id;
    if (updates.description) updateData.description = updates.description;
    if (updates.date) updateData.date = updates.date.toISOString().split('T')[0];
    if (updates.recurrence) updateData.recurrence = updates.recurrence;

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
      return;
    }

    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, ...updates };
      }
      return t;
    }));
    toast.success('Transaction updated!');
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
      return;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transaction deleted!');
  }, [user]);

  const updateCategoryBudget = useCallback(async (categoryId: string, budget: number | null) => {
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .update({ budget })
      .eq('id', categoryId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
      return;
    }

    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        return { ...c, budget: budget || undefined };
      }
      return c;
    }));
    toast.success('Budget updated!');
  }, [user]);

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
      .filter(b => b.spent > 0 || b.budget > 0)
      .sort((a, b) => b.percentage - a.percentage);
  }, [filteredTransactions, categories]);

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
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
  };
}
