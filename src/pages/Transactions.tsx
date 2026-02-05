/**
 * Transactions Page (Refactored)
 * 
 * Clean, composition-based page using the new architecture.
 */

import { useState } from 'react';
import TransactionsTable from '@/components/transactions/TransactionsTable';
import TransactionDetails from '@/pages/TransactionDetails';

export default function Transactions() {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  if (selectedTransactionId) {
    return (
      <TransactionDetails 
        transactionId={selectedTransactionId} 
        onBack={() => setSelectedTransactionId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <TransactionsTable onViewDetails={setSelectedTransactionId} />
    </div>
  );
}
