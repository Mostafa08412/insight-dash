import { Package, DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import SalesChart from '@/components/dashboard/SalesChart';
import CategoryChart from '@/components/dashboard/CategoryChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import LowStockPanel from '@/components/dashboard/LowStockPanel';
import TopProducts from '@/components/dashboard/TopProducts';
import { mockDashboardStats } from '@/data/mockData';
import { useRole } from '@/contexts/RoleContext';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { currentRole, hasPermission } = useRole();
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          variant="primary"
          change={{ value: 12, positive: true }}
          delay={0}
        />
        <StatCard
          title="Total Stock Value"
          value={`$${(stats.totalStockValue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          variant="success"
          change={{ value: 8, positive: true }}
          delay={50}
        />
        <StatCard
          title="Total Sales"
          value={`$${(stats.totalSales / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          variant="primary"
          change={{ value: 23, positive: true }}
          delay={100}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          variant="warning"
          delay={150}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <CategoryChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions onNavigate={onNavigate} />
        </div>
        <div className="space-y-6">
          {hasPermission(['admin', 'manager']) && <TopProducts onNavigate={onNavigate} />}
          <LowStockPanel onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
