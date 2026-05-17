import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function InputField(props) {
  return <TextInput style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15
  }
});
