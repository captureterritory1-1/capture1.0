import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, UserPlus, Search, MapPin, Trophy, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

// Mock friends data
const MOCK_FRIENDS = [
  { id: 1, name: 'Alex Runner', territories: 12, isOnline: true, color: '#EF4444' },
  { id: 2, name: 'Sam Swift', territories: 8, isOnline: true, color: '#3B82F6' },
  { id: 3, name: 'Jordan Trail', territories: 15, isOnline: false, color: '#22C55E' },
  { id: 4, name: 'Casey Path', territories: 6, isOnline: false, color: '#A855F7' },
];

const MOCK_REQUESTS = [
  { id: 5, name: 'Taylor Sprint', territories: 9, color: '#F97316' },
  { id: 6, name: 'Morgan Pace', territories: 11, color: '#06B6D4' },
];

const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const handleAcceptRequest = (id) => {
    const accepted = requests.find(r => r.id === id);
    if (accepted) {
      setFriends([...friends, { ...accepted, isOnline: false }]);
      setRequests(requests.filter(r => r.id !== id));
      toast.success(`${accepted.name} is now your friend!`);
    }
  };

  const handleDeclineRequest = (id) => {
    setRequests(requests.filter(r => r.id !== id));
    toast.info('Request declined');
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card pt-safe px-4 pb-4 border-b border-border">
        <div className="flex items-center justify-center gap-2 pt-4 mb-4">
          <Users className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-heading font-bold text-foreground">Friends</h1>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-secondary border-0"
          />
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary mb-4">
            <TabsTrigger 
              value="friends"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger 
              value="requests"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background relative"
            >
              Requests
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value="friends" className="mt-0">
            {filteredFriends.length === 0 ? (
              <Card className="border-0 shadow-card">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No friends found</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {searchQuery ? 'Try a different search' : 'Add friends to compete together!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <Card key={friend.id} className="border-0 shadow-sm">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: friend.color }}
                          >
                            {friend.name[0]}
                          </div>
                          {friend.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{friend.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{friend.territories} territories</span>
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="text-right">
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            friend.isOnline 
                              ? "bg-green-100 text-green-700" 
                              : "bg-secondary text-muted-foreground"
                          )}>
                            {friend.isOnline ? 'Active' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Friend Button */}
            <Button
              className="w-full mt-4 h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add Friend
            </Button>
          </TabsContent>

          {/* Requests List */}
          <TabsContent value="requests" className="mt-0">
            {requests.length === 0 ? (
              <Card className="border-0 shadow-card">
                <CardContent className="py-12 text-center">
                  <UserPlus className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No pending requests</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Friend requests will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Card key={request.id} className="border-0 shadow-sm">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: request.color }}
                        >
                          {request.name[0]}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{request.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Trophy className="w-3 h-3" />
                            <span>{request.territories} territories claimed</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-10 h-10 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-10 h-10 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FriendsPage;
