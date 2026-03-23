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
      await login(email.trim().toLowerCase(), password.trim());
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
    <ScreenWrapper variant="gradient">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.appName, { color: '#FFFFFF' }]}>ToryAi</Text>
            <Text style={[styles.tagline, { color: 'rgba(255,255,255,0.7)' }]}>
              Smart Inventory Management
            </Text>
          </View>

          {/* Form */}
          <View style={[
            styles.formCard, 
            { 
              backgroundColor: theme.colors.surface,
              ...theme.shadows.md,
            }
          ]}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>Sign In</Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email Address</Text>
              <View style={[styles.inputRow, { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={theme.colors.textTertiary} />
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
              <View style={[styles.inputRow, { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotBtn}
              >
                <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <GlassButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              icon="log-in-outline"
              size="large"
            />

            {canUseBiometrics && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={[styles.biometricBtn, { borderColor: theme.colors.border }]}
              >
                <Ionicons name="finger-print-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.biometricText, { color: theme.colors.primary }]}>
                  Use Biometrics
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: 'rgba(255,255,255,0.8)' }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: '#FFFFFF' }]}>
                {' '}Sign up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo hint */}
          <View style={[styles.demoBox, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="information-circle-outline" size={15} color="#FFFFFF" />
            <Text style={[styles.demoText, { color: 'rgba(255,255,255,0.8)' }]}>
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
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  logoCircle: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    width: 44,
    height: 44,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
  },
  formCard: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  demoText: {
    fontSize: 12,
  },
});