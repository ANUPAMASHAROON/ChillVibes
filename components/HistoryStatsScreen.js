import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const HistoryStatsScreen = ({ route, navigation }) => {
  const { history } = route.params;
  
  const moodCounts = history.reduce((acc, entry) => {
    const mood = entry.mood.toLowerCase();
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    population: count, 
    color: getMoodColor(mood),
    legendFontColor: '#333',
    legendFontSize: 14,
  }));
  
  function getMoodColor(mood) {
    const colors = {
      happy: '#FFC107',
      sad: '#2196F3',
      angry: '#F44336',
      depression: '#4CAF50',
      alone: '#9C27B0',
      default: '#607D8B'
    };
    return colors[mood.toLowerCase()] || colors.default; 
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Mood History</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {chartData.length > 0 ? (
          <>
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population" 
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
            
            <View style={styles.statsContainer}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.statItem}>
                  <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                  <Text style={styles.statText}>
                    {item.name}: {item.population} time{item.population !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>No mood history yet</Text>
        )}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDDAD0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 20,
  },
  statsContainer: {
    marginTop: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  statText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default HistoryStatsScreen;