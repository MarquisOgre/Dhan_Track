import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category } from '@/hooks/useSupabaseTransactions';

type BudgetSettingsModalProps = {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateBudget: (categoryId: string, budget: number | null) => void;
};

export function BudgetSettingsModal({ categories, open, onOpenChange, onUpdateBudget }: BudgetSettingsModalProps) {
  const [budgets, setBudgets] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    categories.forEach(c => {
      initial[c.id] = c.budget?.toString() || '';
    });
    return initial;
  });

  const handleSave = (categoryId: string) => {
    const value = budgets[categoryId];
    const budget = value ? parseFloat(value) : null;
    onUpdateBudget(categoryId, budget);
  };

  // Only show expense categories (those that can have budgets)
  const expenseCategories = categories.filter(c => 
    !['Salary', 'Freelance', 'Investment'].includes(c.name)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Budget Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {expenseCategories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <span className="text-lg">{category.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{category.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">₹</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={budgets[category.id] || ''}
                  onChange={(e) => setBudgets(prev => ({ ...prev, [category.id]: e.target.value }))}
                  className="w-24 h-9"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSave(category.id)}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
