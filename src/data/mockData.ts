import { Product, Category, Transaction, LowStockAlert, User, DashboardStats } from '@/types/inventory';

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', role: 'admin', avatar: 'SC' },
  { id: '2', name: 'Michael Torres', email: 'michael@company.com', role: 'manager', avatar: 'MT' },
  { id: '3', name: 'Emily Johnson', email: 'emily@company.com', role: 'staff', avatar: 'EJ' },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', productCount: 45 },
  { id: '2', name: 'Office Supplies', description: 'Office equipment and supplies', productCount: 128 },
  { id: '3', name: 'Furniture', description: 'Office and home furniture', productCount: 34 },
  { id: '4', name: 'Software', description: 'Software licenses and subscriptions', productCount: 22 },
  { id: '5', name: 'Hardware', description: 'Computer hardware components', productCount: 67 },
];

export const mockProducts: Product[] = [
  { id: '1', sku: 'MBP-16-M3P', name: 'MacBook Pro 16"', description: 'Apple M3 Pro, 18GB RAM', price: 2499, quantityInStock: 15, categoryId: '1', supplier: 'Apple Inc.', createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-20'), lowStockThreshold: 5 },
  { id: '2', sku: 'DELL-US27-4K', name: 'Dell UltraSharp 27"', description: '4K USB-C Hub Monitor', price: 699, quantityInStock: 3, categoryId: '1', supplier: 'Dell Technologies', createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-01-18'), lowStockThreshold: 10 },
  { id: '3', sku: 'HM-AERON-BLK', name: 'Herman Miller Aeron', description: 'Ergonomic Office Chair', price: 1395, quantityInStock: 8, categoryId: '3', supplier: 'Herman Miller', createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-12'), lowStockThreshold: 5 },
  { id: '4', sku: 'LOG-MX3S-BLK', name: 'Logitech MX Master 3S', description: 'Wireless Performance Mouse', price: 99, quantityInStock: 42, categoryId: '1', supplier: 'Logitech', createdAt: new Date('2024-01-08'), updatedAt: new Date('2024-01-15'), lowStockThreshold: 20 },
  { id: '5', sku: 'KEY-MECH-PRO', name: 'Mechanical Keyboard Pro', description: 'Cherry MX Brown Switches', price: 179, quantityInStock: 2, categoryId: '1', supplier: 'Keychron', createdAt: new Date('2024-01-12'), updatedAt: new Date('2024-01-19'), lowStockThreshold: 10 },
  { id: '6', sku: 'UPL-DSK-FRM', name: 'Standing Desk Frame', description: 'Electric Height Adjustable', price: 549, quantityInStock: 18, categoryId: '3', supplier: 'Uplift Desk', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-10'), lowStockThreshold: 8 },
  { id: '7', sku: 'ANK-HUB-10P', name: 'USB-C Hub 10-in-1', description: 'Multiport Adapter', price: 79, quantityInStock: 56, categoryId: '5', supplier: 'Anker', createdAt: new Date('2024-01-14'), updatedAt: new Date('2024-01-21'), lowStockThreshold: 25 },
  { id: '8', sku: 'MOL-NB-100P', name: 'Notebook Pack (100)', description: 'A5 Lined Notebooks', price: 45, quantityInStock: 234, categoryId: '2', supplier: 'Moleskine', createdAt: new Date('2024-01-06'), updatedAt: new Date('2024-01-13'), lowStockThreshold: 50 },
  { id: '9', sku: 'LOG-WBC-4KP', name: 'Webcam 4K Pro', description: 'Ultra HD Streaming Camera', price: 199, quantityInStock: 4, categoryId: '1', supplier: 'Logitech', createdAt: new Date('2024-01-11'), updatedAt: new Date('2024-01-18'), lowStockThreshold: 10 },
  { id: '10', sku: 'MS-O365-BUS', name: 'Office 365 License', description: 'Annual Business Subscription', price: 299, quantityInStock: 150, categoryId: '4', supplier: 'Microsoft', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-08'), lowStockThreshold: 20 },
];

export const mockTransactions: Transaction[] = [
  { id: '1', productId: '1', productName: 'MacBook Pro 16"', quantity: 2, type: 'sale', date: new Date('2024-01-21'), userId: '3', userName: 'Emily Johnson', totalAmount: 4998 },
  { id: '2', productId: '4', productName: 'Logitech MX Master 3S', quantity: 10, type: 'purchase', date: new Date('2024-01-20'), userId: '2', userName: 'Michael Torres', totalAmount: 990 },
  { id: '3', productId: '2', productName: 'Dell UltraSharp 27"', quantity: 1, type: 'sale', date: new Date('2024-01-20'), userId: '3', userName: 'Emily Johnson', totalAmount: 699 },
  { id: '4', productId: '8', productName: 'Notebook Pack (100)', quantity: 50, type: 'purchase', date: new Date('2024-01-19'), userId: '2', userName: 'Michael Torres', totalAmount: 2250 },
  { id: '5', productId: '3', productName: 'Herman Miller Aeron', quantity: 3, type: 'sale', date: new Date('2024-01-19'), userId: '3', userName: 'Emily Johnson', totalAmount: 4185 },
  { id: '6', productId: '5', productName: 'Mechanical Keyboard Pro', quantity: 5, type: 'sale', date: new Date('2024-01-18'), userId: '3', userName: 'Emily Johnson', totalAmount: 895 },
  { id: '7', productId: '7', productName: 'USB-C Hub 10-in-1', quantity: 20, type: 'purchase', date: new Date('2024-01-17'), userId: '2', userName: 'Michael Torres', totalAmount: 1580 },
  { id: '8', productId: '9', productName: 'Webcam 4K Pro', quantity: 2, type: 'sale', date: new Date('2024-01-17'), userId: '3', userName: 'Emily Johnson', totalAmount: 398 },
];

export const mockAlerts: LowStockAlert[] = [
  { id: '1', productId: '2', productName: 'Dell UltraSharp 27"', currentStock: 3, threshold: 10, alertSent: true, date: new Date('2024-01-20') },
  { id: '2', productId: '5', productName: 'Mechanical Keyboard Pro', currentStock: 2, threshold: 10, alertSent: true, date: new Date('2024-01-19') },
  { id: '3', productId: '9', productName: 'Webcam 4K Pro', currentStock: 4, threshold: 10, alertSent: false, date: new Date('2024-01-18') },
];

export const mockDashboardStats: DashboardStats = {
  totalProducts: 296,
  totalStockValue: 847500,
  totalSales: 156780,
  totalPurchases: 89450,
  lowStockCount: 3,
  recentTransactions: mockTransactions.slice(0, 5),
};

export const salesChartData = [
  { name: 'Jan', sales: 45000, purchases: 32000 },
  { name: 'Feb', sales: 52000, purchases: 28000 },
  { name: 'Mar', sales: 48000, purchases: 35000 },
  { name: 'Apr', sales: 61000, purchases: 42000 },
  { name: 'May', sales: 55000, purchases: 38000 },
  { name: 'Jun', sales: 67000, purchases: 45000 },
  { name: 'Jul', sales: 72000, purchases: 48000 },
];

export const categoryDistributionData = [
  { name: 'Electronics', value: 45, fill: 'hsl(173 80% 40%)' },
  { name: 'Office Supplies', value: 128, fill: 'hsl(142 76% 36%)' },
  { name: 'Furniture', value: 34, fill: 'hsl(38 92% 50%)' },
  { name: 'Software', value: 22, fill: 'hsl(199 89% 48%)' },
  { name: 'Hardware', value: 67, fill: 'hsl(280 65% 60%)' },
];

export const topProductsData = [
  { name: 'MacBook Pro 16"', sales: 45, revenue: 112455 },
  { name: 'Herman Miller Aeron', sales: 38, revenue: 53010 },
  { name: 'Dell UltraSharp 27"', sales: 32, revenue: 22368 },
  { name: 'Logitech MX Master 3S', sales: 89, revenue: 8811 },
  { name: 'USB-C Hub 10-in-1', sales: 124, revenue: 9796 },
];
