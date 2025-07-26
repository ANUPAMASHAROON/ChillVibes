import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  Animated,
  Easing 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen({ navigation, onLogout }) {
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({});
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
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

    const loadStats = async () => {
      try {
        const data = await AsyncStorage.getItem('moodStats');
        const currentDate = new Date().toDateString();
        let stats = data ? JSON.parse(data) : { streak: 0, points: 0, moodHistory: [], lastLoginDate: null };
        
        // Check and update streak
        if (stats.lastLoginDate) {
          const lastLogin = new Date(stats.lastLoginDate);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastLogin.toDateString() === yesterday.toDateString()) {
            // Consecutive login
            stats.streak += 1;
          } else if (lastLogin.toDateString() !== today.toDateString()) {
            // Broken streak
            stats.streak = 1;
          }
        } else {
          // First time login
          stats.streak = 1;
        }
        
        // Update points (1 point per login)
        stats.points += 1;
        stats.lastLoginDate = currentDate;
        
        await AsyncStorage.setItem('moodStats', JSON.stringify(stats));
        
        setStreak(stats.streak);
        setPoints(stats.points);
        setLastLoginDate(stats.lastLoginDate);
        setWeeklyStats(getWeeklyStats(stats.moodHistory));
        setTotalEntries(stats.moodHistory.length);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, []);

  const getWeeklyStats = (history = []) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const stats = {};
    const moodCounts = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      neutral: 0
    };

    history.forEach(({ date, mood }) => {
      const entryDate = new Date(date);
      if (entryDate >= oneWeekAgo) {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      }
    });

    // Filter out moods with 0 counts
    Object.keys(moodCounts).forEach(mood => {
      if (moodCounts[mood] > 0) {
        stats[mood] = moodCounts[mood];
      }
    });

    return stats;
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      if (onLogout) {
        onLogout();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const moodColors = {
    happy: '#FFD166',
    sad: '#06D6A0',
    angry: '#EF476F',
    anxious: '#7209B7',
    neutral: '#118AB2'
  };

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    neutral: '😐'
  };

  const prepareChartData = () => {
    return Object.entries(weeklyStats).map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      count: count,
      color: moodColors[mood],
      legendFontColor: '#333',
      legendFontSize: 12
    }));
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

  const getAchievementLevel = () => {
    if (streak >= 30) return 'Legendary';
    if (streak >= 14) return 'Master';
    if (streak >= 7) return 'Advanced';
    return 'Beginner';
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.8)', 'rgba(245,245,245,0.95)']}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header Section */}
          <Animated.View 
            style={[
              styles.headerContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.profileHeader}>
              <Text style={styles.title}>My Journal Profile</Text>
              <View style={styles.headerDivider} />
              <View style={styles.profileBadge}>
                <Icon name="crown" size={24} color="#e36c0aff" />
                <Text style={styles.badgeText}>{getAchievementLevel()} Level</Text>
              </View>
            </View>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View 
            style={[
              styles.cardsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Streak Card */}
            <View style={[styles.card, styles.streakCard]}>
              <LinearGradient
                colors={['#FF7E5F', '#FEB47B']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardHeader}>
                  <Icon name="fire" size={24} color="white" />
                  <Text style={styles.cardTitle}>Current Streak</Text>
                </View>
                <Text style={styles.streakValue}>{streak}</Text>
                <Text style={styles.cardUnit}>days in a row</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(streak, 30) * 3.33}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {streak >= 30 ? '🔥 Max streak!' : `${30 - streak} days to legendary`}
                  </Text>
                </View>
                <View style={styles.streakReward}>
                  <Icon name="lightning-bolt" size={16} color="#FFD700" />
                  <Text style={styles.streakRewardText}>+{streak * 2} bonus points</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Points Card */}
            <View style={[styles.card, styles.pointsCard]}>
              <LinearGradient
                colors={['#5E8B7E', '#4B7B6F']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardHeader}>
                  <Icon name="star-circle" size={24} color="white" />
                  <Text style={styles.cardTitle}>Points Collected</Text>
                </View>
                <Text style={styles.pointsValue}>{points}</Text>
                <Text style={styles.cardUnit}>total points</Text>
                <View style={styles.rewardsContainer}>
                  <Icon name="trophy" size={18} color="#FFD700" />
                  <Text style={styles.rewardsText}>
                    {points >= 100 ? `Unlocked ${Math.floor(points/100)} rewards` : `${100 - (points % 100)} to next reward`}
                  </Text>
                </View>
                <View style={styles.pointsBreakdown}>
  <View style={styles.pointsRow}>
    <View style={styles.pointItem}>
      <Icon name="login" size={16} color="white" />
      <Text style={styles.pointsItemText}>Daily: {points}</Text>
    </View>
    <View style={styles.pointItem}>
      <Icon name="fire" size={16} color="white" />
      <Text style={styles.pointsItemText}>Streak: {streak * 2}</Text>
    </View>
  </View>
