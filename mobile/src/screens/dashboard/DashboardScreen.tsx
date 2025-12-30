import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from '@rneui/themed';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ResponsiveContainer } from '../../components/ResponsiveContainer';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();

  return (
    <ResponsiveContainer>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h3>Welcome, {user?.email}</Text>
        <Button title="Sign Out" type="outline" onPress={signOut} buttonStyle={styles.signOutButton} />
      </View>

      <Card containerStyle={styles.card}>
        <Text h4>Quick Actions</Text>
        <Button
          title="View Studies"
          onPress={() => navigation.navigate('Studies' as never)}
          buttonStyle={styles.actionButton}
        />
      </Card>
      </ScrollView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  signOutButton: {
    marginTop: 10,
  },
  card: {
    marginBottom: 20,
  },
  actionButton: {
    marginTop: 10,
  },
});


