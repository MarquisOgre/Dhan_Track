export type TransactionType = 'income' | 'expense';
export type RecurrenceType = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number; // Monthly budget limit
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

export const categories: Category[] = [
  { id: '1', name: 'Salary', icon: '💰', color: 'hsl(160 84% 39%)' },
  { id: '2', name: 'Food', icon: '🍔', color: 'hsl(30 90% 55%)', budget: 5000 },
  { id: '3', name: 'Transport', icon: '🚗', color: 'hsl(200 80% 50%)', budget: 3000 },
  { id: '4', name: 'Shopping', icon: '🛍️', color: 'hsl(330 80% 55%)', budget: 4000 },
  { id: '5', name: 'Entertainment', icon: '🎬', color: 'hsl(280 70% 55%)', budget: 2000 },
  { id: '6', name: 'Bills', icon: '📄', color: 'hsl(220 70% 50%)', budget: 5000 },
  { id: '7', name: 'Health', icon: '💊', color: 'hsl(0 70% 55%)', budget: 2000 },
  { id: '8', name: 'Freelance', icon: '💻', color: 'hsl(170 70% 45%)' },
  { id: '9', name: 'Gift', icon: '🎁', color: 'hsl(350 80% 60%)', budget: 1000 },
  { id: '10', name: 'Investment', icon: '📈', color: 'hsl(140 60% 45%)' },
  { id: '11', name: 'Groceries', icon: '🛒', color: 'hsl(100 60% 45%)', budget: 8000 },
  { id: '12', name: 'Other', icon: '📦', color: 'hsl(220 10% 50%)', budget: 2000 },
];

export const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: 'one-time', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];
