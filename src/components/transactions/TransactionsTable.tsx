import { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, Plus, Download } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { Transaction } from '@/types/inventory';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import NewTransactionModal from './NewTransactionModal';

export default function TransactionsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const { hasPermission } = useRole();

  const canRecordTransactions = hasPermission(['admin', 'manager', 'staff']);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleNewTransaction = (data: { productId: string; quantity: number; type: 'sale' | 'purchase' }) => {
    // In a real app, this would be an API call
    const product = mockTransactions.find(t => t.productId === data.productId);
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      productId: data.productId,
      productName: product?.productName || 'Unknown Product',
      quantity: data.quantity,
      type: data.type,
      date: new Date(),
      userId: '1',
      userName: 'Current User',
      totalAmount: data.quantity * 100, // Mock price
    };
    
    setTransactions([newTransaction, ...transactions]);
    toast.success(`${data.type === 'sale' ? 'Sale' : 'Purchase'} recorded successfully!`);
  };

  return (
    <>
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
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
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
                <tr key={transaction.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={cn(
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
                      transaction.type === 'sale' 
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-blue-500/20 text-blue-500'
                    )}>
                      {transaction.type === 'sale' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      )}
                      {transaction.type === 'sale' ? 'Sale' : 'Purchase'}
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
                      transaction.type === 'sale' ? 'text-emerald-500' : 'text-blue-500'
                    )}>
                      {transaction.type === 'sale' ? '+' : '-'}${transaction.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium">
                        {transaction.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-muted-foreground">{transaction.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </div>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewTransaction}
      />
    </>
  );
}
