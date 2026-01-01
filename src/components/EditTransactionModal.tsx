import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, Category, TransactionType, RecurrenceType, recurrenceOptions } from '@/hooks/useSupabaseTransactions';

type EditTransactionModalProps = {
  transaction: Transaction | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export function EditTransactionModal({ transaction, categories, open, onOpenChange, onUpdate }: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [month, setMonth] = useState('0');
  const [year, setYear] = useState(currentYear.toString());
  const [recurrence, setRecurrence] = useState<RecurrenceType>('one-time');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setSelectedCategory(transaction.category);
      setMonth(transaction.date.getMonth().toString());
      setYear(transaction.date.getFullYear().toString());
      setRecurrence(transaction.recurrence);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || !selectedCategory) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!description.trim()) return;

    const date = new Date(parseInt(year), parseInt(month), 15);

    onUpdate(transaction.id, {
      type,
      amount: parsedAmount,
      description: description.trim(),
      category: selectedCategory,
      date,
      recurrence,
    });

    onOpenChange(false);
  };

  const incomeCategories = categories.filter(c => 
    ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'].includes(c.name)
  );
  const expenseCategories = categories.filter(c => 
    !['Salary', 'Freelance', 'Investment'].includes(c.name)
  );
  const filteredCategories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Transaction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (selectedCategory && !expenseCategories.find(c => c.id === selectedCategory.id)) {
                  setSelectedCategory(expenseCategories[0]);
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                type === 'expense'
                  ? 'bg-expense text-expense-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (selectedCategory && !incomeCategories.find(c => c.id === selectedCategory.id)) {
                  setSelectedCategory(incomeCategories[0]);
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                type === 'income'
                  ? 'bg-income text-income-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-2xl font-display h-14"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 ${
                    selectedCategory?.id === category.id
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="text-xs text-muted-foreground truncate w-full text-center">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Month/Year Selector */}
          <div className="space-y-2">
            <Label>Month & Year</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, index) => (
                    <SelectItem key={m} value={index.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-2">
            <Label>Recurrence</Label>
            <div className="flex flex-wrap gap-2">
              {recurrenceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRecurrence(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    recurrence === option.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-medium">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
