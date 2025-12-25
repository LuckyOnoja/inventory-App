// screens/dashboard/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = 'http://172.20.10.2:5000/api';

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockItems: number;
  pendingChecks: number;
  activeStaff: number;
  cameraIssues: number;
}

export default function DashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockItems: 0,
    pendingChecks: 0,
    activeStaff: 0,
    cameraIssues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch from your API
      // For now, using mock data
      const mockStats = {
        totalSales: 157,
        totalRevenue: 2450000,
        totalProducts: 89,
        lowStockItems: 12,
        pendingChecks: 2,
        activeStaff: 5,
        cameraIssues: 1,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onPress,
    subtitle = '' 
  }: any) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.statSubtitle, { color: theme.colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={theme.colors.textTertiary} 
      />
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Dashboard
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Today's Overview
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Sales"
            value={stats.totalSales}
            icon="cart-outline"
            color={theme.colors.primary}
            onPress={() => navigation.navigate('Sales')}
          />
          <StatCard
            title="Revenue"
            value={`₦${stats.totalRevenue.toLocaleString()}`}
            icon="cash-outline"
            color={theme.colors.success}
            onPress={() => navigation.navigate('Reports')}
          />
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon="cube-outline"
            color={theme.colors.info}
            onPress={() => navigation.navigate('Products')}
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockItems}
            icon="warning-outline"
            color={theme.colors.warning}
            onPress={() => navigation.navigate('Inventory')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="New Sale"
              icon="add-circle-outline"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('NewSale')}
            />
            <QuickAction
              title="Check Inventory"
              icon="clipboard-outline"
              color={theme.colors.success}
              onPress={() => navigation.navigate('InventoryCheck')}
            />
            <QuickAction
              title="Add Product"
              icon="add-outline"
              color={theme.colors.info}
              onPress={() => navigation.navigate('AddProduct')}
            />
            <QuickAction
              title="View Reports"
              icon="document-text-outline"
              color={theme.colors.warning}
              onPress={() => navigation.navigate('Reports')}
            />
          </View>
        </View>

        {/* Security Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Security Status
          </Text>
          <StatCard
            title="Pending Checks"
            value={stats.pendingChecks}
            icon="time-outline"
            color={theme.colors.warning}
            subtitle="Inventory checks due"
            onPress={() => navigation.navigate('Inventory')}
          />
          <StatCard
            title="Active Staff"
            value={stats.activeStaff}
            icon="people-outline"
            color={theme.colors.success}
            subtitle="On duty"
            onPress={() => navigation.navigate('Staff')}
          />
          <StatCard
            title="Camera Issues"
            value={stats.cameraIssues}
            icon="camera-outline"
            color={stats.cameraIssues > 0 ? theme.colors.error : theme.colors.success}
            subtitle={stats.cameraIssues > 0 ? "Requires attention" : "All systems normal"}
            onPress={() => navigation.navigate('Cameras')}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Activity
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.activityCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: theme.colors.text }]}>
                  Sale completed - #S-00157
                </Text>
                <Text style={[styles.activityTime, { color: theme.colors.textTertiary }]}>
                  2 minutes ago
                </Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: theme.colors.text }]}>
                  Camera #3 went offline
                </Text>
                <Text style={[styles.activityTime, { color: theme.colors.textTertiary }]}>
                  15 minutes ago
                </Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.info + '20' }]}>
                <Ionicons name="cube-outline" size={16} color={theme.colors.info} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: theme.colors.text }]}>
                  Product "Indomie" running low
                </Text>
                <Text style={[styles.activityTime, { color: theme.colors.textTertiary }]}>
                  1 hour ago
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  statsGrid: {
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
});