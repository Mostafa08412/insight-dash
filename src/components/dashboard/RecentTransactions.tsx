import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function RecentTransactions() {
  const recentTransactions = mockTransactions.slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-xl animate-fade-in" style={{ animationDelay: '400ms' }}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <p className="text-sm text-muted-foreground">Latest inventory movements</p>
          </div>
          <button className="text-sm text-primary hover:underline">View all</button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="px-6 py-4 table-row-hover">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                transaction.type === 'sale' 
                  ? 'bg-success/20 text-success' 
                  : 'bg-info/20 text-info'
              )}>
                {transaction.type === 'sale' 
                  ? <ArrowUpRight className="w-5 h-5" /> 
                  : <ArrowDownLeft className="w-5 h-5" />
                }
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{transaction.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.userName} • {format(transaction.date, 'MMM d, yyyy')}
                </p>
              </div>

              <div className="text-right">
                <p className={cn(
                  'text-sm font-semibold',
                  transaction.type === 'sale' ? 'text-success' : 'text-info'
                )}>
                  {transaction.type === 'sale' ? '+' : '-'}${transaction.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.quantity} units
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
