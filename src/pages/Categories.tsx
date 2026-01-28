import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Package, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mockCategories } from '@/data/mockData';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { Category } from '@/types/inventory';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Categories() {
  const { hasPermission } = useRole();
  const canManage = hasPermission(['admin']);
  
  const [categories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [productCountFilter, setProductCountFilter] = useState<'all' | '0-20' | '20-50' | '50-100' | '100+'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'products'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const filteredCategories = useMemo(() => {
    let result = [...categories];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(cat => 
        cat.name.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
      );
    }
    
    // Product count filter
    if (productCountFilter !== 'all') {
      result = result.filter(cat => {
        switch (productCountFilter) {
          case '0-20': return cat.productCount >= 0 && cat.productCount < 20;
          case '20-50': return cat.productCount >= 20 && cat.productCount < 50;
          case '50-100': return cat.productCount >= 50 && cat.productCount < 100;
          case '100+': return cat.productCount >= 100;
          default: return true;
        }
      });
    }
    
    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'products':
          comparison = a.productCount - b.productCount;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [categories, searchQuery, productCountFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, productCountFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setProductCountFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchQuery || productCountFilter !== 'all';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-foreground">Product Categories</h2>
          <p className="text-sm text-muted-foreground">{filteredCategories.length} categories found</p>
        </div>
        {canManage && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            <Select value={productCountFilter} onValueChange={(v) => setProductCountFilter(v as any)}>
              <SelectTrigger className="w-[160px] bg-secondary border-border">
                <SelectValue placeholder="Product Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counts</SelectItem>
                <SelectItem value="0-20">0 - 20 Products</SelectItem>
                <SelectItem value="20-50">20 - 50 Products</SelectItem>
                <SelectItem value="50-100">50 - 100 Products</SelectItem>
                <SelectItem value="100+">100+ Products</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [sort, order] = v.split('-') as [typeof sortBy, typeof sortOrder];
              setSortBy(sort);
              setSortOrder(order);
            }}>
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="products-asc">Products (Low-High)</SelectItem>
                <SelectItem value="products-desc">Products (High-Low)</SelectItem>
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCategories.map((category, index) => (
          <div 
            key={category.id} 
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 animate-fade-in group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
              {canManage && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1">{category.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{category.productCount}</span> products
              </span>
            </div>
          </div>
        ))}
      </div>

      {paginatedCategories.length === 0 && (
        <div className="p-12 text-center bg-card border border-border rounded-xl">
          <p className="text-muted-foreground">No categories found</p>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredCategories.length > 0 && (
        <div className="bg-card border border-border rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredCategories.length)}</span> of{' '}
              <span className="font-medium text-foreground">{filteredCategories.length}</span> results
            </p>
            <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[80px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
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
      )}
    </div>
  );
}
