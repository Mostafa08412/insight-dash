import { useState, useMemo } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, Plus, Download, ChevronLeft, ChevronRight, X, CalendarIcon } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { Transaction } from '@/types/inventory';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import NewTransactionModal from './NewTransactionModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

export default function TransactionsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [amountRange, setAmountRange] = useState<'all' | '0-100' | '100-500' | '500-1000' | '1000+'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const { hasPermission } = useRole();

  const canRecordTransactions = hasPermission(['admin', 'manager', 'staff']);

  // Get unique users
  const uniqueUsers = useMemo(() => {
    return [...new Set(transactions.map(t => t.userName))];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(transaction => 
        transaction.productName.toLowerCase().includes(query) ||
        transaction.userName.toLowerCase().includes(query)
      );
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }
    
    // User filter
    if (userFilter !== 'all') {
      result = result.filter(t => t.userName === userFilter);
    }
    
    // Date range filter
    if (dateFrom) {
      result = result.filter(t => new Date(t.date) >= dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(t => new Date(t.date) <= endDate);
    }
    
    // Amount range filter
    if (amountRange !== 'all') {
      result = result.filter(t => {
        switch (amountRange) {
          case '0-100': return t.totalAmount >= 0 && t.totalAmount < 100;
          case '100-500': return t.totalAmount >= 100 && t.totalAmount < 500;
          case '500-1000': return t.totalAmount >= 500 && t.totalAmount < 1000;
          case '1000+': return t.totalAmount >= 1000;
          default: return true;
        }
      });
    }
    
    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [transactions, searchQuery, typeFilter, userFilter, dateFrom, dateTo, amountRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, userFilter, dateFrom, dateTo, amountRange]);

  const handleNewTransaction = (data: { productId: string; quantity: number; type: 'sale' | 'purchase' }) => {
    const product = mockTransactions.find(t => t.productId === data.productId);
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      productId: data.productId,
      productName: product?.productName || 'Unknown Product',
      quantity: data.quantity,
      type: data.type,
      date: new Date(),
      userId: '1',
      userName: 'Current User',
      totalAmount: data.quantity * 100,
    };
    
    setTransactions([newTransaction, ...transactions]);
    toast.success(`${data.type === 'sale' ? 'Sale' : 'Purchase'} recorded successfully!`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setUserFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setAmountRange('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || userFilter !== 'all' || 
                           dateFrom || dateTo || amountRange !== 'all';

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
              <p className="text-sm text-muted-foreground">{filteredTransactions.length} transactions found</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent transition-colors font-medium text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
              {canRecordTransactions && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Transaction
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3 mt-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by product or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            {/* Filter Row */}
            <div className="flex flex-wrap gap-3">
              {/* Type buttons */}
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                {(['all', 'sale', 'purchase'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      typeFilter === type
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {type === 'all' ? 'All' : type === 'sale' ? 'Sales' : 'Purchases'}
                  </button>
                ))}
              </div>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[160px] bg-secondary border-border">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "w-[140px] justify-start text-left font-normal bg-secondary border-border",
                    !dateFrom && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "w-[140px] justify-start text-left font-normal bg-secondary border-border",
                    !dateTo && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM d, yyyy") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Select value={amountRange} onValueChange={(v) => setAmountRange(v as any)}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="0-100">$0 - $100</SelectItem>
                  <SelectItem value="100-500">$100 - $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000+">$1,000+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
                const [sort, order] = v.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(sort);
                setSortOrder(order);
              }}>
                <SelectTrigger className="w-[160px] bg-secondary border-border">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
                  <SelectItem value="quantity-desc">Quantity (High-Low)</SelectItem>
                  <SelectItem value="quantity-asc">Quantity (Low-High)</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={cn(
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
                      transaction.type === 'sale' 
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-blue-500/20 text-blue-500'
                    )}>
                      {transaction.type === 'sale' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      )}
                      {transaction.type === 'sale' ? 'Sale' : 'Purchase'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">{transaction.productName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{transaction.quantity} units</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'text-sm font-semibold',
                      transaction.type === 'sale' ? 'text-emerald-500' : 'text-blue-500'
                    )}>
                      {transaction.type === 'sale' ? '+' : '-'}${transaction.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium">
                        {transaction.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-muted-foreground">{transaction.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedTransactions.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of{' '}
              <span className="font-medium text-foreground">{filteredTransactions.length}</span> results
            </p>
            <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[80px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
                currentPage === 1 
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                  : 'bg-secondary text-foreground hover:bg-accent'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            {getPageNumbers().map((page, i) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg transition-colors',
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
                currentPage === totalPages || totalPages === 0
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                  : 'bg-secondary text-foreground hover:bg-accent'
              )}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewTransaction}
      />
    </>
  );
}
