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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItem {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
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

          {/* Removed stats section as requested */}
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
                onValueChange={setNotificationsEnabled}
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
                onValueChange={setBiometricEnabled}
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
                onValueChange={setOfflineMode}
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
                onValueChange={() => {}} // Theme toggle removed as per ThemeContext
                trackColor={{ false: theme.colors.border, true: theme.colors.warning + '80' }}
                thumbColor={theme.mode === 'dark' ? theme.colors.warning : '#f4f3f4'}
                disabled={true}
              />
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
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
        </View>

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
          Inventory Pro v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
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
});