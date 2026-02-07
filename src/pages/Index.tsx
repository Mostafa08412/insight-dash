import { useState, useEffect } from 'react';
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
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/auth/AccessDenied';

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
  const { canAccessPage, accessiblePages } = usePermissions();

  // Redirect to accessible page if current page is not accessible
  useEffect(() => {
    if (!canAccessPage(activePage) && accessiblePages.length > 0) {
      setActivePage(accessiblePages[0]);
    }
  }, [activePage, canAccessPage, accessiblePages]);

  const renderPage = () => {
    // Check page access and show access denied for restricted pages
    if (!canAccessPage(activePage)) {
      return <AccessDenied onGoBack={() => setActivePage('dashboard')} />;
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
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
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  const pageInfo = pageTitles[activePage] || pageTitles.dashboard;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      
      <main className="lg:ml-64">
        <Header 
          title={pageInfo.title} 
          subtitle={pageInfo.subtitle}
          activePage={activePage}
          onNavigate={setActivePage}
        />
        <div className="p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default function Index() {
  return <InventoryApp />;
}
