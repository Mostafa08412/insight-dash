import { useState } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Package, Hash, DollarSign } from 'lucide-react';
import { mockProducts, mockUsers } from '@/data/mockData';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: {
    productId: string;
    quantity: number;
    type: 'sale' | 'purchase';
  }) => void;
}

export default function NewTransactionModal({ isOpen, onClose, onSubmit }: NewTransactionModalProps) {
  const { currentUser } = useRole();
  const [transactionType, setTransactionType] = useState<'sale' | 'purchase'>('sale');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = mockProducts.find(p => p.id === selectedProductId);
  const totalAmount = selectedProduct ? selectedProduct.price * (parseInt(quantity) || 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit({
      productId: selectedProductId,
      quantity: parseInt(quantity),
      type: transactionType,
    });

    // Reset form
    setSelectedProductId('');
    setQuantity('');
    setTransactionType('sale');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedProductId('');
    setQuantity('');
    setTransactionType('sale');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">New Transaction</h2>
            <p className="text-sm text-muted-foreground mt-1">Record a sale or purchase transaction</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Transaction Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType('sale')}
                className={cn(
                  'flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all',
                  transactionType === 'sale'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground'
                )}
              >
                <ArrowUpRight className="w-5 h-5" />
                <span className="font-medium">Sale</span>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('purchase')}
                className={cn(
                  'flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all',
                  transactionType === 'purchase'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground'
                )}
              >
                <ArrowDownLeft className="w-5 h-5" />
                <span className="font-medium">Purchase</span>
              </button>
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {mockProducts.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>{product.name}</span>
                      <span className="text-muted-foreground text-xs">
                        (Stock: {product.quantityInStock})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <div className="p-4 bg-secondary rounded-xl space-y-2 animate-fade-in">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Stock</span>
                <span className="text-foreground font-medium">{selectedProduct.quantityInStock} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit Price</span>
                <span className="text-foreground font-medium">${selectedProduct.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Supplier</span>
                <span className="text-foreground font-medium">{selectedProduct.supplier}</span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Quantity</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                min="1"
                max={transactionType === 'sale' && selectedProduct ? selectedProduct.quantityInStock : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="pl-10 bg-secondary border-border"
              />
            </div>
            {transactionType === 'sale' && selectedProduct && parseInt(quantity) > selectedProduct.quantityInStock && (
              <p className="text-sm text-destructive">Quantity exceeds available stock</p>
            )}
          </div>

          {/* Total Amount Preview */}
          {selectedProduct && quantity && (
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Total Amount</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="p-4 bg-secondary rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                {currentUser?.avatar || currentUser?.name.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">Recording this transaction</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedProductId || !quantity || isSubmitting || 
                (transactionType === 'sale' && selectedProduct && parseInt(quantity) > selectedProduct.quantityInStock)}
              className={cn(
                'flex-1',
                transactionType === 'sale' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {isSubmitting ? 'Recording...' : `Record ${transactionType === 'sale' ? 'Sale' : 'Purchase'}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
