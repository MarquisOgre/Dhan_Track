-- Add columns to track which month/year the expense was paid for
ALTER TABLE public.recurring_expenses 
ADD COLUMN paid_for_month integer,
ADD COLUMN paid_for_year integer;

-- Update existing paid expenses to use current month/year
UPDATE public.recurring_expenses 
SET paid_for_month = EXTRACT(MONTH FROM now())::integer,
    paid_for_year = EXTRACT(YEAR FROM now())::integer
WHERE is_paid = true;