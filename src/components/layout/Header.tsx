import { Search, Bell, Moon, Sun } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useState } from 'react';
import { mockAlerts } from '@/data/mockData';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { currentUser, currentRole } = useRole();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadAlerts = mockAlerts.filter(a => !a.alertSent).length;

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Title Section */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, transactions..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-72 pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-pulse">
                  {unreadAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-lg overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-thin">
                  {mockAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-warning text-sm">⚠️</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{alert.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {alert.currentStock} / Threshold: {alert.threshold}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button className="w-full text-sm text-primary hover:underline">View all alerts</button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentRole}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {currentUser.avatar}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
