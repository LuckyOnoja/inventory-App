// screens/profile/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';

interface MenuItem {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme(); 
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [confirmationName, setConfirmationName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const biometricPref = await AsyncStorage.getItem('biometric_enabled');
      setBiometricEnabled(biometricPref === 'true');
      
      const offlinePref = await AsyncStorage.getItem('offline_mode');
      if (offlinePref !== null) setOfflineMode(offlinePref === 'true');
      
      const notificationsPref = await AsyncStorage.getItem('notifications_enabled');
      if (notificationsPref !== null) setNotificationsEnabled(notificationsPref === 'true');
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      // Check if hardware supports it
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometrics Not Available',
          'Your device does not support biometric authentication or you haven\'t set it up.'
        );
        return;
      }

      // Verify biometrics before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm biometrics to enable login',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        setBiometricEnabled(true);
        await AsyncStorage.setItem('biometric_enabled', 'true');
        Alert.alert('Success', 'Biometric login enabled successfully.');
      }
    } else {
      setBiometricEnabled(false);
      await AsyncStorage.setItem('biometric_enabled', 'false');
    }
  };

  const handleToggleOffline = async (value: boolean) => {
    setOfflineMode(value);
    await AsyncStorage.setItem('offline_mode', value.toString());
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notifications_enabled', value.toString());
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    const requiredName = user?.role === 'SUPER_ADMIN' ? user?.business?.name : user?.name;
    
    if (confirmationName !== requiredName) {
      Alert.alert('Verification Failed', `Please type "${requiredName}" exactly to confirm deletion.`);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      // AuthContext handles state reset and logout on success
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Personal Information',
      icon: 'person-outline',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      title: 'Security Settings',
      icon: 'shield-outline',
      color: theme.colors.error,
      onPress: () => navigation.navigate('SecuritySettings'),
    },
    {
      title: 'Business Profile',
      icon: 'business-outline',
      color: theme.colors.success,
      onPress: () => navigation.navigate('BusinessProfile'),
    },
    {
      title: 'Payment Methods',
      icon: 'wallet-outline',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      color: theme.colors.info,
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      title: 'About App',
      icon: 'information-circle-outline',
      color: theme.colors.text,
      onPress: () => navigation.navigate('AboutApp'),
    },
  ];

  // Get user role display text
  const getRoleDisplayText = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'SALES_AGENT':
        return 'Sales Agent';
      case 'SUPERVISOR':
        return 'Supervisor';
      default:
        return 'User';
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Profile
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Manage your account and settings
            </Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
              />
              <View style={[styles.statusDot, { backgroundColor: user?.status ? theme.colors.success : theme.colors.error }]} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {user?.name || 'Business Owner'}
              </Text>
              <Text style={[styles.profileRole, { color: theme.colors.textSecondary }]}>
                {getRoleDisplayText(user?.role)}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textTertiary }]}>
                {user?.email || 'owner@business.com'}
              </Text>
              {user?.phone && (
                <Text style={[styles.profilePhone, { color: theme.colors.textTertiary }]}>
                  {user.phone}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Settings
          </Text>

          <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    Notifications
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    Receive alerts and updates
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={notificationsEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Ionicons name="finger-print-outline" size={20} color={theme.colors.success} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    Biometric Login
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    Use fingerprint or face ID
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometrics}
                trackColor={{ false: theme.colors.border, true: theme.colors.success + '80' }}
                thumbColor={biometricEnabled ? theme.colors.success : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.info + '20' }]}>
                  <Ionicons name="cloud-offline-outline" size={20} color={theme.colors.info} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    Offline Mode
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    Work without internet
                  </Text>
                </View>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={handleToggleOffline}
                trackColor={{ false: theme.colors.border, true: theme.colors.info + '80' }}
                thumbColor={offlineMode ? theme.colors.info : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Ionicons name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.colors.warning} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    {theme.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    Switch theme
                  </Text>
                </View>
              </View>
              <Switch
                value={theme.mode === 'dark'}
                onValueChange={toggleTheme} // Now using the toggleTheme function
                trackColor={{ false: theme.colors.border, true: theme.colors.warning + '80' }}
                thumbColor={theme.mode === 'dark' ? theme.colors.warning : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setIsDeleteModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.error + '10' }]}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    Account Termination
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    Data purge protocol
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        {/*<View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account & Settings
          </Text>
          
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.menuText, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
                
                {index < menuItems.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>*/}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error + '10' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>
          ToryAi v1.0.0
        </Text>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassView 
            style={[
              styles.modalContent, 
              { backgroundColor: theme.mode === 'dark' ? '#000000' : '#FFFFFF' }
            ]} 
            intensity={40}
          >
            <View style={[styles.warningIconContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Ionicons name="warning" size={32} color={theme.colors.error} />
            </View>
            
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {user?.role === 'SUPER_ADMIN' ? 'Terminate Business' : 'Delete Your Account'}
            </Text>
            
            <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
              {user?.role === 'SUPER_ADMIN' 
                ? 'This action is PERMANENT. It will erase the entire business infrastructure, all products, and all sales history. This cannot be undone.'
                : 'Are you sure? This will delete your personalized access and data. Business records created by you will be preserved but anonymized.'}
            </Text>

            <View style={styles.confirmationInputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textTertiary }]}>
                TYPE <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                  {user?.role === 'SUPER_ADMIN' ? user?.business?.name : user?.name}
                </Text> TO CONFIRM
              </Text>
              <TextInput
                style={[
                  styles.confirmationInput, 
                  { 
                    color: theme.colors.text, 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: theme.colors.border
                  }
                ]}
                value={confirmationName}
                onChangeText={setConfirmationName}
                placeholder="Type here..."
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setConfirmationName('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.confirmDeleteButton, 
                  { backgroundColor: theme.colors.error },
                  confirmationName !== (user?.role === 'SUPER_ADMIN' ? user?.business?.name : user?.name) && { opacity: 0.5 }
                ]}
                onPress={handleDeleteAccount}
                disabled={isDeleting || confirmationName !== (user?.role === 'SUPER_ADMIN' ? user?.business?.name : user?.name)}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete Forever</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassView>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
  },
  profilePhone: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    marginHorizontal: 16,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 24,
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmationInputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  confirmationInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  confirmDeleteButton: {
    shadowColor: '#FF0000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  confirmDeleteText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});