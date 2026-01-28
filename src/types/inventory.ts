export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  quantityInStock: number;
  categoryId: string;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
  lowStockThreshold: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'sale' | 'purchase';
  date: Date;
  userId: string;
  userName: string;
  totalAmount: number;
}

export interface LowStockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  alertSent: boolean;
  date: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  totalSales: number;
  totalPurchases: number;
  lowStockCount: number;
  recentTransactions: Transaction[];
}
