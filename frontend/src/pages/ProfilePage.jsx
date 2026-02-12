import React, { useState, useRef, useEffect } from 'react';
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
  Sun,
  Camera,
  Loader2,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getTotalStats, userPreferences, userTerritories } = useGame();
  const { isDarkMode, toggleTheme } = useTheme();
  const stats = getTotalStats();
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load profile picture on mount
  useEffect(() => {
    const loadProfilePicture = async () => {
      // First check localStorage for quick load
      const cachedPic = localStorage.getItem('capture_profile_picture');
      if (cachedPic) {
        setProfilePicture(cachedPic);
      }
      
      // Then try to fetch from server
      if (user?.id) {
        try {
          const response = await fetch(`${API_BASE}/api/profile-picture/${user.id}`);
          const data = await response.json();
          if (data.success && data.url) {
            setProfilePicture(data.url);
            localStorage.setItem('capture_profile_picture', data.url);
          }
        } catch (error) {
          console.error('Error loading profile picture:', error);
        }
      }
    };
    
    loadProfilePicture();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('capture_profile_picture');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toast.success(isDarkMode ? 'Light mode activated' : 'Dark mode activated');
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/profile-picture/${user?.id || 'anonymous'}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setProfilePicture(data.url);
        localStorage.setItem('capture_profile_picture', data.url);
        toast.success('Profile picture updated!');
      } else {
        throw new Error(data.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
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
          {/* Profile Picture with Upload */}
          <div className="relative">
            <button 
              onClick={handleProfilePictureClick}
              disabled={isUploading}
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-lg relative group transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: profilePicture ? 'transparent' : userPreferences.territoryColor.hex }}
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              ) : profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                (user?.displayName || 'U')[0].toUpperCase()
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            
            {/* Camera badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-lg border-2 border-card">
              <Camera className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-bold text-foreground">
                {user?.displayName || 'Runner'}
              </h2>
              <button 
                className="p-1 hover:bg-secondary rounded-md transition-colors"
                onClick={() => toast.info('Edit profile coming soon!')}
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-xl p-4 text-center theme-transition">
                <MapPin className="w-6 h-6 mx-auto text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground font-metrics">{stats.territories}</p>
                <p className="text-xs text-muted-foreground">Territories</p>
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
