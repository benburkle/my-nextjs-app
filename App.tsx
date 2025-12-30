import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { AuthProvider } from './mobile/src/contexts/AuthContext';
import AppNavigator from './mobile/src/navigation/AppNavigator';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetails}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer
              // Enable URL-based navigation on web
              linking={
                Platform.OS === 'web'
                  ? {
                      enabled: true,
                      config: {
                        screens: {
                          Main: {
                            screens: {
                              Dashboard: '',
                              Studies: 'studies',
                              Guides: 'guides',
                              Resources: 'resources',
                              Schedules: 'schedules',
                            },
                          },
                          StudyDetail: 'study/:id',
                          Session: 'session/:id',
                          GuideEdit: 'guide/:id/edit',
                          ResourceDetail: 'resource/:id',
                          ScheduleDetail: 'schedule/:id',
                        },
                      },
                    }
                  : undefined
              }
            >
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: 'red',
  },
});

