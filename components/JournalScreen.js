import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const JournalScreen = ({ route, navigation }) => {
  const { prompt, mood } = route.params;
  const [entry, setEntry] = useState('');
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Today's Journal</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <View style={styles.promptContainer}>
        <Text style={styles.promptText}>{prompt}</Text>
      </View>
      
      <TextInput
        style={styles.input}
        multiline
        placeholder="Write your thoughts here..."
        value={entry}
        onChangeText={setEntry}
        autoFocus
      />
      
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  promptContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  promptText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#5E8B7E',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default JournalScreen;