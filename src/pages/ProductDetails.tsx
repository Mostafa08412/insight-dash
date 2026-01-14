import { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Package, TrendingUp, TrendingDown, Calendar, Building, BarChart3, History } from 'lucide-react';
import { mockProducts, mockCategories, mockTransactions } from '@/data/mockData';
import { useRole } from '@/contexts/RoleContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductDetailsProps {
  productId: string;
  onBack: () => void;
}

export default function ProductDetails({ productId, onBack }: ProductDetailsProps) {
  const { hasPermission } = useRole();
  const canManageProducts = hasPermission(['admin', 'manager']);
  
  const product = mockProducts.find(p => p.id === productId);
  const category = mockCategories.find(c => c.id === product?.categoryId);
  
  // Mock stock history data
  const stockHistory = [
    { date: 'Jan', stock: 150 },
    { date: 'Feb', stock: 120 },
    { date: 'Mar', stock: 180 },
    { date: 'Apr', stock: 140 },
    { date: 'May', stock: 200 },
    { date: 'Jun', stock: product?.quantityInStock || 0 },
  ];

  // Get recent transactions for this product
  const productTransactions = mockTransactions
    .filter(t => t.productId === productId)
    .slice(0, 5);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity <= threshold * 0.3) return { label: 'Critical', class: 'badge-danger' };
    if (quantity <= threshold) return { label: 'Low', class: 'badge-warning' };
    return { label: 'In Stock', class: 'badge-success' };
  };

  const stockStatus = getStockStatus(product.quantityInStock, product.lowStockThreshold);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <p className="text-muted-foreground">{category?.name}</p>
          </div>
        </div>
        
        {canManageProducts && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm">
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium text-sm">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Product info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Product Image Placeholder */}
              <div className="w-full md:w-48 h-48 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
              
              {/* Product Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{product.name}</h2>
                  <p className="text-muted-foreground mt-1">{product.description}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className={stockStatus.class}>{stockStatus.label}</span>
                  <span className="badge-secondary">{category?.name}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-lg font-semibold text-foreground">${product.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="text-lg font-semibold text-foreground">{product.quantityInStock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Threshold</p>
                    <p className="text-lg font-semibold text-foreground">{product.lowStockThreshold}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-lg font-semibold text-foreground">
                      ${(product.price * product.quantityInStock).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock History Chart */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Stock History</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column - Additional info */}
        <div className="space-y-6">
          {/* Supplier Info */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Supplier</h3>
            </div>
            <p className="text-foreground font-medium">{product.supplier}</p>
            <p className="text-sm text-muted-foreground mt-1">Primary supplier for this product</p>
          </div>

          {/* Dates */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Timeline</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-foreground">{new Date(product.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-foreground">{new Date(product.updatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Quick Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Sales</span>
                <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  +12%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Restock Time</span>
                <span className="text-foreground text-sm font-medium">3 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Restocked</span>
                <span className="text-foreground text-sm font-medium">2 weeks ago</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {productTransactions.length > 0 ? (
                productTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                    <div className={`p-1.5 rounded-lg ${transaction.type === 'sale' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                      {transaction.type === 'sale' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground capitalize">{transaction.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`text-sm font-medium ${transaction.type === 'sale' ? 'text-emerald-500' : 'text-blue-500'}`}>
                      {transaction.type === 'sale' ? '-' : '+'}{transaction.quantity}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
