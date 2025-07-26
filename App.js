import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreens from './components/AuthScreens';
import HomeScreen from './HomeScreen';
import MoodBot from './components/MoodBot';
import DiaryScreen from './components/DiaryScreen';
import ProfileScreen from './components/ProfileScreen';
import BreathingScreen from './components/BreathingScreen';
import JournalScreen from './components/JournalScreen';
import HistoryStatsScreen from './components/HistoryStatsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();


function AuthStackScreens({ onLoginSuccess }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="AuthScreens">
        {() => <AuthScreens onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MoodBot" component={MoodBot} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="HistoryStats" component={HistoryStatsScreen} />
    </Stack.Navigator>
  );
}

function MainApp({ onLogout }) {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Diary') iconName = 'book';
          else if (route.name === 'Profile') iconName = 'person-circle';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5E8B7E',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Diary" component={DiaryScreen} />
      <Tab.Screen 
        name="Profile" 
        children={() => <ProfileScreen onLogout={onLogout} />} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
      
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const user = await AsyncStorage.getItem('currentUser');
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#5E8B7E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainApp onLogout={handleLogout} />
      ) : (
        <AuthStackScreens onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </NavigationContainer>
  );
}