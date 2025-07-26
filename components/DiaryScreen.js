import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Share,
  ImageBackground,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
  Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { PieChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

const moodTags = [
  { emoji: '😊', label: 'Happy', color: '#FFD166', bgColor: 'rgba(255, 209, 102, 0.1)' },
  { emoji: '😢', label: 'Sad', color: '#06D6A0', bgColor: 'rgba(6, 214, 160, 0.1)' },
  { emoji: '😠', label: 'Angry', color: '#EF476F', bgColor: 'rgba(239, 71, 111, 0.1)' },
  { emoji: '😌', label: 'Calm', color: '#118AB2', bgColor: 'rgba(17, 138, 178, 0.1)' },
  { emoji: '😭', label: 'Depressed', color: '#073B4C', bgColor: 'rgba(7, 59, 76, 0.1)' },
  { emoji: '💭', label: 'Thoughts', color: '#7209B7', bgColor: 'rgba(114, 9, 183, 0.1)' }
];

const quotes = [
  "The journal is a vehicle for my sense of self-worth.",
  "Journal writing is a voyage to the interior.",
  "Keeping a journal of what's going on in your life is a good way to help you distill what's important and what's not.",
  "Journal writing gives us insights into who we are, who we were, and who we can become.",
  "A personal journal is an ideal environment in which to become.",
  "Writing in a journal reminds you of your goals and of your learning in life."
];

export default function DiaryScreen() {
  const scrollViewRef = useRef();
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showPasscodeModal, setShowPasscodeModal] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcode, setPasscode] = useState('1234');
  const [changeMode, setChangeMode] = useState(false);
  const [selectedMood, setSelectedMood] = useState(moodTags[0]);
  const [filterSentiment, setFilterSentiment] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [randomQuote, setRandomQuote] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const loadData = async () => {
      const savedEntries = await AsyncStorage.getItem('diaryEntries');
      const savedPasscode = await AsyncStorage.getItem('diaryPasscode');
      if (savedEntries) setEntries(JSON.parse(savedEntries));
      if (savedPasscode) setPasscode(savedPasscode);
      setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      ]).start();
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('diaryEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSave = () => {
    if (text.trim() === '') {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }
    
    const sentiment = analyzeSentiment(text);
    const entry = {
      text,
      date: selectedDate.toLocaleDateString(),
      timestamp: selectedDate.getTime(),
      sentiment,
      mood: selectedMood.emoji,
      moodColor: selectedMood.color,
      moodBgColor: selectedMood.bgColor,
      moodLabel: selectedMood.label
    };
    
    if (editingIndex !== null) {
      const updated = [...entries];
      updated[editingIndex] = entry;
      setEntries(updated);
      setEditingIndex(null);
    } else {
      setEntries([entry, ...entries]);
    }
    
    setText('');
    setSelectedMood(moodTags[0]);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleDelete = (index) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = entries.filter((_, i) => i !== index);
          setEntries(updated);
        },
      },
    ]);
  };

  const handleEdit = (index) => {
    setText(entries[index].text);
    setSelectedDate(new Date(entries[index].date));
    const mood = moodTags.find(tag => tag.emoji === entries[index].mood) || moodTags[0];
    setSelectedMood(mood);
    setEditingIndex(index);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const unlockDiary = () => {
    if (passcodeInput === passcode) {
      setShowPasscodeModal(false);
      setPasscodeInput('');
      Keyboard.dismiss();
    } else {
      Alert.alert('Incorrect Passcode', 'Please try again.');
    }
  };

  const changePasscode = async () => {
    if (passcodeInput.length < 4) {
      Alert.alert('Invalid Passcode', 'Passcode must be at least 4 digits');
      return;
    }
    await AsyncStorage.setItem('diaryPasscode', passcodeInput);
    setPasscode(passcodeInput);
    setShowPasscodeModal(false);
    setPasscodeInput('');
    Keyboard.dismiss();
    Alert.alert('Success', 'Passcode updated successfully');
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setSelectedDate(selected);
  };

  const exportEntries = async () => {
    if (entries.length === 0) {
      Alert.alert('No Entries', 'There are no entries to export.');
      return;
    }
    
    let content = entries
      .map(
        (e) =>
          `📅 ${e.date} | ${e.mood} ${e.moodLabel}\nSentiment: ${e.sentiment}\n${e.text}\n---\n`
      )
      .join('\n');
    
    try {
      await Share.share({
        title: 'My Journal Entries',
        message: content,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share entries.');
    }
  };

  const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();
    const positiveWords = ['happy', 'joy', 'great', 'awesome', 'amazing', 'love', 'wonderful'];
    const negativeWords = ['sad', 'angry', 'bad', 'hate', 'terrible', 'awful', 'depressed'];
    
    const positiveCount = positiveWords.filter(word => lower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  };

  const filteredEntries = entries.filter((e) => {
    const matchSentiment = filterSentiment ? e.sentiment === filterSentiment : true;
    const matchDate = searchDate ? e.date.includes(searchDate.trim()) : true;
    return matchSentiment && matchDate;
  });

  const getSentimentStats = () => {
    const stats = {
      Positive: 0,
      Negative: 0,
      Neutral: 0
    };
    
    entries.forEach(entry => {
      stats[entry.sentiment]++;
    });
    
    return Object.entries(stats).map(([key, value]) => ({
      name: key,
      count: value,
      color: key === 'Positive' ? '#4CAF50' : key === 'Negative' ? '#F44336' : '#2196F3',
      legendFontColor: '#333',
      legendFontSize: 14
    }));
  };

  const getMoodStats = () => {
    const moodCounts = {};
    
    moodTags.forEach(mood => {
      moodCounts[mood.label] = entries.filter(e => e.mood === mood.emoji).length;
    });
    
    return Object.entries(moodCounts).map(([key, value]) => ({
      name: key,
      count: value,
      color: moodTags.find(m => m.label === key).color,
      legendFontColor: '#333',
      legendFontSize: 14
    }));
  };

  const resetForm = () => {
    setText('');
    setSelectedMood(moodTags[0]);
    setSelectedDate(new Date());
    setEditingIndex(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(245,245,245,0.9)']}
        style={styles.overlay}
      >
        {/* Passcode Modal */}
   <Modal visible={showPasscodeModal} transparent={true} animationType="fade">
  <View style={styles.modalContainer}>
    <Animatable.View 
      animation="zoomIn"
      duration={600}
      style={styles.modalContent}
    >
      <View style={styles.modalIconContainer}>
        <MaterialCommunityIcons 
          name={changeMode ? "lock-reset" : "lock"} 
          size={48} 
          color="#5E8B7E" 
        />
      </View>
      <Text style={styles.modalTitle}>
        {changeMode ? 'Set New Passcode' : 'Welcome to Your Diary'}
      </Text>
      <Text style={styles.modalSubtitle}>
        {changeMode ? 'Enter a new 4-digit passcode' : 'Enter your passcode to continue'}
      </Text>
     
      <TextInput
        style={styles.passcodeInput}
        value={passcodeInput}
        onChangeText={setPasscodeInput}
        placeholder="Enter 4-digit code"
        placeholderTextColor="#95a5a6"
        keyboardType="number-pad"
        maxLength={4}
        autoFocus
        secureTextEntry
      />
      
      {/* Visual representation of the passcode */}
      <View style={styles.passcodeDotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View 
            key={i} 
            style={[
              styles.passcodeDot,
              i < passcodeInput.length && styles.passcodeDotFilled
            ]}
          />
        ))}
      </View>
      
      <TouchableOpacity
        onPress={changeMode ? changePasscode : unlockDiary}
        style={styles.modalButton}
        activeOpacity={0.8}
        disabled={passcodeInput.length !== 4}
      >
        <LinearGradient
          colors={['#5E8B7E', '#4B7B6F']}
          style={[styles.modalButtonGradient, passcodeInput.length !== 4 && { opacity: 0.6 }]}
        >
          <Text style={styles.modalButtonText}>
            {changeMode ? 'Save Passcode' : 'Unlock Diary'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {!changeMode && (
        <TouchableOpacity 
          onPress={() => {
            setChangeMode(true);
            setPasscodeInput('');
          }}
          style={styles.changePasscodeButton}
        >
          <Text style={styles.changePasscodeText}>Change Passcode</Text>
        </TouchableOpacity>
      )}
    </Animatable.View>
  </View>
</Modal>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
         
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.headerTitle}>Dear Diary,</Text>
            <Text style={styles.headerSubtitle}>{randomQuote}</Text>
          </Animated.View>

          <Animatable.View 
            animation="fadeInUp"
            delay={100}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Entry Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar" size={22} color="#5E8B7E" />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Feather name="chevron-down" size={18} color="#95a5a6" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
                themeVariant="light"
              />
            )}
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp"
            delay={200}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            <View style={styles.moodGrid}>
              <View style={styles.moodRow}>
                {moodTags.slice(0, 3).map((mood, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedMood(mood)}
                    style={[
                      styles.moodButton,
                      selectedMood.emoji === mood.emoji && {
                        backgroundColor: mood.bgColor,
                        borderColor: mood.color
                      }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.moodEmoji, { color: mood.color }]}>
                      {mood.emoji}
                    </Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.moodRow}>
                {moodTags.slice(3, 6).map((mood, i) => (
                  <TouchableOpacity
                    key={i+3}
                    onPress={() => setSelectedMood(mood)}
                    style={[
                      styles.moodButton,
                      selectedMood.emoji === mood.emoji && {
                        backgroundColor: mood.bgColor,
                        borderColor: mood.color
                      }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.moodEmoji, { color: mood.color }]}>
                      {mood.emoji}
                    </Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp"
            delay={300}
            style={styles.card}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Thoughts</Text>
              <Text style={styles.charCount}>{text.length}/1000</Text>
            </View>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Pour your heart out here..."
              placeholderTextColor="#95a5a6"
              multiline
              style={styles.textInput}
              textAlignVertical="top"
              maxLength={1000}
            />
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp"
            delay={400}
            style={styles.buttonRow}
          >
            <TouchableOpacity
              onPress={resetForm}
              style={styles.resetButton}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.button,
                styles.primaryButton,
                editingIndex !== null && styles.updateButton
              ]}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={editingIndex !== null ? ['#F39C12', '#E67E22'] : ['#5E8B7E', '#4B7B6F']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {editingIndex !== null ? 'Update Entry' : 'Save Entry'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

         
          {entries.length > 0 && (
            <Animatable.View 
              animation="fadeInUp"
              delay={500}
              style={styles.statsToggleContainer}
            >
              <TouchableOpacity
                onPress={() => setShowStats(!showStats)}
                style={styles.statsToggleButton}
                activeOpacity={0.7}
              >
                <Text style={styles.statsToggleText}>
                  {showStats ? 'Hide Statistics' : 'Show Statistics'}
                </Text>
                <Ionicons 
                  name={showStats ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#5E8B7E" 
                />
              </TouchableOpacity>
            </Animatable.View>
          )}

          {/* Statistics */}
          {showStats && entries.length > 0 && (
            <Animatable.View 
              animation="fadeIn"
              style={styles.statsContainer}
            >
              <Text style={styles.statsTitle}>Your Journal Insights</Text>
              
              <View style={styles.chartRow}>
                <View style={styles.chartContainer}>
                  <Text style={styles.chartLabel}>Sentiment Analysis</Text>
                  <PieChart
                    data={getSentimentStats()}
                    width={width - 60}
                    height={160}
                    chartConfig={chartConfig}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                    hasLegend
                  />
                </View>
                
                <View style={styles.chartContainer}>
                  <Text style={styles.chartLabel}>Mood Distribution</Text>
                  <PieChart
                    data={getMoodStats()}
                    width={width - 60}
                    height={160}
                    chartConfig={chartConfig}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                    hasLegend
                  />
                </View>
              </View>
              
              <View style={styles.statsSummary}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{entries.length}</Text>
                  <Text style={styles.statLabel}>Total Entries</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {entries.length > 0 ? 
                      new Date(Math.min(...entries.map(e => e.timestamp))).toLocaleDateString() : 
                      'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>First Entry</Text>
                </View>
              </View>
            </Animatable.View>
          )}

          {entries.length > 0 && (
            <Animatable.View 
              animation="fadeInUp"
              delay={600}
              style={styles.card}
            >
              <Text style={styles.sectionTitle}>Filter Entries</Text>
              
              <View style={styles.filterRow}>
                <View style={styles.filterInputContainer}>
                  <Ionicons name="search" size={18} color="#95a5a6" style={styles.filterIcon} />
                  <TextInput
                    placeholder="Search by date..."
                    placeholderTextColor="#95a5a6"
                    value={searchDate}
                    onChangeText={setSearchDate}
                    style={styles.filterInput}
                  />
                </View>
                
                <TouchableOpacity
                  onPress={() => setFilterSentiment('Positive')}
                  style={[
                    styles.sentimentFilterButton,
                    filterSentiment === 'Positive' && styles.sentimentFilterButtonActive
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.sentimentFilterText,
                    filterSentiment === 'Positive' && styles.sentimentFilterTextActive
                  ]}>
                    Positive
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setFilterSentiment('Neutral')}
                  style={[
                    styles.sentimentFilterButton,
                    filterSentiment === 'Neutral' && styles.sentimentFilterButtonActive
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.sentimentFilterText,
                    filterSentiment === 'Neutral' && styles.sentimentFilterTextActive
                  ]}>
                    Neutral
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setFilterSentiment('Negative')}
                  style={[
                    styles.sentimentFilterButton,
                    filterSentiment === 'Negative' && styles.sentimentFilterButtonActive
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.sentimentFilterText,
                    filterSentiment === 'Negative' && styles.sentimentFilterTextActive
                  ]}>
                    Negative
                  </Text>
                </TouchableOpacity>
              </View>
              
              {(filterSentiment || searchDate) && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchDate('');
                    setFilterSentiment('');
                  }}
                  style={styles.clearFiltersButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearFiltersText}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              )}
            </Animatable.View>
          )}

          {filteredEntries.length > 0 ? (
            <Animatable.View 
              animation="fadeInUp"
              delay={700}
            >
              <View style={styles.entriesHeader}>
                <Text style={styles.entriesTitle}>Your Journal Entries</Text>
                <TouchableOpacity
                  onPress={exportEntries}
                  style={styles.exportButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="share-social" size={18} color="#5E8B7E" />
                  <Text style={styles.exportButtonText}>Export</Text>
                </TouchableOpacity>
              </View>
              
              {filteredEntries.map((item, index) => {
                const moodData = moodTags.find(m => m.emoji === item.mood) || moodTags[0];
                return (
                  <Animatable.View 
                    key={index}
                    animation="fadeIn"
                    duration={500}
                    delay={index * 100}
                    style={[
                      styles.entryCard,
                      { 
                        borderLeftColor: moodData.color,
                        backgroundColor: 'white'
                      }
                    ]}
                  >
                    <View style={styles.entryHeader}>
                      <View style={styles.entryMoodContainer}>
                        <Text style={[styles.entryMood, { color: moodData.color }]}>
                          {item.mood}
                        </Text>
                        <Text style={styles.entryMoodLabel}>{item.moodLabel}</Text>
                      </View>
                      <Text style={styles.entryDate}>{item.date}</Text>
                    </View>
                    
                    <Text style={styles.entryText}>{item.text}</Text>
                    
                    <View style={styles.entryFooter}>
                      <View style={[
                        styles.sentimentBadge,
                        item.sentiment === 'Positive' && styles.positiveSentiment,
                        item.sentiment === 'Negative' && styles.negativeSentiment,
                        item.sentiment === 'Neutral' && styles.neutralSentiment,
                      ]}>
                        <Text style={styles.sentimentText}>{item.sentiment}</Text>
                      </View>
                      
                      <View style={styles.entryActions}>
                        <TouchableOpacity 
                          onPress={() => handleEdit(index)} 
                          style={styles.editButton}
                        >
                          <Ionicons name="create-outline" size={20} color="#5E8B7E" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDelete(index)} 
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#e63946" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animatable.View>
                );
              })}
            </Animatable.View>
          ) : entries.length > 0 ? (
            <Animatable.View 
              animation="fadeInUp"
              delay={700}
              style={styles.noResultsContainer}
            >
              <Ionicons name="search-outline" size={48} color="#95a5a6" />
              <Text style={styles.noResultsText}>No entries match your filters</Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchDate('');
                  setFilterSentiment('');
                }}
                style={styles.clearFiltersButtonLarge}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFiltersTextLarge}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          ) : (
            <Animatable.View 
              animation="fadeInUp"
              delay={700}
              style={styles.emptyStateContainer}
            >
              <Ionicons name="book-outline" size={48} color="#95a5a6" />
              <Text style={styles.emptyStateTitle}>Your Journal is Empty</Text>
              <Text style={styles.emptyStateText}>
                Start by writing your first entry. Your future self will thank you!
              </Text>
            </Animatable.View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        {entries.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            duration={500}
            delay={1000}
            style={styles.fabContainer}
          >
            <TouchableOpacity 
              style={styles.fab}
              onPress={resetForm}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#5E8B7E', '#4B7B6F']}
                style={styles.fabGradient}
              >
                <Ionicons name="add" size={28} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#5E8B7E',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#f7f1f1ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderColor:'#5E8B7E',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5E8B7E',
  },
  dateText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 10,
    marginRight: 6,
    flex: 1,
  },
  moodGrid: {
    marginBottom: -10,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moodButton: {
    width: '32%',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5E8B7E',
    backgroundColor: '#F8F9F9',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E',
  },
  textInput: {
    minHeight: 180,
    backgroundColor: '#F8F9F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#5E8B7E',
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resetButton: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#666',
    borderWidth: 1,
    borderColor: '#5E8B7E',
    marginRight: 10,
    height: 52,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    height: 52,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    marginLeft: 10,
  },
  updateButton: {
    backgroundColor: '#F39C12',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  statsToggleContainer: {
    marginBottom: 20,
  },
  statsToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#666',
  },
  statsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5E8B7E',
    marginRight: 8,
  },
  statsContainer: {
    backgroundColor: '#c7e7deff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartContainer: {
    flex: 1,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#5E8B7E',
    marginBottom: 10,
    width: '100%',
  },
  filterIcon: {
    marginRight: 10,
  },
  filterInput: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
    height: '100%',
  },
  sentimentFilterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5E8B7E',
    backgroundColor: '#F8F9F9',
    marginBottom: 10,
    width: '32%',
  },
  sentimentFilterButtonActive: {
    backgroundColor: '#5E8B7E',
    borderColor: '#5E8B7E',
  },
  sentimentFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
  sentimentFilterTextActive: {
    color: 'white',
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5E8B7E',
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5E8B7E',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5E8B7E',
    marginLeft: 6,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entryMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryMood: {
    fontSize: 28,
  },
  entryMoodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E',
    marginLeft: 12,
  },
  entryDate: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  entryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
    marginBottom: 20,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentimentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  positiveSentiment: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  negativeSentiment: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  neutralSentiment: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
  },
  sentimentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  entryActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 6,
    marginLeft: 10,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 10,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 16,
    textAlign: 'center',
  },
  clearFiltersButtonLarge: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#5E8B7E',
    borderRadius: 12,
  },
  clearFiltersTextLarge: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIconContainer: {
    backgroundColor: 'rgba(94, 139, 126, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#7F8C8D',
    marginBottom: 24,
    textAlign: 'center',
  },
  passcodeDisplay: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#F8F9F9',
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  passcodeText: {
    fontSize: 24,
    letterSpacing: 8,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  passcodeInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  modalButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  modalButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  changePasscodeButton: {
    padding: 8,
  },
  changePasscodeText: {
    color: '#5E8B7E',
    fontWeight: '500',
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passcodeInput: {
  position: 'absolute',
  width: '100%',
  height: 50,
  opacity: 1, 
  color: 'transparent',
  backgroundColor: 'transparent',
},
passcodeDotsContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginVertical: 20,
},
passcodeDot: {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#95a5a6',
  marginHorizontal: 10,
},
passcodeDotFilled: {
  backgroundColor: '#5E8B7E',
  borderColor: '#5E8B7E',
},
});