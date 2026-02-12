import React from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Medal, Crown, MapPin, Clock, Route } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  { id: 1, name: 'SpeedRunner', territories: 24, area: 2.45, color: '#EF4444' },
  { id: 2, name: 'TerritoryKing', territories: 21, area: 2.12, color: '#3B82F6' },
  { id: 3, name: 'MapMaster', territories: 18, area: 1.89, color: '#22C55E' },
  { id: 4, name: 'TrailBlazer', territories: 15, area: 1.56, color: '#A855F7' },
  { id: 5, name: 'PathFinder', territories: 12, area: 1.23, color: '#F97316' },
];

const RanksPage = () => {
  const { getTotalStats, userTerritories, userPreferences } = useGame();
  const { user } = useAuth();
  const stats = getTotalStats();

  // Add current user to leaderboard
  const userRank = {
    id: 'current',
    name: user?.displayName || 'You',
    territories: stats.territories,
    area: parseFloat(stats.totalArea),
    color: userPreferences.territoryColor.hex,
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 0:
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card pt-safe px-4 pb-6 border-b border-border">
        <div className="flex items-center justify-center gap-2 pt-4 mb-6">
          <Trophy className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-heading font-bold text-foreground">Leaderboard</h1>
        </div>
        
        {/* Your Stats */}
        <Card className="border-0 shadow-card bg-secondary/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: userPreferences.territoryColor.hex }}
              >
                {(user?.displayName || 'Y')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{user?.displayName || 'You'}</p>
                <p className="text-sm text-muted-foreground">
                  Rank #{MOCK_LEADERBOARD.length + 1}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <p className="text-xl font-bold text-foreground">{stats.territories}</p>
                <p className="text-xs text-muted-foreground">Territories</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Route className="w-4 h-4 text-accent" />
                </div>
                <p className="text-xl font-bold text-foreground">{stats.totalDistance}</p>
                <p className="text-xs text-muted-foreground">km Total</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                <p className="text-xl font-bold text-foreground">{stats.totalTime}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard List */}
      <div className="p-4">
        <div className="space-y-3">
          {MOCK_LEADERBOARD.map((player, index) => (
            <Card 
              key={player.id} 
              className={cn(
                "border-0 shadow-sm transition-all duration-200",
                index === 0 && "shadow-card bg-gradient-to-r from-amber-50 to-amber-100/50"
              )}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  
                  {/* Avatar */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name[0]}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{player.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.territories} territories • {player.area.toFixed(2)} km²
                    </p>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{player.territories * 100}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Current User Card */}
          {stats.territories > 0 && (
            <Card className="border-2 border-accent/30 shadow-sm bg-accent/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-accent">
                      {MOCK_LEADERBOARD.length + 1}
                    </span>
                  </div>
                  
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: userPreferences.territoryColor.hex }}
                  >
                    {(user?.displayName || 'Y')[0].toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{user?.displayName || 'You'}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.territories} territories • {stats.totalArea} km²
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">{stats.territories * 100}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default RanksPage;
