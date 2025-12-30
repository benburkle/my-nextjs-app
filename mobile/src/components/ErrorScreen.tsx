import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@rneui/themed';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <Text h4 style={styles.errorText}>
        {error}
      </Text>
      {onRetry && (
        <Button title="Retry" onPress={onRetry} buttonStyle={styles.retryButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
});



