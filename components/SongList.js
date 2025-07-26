import React, { useEffect, useState } from 'react';
import { View, Text, Image, Linking, StyleSheet, TouchableOpacity } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { getYouTubeSongs } from '../utils/youtube';

const languages = ['English', 'Hindi', 'Tamil', 'Spanish','Telugu', 'Rajasthani', 'Gujarathi', 'Malayalam', 'Punjabi','Kashmiri', 'Bhojpuri','Assame'];

export default function SongList({ mood }) {
  const [language, setLanguage] = useState('English');
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (mood) {
      (async () => {
        const results = await getYouTubeSongs(mood, language);
        setSongs(results);
      })();
    }
  }, [mood, language]);

  if (!mood) return null;

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.languageLabel}>Choose Language</Text>
      <Picker
        selectedValue={language}
        onValueChange={(value) => setLanguage(value)}
        style={styles.picker}
      >
        {languages.map((lang) => (
          <Picker.Item key={lang} label={lang} value={lang} />
        ))}
      </Picker>
      <Text style={styles.title}>🎵 Mood Songs for "{mood}"</Text>

      {songs.map((song, index) => (
        <View key={index} style={styles.card}>
  <Image source={{ uri: song.thumbnail }} style={styles.thumbnail} />
  <Text style={styles.songTitle}>{song.title}</Text>

  <TouchableOpacity
    style={styles.buttonContainer}
    onPress={() => Linking.openURL(song.url)}
  >
    <Text style={styles.buttonText}>▶ Play on YouTube</Text>
  </TouchableOpacity>
</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
 picker: {
  marginVertical: 8,
  marginHorizontal: 4,
  backgroundColor: '#ffffff',
  // borderRadius: 30,
  backgroundColor: '#fff',
    padding: 14,
    borderRadius: 30,
    marginBottom: 10,
    elevation: 2,
  borderWidth: 1,
  borderColor: 'grey',
  paddingVertical: 2,
  paddingHorizontal: 10,
  color: '#333',
},

buttonContainer: {
  backgroundColor: '#748DAE',     
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 8,
  elevation: 4,                   
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  letterSpacing: 0.5,
},

  card: { backgroundColor: '#f2f2f2', padding: 10, marginBottom: 10, borderRadius: 8 },
  thumbnail: { width: 100, height: 60, marginBottom: 5 ,borderRadius:8},
  songTitle: { fontWeight: '600', marginBottom: 5 },
  languageLabel: {
  fontSize: 17,
  fontWeight: '700',
  marginTop: 12,
  borderRadius: 8 ,
  marginBottom: 1,
  color: '#4a4a4a',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  textAlign: 'left',
  paddingLeft: 4,
},

});
