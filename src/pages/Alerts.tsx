import { useState, useMemo } from 'react';
import { AlertTriangle, Bell, CheckCircle, XCircle, RefreshCw, Search, Filter, X } from 'lucide-react';
import { mockAlerts, mockProducts } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function Alerts() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [notificationFilter, setNotificationFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [stockRangeFilter, setStockRangeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let result = [...mockAlerts];

    // Search filter
    if (searchQuery) {
      result = result.filter(alert =>
        alert.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter(alert => {
        const stockPercentage = (alert.currentStock / alert.threshold) * 100;
        if (severityFilter === 'critical') return stockPercentage < 30;
        if (severityFilter === 'low') return stockPercentage >= 30;
        return true;
      });
    }

    // Notification status filter
    if (notificationFilter !== 'all') {
      result = result.filter(alert => {
        if (notificationFilter === 'sent') return alert.alertSent;
        if (notificationFilter === 'pending') return !alert.alertSent;
        return true;
      });
    }

    // Stock range filter
    if (stockRangeFilter !== 'all') {
      result = result.filter(alert => {
        const stockPercentage = (alert.currentStock / alert.threshold) * 100;
        if (stockRangeFilter === '0-10') return stockPercentage <= 10;
        if (stockRangeFilter === '10-30') return stockPercentage > 10 && stockPercentage <= 30;
        if (stockRangeFilter === '30-50') return stockPercentage > 30 && stockPercentage <= 50;
        if (stockRangeFilter === '50+') return stockPercentage > 50;
        return true;
      });
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter(alert => new Date(alert.date) >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(alert => new Date(alert.date) <= dateTo);
    }

    // Sort
    result.sort((a, b) => {
      const aPercentage = (a.currentStock / a.threshold) * 100;
      const bPercentage = (b.currentStock / b.threshold) * 100;
      
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'stock-asc':
          return aPercentage - bPercentage;
        case 'stock-desc':
          return bPercentage - aPercentage;
        case 'name-asc':
          return a.productName.localeCompare(b.productName);
        case 'name-desc':
          return b.productName.localeCompare(a.productName);
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, severityFilter, notificationFilter, dateFrom, dateTo, stockRangeFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    severityFilter !== 'all',
    notificationFilter !== 'all',
    stockRangeFilter !== 'all',
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSeverityFilter('all');
    setNotificationFilter('all');
    setStockRangeFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const criticalAlerts = mockAlerts.filter(a => (a.currentStock / a.threshold) < 0.3);
  const warningAlerts = mockAlerts.filter(a => (a.currentStock / a.threshold) >= 0.3);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-foreground">{criticalAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-foreground">{warningAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Healthy Stock</p>
              <p className="text-2xl font-bold text-foreground">{mockProducts.length - mockAlerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilterChange();
              }}
              className="pl-10"
            />
          </div>

          {/* Severity Filter */}
          <Select value={severityFilter} onValueChange={(value) => {
            setSeverityFilter(value);
            handleFilterChange();
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical (&lt;30%)</SelectItem>
              <SelectItem value="low">Low Stock (≥30%)</SelectItem>
            </SelectContent>
          </Select>

          {/* Notification Status Filter */}
          <Select value={notificationFilter} onValueChange={(value) => {
            setNotificationFilter(value);
            handleFilterChange();
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Notification Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="sent">Notification Sent</SelectItem>
              <SelectItem value="pending">Pending Notification</SelectItem>
            </SelectContent>
          </Select>

          {/* Stock Range Filter */}
          <Select value={stockRangeFilter} onValueChange={(value) => {
            setStockRangeFilter(value);
            handleFilterChange();
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Stock Level Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="0-10">0% - 10%</SelectItem>
              <SelectItem value="10-30">10% - 30%</SelectItem>
              <SelectItem value="30-50">30% - 50%</SelectItem>
              <SelectItem value="50+">50%+</SelectItem>
            </SelectContent>
          </Select>

          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(date) => {
                  setDateFrom(date);
                  handleFilterChange();
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                {dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(date) => {
                  setDateTo(date);
                  handleFilterChange();
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest first)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
              <SelectItem value="stock-asc">Stock Level (Low to High)</SelectItem>
              <SelectItem value="stock-desc">Stock Level (High to Low)</SelectItem>
              <SelectItem value="name-asc">Product Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Product Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-card border border-border rounded-xl animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Stock Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Showing {paginatedAlerts.length} of {filteredAlerts.length} alerts
                {filteredAlerts.length !== mockAlerts.length && ` (filtered from ${mockAlerts.length} total)`}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent transition-colors text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {paginatedAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No alerts found</h4>
            <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedAlerts.map((alert) => {
              const stockPercentage = (alert.currentStock / alert.threshold) * 100;
              const isCritical = stockPercentage < 30;

              return (
                <div key={alert.id} className="p-4 sm:p-6 table-row-hover">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={cn(
                        'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        isCritical ? 'bg-destructive/20' : 'bg-warning/20'
                      )}>
                        <AlertTriangle className={cn(
                          'w-5 h-5 sm:w-6 sm:h-6',
                          isCritical ? 'text-destructive' : 'text-warning'
                        )} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm sm:text-base font-semibold text-foreground">{alert.productName}</h4>
                          <span className={isCritical ? 'badge-danger' : 'badge-warning'}>
                            {isCritical ? 'Critical' : 'Low Stock'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          Current stock ({alert.currentStock}) is below the threshold ({alert.threshold})
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <span>Alert: {format(alert.date, 'MMM d, yyyy')}</span>
                          <span className={cn(
                            'flex items-center gap-1',
                            alert.alertSent ? 'text-success' : 'text-warning'
                          )}>
                            {alert.alertSent ? <CheckCircle className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                            {alert.alertSent ? 'Sent' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-13 sm:ml-0 flex-shrink-0">
                      <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium">
                        Order Stock
                      </button>
                      <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary text-foreground rounded-lg hover:bg-accent transition-colors text-xs sm:text-sm font-medium">
                        Dismiss
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 ml-16">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Stock Level</span>
                      <span className="text-foreground font-medium">{alert.currentStock} / {alert.threshold} ({stockPercentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isCritical ? 'bg-destructive' : 'bg-warning'
                        )}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {filteredAlerts.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select value={String(itemsPerPage)} onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map(option => (
                      <SelectItem key={option} value={String(option)}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAlerts.length)} of {filteredAlerts.length} alerts
              </div>

              {/* Pagination */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={cn(currentPage === 1 && 'pointer-events-none opacity-50', 'cursor-pointer')}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={cn(currentPage === totalPages && 'pointer-events-none opacity-50', 'cursor-pointer')}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
