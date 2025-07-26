import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MoodHistory({ history }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕒Moodify Me</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>No moods tracked yet.</Text>
      ) : (
        history.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <Text>Mood: {entry.mood}</Text>
            <Text style={styles.date}>Date: {entry.date}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#e6f7ff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  date: { fontSize: 12, color: '#555' },
  empty: { fontStyle: 'italic', color: '#777' },
});
