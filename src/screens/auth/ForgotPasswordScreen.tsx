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
import { useTheme } from '../../context/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';
import { GlassButton } from '../../components/ui/GlassButton';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { theme } = useTheme();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetSent(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
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
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.colors.surfaceLight + '80' }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Reset Password
              </Text>
            </View>
          </View>

          {!resetSent ? (
            <GlassView style={styles.contentCard} intensity={20}>
              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <View style={styles.iconContainer}>
                  <Image
                    source={require('../../../assets/icon.png')}
                    style={{ width: 180, height: 180 }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
                  Forgot Your Password?
                </Text>
                <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
                  Enter your email address below and we'll send you instructions to reset your password.
                </Text>
              </View>

              {/* Email Input */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Email Address
                  </Text>
                  <View style={[styles.inputContainer, {
                    backgroundColor: theme.colors.surfaceLight + '40',
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
                      placeholder="Enter your email address"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Reset Button */}
                <GlassButton
                  title="Send Reset Link"
                  onPress={handleResetPassword}
                  loading={loading}
                  icon="send-outline"
                  size="large"
                  variant="primary"
                />
              </View>
            </GlassView>
          ) : (
            /* Success Message */
            <GlassView style={styles.successCard} intensity={25}>
              <View style={[styles.successIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
              </View>
              <Text style={[styles.successTitle, { color: theme.colors.text }]}>
                Check Your Email
              </Text>
              <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>
                We've sent password reset instructions to:
              </Text>
              <Text style={[styles.emailText, { color: theme.colors.primary }]}>
                {email}
              </Text>
              <Text style={[styles.successNote, { color: theme.colors.textTertiary }]}>
                If you don't see the email, check your spam folder or try again.
              </Text>

              <GlassButton
                title="Back to Login"
                onPress={() => navigation.navigate('Login')}
                icon="arrow-back-outline"
                variant="secondary"
                size="large"
              />
            </GlassView>
          )}

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Ionicons name="help-circle-outline" size={16} color={theme.colors.textTertiary} />
            <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
              Need help? Contact support at support@inventoryguard.com
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
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginRight: 44, // Balance back button
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  contentCard: {
    padding: 24,
    borderRadius: 24,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 24,
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
  successCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  successNote: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
    gap: 8,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
  },
});