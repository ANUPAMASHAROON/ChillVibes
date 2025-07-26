import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const AuthScreens = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [secureEntry, setSecureEntry] = useState(true);

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthError('');
    reset();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const calculateAge = (birthDate) => {
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleAuth = async (data) => {
    setIsProcessing(true);
    setAuthError('');
    
    try {
      if (isLogin) {
        const users = await AsyncStorage.getItem('users');
        const parsedUsers = users ? JSON.parse(users) : {};
        
        if (parsedUsers[data.email] && parsedUsers[data.email].password === data.password) {
          await AsyncStorage.setItem('currentUser', JSON.stringify({
            email: data.email,
            name: parsedUsers[data.email].name,
            age: parsedUsers[data.email].age,
            gender: parsedUsers[data.email].gender
          }));
          onLoginSuccess();
        } else {
          setAuthError('Invalid credentials');
        }
      } else {
        const users = await AsyncStorage.getItem('users');
        const parsedUsers = users ? JSON.parse(users) : {};
        
        if (parsedUsers[data.email]) {
          setAuthError('Email already exists');
        } else {
          parsedUsers[data.email] = {
            name: data.name,
            password: data.password,
            age: calculateAge(dateOfBirth),
            gender: data.gender,
            moods: []
          };
          await AsyncStorage.setItem('users', JSON.stringify(parsedUsers));
          await AsyncStorage.setItem('currentUser', JSON.stringify({
            email: data.email,
            name: data.name,
            age: calculateAge(dateOfBirth),
            gender: data.gender
          }));
          onLoginSuccess();
        }
      }
    } catch (error) {
      setAuthError('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <LinearGradient
  colors={['#7FB8A2', '#5E8B7E']}
  style={styles.container}
>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View 
            animation="fadeInDown"
            duration={1000}
            style={styles.header}
          >
            <LottieView
              source={require('../assets/log in.json')} 
              autoPlay
              loop
              style={styles.animation}
            />
            <Text style={styles.headerText}>
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </Text>
            <Text style={styles.subHeaderText}>
              {isLogin ? 'Track your mood journey' : 'Start your mood tracking journey'}
            </Text>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp"
            duration={1000}
            style={styles.formContainer}
          >
            {authError ? (
              <Animatable.View animation="shake" duration={500} style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color="#ff4757" />
                <Text style={styles.errorText}>{authError}</Text>
              </Animatable.View>
            ) : null}

            {!isLogin && (
              <>
                <Controller
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                      <View style={styles.iconContainer}>
                        <Icon name="account" size={20} color="#5E8B7E" />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#aaa"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      {errors.name && (
                        <Animatable.View animation="fadeIn" duration={300}>
                          <Text style={styles.validationError}>{errors.name.message}</Text>
                        </Animatable.View>
                      )}
                    </View>
                  )}
                  name="name"
                  defaultValue=""
                />

                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="cake" size={20} color="#5E8B7E" />
                  </View>
                  <View style={[styles.input, styles.dateInput]}>
                    <Text style={styles.dateText}>
                      {dateOfBirth.toLocaleDateString()}
                    </Text>
                    <Text style={styles.ageText}>
                      {calculateAge(dateOfBirth)} years
                    </Text>
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}

                <Controller
                  control={control}
                  rules={{ required: 'Gender is required' }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                      <View style={styles.iconContainer}>
                        <Icon name="gender-male-female" size={20} color="#5E8B7E" />
                      </View>
                      <View style={[styles.input, styles.pickerInput]}>
                        <Picker
                          selectedValue={value}
                          onValueChange={onChange}
                          style={styles.picker}
                          dropdownIconColor="#5E8B7E"
                        >
                          <Picker.Item label="Select Gender" value="" />
                          <Picker.Item label="Male" value="male" />
                          <Picker.Item label="Female" value="female" />
                          <Picker.Item label="Other" value="other" />
                          <Picker.Item label="Prefer not to say" value="prefer-not-to-say" />
                        </Picker>
                      </View>
                      {errors.gender && (
                        <Animatable.View animation="fadeIn" duration={300}>
                          <Text style={styles.validationError}>{errors.gender.message}</Text>
                        </Animatable.View>
                      )}
                    </View>
                  )}
                  name="gender"
                  defaultValue=""
                />
              </>
            )}

            <Controller
              control={control}
              rules={{ 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <View style={styles.iconContainer}>
                    <Icon name="email" size={20} color="#5E8B7E" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.email && (
                    <Animatable.View animation="fadeIn" duration={300}>
                      <Text style={styles.validationError}>{errors.email.message}</Text>
                    </Animatable.View>
                  )}
                </View>
              )}
              name="email"
              defaultValue=""
            />

            <Controller
              control={control}
              rules={{ 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <View style={styles.iconContainer}>
                    <Icon name="lock" size={20} color="#5E8B7E" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={secureEntry}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setSecureEntry(!secureEntry)}
                  >
                    <Icon 
                      name={secureEntry ? "eye-off" : "eye"} 
                      size={20} 
                      color="#aaa" 
                    />
                  </TouchableOpacity>
                  {errors.password && (
                    <Animatable.View animation="fadeIn" duration={300}>
                      <Text style={styles.validationError}>{errors.password.message}</Text>
                    </Animatable.View>
                  )}
                </View>
              )}
              name="password"
              defaultValue=""
            />

            {!isLogin && (
              <Controller
                control={control}
                rules={{ 
                  validate: value => 
                    value === watch('password') || 'Passwords do not match'
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <View style={styles.iconContainer}>
                      <Icon name="lock-check" size={20} color="#5E8B7E" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={secureEntry}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.confirmPassword && (
                      <Animatable.View animation="fadeIn" duration={300}>
                        <Text style={styles.validationError}>{errors.confirmPassword.message}</Text>
                      </Animatable.View>
                    )}
                  </View>
                )}
                name="confirmPassword"
                defaultValue=""
              />
            )}

            <TouchableOpacity 
              style={styles.authButton}
              onPress={handleSubmit(handleAuth)}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={isProcessing ? ['#cccccc', '#aaaaaa'] : ['#5E8B7E', '#86C6B4']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isProcessing ? (
                  <LottieView
                    source={require('../assets/Trail loading.json')} 
                    autoPlay
                    loop
                    style={styles.loadingAnimation}
                  />
                ) : (
                  <>
                    <Icon 
                      name={isLogin ? "login" : "account-plus"} 
                      size={20} 
                      color="white" 
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>
                      {isLogin ? 'Login' : 'Sign Up'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

        
       
            <TouchableOpacity onPress={toggleAuthMode} style={styles.toggleButton}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.toggleHighlight}>
                  {isLogin ? "Sign Up" : "Login"}
                </Text>
              </Text>
            </TouchableOpacity>

           
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subHeaderText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    maxWidth: '80%',
  },
  formContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 30,
    marginTop: 20,
    minHeight: height * 0.6,
  },
  inputContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 45,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
    color: '#495057',
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#495057',
  },
  ageText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  pickerInput: {
    paddingHorizontal: 40,
    paddingVertical: 5,
  },
  picker: {
    width: '100%',
    color: '#495057',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  authButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
  loadingAnimation: {
    width: 50,
    height: 50,
  },
  toggleButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  toggleText: {
    color: '#6c757d',
    textAlign: 'center',
    fontSize: 15,
  },
  toggleHighlight: {
    color: '#5E8B7E',
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#ff4757',
    marginLeft: 5,
    fontSize: 14,
  },
  validationError: {
    color: '#ff4757',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    width: 40,
    textAlign: 'center',
    color: '#6c757d',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  socialButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#4facfe',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthScreens;