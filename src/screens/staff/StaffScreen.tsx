// screens/staff/StaffScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

interface StaffMember {
  id: string;
  staffId: string;
  email: string;
  name: string;
  phone: string;
  role: 'SALES_AGENT' | 'STAFF' | 'MANAGER';
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive: string;
  createdAt?: string;
  updatedAt?: string;
  salesCount?: number;
  totalSales?: number;
  permissions?: string[];
}

export default function StaffScreen({ navigation }: any) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const { theme } = useTheme();
  const { user, token } = useAuth();

  useEffect(() => {
    fetchStaff();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [staff, filter, searchQuery]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Transform the API data to match your frontend interface
        const staffData: StaffMember[] = response.data.data.map((user: any) => ({
          id: user.id,
          staffId: user.id.substring(0, 6).toUpperCase(), // Generate a short ID for display
          name: user.name,
          email: user.email,
          phone: user.phone || 'Not provided',
          role: user.role as 'SALES_AGENT' | 'SUPERVISOR' | 'MANAGER',
          status: user.status ? 'active' : 'inactive',
          joinDate: new Date(user.createdAt).toISOString().split('T')[0],
          lastActive: new Date(user.updatedAt).toISOString(),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          salesCount: 0, // You might want to fetch this separately
          totalSales: 0, // You might want to fetch this separately
          permissions: getPermissionsByRole(user.role),
        }));
        setStaff(staffData);
      }
    } catch (error: any) {
      console.error('Failed to fetch staff:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to load staff data'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const getPermissionsByRole = (role: string): string[] => {
    switch (role) {
      case 'SALES_AGENT':
        return ['sales', 'inventory_view', 'staff_manage'];
      case 'STAFF':
        return ['sales', 'inventory_view'];
      default:
        return [];
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaff();
    fetchLeaderboard();
  };

  const applyFilters = () => {
    let filtered = [...staff];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(member => member.status === filter);
    }

    // Sort by status (active first) and then by name
    filtered.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return a.name.localeCompare(b.name);
    });

    setFilteredStaff(filtered);
  };

  const getStatusColor = (status: 'active' | 'inactive'): string => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'inactive':
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  };

  const getStatusText = (status: 'active' | 'inactive'): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const getRoleText = (role: string): string => {
    switch (role) {
      case 'SALES_AGENT':
        return 'Branch Manager';
      case 'STAFF':
        return 'Staff Member';
      case 'MANAGER':
        return 'Admin';
      default:
        return role;
    }
  };

  const handleAddStaff = () => {
    navigation.navigate('AddStaff');
  };

  const handleEditStaff = (staffMember: StaffMember) => {
    navigation.navigate('StaffPerformance', { staffId: staffMember.id, name: staffMember.name });
  };

  const handleToggleStatus = async (staffMember: StaffMember) => {
    const newStatus = staffMember.status === 'active' ? false : true;
    const statusText = newStatus ? 'active' : 'inactive';

    Alert.alert(
      'Change Status',
      `Change ${staffMember.name}'s status to ${statusText}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await axios.put(
                `${API_URL}/users/${staffMember.id}/status`,
                { status: newStatus },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                Alert.alert('Success', `Status updated for ${staffMember.name}`);
                fetchStaff(); // Refresh the list
              }
            } catch (error: any) {
              console.error('Failed to update status:', error);
              Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to update status'
              );
            }
          },
        },
      ]
    );
  };

  const handleEditPermissions = (staffMember: StaffMember) => {
    Alert.alert('Access Restricted', 'Permission updates for this staff member are restricted to the business owner.');
  };

  const handleViewSales = (staffMember: StaffMember) => {
    // Navigate to staff performance screen
    navigation.navigate('StaffPerformance', { staffId: staffMember.id, name: staffMember.name });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Sales Leaderboard
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Top performing agents this month
        </Text>
      </View>
      {(user?.role === 'SUPER_ADMIN' || user?.role === 'SALES_AGENT') && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddStaff}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLeaderboard = () => {
    if (leaderboard.length === 0) return null;

    return (
      <View style={styles.leaderboardContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.leaderboardScroll}>
          {leaderboard.slice(0, 5).map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.leaderTile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('StaffPerformance', { staffId: item.id, name: item.name })}
            >
              <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : theme.colors.primary + '20' }]}>
                <Text style={[styles.rankText, { color: index < 3 ? '#000' : theme.colors.primary }]}>#{index + 1}</Text>
              </View>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=${theme.colors.primary.replace('#', '')}&color=fff` }}
                style={styles.leaderAvatar}
              />
              <Text style={[styles.leaderName, { color: theme.colors.text }]} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
              <Text style={[styles.leaderRevenue, { color: theme.colors.success }]}>₦{(item.totalRevenue || 0).toLocaleString()}</Text>
              <Text style={[styles.leaderSales, { color: theme.colors.textTertiary }]}>{item.totalSales} Sales</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
      <Ionicons name="search-outline" size={20} color={theme.colors.textTertiary} />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search staff by name or email..."
        placeholderTextColor={theme.colors.textTertiary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: filter === 'all' ? theme.colors.primary + '20' : 'transparent',
            borderColor: filter === 'all' ? theme.colors.primary : theme.colors.border,
          },
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
            backgroundColor: filter === 'active' ? theme.colors.success + '20' : 'transparent',
            borderColor: filter === 'active' ? theme.colors.success : theme.colors.border,
          },
        ]}
        onPress={() => setFilter('active')}
      >
        <Text style={[
          styles.filterText,
          { color: filter === 'active' ? theme.colors.success : theme.colors.text }
        ]}>
          Active
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: filter === 'inactive' ? theme.colors.error + '20' : 'transparent',
            borderColor: filter === 'inactive' ? theme.colors.error : theme.colors.border,
          },
        ]}
        onPress={() => setFilter('inactive')}
      >
        <Text style={[
          styles.filterText,
          { color: filter === 'inactive' ? theme.colors.error : theme.colors.text }
        ]}>
          Inactive
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStaffItem = ({ item }: { item: StaffMember }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={[styles.staffCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleEditStaff(item)}
        activeOpacity={0.7}
      >
        <View style={styles.staffHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=${statusColor.replace('#', '')}&color=fff` }}
              style={styles.avatar}
            />
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>

          <View style={styles.staffInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.staffName, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.roleText, { color: statusColor }]}>
                  {getRoleText(item.role)}
                </Text>
              </View>
            </View>

            <Text style={[styles.staffId, { color: theme.colors.textTertiary }]}>
              {item.staffId}
            </Text>
            <Text style={[styles.staffEmail, { color: theme.colors.textSecondary }]}>
              {item.email}
            </Text>
            <Text style={[styles.staffPhone, { color: theme.colors.textTertiary }]}>
              📞 {item.phone}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'Staff Actions',
                `Select action for ${item.name}:`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'View Details', onPress: () => handleEditStaff(item) },
                  { text: 'View Sales', onPress: () => handleViewSales(item) },
                  { text: 'Edit Permissions', onPress: () => handleEditPermissions(item) },
                  {
                    text: item.status === 'active' ? 'Deactivate' : 'Activate',
                    style: item.status === 'active' ? 'destructive' : 'default',
                    onPress: () => handleToggleStatus(item)
                  },
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Join Date
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {new Date(item.joinDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Last Active
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {new Date(item.lastActive).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Status
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Staff Members
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {searchQuery || filter !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Add your first staff member to get started'
        }
      </Text>
      {!searchQuery && filter === 'all' && user?.role === 'SUPER_ADMIN' && (
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddStaff}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
          <Text style={[styles.emptyButtonText, { color: theme.colors.white }]}>
            Add Staff Member
          </Text>
        </TouchableOpacity>
      )}
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
      {renderLeaderboard()}
      {renderSearchBar()}
      {renderFilterButtons()}

      <FlatList
        data={filteredStaff}
        renderItem={renderStaffItem}
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
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  leaderboardContainer: {
    marginBottom: 20,
  },
  leaderboardScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  leaderTile: {
    width: 140,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '900',
  },
  leaderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  leaderRevenue: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  leaderSales: {
    fontSize: 10,
    fontWeight: '600',
  },
  filterText: {
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
  staffCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  staffInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  staffId: {
    fontSize: 12,
    marginBottom: 2,
  },
  staffEmail: {
    fontSize: 12,
    marginBottom: 2,
  },
  staffPhone: {
    fontSize: 11,
  },
  moreButton: {
    padding: 4,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});