import { AlertTriangle, ExternalLink } from 'lucide-react';
import { mockAlerts } from '@/data/mockData';

export default function LowStockPanel() {
  return (
    <div className="bg-card border border-border rounded-xl animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Low Stock Alerts</h3>
            <p className="text-sm text-muted-foreground">{mockAlerts.length} items need attention</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {mockAlerts.map((alert) => {
          const stockPercentage = (alert.currentStock / alert.threshold) * 100;
          
          return (
            <div key={alert.id} className="px-6 py-4 table-row-hover">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">{alert.productName}</p>
                <span className={`badge-${stockPercentage < 30 ? 'danger' : 'warning'}`}>
                  {stockPercentage < 30 ? 'Critical' : 'Low'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current: {alert.currentStock} units</span>
                  <span className="text-muted-foreground">Threshold: {alert.threshold}</span>
                </div>
                
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      stockPercentage < 30 ? 'bg-destructive' : 'bg-warning'
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:underline">
          <span>Manage all alerts</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
