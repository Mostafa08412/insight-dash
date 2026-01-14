import { AlertTriangle, Bell, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { mockAlerts, mockProducts } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Alerts() {
  const criticalAlerts = mockAlerts.filter(a => (a.currentStock / a.threshold) < 0.3);
  const warningAlerts = mockAlerts.filter(a => (a.currentStock / a.threshold) >= 0.3);

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

      {/* Alerts List */}
      <div className="bg-card border border-border rounded-xl animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">All Stock Alerts</h3>
              <p className="text-sm text-muted-foreground">{mockAlerts.length} active alerts</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent transition-colors text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="divide-y divide-border">
          {mockAlerts.map((alert) => {
            const stockPercentage = (alert.currentStock / alert.threshold) * 100;
            const isCritical = stockPercentage < 30;

            return (
              <div key={alert.id} className="p-6 table-row-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      isCritical ? 'bg-destructive/20' : 'bg-warning/20'
                    )}>
                      <AlertTriangle className={cn(
                        'w-6 h-6',
                        isCritical ? 'text-destructive' : 'text-warning'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-semibold text-foreground">{alert.productName}</h4>
                        <span className={isCritical ? 'badge-danger' : 'badge-warning'}>
                          {isCritical ? 'Critical' : 'Low Stock'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Current stock ({alert.currentStock}) is below the threshold ({alert.threshold})
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Alert triggered: {format(alert.date, 'MMM d, yyyy')}</span>
                        <span className={cn(
                          'flex items-center gap-1',
                          alert.alertSent ? 'text-success' : 'text-warning'
                        )}>
                          {alert.alertSent ? <CheckCircle className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                          {alert.alertSent ? 'Notification sent' : 'Pending notification'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                      Order Stock
                    </button>
                    <button className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent transition-colors text-sm font-medium">
                      Dismiss
                    </button>
                  </div>
                </div>

                <div className="mt-4 ml-16">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Stock Level</span>
                    <span className="text-foreground font-medium">{alert.currentStock} / {alert.threshold}</span>
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
      </div>
    </div>
  );
}
