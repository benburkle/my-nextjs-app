import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button } from '@rneui/themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import { studiesService } from '../../services/studiesService';

interface Study {
  id: number;
  name: string;
  guide?: {
    name: string;
  };
  sessions?: any[];
}

export default function StudyDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: number };
  
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudy();
  }, [id]);

  const loadStudy = async () => {
    try {
      const data = await studiesService.getStudy(id);
      setStudy(data);
    } catch (error) {
      console.error('Failed to load study:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!study) {
    return (
      <View style={styles.center}>
        <Text>Study not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text h3>{study.name}</Text>
        <Text style={styles.guideText}>
          Guide: {study.guide?.name || 'None'}
        </Text>
      </Card>

      <Button
        title="New Session"
        onPress={() => navigation.navigate('Session' as never, { id: 'new', studyId: id } as never)}
        buttonStyle={styles.newSessionButton}
      />

      {study.sessions && study.sessions.length > 0 && (
        <View style={styles.sessions}>
          <Text h4 style={styles.sectionTitle}>
            Sessions
          </Text>
          {study.sessions.map((session) => (
            <Card
              key={session.id}
              containerStyle={styles.sessionCard}
              onPress={() => navigation.navigate('Session' as never, { id: session.id, studyId: id } as never)}
            >
              <Text h4>Session {session.id}</Text>
              {session.date && (
                <Text>
                  {new Date(session.date).toLocaleDateString()}
                </Text>
              )}
            </Card>
          ))}
        </View>
      )}
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
  card: {
    marginBottom: 20,
  },
  guideText: {
    marginTop: 5,
    opacity: 0.7,
  },
  sessions: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  sessionCard: {
    marginBottom: 10,
  },
  newSessionButton: {
    marginBottom: 20,
  },
});

