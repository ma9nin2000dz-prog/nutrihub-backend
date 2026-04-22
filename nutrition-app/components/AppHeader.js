import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppHeader({ title }) {
  return (
    <View style={styles.header}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, backgroundColor: 'green' },
  text: { color: 'white', fontSize: 20, fontWeight: 'bold' }
});
