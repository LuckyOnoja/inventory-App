// screens/settings/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';

export default function SettingsScreen({ navigation }: any) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    lowStockAlerts: true,
    cameraAlerts: true,
    soundEffects: true,
    vibration: true,
    autoSync: true,
    dataSaver: false,
    locationServices: true,
    privacyMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove temporary data and free up storage. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export all your business data as CSV or PDF?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CSV',
          onPress: () => Alert.alert('Export Started', 'Your data export will be available shortly')
        },
        {
          text: 'PDF',
          onPress: () => Alert.alert('Export Started', 'Your data export will be available shortly')
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@inventorypro.com?subject=Support Request');
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate App',
      'Enjoying Inventory Pro? Please rate us on the app store!',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.inventorypro')
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Push Notifications',
          subtitle: 'Receive push notifications',
          value: settings.pushNotifications,
          onToggle: () => toggleSetting('pushNotifications'),
        },
        {
          icon: 'mail-outline',
          title: 'Email Notifications',
          subtitle: 'Get daily/weekly reports via email',
          value: settings.emailNotifications,
          onToggle: () => toggleSetting('emailNotifications'),
        },
        {
          icon: 'warning-outline',
          title: 'Low Stock Alerts',
          subtitle: 'Alert when products run low',
          value: settings.lowStockAlerts,
          onToggle: () => toggleSetting('lowStockAlerts'),
        },
        {
          icon: 'camera-outline',
          title: 'Camera Alerts',
          subtitle: 'Security camera status updates',
          value: settings.cameraAlerts,
          onToggle: () => toggleSetting('cameraAlerts'),
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          icon: 'volume-medium-outline',
          title: 'Sound Effects',
          subtitle: 'Play sounds for actions',
          value: settings.soundEffects,
          onToggle: () => toggleSetting('soundEffects'),
        },
        {
          icon: 'phone-portrait-outline',
          title: 'Vibration',
          subtitle: 'Vibrate for notifications',
          value: settings.vibration,
          onToggle: () => toggleSetting('vibration'),
        },
        {
          icon: theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline',
          title: theme.mode === 'dark' ? 'Light Mode' : 'Dark Mode',
          subtitle: 'Switch app theme',
          value: theme.mode === 'dark',
          onToggle: toggleTheme,
          type: 'theme' as const,
        },
        {
          icon: 'sync-outline',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data',
          value: settings.autoSync,
          onToggle: () => toggleSetting('autoSync'),
        },
        {
          icon: 'cellular-outline',
          title: 'Data Saver',
          subtitle: 'Reduce data usage',
          value: settings.dataSaver,
          onToggle: () => toggleSetting('dataSaver'),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'location-outline',
          title: 'Location Services',
          subtitle: 'Use location for store tracking',
          value: settings.locationServices,
          onToggle: () => toggleSetting('locationServices'),
        },
        {
          icon: 'shield-checkmark-outline',
          title: 'Privacy Mode',
          subtitle: 'Hide sensitive data in app switcher',
          value: settings.privacyMode,
          onToggle: () => toggleSetting('privacyMode'),
        },
        {
          icon: 'key-outline',
          title: 'Change Password',
          subtitle: 'Update your login password',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('ChangePassword'),
        },
        {
          icon: 'finger-print-outline',
          title: 'Biometric Login',
          subtitle: 'Set up fingerprint or face ID',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('BiometricSetup'),
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          icon: 'download-outline',
          title: 'Export Data',
          subtitle: 'Export sales, inventory, reports',
          type: 'action' as const,
          onPress: handleExportData,
        },
        {
          icon: 'trash-outline',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          type: 'action' as const,
          onPress: handleClearCache,
        },
        {
          icon: 'cloud-upload-outline',
          title: 'Backup Settings',
          subtitle: 'Backup to cloud',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('BackupSettings'),
        },
      ],
    },
    {
      title: 'Support & About',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Help & FAQ',
          subtitle: 'Get help using the app',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('HelpFAQ'),
        },
        {
          icon: 'chatbubble-ellipses-outline',
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          type: 'action' as const,
          onPress: handleContactSupport,
        },
        {
          icon: 'star-outline',
          title: 'Rate App',
          subtitle: 'Rate us on app store',
          type: 'action' as const,
          onPress: handleRateApp,
        },
        {
          icon: 'information-circle-outline',
          title: 'About App',
          subtitle: 'Version 1.0.0 • Build 1001',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('AboutApp'),
        },
      ],
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Customize your app experience
        </Text>
      </View>
    </View>
  );

  const renderSettingItem = (item: any) => {
    const getIconColor = () => {
      if (item.type === 'theme') return theme.colors.warning;
      if (item.type === 'action') return theme.colors.info;
      return theme.colors.primary;
    };

    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={item.onToggle || item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: getIconColor() + '20' }]}>
            <Ionicons name={item.icon as any} size={20} color={getIconColor()} />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        </View>

        {item.value !== undefined ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: theme.colors.border, true: getIconColor() + '80' }}
            thumbColor={item.value ? getIconColor() : '#f4f3f4'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      {renderHeader()}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {settingsGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {group.title}
              </Text>

              <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    {renderSettingItem(item)}
                    {itemIndex < group.items.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}

          {/* App Info */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Account Type
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Sales Agent'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Storage Used
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                245 MB / 1 GB
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Last Backup
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                Yesterday, 23:45
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                App Version
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                v1.0.0 (Build 1001)
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
              © 2024 Inventory Pro. All rights reserved.
            </Text>
            <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
              Terms • Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  section: {
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
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});