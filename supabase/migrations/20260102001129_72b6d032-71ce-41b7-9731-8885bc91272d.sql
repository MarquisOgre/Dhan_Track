-- Create recurring_expenses table
CREATE TABLE public.recurring_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  due_day INTEGER NOT NULL DEFAULT 1 CHECK (due_day >= 1 AND due_day <= 31),
  recurrence TEXT NOT NULL DEFAULT 'monthly',
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own recurring expenses" 
ON public.recurring_expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring expenses" 
ON public.recurring_expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring expenses" 
ON public.recurring_expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring expenses" 
ON public.recurring_expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_recurring_expenses_updated_at
BEFORE UPDATE ON public.recurring_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();