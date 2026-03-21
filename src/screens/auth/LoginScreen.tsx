import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';
import { GlassButton } from '../../components/ui/GlassButton';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();

  React.useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const isEnabled = await AsyncStorage.getItem('biometric_enabled');
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const savedCredentials = await SecureStore.getItemAsync('user_credentials');

      if (isEnabled === 'true' && hasHardware && isEnrolled && savedCredentials) {
        setCanUseBiometrics(true);
        // Automatically trigger biometrics on mount for better UX
        handleBiometricLogin();
      }
    } catch (error) {
      console.error('Failed to check biometrics:', error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        const credentialsStr = await SecureStore.getItemAsync('user_credentials');
        if (credentialsStr) {
          const { email: savedEmail, password: savedPassword } = JSON.parse(credentialsStr);
          setLoading(true);
          await login(savedEmail, savedPassword);
        }
      }
    } catch (error) {
      console.error('Biometric login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navigation handled by AuthContext
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/icon.png')}
                style={{ width: 220, height: 220 }}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Secure your business inventory
            </Text>
          </View>

          {/* Form */}
          <GlassView style={styles.formContainer} intensity={30}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Email Address
              </Text>
              <View style={[styles.inputContainer, {
                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                borderColor: theme.colors.border,
              }]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Password
              </Text>
              <View style={[styles.inputContainer, {
                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                borderColor: theme.colors.border,
              }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPasswordButton}
              >
                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <GlassButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              icon="log-in-outline"
              size="large"
              style={styles.loginButton}
            />

            {canUseBiometrics && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={[styles.biometricButton, { borderColor: theme.colors.primary + '40' }]}
              >
                <Ionicons name="finger-print-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.biometricText, { color: theme.colors.primary }]}>
                  Login with Biometrics
                </Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textTertiary }]}>
                OR
              </Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                  Sign up now
                </Text>
              </TouchableOpacity>
            </View>
          </GlassView>

          {/* Demo Credentials */}
          <View style={[styles.demoContainer, { backgroundColor: theme.colors.surfaceLight + '80' }]}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
              Demo: admin@example.com / password123
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    padding: 24,
    borderRadius: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 12,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  demoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 32,
  },
  demoText: {
    fontSize: 12,
    textAlign: 'center',
  },
});