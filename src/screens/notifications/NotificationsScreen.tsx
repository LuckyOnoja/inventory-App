// screens/notifications/NotificationsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import moment from 'moment';
import config from '../../config';

const API_URL = config.API_URL;

interface Notification {
  id: string;
  type: 'inventory' | 'security' | 'sales' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'security' | 'inventory'>('all');
  const { theme } = useTheme();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [notifications, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'security',
          title: 'Camera Offline',
          message: 'Camera #3 in main store is offline. Please check connection.',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          read: false,
          priority: 'high',
        },
        {
          id: '2',
          type: 'inventory',
          title: 'Low Stock Alert',
          message: 'Coke 50cl is running low (12 units left). Minimum stock: 30 units.',
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          read: true,
          priority: 'medium',
        },
        {
          id: '3',
          type: 'sales',
          title: 'Large Sale Completed',
          message: 'A sale of ₦45,000 was completed by Agent John Doe.',
          timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
          read: true,
          priority: 'low',
        },
        {
          id: '4',
          type: 'inventory',
          title: 'Inventory Check Due',
          message: 'Daily inventory check is due. Please complete stock count.',
          timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
          read: false,
          priority: 'medium',
        },
        {
          id: '5',
          type: 'security',
          title: 'Camera Tampering Detected',
          message: 'Camera #1 was moved unexpectedly at 14:30.',
          timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
          read: true,
          priority: 'high',
        },
        {
          id: '6',
          type: 'system',
          title: 'System Update Available',
          message: 'A new version of the app is available for download.',
          timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
          read: true,
          priority: 'low',
        },
        {
          id: '7',
          type: 'inventory',
          title: 'Discrepancy Found',
          message: 'Inventory check found 5 units missing for Golden Penny Spaghetti.',
          timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
          read: true,
          priority: 'high',
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const applyFilter = () => {
    let filtered = [...notifications];
    
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(notification => !notification.read);
        break;
      case 'security':
        filtered = filtered.filter(notification => notification.type === 'security');
        break;
      case 'inventory':
        filtered = filtered.filter(notification => notification.type === 'inventory');
        break;
    }
    
    setFilteredNotifications(filtered);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return 'shield-outline';
      case 'inventory':
        return 'cube-outline';
      case 'sales':
        return 'cart-outline';
      case 'system':
        return 'settings-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return theme.colors.error;
      case 'inventory':
        return theme.colors.warning;
      case 'sales':
        return theme.colors.success;
      case 'system':
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.info;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'security':
        navigation.navigate('Cameras');
        break;
      case 'inventory':
        navigation.navigate('Inventory');
        break;
      case 'sales':
        navigation.navigate('Sales');
        break;
      default:
        // Just mark as read
        break;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {notifications.filter(n => !n.read).length} unread • {notifications.length} total
        </Text>
      </View>
      <TouchableOpacity
        style={styles.markAllButton}
        onPress={markAllAsRead}
        disabled={notifications.filter(n => !n.read).length === 0}
      >
        <Text style={[styles.markAllText, { 
          color: notifications.filter(n => !n.read).length === 0 
            ? theme.colors.textTertiary 
            : theme.colors.primary 
        }]}>
          Mark all read
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterButtons = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        style={[
          styles.filterButton,
          { 
            backgroundColor: filter === 'all' 
              ? theme.colors.primary + '20' 
              : theme.colors.surface,
            borderColor: filter === 'all' 
              ? theme.colors.primary 
              : theme.colors.border,
          }
        ]}
        onPress={() => setFilter('all')}
      >
        <Text style={[
          styles.filterText,
          { color: filter === 'all' ? theme.colors.primary : theme.colors.text }
        ]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          { 
            backgroundColor: filter === 'unread' 
              ? theme.colors.primary + '20' 
              : theme.colors.surface,
            borderColor: filter === 'unread' 
              ? theme.colors.primary 
              : theme.colors.border,
          }
        ]}
        onPress={() => setFilter('unread')}
      >
        <Text style={[
          styles.filterText,
          { color: filter === 'unread' ? theme.colors.primary : theme.colors.text }
        ]}>
          Unread
        </Text>
        {notifications.filter(n => !n.read).length > 0 && (
          <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.filterBadgeText}>
              {notifications.filter(n => !n.read).length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          { 
            backgroundColor: filter === 'security' 
              ? theme.colors.error + '20' 
              : theme.colors.surface,
            borderColor: filter === 'security' 
              ? theme.colors.error 
              : theme.colors.border,
          }
        ]}
        onPress={() => setFilter('security')}
      >
        <Ionicons 
          name="shield-outline" 
          size={14} 
          color={filter === 'security' ? theme.colors.error : theme.colors.text} 
        />
        <Text style={[
          styles.filterText,
          { color: filter === 'security' ? theme.colors.error : theme.colors.text }
        ]}>
          Security
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          { 
            backgroundColor: filter === 'inventory' 
              ? theme.colors.warning + '20' 
              : theme.colors.surface,
            borderColor: filter === 'inventory' 
              ? theme.colors.warning 
              : theme.colors.border,
          }
        ]}
        onPress={() => setFilter('inventory')}
      >
        <Ionicons 
          name="cube-outline" 
          size={14} 
          color={filter === 'inventory' ? theme.colors.warning : theme.colors.text} 
        />
        <Text style={[
          styles.filterText,
          { color: filter === 'inventory' ? theme.colors.warning : theme.colors.text }
        ]}>
          Inventory
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const typeColor = getTypeColor(item.type);
    const priorityColor = getPriorityColor(item.priority);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard, 
          { 
            backgroundColor: theme.colors.surface,
            borderLeftColor: typeColor,
            borderLeftWidth: item.read ? 0 : 4,
          }
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.typeIconContainer}>
            <View style={[styles.typeIcon, { backgroundColor: typeColor + '20' }]}>
              <Ionicons name={getTypeIcon(item.type)} size={16} color={typeColor} />
            </View>
          </View>
          
          <View style={styles.notificationContent}>
            <View style={styles.notificationTitleRow}>
              <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {item.priority}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}>
              {item.message}
            </Text>
            
            <View style={styles.notificationFooter}>
              <Text style={[styles.timestamp, { color: theme.colors.textTertiary }]}>
                {moment(item.timestamp).fromNow()}
              </Text>
              
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteNotification(item.id)}
          >
            <Ionicons name="close" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Notifications
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {filter !== 'all' 
          ? 'No notifications match your filter'
          : 'You\'re all caught up!'
        }
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderFilterButtons()}

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterBadge: {
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  separator: {
    height: 12,
  },
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIconContainer: {
    marginRight: 12,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});