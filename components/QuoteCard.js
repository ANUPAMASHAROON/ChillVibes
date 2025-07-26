import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchQuote } from '../utils/fetchQuote';

const moodQuotes = {
  sad: 'This too shall pass. You got this.',
  happy: 'Spread your joy — it’s contagious!',
  anxious: 'Breathe. One step at a time.',
  angry: 'Pause. Think. Peace follows.',
  lonely: 'You are never truly alone.',
};

export default function QuoteCard({ mood }) {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (mood && moodQuotes[mood]) {
        setQuote(moodQuotes[mood]);
      } else {
        const randomQuote = await fetchQuote();
        setQuote(randomQuote);
      }
      setLoading(false);
    };
    load();
  }, [mood]);

  if (loading) return <ActivityIndicator size="large" color="#333" />;

  return (
    <View style={styles.card}>
      <Text style={styles.quote}>“{quote}”</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff9c4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
    textAlign: 'center',
  },
});
