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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';
import { GlassButton } from '../../components/ui/GlassButton';
import axios from 'axios';
import moment from 'moment';
import config from '../../config';

const API_URL = config.API_URL;

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | string>('all');
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0,
    byType: [],
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [notifications, filter]);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (filter !== 'all') {
        if (filter === 'unread') {
          params.append('read', 'false');
        } else {
          params.append('type', filter);
        }
      }

      const response = await axios.get(`${API_URL}/notifications?${params}`);

      if (response.data.success) {
        const data = response.data.data;
        setNotifications(data);
        setStats(response.data.statistics || {
          total: data.length,
          unread: data.filter((n: Notification) => !n.read).length,
          read: data.filter((n: Notification) => n.read).length,
          byType: [],
        });
        setPagination(response.data.pagination || {
          page: 1,
          limit: 20,
          total: data.length,
          pages: Math.ceil(data.length / 20),
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`);
      if (response.data.success) {
        setStats(prev => ({
          ...prev,
          unread: response.data.data.count,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
    fetchUnreadCount();
  };

  const applyFilter = () => {
    let filtered = [...notifications];

    if (filter === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    } else if (filter !== 'all') {
      filtered = filtered.filter(notification => notification.type === filter);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`);

      if (response.data.success) {
        setNotifications(prev => prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        ));
        fetchUnreadCount();
      }
    } catch (error: any) {
      console.error('Failed to mark as read:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(`${API_URL}/notifications/read-all`);

      if (response.data.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        fetchUnreadCount();
        Alert.alert('Success', response.data.message);
      }
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_URL}/notifications/${notificationId}`);

              if (response.data.success) {
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
                fetchUnreadCount();
              }
            } catch (error: any) {
              console.error('Failed to delete notification:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'device_offline':
      case 'camera_alert':
      case 'device_tamper':
        return 'camera-outline';
      case 'low_stock':
      case 'inventory_check':
      case 'discrepancy':
      case 'restock':
      case 'inventory_adjustment':
        return 'cube-outline';
      case 'sale':
        return 'cart-outline';
      case 'system':
      case 'welcome':
      case 'role_change':
      case 'account_status':
        return 'settings-outline';
      case 'user':
        return 'person-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'device_offline':
      case 'camera_alert':
      case 'device_tamper':
        return theme.colors.error;
      case 'low_stock':
      case 'discrepancy':
      case 'inventory_adjustment':
        return theme.colors.warning;
      case 'sale':
      case 'restock':
        return theme.colors.success;
      case 'inventory_check':
        return theme.colors.info;
      case 'system':
      case 'welcome':
      case 'role_change':
      case 'account_status':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'device_offline':
        return 'Camera Offline';
      case 'camera_alert':
        return 'Camera Alert';
      case 'device_tamper':
        return 'Device Tampering';
      case 'low_stock':
        return 'Low Stock';
      case 'inventory_check':
        return 'Inventory Check';
      case 'discrepancy':
        return 'Discrepancy';
      case 'restock':
        return 'Restock';
      case 'inventory_adjustment':
        return 'Inventory Adjustment';
      case 'sale':
        return 'Sale';
      case 'system':
        return 'System';
      case 'welcome':
        return 'Welcome';
      case 'role_change':
        return 'Role Change';
      case 'account_status':
        return 'Account Status';
      case 'user':
        return 'User Activity';
      default:
        return type.replace('_', ' ');
    }
  };

  const getPriority = (type: string): 'low' | 'medium' | 'high' => {
    switch (type) {
      case 'device_offline':
      case 'device_tamper':
      case 'camera_alert':
      case 'discrepancy':
        return 'high';
      case 'low_stock':
      case 'inventory_adjustment':
        return 'medium';
      default:
        return 'low';
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
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Parse data if available
    let notificationData = null;
    if (notification.data) {
      try {
        notificationData = JSON.parse(notification.data);
      } catch (error) {
        console.error('Failed to parse notification data:', error);
      }
    }

    // Navigate based on notification type and data
    switch (notification.type) {
      case 'device_offline':
      case 'camera_alert':
      case 'device_tamper':
        navigation.navigate('Cameras');
        break;
      case 'low_stock':
      case 'inventory_check':
      case 'discrepancy':
      case 'restock':
      case 'inventory_adjustment':
        navigation.navigate('Inventory');
        break;
      case 'sale':
        if (notificationData?.saleId) {
          navigation.navigate('SaleDetail', { saleId: notificationData.saleId });
        } else {
          navigation.navigate('Sales');
        }
        break;
      case 'role_change':
      case 'account_status':
        navigation.navigate('Profile');
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
          {stats.unread} unread • {stats.total} total
        </Text>
      </View>
      <GlassButton
        size="small"
        variant="ghost"
        onPress={markAllAsRead}
        disabled={stats.unread === 0}
        title="Mark all read"
        style={{ width: "auto" }}
      />
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <GlassButton
          size="small"
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onPress={() => setFilter('all')}
          title="All"
          style={{ width: "auto", marginRight: 8 }}
        />

        <GlassButton
          size="small"
          variant={filter === 'unread' ? 'primary' : 'secondary'}
          onPress={() => setFilter('unread')}
          title={`Unread ${stats.unread > 0 ? `(${stats.unread})` : ''}`}
          style={{ width: "auto", marginRight: 8 }}
        />

        <GlassButton
          size="small"
          variant="secondary"
          onPress={() => setShowFilterModal(true)}
          icon="options-outline"
          title="More"
          style={{ width: "auto" }}
        />
      </ScrollView>
    </View>
  );

  const renderFilterModal = () => {
    const typeFilters = stats.byType.map(stat => stat.type);
    const uniqueTypes = Array.from(new Set(['sale', 'inventory_check', 'low_stock', 'device_offline', ...typeFilters]));

    return (
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    Filter by Type
                  </Text>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.typeList}>
                  {uniqueTypes.map((type) => {
                    const typeCount = stats.byType.find(t => t.type === type)?.count || 0;
                    const isSelected = filter === type;

                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeItem,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.primary + '20'
                              : 'transparent',
                            borderBottomColor: theme.colors.border,
                          }
                        ]}
                        onPress={() => {
                          setFilter(type);
                          setShowFilterModal(false);
                        }}
                      >
                        <View style={styles.typeItemContent}>
                          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(type) + '20' }]}>
                            <Ionicons
                              name={getTypeIcon(type) as any}
                              size={16}
                              color={getTypeColor(type)}
                            />
                          </View>
                          <View style={styles.typeTexts}>
                            <Text style={[
                              styles.typeLabel,
                              { color: isSelected ? theme.colors.primary : theme.colors.text }
                            ]}>
                              {getTypeLabel(type)}
                            </Text>
                            <Text style={[styles.typeCount, { color: theme.colors.textSecondary }]}>
                              {typeCount} notifications
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.resetButton, { borderColor: theme.colors.border }]}
                    onPress={() => {
                      setFilter('all');
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={[styles.resetText, { color: theme.colors.text }]}>
                      Show All
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const typeColor = getTypeColor(item.type);
    const priority = getPriority(item.type);
    const priorityColor = getPriorityColor(priority);

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
        style={{ marginBottom: 12 }}
      >
        <GlassView
          style={[
            styles.notificationCard,
            {
              borderLeftColor: typeColor,
              borderLeftWidth: item.read ? 2 : 4,
              opacity: item.read ? 0.9 : 1,
            }
          ]}
          intensity={15}
        >
          <View style={styles.notificationHeader}>
            <View style={styles.typeIconContainer}>
              <View style={[styles.typeIcon, { backgroundColor: typeColor + '20' }]}>
                <Ionicons name={getTypeIcon(item.type)} size={18} color={typeColor} />
              </View>
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationTitleRow}>
                <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                  <Text style={[styles.priorityText, { color: priorityColor }]}>
                    {priority}
                  </Text>
                </View>
              </View>

              <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}>
                {item.message}
              </Text>

              <View style={styles.notificationFooter}>
                <View style={styles.typeBadge}>
                  <Text style={[styles.typeText, { color: typeColor }]}>
                    {getTypeLabel(item.type)}
                  </Text>
                </View>

                <View style={styles.footerRight}>
                  <Text style={[styles.timestamp, { color: theme.colors.textTertiary }]}>
                    {moment(item.createdAt).fromNow()}
                  </Text>

                  {!item.read && (
                    <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteNotification(item.id)}
            >
              <Ionicons name="close" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {filter !== 'all'
          ? 'No Notifications Found'
          : 'No Notifications Yet'
        }
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {filter !== 'all'
          ? `No ${filter === 'unread' ? 'unread' : getTypeLabel(filter)} notifications found`
          : 'You\'re all caught up! New notifications will appear here.'
        }
      </Text>
      {filter !== 'all' && (
        <GlassButton
          size="medium"
          variant="primary"
          onPress={() => setFilter('all')}
          title="Show All Notifications"
          style={{ width: "auto" }}
        />
      )}
    </View>
  );

  const renderLoadMore = () => {
    if (pagination.page >= pagination.pages) {
      return null;
    }

    return (
      <GlassButton
        size="medium"
        variant="secondary"
        onPress={() => fetchNotifications(pagination.page + 1)}
        title="Load More"
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading notifications...
        </Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
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
        ListFooterComponent={renderLoadMore}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={() => {
          if (pagination.page < pagination.pages) {
            fetchNotifications(pagination.page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />

      {renderFilterModal()}
    </ScreenWrapper>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
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
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 20,
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
  moreFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    gap: 6,
  },
  moreFiltersText: {
    fontSize: 14,
    fontWeight: '500',
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
    borderLeftWidth: 4,
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
    marginBottom: 8,
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
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 16,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  typeList: {
    maxHeight: 400,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  typeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  typeTexts: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  typeCount: {
    fontSize: 12,
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
});