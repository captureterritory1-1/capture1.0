import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Trophy, Users, User, Play } from 'lucide-react';
import { cn } from '../lib/utils';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'map', icon: Map, label: 'Map', path: '/map' },
    { id: 'ranks', icon: Trophy, label: 'Ranks', path: '/ranks' },
    { id: 'start', icon: Play, label: 'Start', path: '/map', isCenter: true },
    { id: 'friends', icon: Users, label: 'Friends', path: '/friends' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => {
    if (path === '/map') {
      return location.pathname === '/map' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/50 theme-transition"
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-200",
              item.isCenter 
                ? "relative -mt-6" 
                : "w-16 py-2"
            )}
          >
            {item.isCenter ? (
              // Center FAB Button - Amber colored with gradient
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
                <item.icon className="w-6 h-6 text-white" />
              </div>
            ) : (
              // Regular nav items
              <>
                <div 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    isActive(item.path)
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span 
                  className={cn(
                    "text-[10px] mt-1 font-medium transition-colors duration-200",
                    isActive(item.path) 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
