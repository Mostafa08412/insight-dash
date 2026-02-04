import { ArrowLeft, AlertTriangle, Package, ShoppingCart, Clock, Bell, CheckCircle, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LowStockAlert } from '@/types/inventory';
import { mockProducts, mockTransactions } from '@/data/mockData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AlertDetailsProps {
  alert: LowStockAlert;
  onBack: () => void;
  onViewProduct?: (productId: string) => void;
  onOrderStock?: () => void;
  onDismiss?: () => void;
}

export default function AlertDetails({ alert, onBack, onViewProduct, onOrderStock, onDismiss }: AlertDetailsProps) {
  const product = mockProducts.find(p => p.id === alert.productId);
  const stockPercentage = (alert.currentStock / alert.threshold) * 100;
  const isCritical = stockPercentage < 30;

  const relatedTransactions = mockTransactions
    .filter(t => t.productId === alert.productId)
    .slice(0, 5);

  const handleOrderStock = () => {
    toast({ title: 'Stock Order Initiated', description: `Order placed for ${alert.productName}.` });
    onOrderStock?.();
  };

  const handleDismiss = () => {
    toast({ title: 'Alert Dismissed', description: `Alert for ${alert.productName} has been dismissed.` });
    onDismiss?.();
    onBack();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Stock Alert Details</h2>
              <span className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full',
                isCritical ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
              )}>
                {isCritical ? 'Critical' : 'Low Stock'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{alert.productName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Dismiss Alert
          </Button>
          <Button onClick={handleOrderStock}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Order Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Alert Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Level Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center',
                isCritical ? 'bg-destructive/20' : 'bg-warning/20'
              )}>
                <AlertTriangle className={cn('w-7 h-7', isCritical ? 'text-destructive' : 'text-warning')} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Stock Level Alert</h3>
                <p className="text-sm text-muted-foreground">
                  Current stock ({alert.currentStock} units) is below the threshold ({alert.threshold} units)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stock Level</span>
                <span className={cn('font-semibold', isCritical ? 'text-destructive' : 'text-warning')}>
                  {stockPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={stockPercentage} 
                className={cn('h-3', isCritical ? '[&>div]:bg-destructive' : '[&>div]:bg-warning')} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 units</span>
                <span>Threshold: {alert.threshold} units</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          {product && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Product Information</h3>
                <Button variant="outline" size="sm" onClick={() => onViewProduct?.(product.id)}>
                  View Product
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-mono text-foreground">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold text-foreground">${product.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="text-foreground">{product.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Threshold</p>
                  <p className="text-foreground">{product.lowStockThreshold} units</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-card border border-border rounded-xl">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
              <p className="text-sm text-muted-foreground">Latest transactions for this product</p>
            </div>
            {relatedTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {relatedTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        transaction.type === 'sale' ? 'bg-success/20' : 'bg-info/20'
                      )}>
                        {transaction.type === 'sale' ? (
                          <TrendingDown className="w-5 h-5 text-success" />
                        ) : (
                          <Package className="w-5 h-5 text-info" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">{format(transaction.date, 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{transaction.quantity} units</p>
                      <p className="text-sm text-muted-foreground">${transaction.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Alert Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Alert Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  alert.alertSent ? 'bg-success/20' : 'bg-warning/20'
                )}>
                  {alert.alertSent ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <Bell className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {alert.alertSent ? 'Notification Sent' : 'Notification Pending'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {alert.alertSent ? 'Team has been notified' : 'Awaiting notification'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Alert Created</p>
                  <p className="text-sm text-muted-foreground">{format(alert.date, 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Stock</span>
                <span className="font-semibold text-foreground">{alert.currentStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Threshold</span>
                <span className="font-semibold text-foreground">{alert.threshold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units Below</span>
                <span className="font-semibold text-destructive">{alert.threshold - alert.currentStock}</span>
              </div>
              {product && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Value</span>
                  <span className="font-semibold text-foreground">
                    ${(product.price * alert.currentStock).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
