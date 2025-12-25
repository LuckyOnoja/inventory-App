import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from "../../config";

const API_URL = config.API_URL;
const roles = [
  { value: 'SALES_AGENT', label: 'Sales Agent', icon: 'person-outline' },
  { value: 'SUPERVISOR', label: 'Store Manager', icon: 'people-outline' },
];

export default function AddStaffScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { theme } = useTheme();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange('password', password);
    handleInputChange('confirmPassword', password);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const staffData = {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      };

      const response = await axios.post(`${API_URL}/users`, staffData);

      Alert.alert(
        'Success',
        `${formData.name} has been added as a ${formData.role === 'SALES_AGENT' ? 'Sales Agent' : 'Store Manager'}`,
        [
          {
            text: 'Add Another',
            style: 'cancel',
            onPress: () => {
              resetForm();
            },
          },
          {
            text: 'View Staff',
            onPress: () => {
              navigation.goBack();
              navigation.navigate('Staff');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to add staff:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to add staff. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'SALES_AGENT':
        return 'Can log sales and view own sales history. Cannot access sensitive data.';
      case 'SUPERVISOR':
        return 'Can manage staff, conduct inventory checks, and view all reports.';
      default:
        return '';
    }
  };

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
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Add New Staff
            </Text>
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: theme.colors.surface }]}
              onPress={generatePassword}
            >
              <Ionicons name="key-outline" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Personal Information
              </Text>
              
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Full Name *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.name ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Enter staff full name"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                  />
                </View>
                {errors.name && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Email Address *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.email ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Enter staff email"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Phone Number *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.phone ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Enter phone number"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.phone}
                  </Text>
                )}
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Role & Permissions *
              </Text>
              
              <View style={styles.roleGrid}>
                {roles.map((roleItem) => (
                  <TouchableOpacity
                    key={roleItem.value}
                    style={[
                      styles.roleButton,
                      { 
                        backgroundColor: formData.role === roleItem.value 
                          ? theme.colors.primary + '20' 
                          : theme.colors.surfaceLight,
                        borderColor: formData.role === roleItem.value 
                          ? theme.colors.primary 
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => handleInputChange('role', roleItem.value)}
                  >
                    <View style={styles.roleIconContainer}>
                      <Ionicons 
                        name={roleItem.icon as any} 
                        size={24} 
                        color={formData.role === roleItem.value 
                          ? theme.colors.primary
                          : theme.colors.text
                        } 
                      />
                    </View>
                    <Text style={[
                      styles.roleLabel,
                      { 
                        color: formData.role === roleItem.value 
                          ? theme.colors.primary
                          : theme.colors.text 
                      }
                    ]}>
                      {roleItem.label}
                    </Text>
                    <Text style={[
                      styles.roleDescription,
                      { color: theme.colors.textSecondary }
                    ]}>
                      {getRoleDescription(roleItem.value)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.role && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.role}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Account Password
              </Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Password *
                  </Text>
                  <TouchableOpacity onPress={generatePassword}>
                    <Text style={[styles.generateText, { color: theme.colors.primary }]}>
                      Generate Strong Password
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.password ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Create a secure password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.password}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Confirm Password *
                </Text>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Confirm the password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Password Requirements */}
              <View style={[styles.passwordRequirements, { backgroundColor: theme.colors.surfaceLight }]}>
                <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>
                  Password Requirements:
                </Text>
                <View style={styles.requirementList}>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={formData.password.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={14} 
                      color={formData.password.length >= 6 ? theme.colors.success : theme.colors.textTertiary} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { 
                        color: formData.password.length >= 6 ? theme.colors.success : theme.colors.textTertiary 
                      }
                    ]}>
                      At least 6 characters
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={14} 
                      color={formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? theme.colors.success : theme.colors.textTertiary} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { 
                        color: formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? theme.colors.success : theme.colors.textTertiary 
                      }
                    ]}>
                      Passwords match
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Important Notes */}
            <View style={[styles.notesContainer, { backgroundColor: theme.colors.warning + '20' }]}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.warning} />
              <View style={styles.notesContent}>
                <Text style={[styles.notesTitle, { color: theme.colors.warning }]}>
                  Important Information
                </Text>
                <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
                  • Staff will receive an email with login instructions{'\n'}
                  • Ensure the email address is correct{'\n'}
                  • Staff must change their password on first login{'\n'}
                  • You can reset passwords anytime from Staff Management
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                { 
                  backgroundColor: theme.colors.primary,
                  opacity: loading ? 0.7 : 1,
                }
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color={theme.colors.white} />
                  <Text style={[styles.submitButtonText, { color: theme.colors.white }]}>
                    Add Staff Member
                  </Text>
                </>
              )}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  generateButton: {
    padding: 8,
    borderRadius: 8,
  },
  form: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  generateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
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
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  roleGrid: {
    gap: 12,
  },
  roleButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleIconContainer: {
    marginBottom: 12,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  passwordRequirements: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
  },
  notesContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  notesContent: {
    flex: 1,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});