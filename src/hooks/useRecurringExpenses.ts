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
  paidForMonth?: number;
  paidForYear?: number;
};

export function useRecurringExpenses(categories: Category[], currentMonth?: number, currentYear?: number) {
  const { user } = useAuth();
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recurring expenses and compute isPaid based on current month/year
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
        const viewMonth = currentMonth ?? new Date().getMonth();
        const viewYear = currentYear ?? new Date().getFullYear();
        
        setRecurringExpenses(data.map(re => {
          const category = categories.find(c => c.id === re.category_id) || defaultCategories[11];
          // Check if paid for the current viewing month/year
          const isPaidForCurrentPeriod = re.is_paid && 
            re.paid_for_month === viewMonth + 1 && // DB stores 1-indexed month
            re.paid_for_year === viewYear;
          
          return {
            id: re.id,
            description: re.description,
            amount: Number(re.amount),
            category,
            dueDay: re.due_day,
            recurrence: re.recurrence,
            isPaid: isPaidForCurrentPeriod,
            paidTransactionId: isPaidForCurrentPeriod ? (re.paid_transaction_id || undefined) : undefined,
            paidForMonth: re.paid_for_month ?? undefined,
            paidForYear: re.paid_for_year ?? undefined,
          };
        }));
      }
      setLoading(false);
    };

    loadRecurringExpenses();
  }, [user, categories, currentMonth, currentYear]);

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

    // Create transaction for the payment - format date as YYYY-MM-DD directly to avoid timezone issues
    const day = Math.min(expense.dueDay, 28); // Ensure valid day for all months
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const paymentDateStr = `${currentYear}-${month}-${dayStr}`;
    
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'expense',
        amount: expense.amount,
        category_id: expense.category.id,
        description: expense.description,
        date: paymentDateStr,
        recurrence: expense.recurrence,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      toast.error('Failed to mark as paid');
      return;
    }

    // Update recurring expense with paid status, transaction ID, and month/year
    const { error: updateError } = await supabase
      .from('recurring_expenses')
      .update({
        is_paid: true,
        paid_transaction_id: transactionData.id,
        paid_for_month: currentMonth + 1, // Store 1-indexed month
        paid_for_year: currentYear,
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
        ? { ...e, isPaid: true, paidTransactionId: transactionData.id, paidForMonth: currentMonth + 1, paidForYear: currentYear }
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

    // Update recurring expense to unpaid and clear month/year
    const { error: updateError } = await supabase
      .from('recurring_expenses')
      .update({
        is_paid: false,
        paid_transaction_id: null,
        paid_for_month: null,
        paid_for_year: null,
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
        ? { ...e, isPaid: false, paidTransactionId: undefined, paidForMonth: undefined, paidForYear: undefined }
        : e
    ));
    toast.success('Marked as unpaid, transaction deleted');
  }, [user, recurringExpenses]);

  const updateRecurringExpense = useCallback(async (
    expenseId: string, 
    updates: Partial<Omit<RecurringExpense, 'id' | 'isPaid' | 'paidTransactionId'>>
  ) => {
    if (!user) return;

    const updateData: Record<string, unknown> = {};
    if (updates.description) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.category) updateData.category_id = updates.category.id;
    if (updates.dueDay !== undefined) updateData.due_day = updates.dueDay;
    if (updates.recurrence) updateData.recurrence = updates.recurrence;

    const { error } = await supabase
      .from('recurring_expenses')
      .update(updateData)
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating recurring expense:', error);
      toast.error('Failed to update recurring expense');
      return;
    }

    setRecurringExpenses(prev => prev.map(e => 
      e.id === expenseId 
        ? { ...e, ...updates }
        : e
    ).sort((a, b) => a.dueDay - b.dueDay));
    toast.success('Recurring expense updated!');
  }, [user]);

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

  const duplicateRecurringExpense = useCallback(async (expenseId: string) => {
    if (!user) return;

    const expense = recurringExpenses.find(e => e.id === expenseId);
    if (!expense) return;

    await addRecurringExpense({
      description: `${expense.description} (Copy)`,
      amount: expense.amount,
      category: expense.category,
      dueDay: expense.dueDay,
      recurrence: expense.recurrence,
    });
  }, [user, recurringExpenses, addRecurringExpense]);

  return {
    recurringExpenses,
    loading,
    addRecurringExpense,
    updateRecurringExpense,
    markAsPaid,
    markAsUnpaid,
    deleteRecurringExpense,
    duplicateRecurringExpense,
  };
}
