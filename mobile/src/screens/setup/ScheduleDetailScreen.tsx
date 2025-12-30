import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Badge } from '@rneui/themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import { schedulesService } from '../../services/schedulesService';

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
  starts: string | null;
  ends: string | null;
  excludeDayOfWeek: string | null;
  excludeDate: string | null;
  studies: any[];
}

export default function ScheduleDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: number };
  
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedule();
  }, [id]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await schedulesService.getSchedule(id);
      setSchedule(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedule');
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedule();
  };

  if (loading && !schedule) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && !schedule) {
    return (
      <View style={styles.center}>
        <Text h4 style={styles.errorText}>
          {error}
        </Text>
        <Button title="Retry" onPress={loadSchedule} buttonStyle={styles.retryButton} />
      </View>
    );
  }

  if (!schedule) {
    return (
      <View style={styles.center}>
        <Text>Schedule not found</Text>
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
          <Text h4>{schedule.day}</Text>
          <Badge value={schedule.repeats} status="primary" />
        </View>
        <Text style={styles.timeText}>
          Starts at: {schedule.timeStart}
        </Text>
        {schedule.starts && (
          <Text style={styles.dateText}>
            From: {new Date(schedule.starts).toLocaleDateString()}
          </Text>
        )}
        {schedule.ends && (
          <Text style={styles.dateText}>
            Until: {new Date(schedule.ends).toLocaleDateString()}
          </Text>
        )}
      </Card>

      <Card containerStyle={styles.card}>
        <Text h4 style={styles.sectionTitle}>
          Studies ({schedule.studies?.length || 0})
        </Text>
        {schedule.studies && schedule.studies.length > 0 ? (
          schedule.studies.map((study) => (
            <View key={study.id} style={styles.studyItem}>
              <Text>{study.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No studies assigned to this schedule
          </Text>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Edit Schedule"
          onPress={() => navigation.navigate('ScheduleEdit' as never, { id: schedule.id } as never)}
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
  timeText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  dateText: {
    marginTop: 5,
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  studyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emptyText: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    marginBottom: 10,
  },
});



