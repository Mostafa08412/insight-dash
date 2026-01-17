import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Upload, Eye } from 'lucide-react';
import { mockProducts, mockCategories } from '@/data/mockData';
import { Product } from '@/types/inventory';
import { useRole } from '@/contexts/RoleContext';
import { toast } from 'sonner';
import CSVImportModal from './CSVImportModal';
import EditProductModal from './EditProductModal';

interface ProductsTableProps {
  onViewProduct?: (productId: string) => void;
}

export default function ProductsTable({ onViewProduct }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { hasPermission } = useRole();

  const canManageProducts = hasPermission(['admin', 'manager']);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleDelete = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully!');
    }
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
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Categories</option>
            {mockCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
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
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantityInStock, product.lowStockThreshold);
              
              return (
                <tr key={product.id} className="table-row-hover cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
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

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">{filteredProducts.length}</span> of{' '}
          <span className="font-medium text-foreground">{products.length}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            Previous
          </button>
          <button className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground">
            1
          </button>
          <button className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            Next
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
    </div>
  );
}
