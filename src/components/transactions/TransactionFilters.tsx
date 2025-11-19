import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, CalendarIcon, RotateCcw } from 'lucide-react';
import { FilterState } from '@/hooks/use-transactions';
import { incomeCategories, expenseCategories } from '@/data/transaction-categories';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const TransactionFilters = ({ filters, onFilterChange }: TransactionFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      type: 'all',
      category: 'all',
      startDate: undefined,
      endDate: undefined,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTypeChange = (value: 'all' | 'income' | 'expense') => {
    const newFilters = { ...localFilters, type: value, category: 'all' };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...localFilters, category: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const allCategories = localFilters.type === 'income' 
    ? incomeCategories 
    : localFilters.type === 'expense' 
    ? expenseCategories 
    : [...incomeCategories, ...expenseCategories];

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 md:mb-6 animate-fade-in">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por descrição..."
          value={localFilters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Type Filter */}
      <Select value={localFilters.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select 
        value={localFilters.category} 
        onValueChange={handleCategoryChange}
        disabled={localFilters.type === 'all'}
      >
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {allCategories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {localFilters.startDate && localFilters.endDate ? (
              <>
                {format(localFilters.startDate, 'dd/MM/yy', { locale: ptBR })} -{' '}
                {format(localFilters.endDate, 'dd/MM/yy', { locale: ptBR })}
              </>
            ) : (
              <span>Período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: localFilters.startDate,
              to: localFilters.endDate,
            }}
            onSelect={(range) => {
              const newFilters = {
                ...localFilters,
                startDate: range?.from,
                endDate: range?.to,
              };
              setLocalFilters(newFilters);
              onFilterChange(newFilters);
            }}
            locale={ptBR}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Reset Button */}
      <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
        <RotateCcw className="h-4 w-4 mr-2" />
        Limpar
      </Button>
    </div>
  );
};
