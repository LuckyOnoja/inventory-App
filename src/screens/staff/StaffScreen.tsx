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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = 'http://172.20.10.2:5000/api';

interface StaffMember {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  role: 'SALES_AGENT' | 'SUPERVISOR' | 'MANAGER';
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  lastActive: string;
  salesCount: number;
  totalSales: number;
  permissions: string[];
}

export default function StaffScreen({ navigation }: any) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [staff, filter, searchQuery]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockStaff: StaffMember[] = [
        {
          id: '1',
          staffId: 'AG001',
          name: 'John Doe',
          email: 'john@store.com',
          phone: '08012345678',
          role: 'SALES_AGENT',
          status: 'active',
          joinDate: '2024-01-15',
          lastActive: new Date().toISOString(),
          salesCount: 157,
          totalSales: 2450000,
          permissions: ['sales', 'inventory_view'],
        },
        {
          id: '2',
          staffId: 'AG002',
          name: 'Jane Smith',
          email: 'jane@store.com',
          phone: '08023456789',
          role: 'SALES_AGENT',
          status: 'active',
          joinDate: '2024-02-20',
          lastActive: new Date(Date.now() - 2 * 3600000).toISOString(),
          salesCount: 89,
          totalSales: 1450000,
          permissions: ['sales', 'inventory_view'],
        },
        {
          id: '3',
          staffId: 'SP001',
          name: 'Robert Johnson',
          email: 'robert@store.com',
          phone: '08034567890',
          role: 'SUPERVISOR',
          status: 'active',
          joinDate: '2024-01-05',
          lastActive: new Date(Date.now() - 1 * 3600000).toISOString(),
          salesCount: 0,
          totalSales: 0,
          permissions: ['sales', 'inventory', 'staff_view'],
        },
        {
          id: '4',
          staffId: 'AG003',
          name: 'Sarah Williams',
          email: 'sarah@store.com',
          phone: '08045678901',
          role: 'SALES_AGENT',
          status: 'inactive',
          joinDate: '2024-03-10',
          lastActive: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
          salesCount: 45,
          totalSales: 780000,
          permissions: ['sales'],
        },
        {
          id: '5',
          staffId: 'AG004',
          name: 'Michael Brown',
          email: 'michael@store.com',
          phone: '08056789012',
          role: 'SALES_AGENT',
          status: 'on_leave',
          joinDate: '2024-02-01',
          lastActive: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
          salesCount: 112,
          totalSales: 1890000,
          permissions: ['sales', 'inventory_view'],
        },
      ];
      setStaff(mockStaff);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      Alert.alert('Error', 'Failed to load staff data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaff();
  };

  const applyFilters = () => {
    let filtered = [...staff];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'inactive':
        return theme.colors.error;
      case 'on_leave':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'on_leave':
        return 'On Leave';
      default:
        return 'Unknown';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SALES_AGENT':
        return 'Sales Agent';
      case 'SUPERVISOR':
        return 'Supervisor';
      case 'MANAGER':
        return 'Manager';
      default:
        return role;
    }
  };

  const handleAddStaff = () => {
    navigation.navigate('AddStaff');
  };

  const handleEditStaff = (staffMember: StaffMember) => {
    navigation.navigate('EditStaff', { staffId: staffMember.id });
  };

  const handleToggleStatus = (staffMember: StaffMember) => {
    Alert.alert(
      'Change Status',
      `Change ${staffMember.name}'s status to ${staffMember.status === 'active' ? 'inactive' : 'active'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // API call to update status
            Alert.alert('Success', `Status updated for ${staffMember.name}`);
            fetchStaff();
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Staff Management
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {staff.filter(m => m.status === 'active').length} active • {staff.length} total
        </Text>
      </View>
      {user?.role === 'SUPER_ADMIN' && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddStaff}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
          <Text style={[styles.addButtonText, { color: theme.colors.white }]}>
            Add
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
      <Ionicons name="search-outline" size={20} color={theme.colors.textTertiary} />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search staff by name or ID..."
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
              source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=${statusColor.replace('#', '')}&color=fff` }}
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
          </View>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'Staff Actions',
                `Select action for ${item.name}:`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'View Sales', onPress: () => navigation.navigate('StaffSales', { staffId: item.id }) },
                  { text: 'Edit Permissions', onPress: () => navigation.navigate('EditPermissions', { staffId: item.id }) },
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
              Sales
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {item.salesCount}
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Revenue
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              ₦{(item.totalSales / 1000).toFixed(0)}k
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: 'bold',
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