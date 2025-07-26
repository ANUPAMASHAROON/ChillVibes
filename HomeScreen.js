import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  Easing,
  ImageBackground,
  Dimensions,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MoodInput from './components/MoodInput';
import MoodHistory from './components/MoodHistory';
import QuoteCard from './components/QuoteCard';
import MoodBot from './components/MoodBot';
import SongList from './components/SongList';
import JournalScreen from './components/JournalScreen';
import BreathingScreen from './components/BreathingScreen';
import HistoryStatsScreen from './components/HistoryStatsScreen';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const moodThemes = {
  sad: {
    image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3',
    color: '#2196F3',
    gradient: ['#2196F3', '#64B5F6']
  },
  depression: {
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#81C784']
  },
  alone: {
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#BA68C8']
  },
 angry: {
image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3',
color:'#C62828',
gradient: ['#C62828', '#EF5350']  
},
  happy: {
  image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3', // Bright yellow flowers
  color: '#FFE082',  
  gradient: ['#FFEE58', '#FFF59D'],  
},
  default: {
    image: 'https://unsplash.com/photos/the-water-is-reflecting-the-sunlight-on-the-sand-K0U0eSAjFGU',
    color: '#607D8B',
    gradient: ['#607D8B', '#90A4AE']
  }
};

const moodColors = {
  sad: '#2196F3',
  depression: '#4CAF50',
  alone: '#9C27B0',
  angry: '#F44336',
  happy: '#FFC107',
  default: '#5E8B7E',
};

const moodIcons = {
  sad: 'emoticon-sad-outline',
  depression: 'emoticon-cry-outline',
  alone: 'emoticon-sad-outline',
  angry: 'emoticon-angry-outline',
  happy: 'emoticon-happy-outline',
  default: 'emoticon-neutral-outline'
};

const moodGoals = {
  sad: '🌤 Try taking a short walk outside to lift your spirit',
  depression: '🧩 Break tasks into small pieces and celebrate each one',
  alone: '📱 Reach out to a friend or family member today',
  angry: '🧊 Pause and count to 10. Let calmness return',
  happy: '🌟 Share your joy with someone today!',
  default: '🎯 Do one kind thing for yourself today'
};

const breathingGuides = {
  sad: '🫁 Breathe in for 4 seconds, hold for 5, out for 6. Repeat 3 times',
  depression: '🧘 Focus on your breath. Inhale slowly, exhale gently',
  alone: '🌬 Try alternate nostril breathing for calm',
  angry: '🔥 Take 5 deep belly breaths — slowly and mindfully',
  happy: '✨ Do a gratitude breath: inhale joy, exhale thanks',
  default: '🌿 Breathe deep and slow to refresh your mind'
};

const journalPrompts = {
  sad: 'Write about what might be causing your sadness and one small thing that could help',
  depression: 'List three things you appreciate about yourself, no matter how small',
  alone: 'Describe a connection you value and how you might nurture it',
  angry: 'Write about what triggered your anger and how you might respond differently',
  happy: 'Capture this happy moment in detail to revisit later',
  default: 'Reflect on something you learned about yourself recently'
};

