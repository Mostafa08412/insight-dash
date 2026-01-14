import { useState } from 'react';
import { RoleProvider } from '@/contexts/RoleContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Transactions from '@/pages/Transactions';
import Alerts from '@/pages/Alerts';
import Reports from '@/pages/Reports';
import Categories from '@/pages/Categories';
import Users from '@/pages/Users';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your inventory management' },
  products: { title: 'Products', subtitle: 'Manage your product inventory' },
  transactions: { title: 'Transactions', subtitle: 'Track sales and purchases' },
  alerts: { title: 'Stock Alerts', subtitle: 'Monitor low stock items' },
  reports: { title: 'Reports & Analytics', subtitle: 'Insights and performance metrics' },
  categories: { title: 'Categories', subtitle: 'Organize your products' },
  users: { title: 'User Management', subtitle: 'Manage users and permissions' },
  settings: { title: 'Settings', subtitle: 'System configuration' },
  profile: { title: 'Profile', subtitle: 'Manage your account settings' },
};

function InventoryApp() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'transactions':
        return <Transactions />;
      case 'alerts':
        return <Alerts />;
      case 'reports':
        return <Reports />;
      case 'categories':
        return <Categories />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  const pageInfo = pageTitles[activePage] || pageTitles.dashboard;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      
      <main className="ml-64">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <div className="p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default function Index() {
  return (
    <RoleProvider>
      <InventoryApp />
    </RoleProvider>
  );
}
