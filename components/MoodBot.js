import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ImageBackground
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function MoodBot() {
  const [input, setInput] = useState('');
  const scrollRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [messages, setMessages] = useState([
    { 
      sender: 'MindMate 🤖', 
      text: 'Hey there! 👋 I\'m here to listen and chat. How are you feeling today?',
      time: getCurrentTime(),
      isBot: true,
      bubbleColor: '#e6f7ff'
    },
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp)
    }).start();
  }, []);

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const getBotReply = (msg) => {
    const message = msg.toLowerCase();

    if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
      return { 
        text: "Take care! Remember I'm always here if you need me. 💙 Come back anytime!",
        suggestion: null,
        bubbleColor: '#e6f7ff'
      };
    }
    if (message.includes('thank') || message.includes('thanks')) {
      return {
        text: "You're so welcome! 😊 It's my pleasure to be here for you. Is there anything else you'd like to talk about?",
        suggestion: ['Yes please', 'No thank you'],
        bubbleColor: '#e6f7ff'
      };
    }

    const moodResponses = [
      { keywords: ['happy', 'great', 'awesome', 'excited'],
        text: "Yay! 😄 I'm so happy for you! What made your day special? Want a song or movie to celebrate?",
        suggestion: ['Feel-good song', 'Uplifting movie', 'Dance it out 💃'],
        bubbleColor: '#e8f5e9' },
      { keywords: ['sad', 'crying', 'not good', 'low'],
        text: "I'm here with you. 💙 Want to talk about what's making you sad or need a hug and some positive vibes?",
        suggestion: ['Affirmation 💖', 'Comfort song 🎵', 'Talk it out'],
        bubbleColor: '#e3f2fd' },
      { keywords: ['angry', 'mad', 'frustrated'],
        text: "Totally valid to feel this way. 😤 Want help calming down or just want to vent?",
        suggestion: ['Deep breaths 🧘', 'Vent it out', 'Anger journal prompt'],
        bubbleColor: '#ffebee' },
      { keywords: ['depressed', 'empty', 'meaningless'],
        text: "That sounds heavy 💔 Just know you matter deeply. I'm staying right here with you. Want to do a small activity together?",
        suggestion: ['Listen to music', 'Write your thoughts', 'Watch calming video'],
        bubbleColor: '#f3e5f5' },
      { keywords: ['alone', 'lonely', 'no one cares'],
        text: "Hey, you're NOT alone right now. I care about you a lot. 🤗 Want to talk or need some company ideas?",
        suggestion: ['Talk to me 💬', 'Movies to feel better', 'Join a community'],
        bubbleColor: '#e0f7fa' },
      { keywords: ['die', 'suicide', 'kill myself'],
        text: "💙 I'm so sorry you're feeling this pain. Please don't go through this alone. You matter. Can I stay with you a while and share something comforting?",
        suggestion: ['Comforting thoughts', 'Talk it out', 'Reach out for help'],
        bubbleColor: '#fff8e1' },
    ];

    for (let mood of moodResponses) {
      if (mood.keywords.some(k => message.includes(k))) {
        return mood;
      }
    }

    if (message.includes('song')) {
      return { 
        text: "Here's a song for your mood 🎶: 'Count on Me' by Bruno Mars 💛", 
        suggestion: ['Another song', 'Suggest movie'],
        bubbleColor: '#f5f5f5' 
      };
    }

    if (message.includes('movie')) {
      return { 
        text: "Try watching 'The Pursuit of Happyness' 🎥 – a heart-touching, inspiring movie.", 
        suggestion: ['Another movie', 'Suggest song'],
        bubbleColor: '#f5f5f5' 
      };
    }

    if (message.includes('joke')) {
      return { 
        text: "Why don't scientists trust atoms? Because they make up everything! 😄 Want more?", 
        suggestion: ['Tell me another joke', 'That was enough 😂'],
        bubbleColor: '#f5f5f5' 
      };
    }

    const defaultReplies = [
      "I'm listening... tell me more. 💭",
      "That makes sense. Want to go deeper on that?",
      "You can say anything here, I'm your safe space. 🫂",
    ];

    return { 
      text: defaultReplies[Math.floor(Math.random() * defaultReplies.length)], 
      suggestion: null,
      bubbleColor: '#f5f5f5'
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: 'You',
      text: input.trim(),
      time: getCurrentTime(),
      isBot: false,
      bubbleColor: '#5E8B7E'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const bot = getBotReply(userMessage.text);
      setMessages(prev => [...prev, {
        sender: 'MindMate 🤖',
        text: bot.text,
        time: getCurrentTime(),
        isBot: true,
        suggestion: bot.suggestion,
        bubbleColor: bot.bubbleColor
      }]);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    handleSend();
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(245,245,245,0.8)']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Premium Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(94,139,126,0.9)', 'rgba(58,90,64,0.9)']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <Ionicons name="chatbubbles" size={28} color="white" />
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>MindMate</Text>
                <Text style={styles.subtitle}>Your mental health companion</Text>
              </View>
              <Feather name="heart" size={24} color="white" style={styles.headerIcon} />
            </View>
          </LinearGradient>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.chat}
            contentContainerStyle={{ padding: 20 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, idx) => (
              <Animated.View 
                key={idx} 
                style={[
                  styles.msgRow, 
                  msg.isBot ? styles.bot : styles.user,
                  { opacity: fadeAnim }
                ]}
              >
                <Text style={[
                  styles.sender,
                  msg.isBot ? styles.botSender : styles.userSender
                ]}>
                  {msg.sender} • {msg.time}
                </Text>
                <View style={[
                  styles.bubble, 
                  { 
                    backgroundColor: msg.bubbleColor,
                    borderBottomLeftRadius: msg.isBot ? 5 : 20,
                    borderBottomRightRadius: msg.isBot ? 20 : 5
                  }
                ]}>
                  <Text style={styles.bubbleText}>{msg.text}</Text>
                </View>
                {msg.suggestion && (
                  <View style={styles.suggestions}>
                    {msg.suggestion.map((sug, i) => (
                      <TouchableOpacity 
                        key={i} 
                        style={styles.sugBtn} 
                        onPress={() => handleSuggestion(sug)}
                      >
                        <Text style={styles.sugText}>{sug}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              onPress={handleSend} 
              style={[
                styles.sendBtn,
                !input.trim() && styles.sendBtnDisabled
              ]}
              disabled={!input.trim()}
            >
              <MaterialCommunityIcons 
                name={input.trim() ? "send" : "send-outline"} 
                size={24} 
                color={input.trim() ? "white" : "#ccc"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 10,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
    fontWeight: '500'
  },
  headerIcon: {
    marginLeft: 10,
  },
  chat: {
    flex: 1,
    paddingTop: 15,
  },
  msgRow: {
    marginBottom: 20,
    width: '100%',
  },
  bot: {
    alignItems: 'flex-start'
  },
  user: {
    alignItems: 'flex-end'
  },
  sender: {
    fontSize: 12,
    marginBottom: 6,
    marginHorizontal: 10,
  },
  botSender: {
    color: '#5E8B7E',
  },
  userSender: {
    color: '#3a5a40',
  },
  bubble: {
    borderRadius: 20,
    padding: 15,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'flex-start'
  },
  sugBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 18,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sugText: {
    color: '#5E8B7E',
    fontSize: 14,
    fontWeight: '500'
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginRight: 10,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sendBtn: {
    backgroundColor: '#5E8B7E',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5E8B7E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  sendBtnDisabled: {
    backgroundColor: '#e0e0e0',
    shadowColor: '#aaa',
  },
});