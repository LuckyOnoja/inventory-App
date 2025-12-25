import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import RecentSales from '../../components/dashboard/RecentSales';
import LowStockAlert from '../../components/dashboard/LowStockAlert';
import QuickActions from '../../components/dashboard/QuickActions';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

interface DashboardStats {
  todaySales: number;
  totalProducts: number;
  pendingChecks: number;
  activeDevices: number;
  lowStockCount: number;
  weeklySales: number[];
}

interface RecentSale {
  id: string;
  saleNumber: string;
  totalAmount: number;
  agentName: string;
  createdAt: string;
  itemsCount: number;
}

interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  category: string;
}

export default function DashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalProducts: 0,
    pendingChecks: 0,
    activeDevices: 0,
    lowStockCount: 0,
    weeklySales: [0, 0, 0, 0, 0, 0, 0],
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsRes, salesRes, lowStockRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`),
        axios.get(`${API_URL}/sales/recent?limit=5`),
        axios.get(`${API_URL}/products/low-stock?limit=3`),
      ]);

      setStats(statsRes.data);
      setRecentSales(salesRes.data);
      setLowStockItems(lowStockRes.data);
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

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'newSale':
        navigation.navigate('NewSale');
        break;
      case 'addProduct':
        navigation.navigate('AddProduct');
        break;
      case 'inventoryCheck':
        navigation.navigate('InventoryCheck');
        break;
      case 'viewAlerts':
        navigation.navigate('Notifications');
        break;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: stats.weeklySales,
      color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}!
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          {stats.pendingChecks > 0 && (
            <View style={[styles.notificationBadge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.notificationCount}>{stats.pendingChecks}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Today's Sales"
          value={`₦${stats.todaySales.toLocaleString()}`}
          change="+12.5%"
          icon="cash-outline"
          color={theme.colors.primary}
          onPress={() => navigation.navigate('Sales')}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon="cube-outline"
          color={theme.colors.secondary}
          onPress={() => navigation.navigate('Products')}
        />
        <StatCard
          title="Pending Checks"
          value={stats.pendingChecks.toString()}
          icon="clipboard-outline"
          color={theme.colors.warning}
          onPress={() => navigation.navigate('Inventory')}
        />
        <StatCard
          title="Active Devices"
          value={stats.activeDevices.toString()}
          icon="camera-outline"
          color={theme.colors.success}
          onPress={() => navigation.navigate('Cameras')}
        />
      </View>

      {/* Sales Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Weekly Sales Trend
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              View Details
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
          <LineChart
            data={chartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={false}
            withShadow={false}
            withDots={true}
            withHorizontalLabels={true}
            withVerticalLabels={true}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} />

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Low Stock Alert
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All ({stats.lowStockCount})
              </Text>
            </TouchableOpacity>
          </View>
          <LowStockAlert 
            items={lowStockItems} 
            onViewAll={() => navigation.navigate('Products')}
          />
        </View>
      )}

      {/* Recent Sales */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Sales
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <RecentSales 
          sales={recentSales} 
          onViewAll={() => navigation.navigate('Sales')}
          onPressSale={(saleId) => navigation.navigate('SaleDetail', { saleId })}
        />
      </View>

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
  },
  chart: {
    borderRadius: 16,
  },
  bottomPadding: {
    height: 80,
  },
});