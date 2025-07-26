import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import JournalScreen from './components/JournalScreen';
import BreathingScreen from './components/BreathingScreen';
import HistoryStatsScreen from './components/HistoryStatsScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="HistoryStats" component={HistoryStatsScreen} />
    </Stack.Navigator>
  );
}