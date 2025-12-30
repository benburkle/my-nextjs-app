import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { guidesService } from '../../services/guidesService';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';

interface Guide {
  id: number;
  name: string;
  guideSteps: any[];
}

export default function GuidesScreen() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setError(null);
      const data = await guidesService.getGuides();
      setGuides(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load guides');
      console.error('Failed to load guides:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGuides();
  };

  if (loading && guides.length === 0) {
    return <LoadingScreen message="Loading guides..." />;
  }

  if (error && guides.length === 0) {
    return <ErrorScreen error={error} onRetry={loadGuides} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={guides}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
            <Card
              containerStyle={styles.card}
              onPress={() => navigation.navigate('GuideEdit' as never, { id: item.id } as never)}
            >
              <Text h4>{item.name}</Text>
              <Text style={styles.stepsText}>
                {item.guideSteps?.length || 0} steps
              </Text>
          </Card>
        )}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('GuideEdit' as never, { id: 'new' } as never)}
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
  },
  stepsText: {
    marginTop: 5,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

