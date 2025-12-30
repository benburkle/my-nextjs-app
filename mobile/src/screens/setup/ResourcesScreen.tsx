import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Badge, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { resourcesService } from '../../services/resourcesService';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';

interface Resource {
  id: number;
  name: string;
  series: string | null;
  type: string;
  chapters: any[];
  studies: any[];
}

export default function ResourcesScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setError(null);
      const data = await resourcesService.getResources();
      setResources(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load resources');
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadResources();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Resource',
      'Are you sure you want to delete this resource?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await resourcesService.deleteResource(id);
              loadResources();
            } catch (error) {
              console.error('Failed to delete resource:', error);
              Alert.alert('Error', 'Failed to delete resource');
            }
          },
        },
      ]
    );
  };

  if (loading && resources.length === 0) {
    return <LoadingScreen message="Loading resources..." />;
  }

  if (error && resources.length === 0) {
    return <ErrorScreen error={error} onRetry={loadResources} />;
  }

  return (
    <View style={styles.container}>
      {resources.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No resources yet. Create your first resource!
          </Text>
        </View>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card
              containerStyle={styles.card}
              onPress={() => navigation.navigate('ResourceDetail' as never, { id: item.id } as never)}
            >
              <View style={styles.cardHeader}>
                <Text h4>{item.name}</Text>
                <Badge value={item.type} status="primary" />
              </View>
              {item.series && (
                <Text style={styles.seriesText}>
                  Series: {item.series}
                </Text>
              )}
              <View style={styles.stats}>
                <Text>
                  {item.chapters?.length || 0} chapters
                </Text>
                <Text>
                  {item.studies?.length || 0} studies
                </Text>
              </View>
              <View style={styles.actions}>
                <Button
                  icon={<Icon name="edit" size={16} />}
                  type="clear"
                  title="Edit"
                  onPress={() => navigation.navigate('ResourceDetail' as never, { id: item.id } as never)}
                />
                <Button
                  icon={<Icon name="delete" size={16} color="red" />}
                  type="clear"
                  title="Delete"
                  titleStyle={{ color: 'red' }}
                  onPress={() => handleDelete(item.id)}
                />
              </View>
            </Card>
          )}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewResource' as never)}
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.7,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seriesText: {
    marginTop: 5,
    opacity: 0.7,
  },
  stats: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
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

