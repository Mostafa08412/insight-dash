import { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, Plus, Download } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TransactionsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const { hasPermission } = useRole();

  const canRecordTransactions = hasPermission(['admin', 'manager', 'staff']);

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-card border border-border rounded-xl animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
            <p className="text-sm text-muted-foreground">{filteredTransactions.length} transactions found</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent transition-colors font-medium text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
            {canRecordTransactions && (
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
                <Plus className="w-4 h-4" />
                New Transaction
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {(['all', 'sale', 'purchase'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  typeFilter === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'all' ? 'All' : type === 'sale' ? 'Sales' : 'Purchases'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="table-row-hover">
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-foreground">{transaction.productName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">{transaction.quantity} units</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'text-sm font-semibold',
                    transaction.type === 'sale' ? 'text-success' : 'text-info'
                  )}>
                    {transaction.type === 'sale' ? '+' : '-'}${transaction.totalAmount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">{transaction.userName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">
                    {format(transaction.date, 'MMM d, yyyy')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
