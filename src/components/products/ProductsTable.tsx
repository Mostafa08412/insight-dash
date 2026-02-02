import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Upload, Eye, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { mockProducts, mockCategories } from '@/data/mockData';
import { Product } from '@/types/inventory';
import { useRole } from '@/contexts/RoleContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CSVImportModal from './CSVImportModal';
import EditProductModal from './EditProductModal';
import AddProductModal from './AddProductModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductsTableProps {
  onViewProduct?: (productId: string) => void;
}

export default function ProductsTable({ onViewProduct }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low' | 'critical'>('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<'all' | '0-100' | '100-500' | '500-1000' | '1000+'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'sku'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { hasPermission } = useRole();

  const canManageProducts = hasPermission(['admin', 'manager']);

  // Get unique suppliers for filter
  const uniqueSuppliers = useMemo(() => {
    return [...new Set(products.map(p => p.supplier))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Search by name, SKU, or description
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.supplier.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.categoryId === selectedCategory);
    }
    
    // Stock status filter
    if (stockFilter !== 'all') {
      result = result.filter(product => {
        const ratio = product.quantityInStock / product.lowStockThreshold;
        switch (stockFilter) {
          case 'critical': return ratio <= 0.3;
          case 'low': return ratio > 0.3 && ratio <= 1;
          case 'in-stock': return ratio > 1;
          default: return true;
        }
      });
    }
    
    // Supplier filter
    if (supplierFilter !== 'all') {
      result = result.filter(product => product.supplier === supplierFilter);
    }
    
    // Price range filter
    if (priceRange !== 'all') {
      result = result.filter(product => {
        switch (priceRange) {
          case '0-100': return product.price >= 0 && product.price < 100;
          case '100-500': return product.price >= 100 && product.price < 500;
          case '500-1000': return product.price >= 500 && product.price < 1000;
          case '1000+': return product.price >= 1000;
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
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.quantityInStock - b.quantityInStock;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [products, searchQuery, selectedCategory, stockFilter, supplierFilter, priceRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, stockFilter, supplierFilter, priceRange]);

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity <= threshold * 0.3) return { label: 'Critical', class: 'badge-danger' };
    if (quantity <= threshold) return { label: 'Low', class: 'badge-warning' };
    return { label: 'In Stock', class: 'badge-success' };
  };

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const handleEdit = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    toast.success('Product updated successfully!');
  };

  const handleAddSubmit = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    toast.success('Product created successfully!');
  };

  const handleDelete = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully!');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStockFilter('all');
    setSupplierFilter('all');
    setPriceRange('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || stockFilter !== 'all' || 
                           supplierFilter !== 'all' || priceRange !== 'all';

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
    <div className="bg-card border border-border rounded-xl animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Products Inventory</h3>
            <p className="text-sm text-muted-foreground">{filteredProducts.length} products found</p>
          </div>

          {canManageProducts && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3 mt-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, SKU, description, or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] bg-secondary border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as any)}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[160px] bg-secondary border-border">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {uniqueSuppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={(v) => setPriceRange(v as any)}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
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
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="sku-asc">SKU (A-Z)</SelectItem>
                <SelectItem value="sku-desc">SKU (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                <SelectItem value="stock-asc">Stock (Low-High)</SelectItem>
                <SelectItem value="stock-desc">Stock (High-Low)</SelectItem>
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

      {/* Table - Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantityInStock, product.lowStockThreshold);
              
              return (
                <tr key={product.id} className="table-row-hover cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-muted-foreground">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{getCategoryName(product.categoryId)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-foreground">${product.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{product.quantityInStock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={stockStatus.class}>{stockStatus.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{product.supplier}</span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onViewProduct?.(product.id)}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canManageProducts && (
                        <>
                          <button 
                            onClick={(e) => handleEdit(e, product)}
                            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, product.id)}
                            className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden divide-y divide-border">
        {paginatedProducts.map((product) => {
          const stockStatus = getStockStatus(product.quantityInStock, product.lowStockThreshold);
          
          return (
            <div 
              key={product.id} 
              className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => onViewProduct?.(product.id)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{product.sku}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => onViewProduct?.(product.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canManageProducts && (
                    <>
                      <button 
                        onClick={(e) => handleEdit(e, product)}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, product.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="text-foreground font-semibold">${product.price.toLocaleString()}</span>
                <span className="text-muted-foreground">{getCategoryName(product.categoryId)}</span>
                <span className="text-muted-foreground">Stock: {product.quantityInStock}</span>
                <span className={stockStatus.class}>{stockStatus.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {paginatedProducts.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of{' '}
            <span className="font-medium text-foreground">{filteredProducts.length}</span> results
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
            disabled={currentPage === totalPages}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
              currentPage === totalPages
                ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                : 'bg-secondary text-foreground hover:bg-accent'
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      
      <EditProductModal
        isOpen={isEditModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
}
