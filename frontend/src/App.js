import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import { Toaster } from "./components/ui/sonner";
import BottomNavigation from "./components/BottomNavigation";

// Pages
import LoginPage from "./pages/LoginPage";
import SetupPage from "./pages/SetupPage";
import MapPage from "./pages/MapPage";
import RanksPage from "./pages/RanksPage";
import FriendsPage from "./pages/FriendsPage";
import ProfilePage from "./pages/ProfilePage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-background text-2xl font-heading font-bold">C</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirect to map if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-background text-2xl font-heading font-bold">C</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // If user hasn't completed setup, redirect to setup
    if (!user?.hasCompletedSetup) {
      return <Navigate to="/setup" replace />;
    }
    return <Navigate to="/map" replace />;
  }

  return children;
};

// Global Navigation Wrapper - shows nav on authenticated routes
const NavigationWrapper = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Hide navigation on login and setup pages
  const hideNavRoutes = ['/login', '/setup'];
  const shouldShowNav = isAuthenticated && !hideNavRoutes.includes(location.pathname);
  
  if (!shouldShowNav) return null;
  
  return <BottomNavigation />;
};

// App Content with Routes
const AppContent = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Setup Route (needs auth but not setup completion) */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <SetupPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranks"
          element={
            <ProtectedRoute>
              <RanksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      {/* Global Navigation - Always visible when authenticated */}
      <NavigationWrapper />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <div className="App bg-background" style={{ minHeight: '100dvh', overflow: 'hidden' }}>
            <AppContent />
            <Toaster 
              position="top-center" 
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </div>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
