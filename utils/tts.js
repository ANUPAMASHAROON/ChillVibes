// utils/tts.js
import * as Speech from 'expo-speech';

export const speakQuote = (quote) => {
  Speech.speak(quote);
};
