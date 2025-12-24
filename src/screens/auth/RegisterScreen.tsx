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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          email: personalInfo.email,
          password: personalInfo.password,
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
    <View style={styles.stepContainer}>
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
            backgroundColor: theme.colors.surface,
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
            backgroundColor: theme.colors.surface,
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
            backgroundColor: theme.colors.surface,
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
            backgroundColor: theme.colors.surface,
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
            backgroundColor: theme.colors.surface,
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
    <View style={styles.stepContainer}>
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
            backgroundColor: theme.colors.surface,
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
                style={[
                  styles.businessTypeButton,
                  { 
                    backgroundColor: businessInfo.type === type 
                      ? theme.colors.primary + '20' 
                      : theme.colors.surface,
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
            backgroundColor: theme.colors.surface,
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Create Account
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Step {step} of 2
              </Text>
            </View>
            <View style={styles.stepIndicatorContainer}>
              <View style={[
                styles.stepIndicator, 
                { backgroundColor: step >= 1 ? theme.colors.primary : theme.colors.border }
              ]} />
              <View style={[
                styles.stepIndicator, 
                { backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.border }
              ]} />
            </View>
          </View>

          {/* Form Content */}
          {step === 1 ? renderStep1() : renderStep2()}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {step === 1 ? (
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleNext}
              >
                <Text style={[styles.nextButtonText, { color: theme.colors.white }]}>
                  Continue
                </Text>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, { 
                  backgroundColor: theme.colors.primary,
                  opacity: loading ? 0.7 : 1,
                }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.white} />
                    <Text style={[styles.submitButtonText, { color: theme.colors.white }]}>
                      Create Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                Sign in here
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
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
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
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
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minWidth: '48%',
  },
  businessTypeText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  actionButtons: {
    marginTop: 32,
    marginBottom: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});