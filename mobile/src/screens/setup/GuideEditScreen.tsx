import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Input, Button, Card, Icon } from '@rneui/themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import { guidesService } from '../../services/guidesService';

export default function GuideEditScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: number | string };

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    levelOfResource: '',
    amtOfResource: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadGuide();
    } else {
      setFetching(false);
    }
  }, [id]);

  const loadGuide = async () => {
    try {
      setFetching(true);
      const data = await guidesService.getGuide(Number(id));
      setFormData({
        name: data.name || '',
        levelOfResource: data.levelOfResource || '',
        amtOfResource: data.amtOfResource || '',
      });
    } catch (error) {
      console.error('Failed to load guide:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      if (id && id !== 'new') {
        await guidesService.updateGuide(Number(id), {
          name: formData.name,
          levelOfResource: formData.levelOfResource || null,
          amtOfResource: formData.amtOfResource || null,
        });
      } else {
        await guidesService.createGuide({
          name: formData.name,
          levelOfResource: formData.levelOfResource || null,
          amtOfResource: formData.amtOfResource || null,
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save guide:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          icon={<Icon name="arrow-back" />}
          onPress={() => navigation.goBack()}
          type="clear"
          title="Back"
        />
        <Text h3>
          {id && id !== 'new' ? 'Edit Guide' : 'New Guide'}
        </Text>
      </View>

      <Card containerStyle={styles.card}>
        <Input
          label="Name"
          placeholder="Enter guide name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          containerStyle={styles.input}
        />
        <Input
          label="Level of Resource"
          placeholder="Optional"
          value={formData.levelOfResource}
          onChangeText={(text) => setFormData({ ...formData, levelOfResource: text })}
          containerStyle={styles.input}
        />
        <Input
          label="Amount of Resource"
          placeholder="Optional"
          value={formData.amtOfResource}
          onChangeText={(text) => setFormData({ ...formData, amtOfResource: text })}
          containerStyle={styles.input}
        />
      </Card>

      <View style={styles.actions}>
        <Button
          title="Cancel"
          type="outline"
          onPress={() => navigation.goBack()}
          buttonStyle={styles.button}
        />
        <Button
          title={id && id !== 'new' ? 'Update' : 'Create'}
          onPress={handleSave}
          loading={loading}
          disabled={!formData.name.trim()}
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
  header: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});



