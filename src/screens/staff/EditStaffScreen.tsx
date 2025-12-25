// screens/staff/EditStaffScreen.tsx
import React, { useState, useEffect } from 'react';
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
import config from '../../config';

const API_URL = config.API_URL;

export default function EditStaffScreen({ navigation, route }: any) {
  const { staffId } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { theme } = useTheme();
  const { user, token } = useAuth();

  useEffect(() => {
    fetchStaffData();
  }, [staffId]);

  const fetchStaffData = async () => {
    try {
      setLoadingData(true);
      const response = await axios.get(`${API_URL}/users/${staffId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const staff = response.data.data;
        setFormData({
          name: staff.name || '',
          email: staff.email || '',
          phone: staff.phone || '',
          role: staff.role || '',
          password: '', // Don't load password for security
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch staff data:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to load staff data'
      );
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await axios.put(
        `${API_URL}/users/${staffId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Staff member updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Failed to update staff:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update staff. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    Alert.prompt(
      'Reset Password',
      'Enter new password for this staff member:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async (password : any) => {
            if (password && password.length >= 6) {
              try {
                const response = await axios.put(
                  `${API_URL}/users/${staffId}`,
                  { password },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (response.data.success) {
                  Alert.alert('Success', 'Password reset successfully');
                }
              } catch (error: any) {
                Alert.alert(
                  'Error',
                  error.response?.data?.error || 'Failed to reset password'
                );
              }
            } else {
              Alert.alert('Error', 'Password must be at least 6 characters');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const roles = [
    { value: 'SALES_AGENT', label: 'Sales Agent', icon: 'person-outline' },
    { value: 'SUPERVISOR', label: 'Supervisor', icon: 'people-outline' },
  ];

  if (loadingData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Edit Staff
            </Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Personal Information
              </Text>
              
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
                    editable={false} // Email shouldn't be changed
                  />
                </View>
                {errors.email && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.email}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Phone Number
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
                  </TouchableOpacity>
                ))}
              </View>
              {errors.role && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.role}
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Password
                </Text>
                <TouchableOpacity onPress={handleResetPassword}>
                  <Text style={[styles.resetText, { color: theme.colors.primary }]}>
                    Reset Password
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  New Password (Optional)
                </Text>
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
                    placeholder="Leave blank to keep current"
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
                <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                  Leave blank to keep current password
                </Text>
              </View>
            </View>
          </View>

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
                  <Ionicons name="save-outline" size={20} color={theme.colors.white} />
                  <Text style={[styles.submitButtonText, { color: theme.colors.white }]}>
                    Save Changes
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerRight: {
    width: 40,
  },
  form: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
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
  helpText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  roleGrid: {
    gap: 12,
  },
  roleButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconContainer: {
    marginRight: 12,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
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