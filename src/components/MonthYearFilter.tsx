import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterPeriod } from '@/hooks/useTransactions';

type MonthYearFilterProps = {
  filterPeriod: FilterPeriod;
  onFilterChange: (period: FilterPeriod) => void;
};

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function MonthYearFilter({ filterPeriod, onFilterChange }: MonthYearFilterProps) {
  if (filterPeriod === 'all') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange({ month: new Date().getMonth(), year: new Date().getFullYear() })}
          className="text-xs"
        >
          <Calendar className="w-3 h-3 mr-1" />
          All Time
        </Button>
      </div>
    );
  }

  const goToPrevMonth = () => {
    let newMonth = filterPeriod.month - 1;
    let newYear = filterPeriod.year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    onFilterChange({ month: newMonth, year: newYear });
  };

  const goToNextMonth = () => {
    let newMonth = filterPeriod.month + 1;
    let newYear = filterPeriod.year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    onFilterChange({ month: newMonth, year: newYear });
  };

  const toggleAllTime = () => {
    onFilterChange('all');
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevMonth}
        className="h-8 w-8"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={toggleAllTime}
        className="text-xs font-medium min-w-[100px]"
      >
        {months[filterPeriod.month]} {filterPeriod.year}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextMonth}
        className="h-8 w-8"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
