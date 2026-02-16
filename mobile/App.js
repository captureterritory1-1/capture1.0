import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RanksScreen from './src/screens/RanksScreen';

// Theme
import { COLORS } from './src/constants/theme';

const Stack = createNativeStackNavigator();

// Simple Tab Bar Component
function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: COLORS.surface,
      borderTopColor: COLORS.border,
      borderTopWidth: 1,
      height: 60,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: isFocused ? COLORS.primary : COLORS.textSecondary,
              fontSize: 24,
              marginBottom: 4,
            }}>
              {route.name === 'Map' ? '🗺️' : route.name === 'Ranks' ? '🏆' : '👤'}
            </Text>
            <Text style={{
              color: isFocused ? COLORS.primary : COLORS.textSecondary,
              fontSize: 12,
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Main App Navigator
export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Ranks" component={RanksScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