const HomeScreen = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentMood, setCurrentMood] = useState('');
  const [greeting, setGreeting] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMoodSubmit = (mood) => {
    const entry = {
      id: Date.now().toString(),
      mood,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMoodHistory([entry, ...moodHistory]);
    setCurrentMood(mood.toLowerCase());
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const moodGoal = moodGoals[currentMood] || moodGoals.default;
  const breathingTip = breathingGuides[currentMood] || breathingGuides.default;
  const journalPrompt = journalPrompts[currentMood] || journalPrompts.default;
  const moodColor = moodColors[currentMood] || moodColors.default;
  const moodIcon = moodIcons[currentMood] || moodIcons.default;

  // New feature: Mood statistics
  const moodStats = moodHistory.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const renderData = [
    { type: 'header', content: null },
    { type: 'greeting', content: null },
    { type: 'moodHeader', content: currentMood },
    { type: 'moodInput', content: null },
    { type: 'quote', content: currentMood },
    { type: 'stats', content: moodStats },
    { type: 'goal', content: moodGoal },
    { type: 'breathing', content: breathingTip },
    { type: 'journal', content: journalPrompt },
    { type: 'songs', content: currentMood },
    { type: 'history', content: moodHistory },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
  return (
    <View style={styles.headerContainer}>
      {currentMood !== '' && (
        <TouchableOpacity 
          onPress={() => setCurrentMood('')}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#666" />
        </TouchableOpacity>
      )}
      
      {/* Replace Image with Lottie Animation */}
      <LottieView
        source={require('./assets/Mood emoji with animation.json')}
        autoPlay
        loop
        style={styles.lottieLogo}
        resizeMode="contain"
      />
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('HistoryStats', { history: moodHistory })}
        style={styles.historyButton}
      >
        <Feather name="bar-chart-2" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
      case 'greeting':
        return !currentMood ? (
          <Animatable.View 
            animation="fadeIn" 
            duration={1500}
            style={styles.greetingContainer}
          >
            <Text style={styles.greetingText}>Hey, Comrade..!</Text>
            <Text style={styles.subGreetingText}>{greeting}! How are you feeling today?</Text>
            <View style={styles.divider} />
          </Animatable.View>
        ) : null;
      case 'moodHeader':
        return currentMood !== '' ? (
          <Animatable.View 
            animation="pulse" 
            iterationCount={1}
            style={[styles.moodHeaderCard, { backgroundColor: moodColor }]}
          >
            <MaterialCommunityIcons 
              name={moodIcon} 
              size={32} 
              color="white" 
              style={styles.moodIcon}
            />
            <Text style={styles.moodHeaderText}>
              You're feeling: {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
            </Text>
          </Animatable.View>
        ) : null;
      case 'moodInput':
        return !currentMood ? (
          <Animatable.View animation="fadeInUp" delay={300}>
            <MoodInput onSubmit={handleMoodSubmit} />
          </Animatable.View>
        ) : null;
      case 'quote':
        return (
          <Animatable.View animation="fadeIn" delay={500}>
            <QuoteCard mood={item.content} color={moodColor} />
          </Animatable.View>
        );
      case 'stats':
        return Object.keys(item.content).length > 0 ? (
          <Animatable.View animation="fadeInRight" delay={400}>
            <View style={[styles.card, { borderColor: moodColor }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="stats-chart-outline" size={24} color={moodColor} />
                <Text style={[styles.cardTitle, { color: moodColor }]}>Your Mood Stats</Text>
              </View>
              <View style={styles.statsContainer}>
                {Object.entries(item.content).map(([mood, count]) => (
                  <View key={mood} style={styles.statItem}>
                    <Text style={[styles.statText, { color: moodColors[mood] || moodColors.default }]}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}: {count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animatable.View>
        ) : null;
      case 'goal':
        return (
          <Animatable.View animation="fadeInLeft" delay={400}>
            <View style={[styles.card, { borderColor: moodColor }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="ribbon-outline" size={24} color={moodColor} />
                <Text style={[styles.cardTitle, { color: moodColor }]}>Today's Mood Goal</Text>
              </View>
              <Text style={styles.cardText}>{item.content}</Text>
            </View>
          </Animatable.View>
        );
      case 'breathing':
        return (
          <Animatable.View animation="fadeInRight" delay={400}>
            <View style={[styles.card, { borderColor: moodColor }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="leaf-outline" size={24} color={moodColor} />
                <Text style={[styles.cardTitle, { color: moodColor }]}>Breathing Exercise</Text>
              </View>
              <Text style={styles.cardText}>{item.content}</Text>
              <TouchableOpacity 
  style={[styles.breathingButton, { backgroundColor: moodColor }]}
  onPress={() => navigation.navigate('Breathing', { mood: currentMood })}
>
  <Text style={styles.breathingButtonText}>Start Guided Breathing</Text>
</TouchableOpacity>
            </View>
          </Animatable.View>
        );
      
      case 'songs':
        return (
          <Animatable.View animation="fadeInUp" delay={500}>
            <SongList mood={item.content} color={moodColor} />
          </Animatable.View>
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground 
      source={{ uri: moodThemes[currentMood]?.image || moodThemes.default.image }}
      style={styles.fullScreenContainer}
      blurRadius={currentMood ? 3 : 1}
      resizeMode="cover"
    >
     
<View style={[
  StyleSheet.absoluteFill, 
  { 
    backgroundColor: currentMood 
      ? `rgba(${hexToRgb(moodColor).r}, ${hexToRgb(moodColor).g}, ${hexToRgb(moodColor).b}, 0.2)` 
      : 'rgba(94, 139, 126, 0.2)' 
  }
]} />

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderData.map((item, index) => (
          <View key={index.toString()}>
            {renderItem({ item, index })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={[styles.floatingBot, { backgroundColor: moodColor }]}
          onPress={() => navigation.navigate('MoodBot')}
        >
          <MaterialCommunityIcons name="robot-happy-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 100,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
    height: 80, 
  },
  
  lottieLogo: {
    width: 180,  
    height: 80,  
    marginHorizontal: 2, 
  },
  
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 10, 
  },
  
  historyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 10, 
  },

  greetingContainer: {
    marginBottom: 30,
    marginTop: 10,
  },
  greetingText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#5E8B7E',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'HelveticaNeue-Bold',
    fontStyle: 'italic',
  },
  subGreetingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'PlayfairDisplay-Black',
    fontStyle: 'italic',
  },
  divider: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: 20,
    width: '40%',
    borderRadius: 3,
  },
  moodHeaderCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodIcon: {
    marginRight: 12,
  },
  moodHeaderText: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  statItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  breathingButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  breathingButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  journalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  journalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    alignItems: 'flex-end',
  },
  floatingBot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 15,
  },
  floatingJournal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    top: -50,
  },
  
});

export default HomeScreen;