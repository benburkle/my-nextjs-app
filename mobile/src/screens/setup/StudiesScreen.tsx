import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { studiesService } from '../../services/studiesService';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';

interface Study {
  id: number;
  name: string;
  guide?: {
    name: string;
  };
}

export default function StudiesScreen() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadStudies();
  }, []);

  const loadStudies = async () => {
    try {
      setError(null);
      const data = await studiesService.getStudies();
      setStudies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load studies');
      console.error('Failed to load studies:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudies();
  };

  if (loading && studies.length === 0) {
    return <LoadingScreen message="Loading studies..." />;
  }

  if (error && studies.length === 0) {
    return <ErrorScreen error={error} onRetry={loadStudies} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={studies}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card
            containerStyle={styles.card}
            onPress={() => navigation.navigate('StudyDetail' as never, { id: item.id } as never)}
          >
            <Text h4>{item.name}</Text>
            <Text style={styles.guideText}>
              Guide: {item.guide?.name || 'None'}
            </Text>
          </Card>
        )}
        contentContainerStyle={styles.list}
      />
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
  guideText: {
    marginTop: 5,
    opacity: 0.7,
  },
});

