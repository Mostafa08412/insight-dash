import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Camera, Save, Shield, Bell, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const { role, roleInfo } = usePermissions();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    company: 'InventoryPro Inc.',
    bio: 'Inventory manager with 5+ years of experience in supply chain management.',
    avatar: '',
  });

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        avatar: (user.firstName?.[0] || '') + (user.lastName?.[0] || ''),
      }));
    }
  }, [user]);

  const [notifications, setNotifications] = useState({
    lowStock: true,
    orderUpdates: true,
    weeklyReport: false,
    promotions: false,
    securityAlerts: true,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl border-4 border-card bg-secondary overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{profile.fullName || 'User'}</h2>
              <p className="text-muted-foreground">{roleInfo.label}</p>
            </div>
            <button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Company</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="company"
                    value={profile.company}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-lg">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Current Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => toast.success('Password updated successfully!')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  Update Password
                </button>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <button className="px-4 py-2 bg-secondary border border-border text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm">
                  Enable 2FA
                </button>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium text-sm">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-foreground">Email Notifications</h3>
              
              {[
                { key: 'lowStock', label: 'Low Stock Alerts', description: 'Get notified when products are running low' },
                { key: 'orderUpdates', label: 'Order Updates', description: 'Receive updates on orders and transactions' },
                { key: 'weeklyReport', label: 'Weekly Report', description: 'Get a weekly summary of inventory activities' },
                { key: 'promotions', label: 'Promotions', description: 'Receive updates about new features and offers' },
                { key: 'securityAlerts', label: 'Security Alerts', description: 'Get notified about security-related activities' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              ))}

              <button 
                onClick={() => toast.success('Notification preferences saved!')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
