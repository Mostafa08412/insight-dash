import { useState } from 'react';
import ProductsTable from '@/components/products/ProductsTable';
import ProductDetails from '@/pages/ProductDetails';

export default function Products() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  if (selectedProductId) {
    return (
      <ProductDetails 
        productId={selectedProductId} 
        onBack={() => setSelectedProductId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProductsTable onViewProduct={setSelectedProductId} />
    </div>
  );
}