</View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Stats Overview */}
          <Animated.View 
            style={[
              styles.statsOverview,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.statBox}>
              <Icon name="notebook" size={24} color="#5E8B7E" />
              <Text style={styles.statBoxValue}>{totalEntries}</Text>
              <Text style={styles.statBoxLabel}>Total Entries</Text>
            </View>
            <View style={styles.statBox}>
              <Icon name="calendar" size={24} color="#5E8B7E" />
              <Text style={styles.statBoxValue}>
                {lastLoginDate ? new Date(lastLoginDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
              </Text>
              <Text style={styles.statBoxLabel}>Last Active</Text>
            </View>
          </Animated.View>

          {/* Mood Distribution Card */}
          <Animated.View 
            style={[
              styles.card, 
              styles.moodCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.cardHeader}>
              <Icon name="chart-pie" size={24} color="#5E8B7E" />
              <Text style={[styles.cardTitle, { color: '#5E8B7E' }]}>Weekly Mood Summary</Text>
            </View>
            
            {Object.entries(weeklyStats).length > 0 ? (
              <View style={styles.chartContainer}>
                <PieChart
                  data={prepareChartData()}
                  width={width - 60}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="count"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  hasLegend
                />
                
                <View style={styles.moodDetails}>
                  {Object.entries(weeklyStats).map(([mood, count]) => (
                    <View key={mood} style={styles.moodDetailItem}>
                      <View style={styles.moodDetailHeader}>
                        <Text style={[styles.moodDetailEmoji, { color: moodColors[mood] }]}>
                          {moodEmojis[mood]}
                        </Text>
                        <Text style={styles.moodDetailName}>
                          {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.moodDetailCount}>
                        {count} day{count !== 1 ? 's' : ''} ({Math.round((count / 7) * 100)}%)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Icon name="emoticon-sad-outline" size={40} color="#95a5a6" />
                <Text style={styles.noDataText}>No mood data recorded this week</Text>
                <Text style={styles.noDataSubtext}>Start journaling to see your mood patterns</Text>
              </View>
            )}
          </Animated.View>

          {/* Weekly Mood Timeline */}
          {Object.entries(weeklyStats).length > 0 && (
            <Animated.View 
              style={[
                styles.card, 
                styles.timelineCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.cardHeader}>
                <Icon name="chart-line" size={24} color="#5E8B7E" />
                <Text style={[styles.cardTitle, { color: '#5E8B7E' }]}>Mood Timeline</Text>
              </View>
              
              <View style={styles.timelineContainer}>
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const moods = Object.entries(weeklyStats).filter(([_, count]) => count > 0);
                  
                  return (
                    <View key={i} style={styles.timelineDay}>
                      <Text style={styles.timelineDayName}>{dayName}</Text>
                      <View style={styles.timelineMoods}>
                        {moods.map(([mood, _]) => (
                          <View 
                            key={mood} 
                            style={[
                              styles.timelineMoodDot, 
                              { backgroundColor: moodColors[mood] }
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View 
            style={[
              styles.actionsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <LinearGradient
                colors={['#666', '#5E8B7E']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="logout" size={20} color="white" />
                <Text style={styles.buttonText}>Log Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
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
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 25,
  },
  profileHeader: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  headerDivider: {
    height: 4,
    width: '30%',
    backgroundColor: '#5E8B7E',
    marginBottom: 15,
    borderRadius: 2,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  cardsContainer: {
    flexDirection: 'column',
    gap: 15,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  streakCard: {
    width: '100%',
  },
  pointsCard: {
    width: '100%',
  },
  moodCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  timelineCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  streakValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: -5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: -5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  streakReward: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  streakRewardText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  rewardsText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  pointsBreakdown: {
    marginTop: 15,
  },
  pointsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    justifyContent: 'center',
  },
  pointsItemText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 5,
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginVertical: 5,
  },
  statBoxLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  chartContainer: {
    alignItems: 'center',
  },
  moodDetails: {
    width: '100%',
    marginTop: 15,
  },
  moodDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  moodDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodDetailEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  moodDetailName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
  },
  moodDetailCount: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noDataText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 5,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  timelineDay: {
    alignItems: 'center',
  },
  timelineDayName: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  timelineMoods: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  timelineMoodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginVertical: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  diaryButton: {
    backgroundColor: '#5E8B7E',
  },
  logoutButton: {
     marginLeft:80,
    backgroundColor: '#666',
  },
  buttonGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  pointsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},
pointItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
},
});