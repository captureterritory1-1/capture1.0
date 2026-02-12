import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('capture_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock validation (accept any email/password for demo)
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if user profile exists
    const storedProfile = localStorage.getItem(`capture_profile_${email}`);
    const hasCompletedSetup = !!storedProfile;

    const userData = {
      id: `user_${Date.now()}`,
      email,
      displayName: storedProfile ? JSON.parse(storedProfile).displayName : null,
      createdAt: new Date().toISOString(),
      hasCompletedSetup,
    };

    setUser(userData);
    localStorage.setItem('capture_user', JSON.stringify(userData));
    
    return { user: userData, hasCompletedSetup };
  };

  // Mock signup function
  const signup = async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const userData = {
      id: `user_${Date.now()}`,
      email,
      displayName: null,
      createdAt: new Date().toISOString(),
      hasCompletedSetup: false,
    };

    setUser(userData);
    localStorage.setItem('capture_user', JSON.stringify(userData));
    
    return { user: userData, hasCompletedSetup: false };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('capture_user');
  };

  // Update user profile after setup
  const updateProfile = (profileData) => {
    const updatedUser = {
      ...user,
      ...profileData,
      hasCompletedSetup: true,
    };
    setUser(updatedUser);
    localStorage.setItem('capture_user', JSON.stringify(updatedUser));
    localStorage.setItem(`capture_profile_${user.email}`, JSON.stringify(profileData));
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
