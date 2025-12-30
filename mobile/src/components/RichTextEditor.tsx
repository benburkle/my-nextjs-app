import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '@rneui/themed';

interface RichTextEditorProps {
  content: string | null;
  onChange: (html: string) => void;
  hideLabel?: boolean;
  minHeight?: number;
}

/**
 * Simple text editor component for React Native
 * Note: For a full rich text editor, consider using a library like
 * react-native-pell-rich-editor or react-native-webview with a web-based editor
 */
export function RichTextEditor({
  content,
  onChange,
  hideLabel = false,
  minHeight = 200,
}: RichTextEditorProps) {
  const [text, setText] = useState(content || '');

  const handleChange = (newText: string) => {
    setText(newText);
    // Convert plain text to simple HTML for compatibility
    const html = newText.replace(/\n/g, '<br>');
    onChange(html);
  };

  return (
    <View style={styles.container}>
      <Input
        label={!hideLabel ? "Insights" : undefined}
        value={text}
        onChangeText={handleChange}
        multiline
        numberOfLines={10}
        containerStyle={styles.input}
        inputStyle={[styles.inputText, { minHeight }]}
        placeholder={hideLabel ? "Enter your insights..." : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
  },
  inputText: {
    textAlignVertical: 'top',
  },
});



