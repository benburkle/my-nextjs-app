import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Badge, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { schedulesService } from '../../services/schedulesService';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
  studies: any[];
}

export default function SchedulesScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setError(null);
      const data = await schedulesService.getSchedules();
      setSchedules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedules');
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedules();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await schedulesService.deleteSchedule(id);
              loadSchedules();
            } catch (error) {
              console.error('Failed to delete schedule:', error);
              Alert.alert('Error', 'Failed to delete schedule');
            }
          },
        },
      ]
    );
  };

  if (loading && schedules.length === 0) {
    return <LoadingScreen message="Loading schedules..." />;
  }

  if (error && schedules.length === 0) {
    return <ErrorScreen error={error} onRetry={loadSchedules} />;
  }

  return (
    <View style={styles.container}>
      {schedules.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No schedules yet. Create your first schedule!
          </Text>
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card
              containerStyle={styles.card}
              onPress={() => navigation.navigate('ScheduleDetail' as never, { id: item.id } as never)}
            >
              <View style={styles.cardHeader}>
                <Text h4>{item.day}</Text>
                <Badge value={item.repeats} status="primary" />
              </View>
              <Text style={styles.timeText}>
                Starts at: {item.timeStart}
              </Text>
              <View style={styles.stats}>
                <Text>
                  {item.studies?.length || 0} studies
                </Text>
              </View>
              <View style={styles.actions}>
                <Button
                  icon={<Icon name="edit" size={16} />}
                  type="clear"
                  title="Edit"
                  onPress={() => navigation.navigate('ScheduleDetail' as never, { id: item.id } as never)}
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
        onPress={() => navigation.navigate('NewSchedule' as never)}
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
  timeText: {
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

