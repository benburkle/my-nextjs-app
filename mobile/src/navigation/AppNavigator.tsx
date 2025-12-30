import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

// Auth Screens
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Dashboard Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import StudiesScreen from '../screens/setup/StudiesScreen';
import GuidesScreen from '../screens/setup/GuidesScreen';
import ResourcesScreen from '../screens/setup/ResourcesScreen';
import SchedulesScreen from '../screens/setup/SchedulesScreen';
import GuideEditScreen from '../screens/setup/GuideEditScreen';
import StudyDetailScreen from '../screens/study/StudyDetailScreen';
import SessionScreen from '../screens/study/SessionScreen';
import ResourceDetailScreen from '../screens/setup/ResourceDetailScreen';
import ScheduleDetailScreen from '../screens/setup/ScheduleDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Studies" component={StudiesScreen} />
      <Tab.Screen name="Guides" component={GuidesScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Schedules" component={SchedulesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="StudyDetail" component={StudyDetailScreen} />
          <Stack.Screen name="Session" component={SessionScreen} />
          <Stack.Screen name="GuideDetail" component={GuidesScreen} />
          <Stack.Screen name="GuideEdit" component={GuideEditScreen} />
          <Stack.Screen name="NewGuide" component={GuideEditScreen} />
          <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
          <Stack.Screen name="NewResource" component={ResourcesScreen} />
          <Stack.Screen name="ScheduleDetail" component={ScheduleDetailScreen} />
          <Stack.Screen name="NewSchedule" component={SchedulesScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

