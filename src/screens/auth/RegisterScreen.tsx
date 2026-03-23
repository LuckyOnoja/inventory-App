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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassButton } from '../../components/ui/GlassButton';

const businessTypes = [
  'Supermarket/Grocery',
  'Pharmacy',
  'Clothing Store',
  'Electronics',
  'Hardware',
  'Restaurant',
  'Other Retail',
];

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { register } = useAuth();

  // Step 1: Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Step 2: Business Info
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    type: '',
    address: '',
  });

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessInfoChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const { name, email, phone, password, confirmPassword } = personalInfo;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const { name, type } = businessInfo;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter business name');
      return false;
    }

    if (!type) {
      Alert.alert('Error', 'Please select business type');
      return false;
    }

    return true;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (step === 2 && validateStep2()) {
      setLoading(true);
      try {
        await register({
          email: personalInfo.email.trim().toLowerCase(),
          password: personalInfo.password.trim(),
          name: personalInfo.name,
          phone: personalInfo.phone,
          businessName: businessInfo.name,
          businessType: businessInfo.type,
        });
      } catch (error: any) {
        Alert.alert('Registration Failed', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStep1 = () => (
    <View style={[styles.stepCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Personal Information
      </Text>

      <View style={styles.form}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Full Name *
          </Text>
          <View style={[styles.inputContainer, {
            backgroundColor: theme.colors.surfaceLight + '40',
            borderColor: theme.colors.border,
          }]}>
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textTertiary}
              value={personalInfo.name}
              onChangeText={(value) => handlePersonalInfoChange('name', value)}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Email Address *
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
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textTertiary}
              value={personalInfo.email}
              onChangeText={(value) => handlePersonalInfoChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Phone Number *
          </Text>
          <View style={[styles.inputContainer, {
            backgroundColor: theme.colors.surfaceLight + '40',
            borderColor: theme.colors.border,
          }]}>
            <Ionicons
              name="call-outline"
              size={20}
              color={theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.colors.textTertiary}
              value={personalInfo.phone}
              onChangeText={(value) => handlePersonalInfoChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Password *
          </Text>
          <View style={[styles.inputContainer, {
            backgroundColor: theme.colors.surfaceLight + '40',
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
              placeholder="Create a password"
              placeholderTextColor={theme.colors.textTertiary}
              value={personalInfo.password}
              onChangeText={(value) => handlePersonalInfoChange('password', value)}
              secureTextEntry
            />
          </View>
          <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
            At least 6 characters
          </Text>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Confirm Password *
          </Text>
          <View style={[styles.inputContainer, {
            backgroundColor: theme.colors.surfaceLight + '40',
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
              placeholder="Confirm your password"
              placeholderTextColor={theme.colors.textTertiary}
              value={personalInfo.confirmPassword}
              onChangeText={(value) => handlePersonalInfoChange('confirmPassword', value)}
              secureTextEntry
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={[styles.stepCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Business Information
      </Text>

      <View style={styles.form}>
        {/* Business Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Business Name *
          </Text>
          <View style={[styles.inputContainer, {
            backgroundColor: theme.colors.surfaceLight + '40',
            borderColor: theme.colors.border,
          }]}>
            <Ionicons
              name="business-outline"
              size={20}
              color={theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Enter your business name"
              placeholderTextColor={theme.colors.textTertiary}
              value={businessInfo.name}
              onChangeText={(value) => handleBusinessInfoChange('name', value)}
            />
          </View>
        </View>

        {/* Business Type */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Business Type *
          </Text>
          <View style={styles.businessTypesContainer}>
            {businessTypes.map((type) => (
              <TouchableOpacity
                key={type}
                activeOpacity={0.7}
                style={[
                  styles.businessTypeButton,
                  {
                    backgroundColor: businessInfo.type === type
                      ? theme.colors.primary + '30'
                      : theme.colors.surfaceLight + '20',
                    borderColor: businessInfo.type === type
                      ? theme.colors.primary
                      : theme.colors.border,
                  }
                ]}
                onPress={() => handleBusinessInfoChange('type', type)}
              >
                <Ionicons
                  name={
                    type.includes('Supermarket') ? 'cart-outline' :
                      type.includes('Pharmacy') ? 'medical-outline' :
                        type.includes('Clothing') ? 'shirt-outline' :
                          type.includes('Electronics') ? 'hardware-chip-outline' :
                            type.includes('Hardware') ? 'hammer-outline' :
                              type.includes('Restaurant') ? 'restaurant-outline' :
                                'storefront-outline'
                  }
                  size={20}
                  color={businessInfo.type === type ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text style={[
                  styles.businessTypeText,
                  { color: businessInfo.type === type ? theme.colors.primary : theme.colors.text }
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Business Address */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Business Address
          </Text>
          <View style={[styles.inputContainer, {
            backgroundColor: theme.colors.surfaceLight + '40',
            borderColor: theme.colors.border,
          }]}>
            <Ionicons
              name="location-outline"
              size={20}
              color={theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Enter business address (optional)"
              placeholderTextColor={theme.colors.textTertiary}
              value={businessInfo.address}
              onChangeText={(value) => handleBusinessInfoChange('address', value)}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper variant="gradient">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logo}
              />
            </View>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
              Join ToryAi for smart inventory management
            </Text>
          </View>

          {/* Form Card Content */}
          <View style={[
            styles.formCard, 
            { 
              backgroundColor: theme.colors.surface,
              ...theme.shadows.md,
            }
          ]}>
            <View style={styles.cardHeader}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border, borderWidth: 1 }]}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <View style={styles.stepIndicatorContainer}>
                {[1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.stepIndicator,
                      {
                        backgroundColor: step === i ? theme.colors.primary : theme.colors.border,
                        width: step === i ? 24 : 10,
                      }
                    ]}
                  />
                ))}
              </View>
            </View>
            
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {step === 1 ? 'Business Info' : 'Account Details'}
            </Text>

            {step === 1 ? renderStep1() : renderStep2()}
            
            {/* Action Buttons inside Card */}
            <View style={styles.actionButtons}>
              {step === 1 ? (
                <GlassButton
                  title="Continue"
                  onPress={handleNext}
                  icon="arrow-forward"
                  size="large"
                  variant="primary"
                />
              ) : (
                <GlassButton
                  title="Create Account"
                  onPress={handleSubmit}
                  loading={loading}
                  icon="checkmark-circle-outline"
                  size="large"
                  variant="primary"
                />
              ) }
            </View>
          </View>

          {/* Footer - Outside Card */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.8)' }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerLink, { color: '#FFFFFF' }]}>
                {' '}Sign in here
              </Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  logoCircle: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: '85%',
  },
  formCard: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  stepIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  form: {
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
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  businessTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  businessTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: '48%',
  },
  businessTypeText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});