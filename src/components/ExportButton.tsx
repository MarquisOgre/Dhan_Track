import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/hooks/useSupabaseTransactions';
import { toast } from 'sonner';

type ExportButtonProps = {
  transactions: Transaction[];
};

export function ExportButton({ transactions }: ExportButtonProps) {
  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Recurrence'];
    const rows = transactions.map(t => [
      formatDate(t.date),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.category.name,
      `"${t.description}"`,
      t.type === 'income' ? t.amount : -t.amount,
      t.recurrence,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast.success('Transactions exported to CSV!');
  };

  const exportToPDF = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #0d9488; margin-bottom: 5px; }
          .subtitle { color: #666; margin-bottom: 30px; }
          .summary { display: flex; gap: 40px; margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .summary-item { text-align: center; }
          .summary-label { color: #666; font-size: 12px; text-transform: uppercase; }
          .summary-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .income { color: #10b981; }
          .expense { color: #f97316; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f8f9fa; font-weight: 600; color: #666; text-transform: uppercase; font-size: 11px; }
          .amount-income { color: #10b981; font-weight: 600; }
          .amount-expense { color: #f97316; font-weight: 600; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Expense Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Income</div>
            <div class="summary-value income">${formatCurrency(totalIncome)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Expenses</div>
            <div class="summary-value expense">${formatCurrency(totalExpenses)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Net Balance</div>
            <div class="summary-value">${formatCurrency(totalIncome - totalExpenses)}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${formatDate(t.date)}</td>
                <td>${t.category.icon} ${t.category.name}</td>
                <td>${t.description}</td>
                <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
                  ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
      toast.success('PDF export opened in new window!');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
