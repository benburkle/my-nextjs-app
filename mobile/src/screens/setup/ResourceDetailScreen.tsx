import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Badge } from '@rneui/themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import { resourcesService } from '../../services/resourcesService';

interface Resource {
  id: number;
  name: string;
  series: string | null;
  type: string;
  chapters: any[];
  studies: any[];
}

export default function ResourceDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: number };
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResource();
  }, [id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourcesService.getResource(id);
      setResource(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load resource');
      console.error('Failed to load resource:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadResource();
  };

  if (loading && !resource) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && !resource) {
    return (
      <View style={styles.center}>
        <Text h4 style={styles.errorText}>
          {error}
        </Text>
        <Button title="Retry" onPress={loadResource} buttonStyle={styles.retryButton} />
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.center}>
        <Text>Resource not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <Text h4>{resource.name}</Text>
          <Badge value={resource.type} status="primary" />
        </View>
        {resource.series && (
          <Text style={styles.seriesText}>
            Series: {resource.series}
          </Text>
        )}
      </Card>

      <Card containerStyle={styles.card}>
        <Text h4 style={styles.sectionTitle}>
          Statistics
        </Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text h2>{resource.chapters?.length || 0}</Text>
            <Text>Chapters</Text>
          </View>
          <View style={styles.statItem}>
            <Text h2>{resource.studies?.length || 0}</Text>
            <Text>Studies</Text>
          </View>
        </View>
      </Card>

      {resource.chapters && resource.chapters.length > 0 && (
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.sectionTitle}>
            Chapters
          </Text>
          {resource.chapters.map((chapter) => (
            <View key={chapter.id} style={styles.chapterItem}>
              <Text>{chapter.name || `Chapter ${chapter.number}`}</Text>
            </View>
          ))}
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          title="Edit Resource"
          onPress={() => navigation.navigate('GuideEdit' as never, { id: resource.id } as never)}
          buttonStyle={styles.button}
        />
      </View>
    </ScrollView>
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
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  card: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seriesText: {
    marginTop: 10,
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  chapterItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actions: {
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    marginBottom: 10,
  },
});



