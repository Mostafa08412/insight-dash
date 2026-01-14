import { useState } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Package } from 'lucide-react';
import { mockCategories } from '@/data/mockData';
import { useRole } from '@/contexts/RoleContext';

export default function Categories() {
  const { hasPermission } = useRole();
  const canManage = hasPermission(['admin']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-foreground">Product Categories</h2>
          <p className="text-sm text-muted-foreground">Organize products by category</p>
        </div>
        {canManage && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCategories.map((category, index) => (
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
    </div>
  );
}
