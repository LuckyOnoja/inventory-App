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
} from 'react-native';
import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';
import { GlassCard } from '../../components/ui/GlassCard';

interface SettingItem {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  value?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen({ navigation }: any) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    lowStockAlerts: true,
    vibration: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsGroups: SettingGroup[] = [
    {
      title: 'OPERATIONAL ALERTS',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Push Channels',
          subtitle: 'Real-time heartbeat updates',
          value: settings.pushNotifications,
          onToggle: () => toggleSetting('pushNotifications'),
        },
        {
          icon: 'warning-outline',
          title: 'Critical Stock',
          subtitle: 'Low inventory threshold warnings',
          value: settings.lowStockAlerts,
          onToggle: () => toggleSetting('lowStockAlerts'),
        },
      ],
    },
    {
      title: 'INTERFACE CORE',
      items: [
        {
          icon: theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline',
          title: theme.mode === 'dark' ? 'Solar Interface' : 'Lunar Interface',
          subtitle: 'Toggle core visual frequency',
          value: theme.mode === 'dark',
          onToggle: toggleTheme,
        },
        {
          icon: 'volume-medium-outline',
          title: 'Haptic Feedback',
          subtitle: 'Tactile response protocol',
          value: settings.vibration,
          onToggle: () => toggleSetting('vibration'),
        },
      ],
    },
    {
      title: 'SECURITY & PROTOCOLS',
      items: [
        {
          icon: 'shield-checkmark-outline',
          title: 'Authorization Protocol',
          subtitle: 'System security is nominal',
          onPress: () => Alert.alert('Security Protocol', 'Advanced multi-vector authentication is active for this session.'),
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
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <View>
        <Text style={[styles.headerGreeting, { color: theme.colors.textTertiary }]}>SYSTEM CONFIG</Text>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings Core</Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      {renderHeader()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <GlassView style={styles.profileCard} intensity={20}>
            <View style={styles.profileInitialsContainer}>
              <Text style={[styles.profileInitials, { color: theme.colors.primary }]}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {user?.name || 'Guest User'}
              </Text>
              <Text style={[styles.profileRole, { color: theme.colors.textSecondary }]}>
                {(user?.role || 'GUEST').replace('_', ' ')} • ID-{user?.id?.slice(-4).toUpperCase() || 'XXXX'}
              </Text>
            </View>
          </GlassView>
        </View>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{group.title}</Text>
            <GlassCard style={styles.settingsCard}>
              {group.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={item.onToggle || item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingLeft}>
                      <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                        <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
                      </View>
                      <View>
                        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
                        <Text style={[styles.settingSubtitle, { color: theme.colors.textTertiary }]}>{item.subtitle}</Text>
                      </View>
                    </View>
                    {item.value !== undefined ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={item.value ? '#FFF' : '#f4f3f4'}
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                  {itemIndex < group.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </GlassCard>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>SYSTEM TELEMETRY</Text>
          <GlassView style={styles.telemetryCard} intensity={15}>
            <View style={styles.telemetryItem}>
              <Text style={[styles.telemetryLabel, { color: theme.colors.textTertiary }]}>LAST SYNC</Text>
              <Text style={[styles.telemetryValue, { color: theme.colors.text }]}>Just Now</Text>
            </View>
            <View style={styles.telemetryDivider} />
            <View style={styles.telemetryItem}>
              <Text style={[styles.telemetryLabel, { color: theme.colors.textTertiary }]}>CORE VERSION</Text>
              <Text style={[styles.telemetryValue, { color: theme.colors.text }]}>1.2.0-PRO</Text>
            </View>
          </GlassView>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            Alert.alert('Terminate Session', 'Are you sure you want to end your current intelligence session?',
              [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: () => { logout(); } }])
          }}
        >
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>TERMINATE SESSION</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>TORYAI INTELLIGENCE OPERATING CORE</Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>© 2024 • SECURE PROTOCOL ACTIVE</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  headerGreeting: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
  },
  profileInitialsContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  settingsCard: {
    padding: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginHorizontal: 20,
  },
  telemetryCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
  },
  telemetryItem: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  telemetryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  telemetryDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoutButton: {
    marginHorizontal: 20,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
    marginTop: 16,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
});