import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { FilterState } from '@/hooks/use-transactions';
import { incomeCategories, expenseCategories } from '@/data/transaction-categories';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  transactionCount?: number;
}

type DateFilterOption = 'all' | '30days' | '60days' | '90days' | 'thisMonth' | 'lastMonth' | 'custom';

interface ExtendedFilterState extends FilterState {
  dateFilter: DateFilterOption;
  customStartDate: string;
  customEndDate: string;
  status: 'all' | 'completed' | 'pending' | 'cancelled';
}

export const TransactionFilters = ({ filters, onFilterChange, transactionCount }: TransactionFiltersProps) => {
  const isMobile = useIsMobile();
  const [localFilters, setLocalFilters] = useState<ExtendedFilterState>({
    ...filters,
    dateFilter: 'all',
    customStartDate: '',
    customEndDate: '',
    status: 'all',
  });

  const handleReset = () => {
    const resetFilters: ExtendedFilterState = {
      search: '',
      type: 'all',
      category: 'all',
      startDate: undefined,
      endDate: undefined,
      dateFilter: 'all',
      customStartDate: '',
      customEndDate: '',
      status: 'all',
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

  const handleDateFilterChange = (value: DateFilterOption) => {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (value) {
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        endDate = new Date();
        break;
      case '60days':
        startDate = new Date(now.setDate(now.getDate() - 60));
        endDate = new Date();
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        endDate = new Date();
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        startDate = undefined;
        endDate = undefined;
    }

    const newFilters = {
      ...localFilters,
      dateFilter: value,
      startDate,
      endDate,
      customStartDate: value !== 'custom' ? '' : localFilters.customStartDate,
      customEndDate: value !== 'custom' ? '' : localFilters.customEndDate,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCustomDateChange = (field: 'customStartDate' | 'customEndDate', value: string) => {
    const newFilters = { ...localFilters, [field]: value };
    
    if (newFilters.customStartDate && newFilters.customEndDate) {
      newFilters.startDate = new Date(newFilters.customStartDate);
      newFilters.endDate = new Date(newFilters.customEndDate);
    }
    
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const allCategories = localFilters.type === 'income' 
    ? incomeCategories 
    : localFilters.type === 'expense' 
    ? expenseCategories 
    : [...incomeCategories, ...expenseCategories];

  // Mobile filters content
  const FiltersContent = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar transações..."
          className="pl-10"
          value={localFilters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Período</label>
          <Select value={localFilters.dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="60days">Últimos 60 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
              <SelectItem value="thisMonth">Este mês</SelectItem>
              <SelectItem value="lastMonth">Mês passado</SelectItem>
              <SelectItem value="custom">Data personalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {localFilters.dateFilter === 'custom' && (
          <div className="space-y-3 border-t pt-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Data início</label>
              <Input
                type="date"
                value={localFilters.customStartDate}
                onChange={(e) => handleCustomDateChange('customStartDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data fim</label>
              <Input
                type="date"
                value={localFilters.customEndDate}
                min={localFilters.customStartDate}
                onChange={(e) => handleCustomDateChange('customEndDate', e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium mb-2 block">Tipo</label>
          <Select value={localFilters.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Categoria</label>
          <Select 
            value={localFilters.category} 
            onValueChange={handleCategoryChange}
            disabled={localFilters.type === 'all'}
          >
            <SelectTrigger>
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
        </div>

        <Button variant="outline" onClick={handleReset} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary" className="text-sm">
          {transactionCount || 0} transações
        </Badge>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Filtrar Transações</SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="space-y-4 mb-4 md:mb-6 animate-fade-in">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar transações..."
          className="pl-10"
          value={localFilters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
      {/* Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select value={localFilters.dateFilter} onValueChange={handleDateFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Máximo</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="60days">Últimos 60 dias</SelectItem>
            <SelectItem value="90days">Últimos 90 dias</SelectItem>
            <SelectItem value="thisMonth">Este mês</SelectItem>
            <SelectItem value="lastMonth">Mês passado</SelectItem>
            <SelectItem value="custom">Data personalizada</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={localFilters.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={localFilters.category} 
          onValueChange={handleCategoryChange}
          disabled={localFilters.type === 'all'}
        >
          <SelectTrigger>
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

        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>
      
      {/* Custom Date Picker */}
      {localFilters.dateFilter === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
          <div>
            <label className="text-sm font-medium mb-2 block">Data início</label>
            <Input
              type="date"
              value={localFilters.customStartDate}
              onChange={(e) => handleCustomDateChange('customStartDate', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Data fim</label>
            <Input
              type="date"
              value={localFilters.customEndDate}
              min={localFilters.customStartDate}
              onChange={(e) => handleCustomDateChange('customEndDate', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
