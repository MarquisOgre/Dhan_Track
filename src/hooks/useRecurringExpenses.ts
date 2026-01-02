import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Category, defaultCategories } from './useSupabaseTransactions';

export type RecurringExpense = {
  id: string;
  description: string;
  amount: number;
  category: Category;
  dueDay: number;
  recurrence: string;
  isPaid: boolean;
  paidTransactionId?: string;
};

export function useRecurringExpenses(categories: Category[]) {
  const { user } = useAuth();
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recurring expenses
  useEffect(() => {
    if (!user || categories.length === 0) return;

    const loadRecurringExpenses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('due_day', { ascending: true });

      if (error) {
        console.error('Error loading recurring expenses:', error);
        toast.error('Failed to load recurring expenses');
      } else if (data) {
        setRecurringExpenses(data.map(re => {
          const category = categories.find(c => c.id === re.category_id) || defaultCategories[11];
          return {
            id: re.id,
            description: re.description,
            amount: Number(re.amount),
            category,
            dueDay: re.due_day,
            recurrence: re.recurrence,
            isPaid: re.is_paid,
            paidTransactionId: re.paid_transaction_id || undefined,
          };
        }));
      }
      setLoading(false);
    };

    loadRecurringExpenses();
  }, [user, categories]);

  const addRecurringExpense = useCallback(async (expense: Omit<RecurringExpense, 'id' | 'isPaid' | 'paidTransactionId'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert({
        user_id: user.id,
        description: expense.description,
        amount: expense.amount,
        category_id: expense.category.id,
        due_day: expense.dueDay,
        recurrence: expense.recurrence,
        is_paid: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding recurring expense:', error);
      toast.error('Failed to add recurring expense');
      return;
    }

    if (data) {
      setRecurringExpenses(prev => [...prev, {
        id: data.id,
        description: data.description,
        amount: Number(data.amount),
        category: expense.category,
        dueDay: data.due_day,
        recurrence: data.recurrence,
        isPaid: data.is_paid,
        paidTransactionId: data.paid_transaction_id || undefined,
      }].sort((a, b) => a.dueDay - b.dueDay));
      toast.success('Recurring expense added!');
    }
  }, [user]);

  const markAsPaid = useCallback(async (
    expenseId: string, 
    currentMonth: number, 
    currentYear: number
  ) => {
    if (!user) return;

    const expense = recurringExpenses.find(e => e.id === expenseId);
    if (!expense) return;

    // Create transaction for the payment
    const paymentDate = new Date(currentYear, currentMonth, expense.dueDay);
    
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'expense',
        amount: expense.amount,
        category_id: expense.category.id,
        description: expense.description,
        date: paymentDate.toISOString().split('T')[0],
        recurrence: expense.recurrence,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      toast.error('Failed to mark as paid');
      return;
    }

    // Update recurring expense with paid status and transaction ID
    const { error: updateError } = await supabase
      .from('recurring_expenses')
      .update({
        is_paid: true,
        paid_transaction_id: transactionData.id,
      })
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating recurring expense:', updateError);
      toast.error('Failed to update status');
      return;
    }

    setRecurringExpenses(prev => prev.map(e => 
      e.id === expenseId 
        ? { ...e, isPaid: true, paidTransactionId: transactionData.id }
        : e
    ));
    toast.success('Marked as paid!');
    return transactionData;
  }, [user, recurringExpenses]);

  const markAsUnpaid = useCallback(async (expenseId: string) => {
    if (!user) return;

    const expense = recurringExpenses.find(e => e.id === expenseId);
    if (!expense || !expense.paidTransactionId) return;

    // Delete the associated transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', expense.paidTransactionId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting transaction:', deleteError);
      toast.error('Failed to delete transaction');
      return;
    }

    // Update recurring expense to unpaid
    const { error: updateError } = await supabase
      .from('recurring_expenses')
      .update({
        is_paid: false,
        paid_transaction_id: null,
      })
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating recurring expense:', updateError);
      toast.error('Failed to update status');
      return;
    }

    setRecurringExpenses(prev => prev.map(e => 
      e.id === expenseId 
        ? { ...e, isPaid: false, paidTransactionId: undefined }
        : e
    ));
    toast.success('Marked as unpaid, transaction deleted');
  }, [user, recurringExpenses]);

  const deleteRecurringExpense = useCallback(async (expenseId: string) => {
    if (!user) return;

    const expense = recurringExpenses.find(e => e.id === expenseId);
    
    // If paid, also delete the transaction
    if (expense?.paidTransactionId) {
      await supabase
        .from('transactions')
        .delete()
        .eq('id', expense.paidTransactionId)
        .eq('user_id', user.id);
    }

    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting recurring expense:', error);
      toast.error('Failed to delete recurring expense');
      return;
    }

    setRecurringExpenses(prev => prev.filter(e => e.id !== expenseId));
    toast.success('Recurring expense deleted!');
  }, [user, recurringExpenses]);

  return {
    recurringExpenses,
    loading,
    addRecurringExpense,
    markAsPaid,
    markAsUnpaid,
    deleteRecurringExpense,
  };
}
