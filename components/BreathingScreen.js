import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const BreathingScreen = ({ route, navigation }) => {
  const { mood } = route.params;
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(4);
  const [isRunning, setIsRunning] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  
  const breathingPatterns = {
    sad: { inhale: 4, hold: 5, exhale: 6 },
    depression: { inhale: 5, hold: 2, exhale: 7 },
    alone: { inhale: 4, hold: 4, exhale: 6 },
    angry: { inhale: 4, hold: 0, exhale: 6 },
    happy: { inhale: 4, hold: 2, exhale: 4 },
    default: { inhale: 4, hold: 4, exhale: 6 }
  };
  
  const pattern = breathingPatterns[mood] || breathingPatterns.default;
  
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) {
            if (phase === 'inhale') {
              setPhase('hold');
              return pattern.hold;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return pattern.exhale;
            } else {
              setPhase('inhale');
              return pattern.inhale;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [isRunning, phase]);
  
  useEffect(() => {
    if (phase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: pattern.inhale * 1000,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'exhale') {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: pattern.exhale * 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [phase]);
  
  const getInstructions = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return '';
    }
  };
  
  const getColor = () => {
    switch (phase) {
      case 'inhale': return '#4CAF50';
      case 'hold': return '#FFC107';
      case 'exhale': return '#2196F3';
      default: return '#9C27B0';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#5E8B7E" />
        </TouchableOpacity>
        <Text style={styles.title}>Peaceful Pauses</Text>
        <View style={{ width: 15 }} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.instructions}>{getInstructions()}</Text>
        
        <Animated.View style={[styles.circle, { 
          transform: [{ scale: scaleAnim }],
          backgroundColor: getColor(),
        }]}>
          <Text style={styles.countText}>{count}</Text>
        </Animated.View>
        
        <Text style={styles.phaseText}>
          {phase === 'inhale' && `Inhale for ${pattern.inhale} seconds`}
          {phase === 'hold' && `Hold for ${pattern.hold} seconds`}
          {phase === 'exhale' && `Exhale for ${pattern.exhale} seconds`}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: isRunning ? '#F44336' : '#5E8B7E' }]}
        onPress={() => setIsRunning(!isRunning)}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Pause' : 'Start'}
        </Text>
      </TouchableOpacity>
      
      <LottieView 
        source={require('../assets/Breathe.json')}
        autoPlay
        loop
        style={styles.backgroundAnimation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    zIndex: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#5E8B7E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  instructions: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#5E8B7E',
  },
  circle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  countText: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
  },
  phaseText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  button: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backgroundAnimation: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
    opacity: 0.3,
  },
});

export default BreathingScreen;
