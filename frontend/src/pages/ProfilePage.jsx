import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { 
  MapPin, 
  Route, 
  Clock, 
  Settings, 
  LogOut, 
  ChevronRight,
  Palette,
  Bell,
  Shield,
  HelpCircle,
  Star,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getTotalStats, userPreferences, userTerritories } = useGame();
  const { isDarkMode, toggleTheme } = useTheme();
  const stats = getTotalStats();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toast.success(isDarkMode ? 'Light mode activated' : 'Dark mode activated');
  };

  const menuItems = [
    {
      icon: isDarkMode ? Moon : Sun,
      label: 'Appearance',
      value: isDarkMode ? 'Dark Mode' : 'Light Mode',
      hasToggle: true,
      onToggle: handleThemeToggle,
      isToggled: isDarkMode,
    },
    {
      icon: Palette,
      label: 'Territory Color',
      value: userPreferences.territoryColor.name,
      color: userPreferences.territoryColor.hex,
    },
    {
      icon: Settings,
      label: 'Preferences',
      value: `${userPreferences.unit === 'km' ? 'Kilometers' : 'Miles'} • ${userPreferences.activityType === 'run' ? 'Running' : 'Walking'}`,
    },
    {
      icon: Bell,
      label: 'Notifications',
      value: 'On',
    },
    {
      icon: Shield,
      label: 'Privacy',
      value: 'Public Profile',
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
    },
    {
      icon: Star,
      label: 'Rate CAPTURE',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 theme-transition">
      {/* Header with Profile */}
      <div className="bg-card/90 backdrop-blur-xl pt-safe px-4 pb-6 border-b border-border/50 theme-transition">
        <h1 className="text-xl font-heading font-bold text-foreground text-center pt-4 mb-6">
          Profile
        </h1>
        
        {/* Profile Card */}
        <div className="flex items-center gap-4">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            style={{ backgroundColor: userPreferences.territoryColor.hex }}
          >
            {(user?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-heading font-bold text-foreground">
              {user?.displayName || 'Runner'}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <Card className="border-0 shadow-card glass theme-transition">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-xl p-4 text-center theme-transition">
                <MapPin className="w-6 h-6 mx-auto text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground font-metrics">{stats.territories}</p>
                <p className="text-xs text-muted-foreground">Territories</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center theme-transition">
                <div 
                  className="w-6 h-6 mx-auto rounded mb-2"
                  style={{ backgroundColor: userPreferences.territoryColor.hex }}
                />
                <p className="text-2xl font-bold text-foreground font-metrics">{stats.totalArea}</p>
                <p className="text-xs text-muted-foreground">km² Captured</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center theme-transition">
                <Route className="w-6 h-6 mx-auto text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground font-metrics">{stats.totalDistance}</p>
                <p className="text-xs text-muted-foreground">km Distance</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center theme-transition">
                <Clock className="w-6 h-6 mx-auto text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground font-metrics">{stats.totalTime}</p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Territories */}
        {userTerritories.length > 0 && (
          <Card className="border-0 shadow-card mt-4 glass theme-transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Recent Captures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userTerritories.slice(-3).reverse().map((territory) => (
                  <div 
                    key={territory.id}
                    className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg theme-transition"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: territory.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{territory.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(territory.area * 1000000).toFixed(0)} sq m • {territory.distance?.toFixed(2) || '0.00'} km
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(territory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Menu */}
        <Card className="border-0 shadow-card mt-4 glass theme-transition">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                  onClick={item.hasToggle ? item.onToggle : undefined}
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center theme-transition">
                    {item.color ? (
                      <div 
                        className="w-5 h-5 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                    ) : (
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    {item.value && (
                      <p className="text-xs text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                  {item.hasToggle ? (
                    <Switch 
                      checked={item.isToggled} 
                      onCheckedChange={item.onToggle}
                      className="data-[state=checked]:bg-accent"
                    />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {index < menuItems.length - 1 && <Separator className="bg-border/50" />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full mt-4 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4 pb-4">
          CAPTURE v1.0.0
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
