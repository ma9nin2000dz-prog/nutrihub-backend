import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PlanCard({ title, price, features, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{price}</Text>
      {features.map((f, i) => (
        <Text key={i}>- {f}</Text>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  price: { fontSize: 20, color: 'green', marginVertical: 10 }
});
