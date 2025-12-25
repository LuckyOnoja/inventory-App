// screens/staff/StaffSalesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

export default function StaffSalesScreen({ navigation, route }: any) {
  const { staffId, staffName } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { theme } = useTheme();
  const { token } = useAuth();

  useEffect(() => {
    fetchSalesData();
  }, [staffId]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      // Fetch sales for this staff member
      const [salesResponse, statsResponse] = await Promise.all([
        axios.get(`${API_URL}/sales?agentId=${staffId}&limit=50`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_URL}/sales/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (salesResponse.data.success) {
        setSales(salesResponse.data.data);
      }

      // You might want to create a specific endpoint for staff sales stats
      if (statsResponse.data.success) {
        // Filter stats for this specific agent
        const agentStats = statsResponse.data.data.salesByAgent?.find(
          (agent: any) => agent.agentId === staffId
        );
        setStats(agentStats || {});
      }
    } catch (error: any) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSalesData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSaleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.saleCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('SaleDetails', { saleId: item.id })}
    >
      <View style={styles.saleHeader}>
        <View>
          <Text style={[styles.saleNumber, { color: theme.colors.text }]}>
            {item.saleNumber}
          </Text>
          <Text style={[styles.saleDate, { color: theme.colors.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={[
          styles.paymentBadge,
          { backgroundColor: theme.colors.primary + '20' }
        ]}>
          <Text style={[styles.paymentText, { color: theme.colors.primary }]}>
            {item.paymentMethod}
          </Text>
        </View>
      </View>
      
      <View style={styles.saleDetails}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Total Amount
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {formatCurrency(item.totalAmount)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Items
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {item.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Status
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'COMPLETED' ? theme.colors.success + '20' : theme.colors.warning + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'COMPLETED' ? theme.colors.success : theme.colors.warning }
            ]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {staffName}'s Sales
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {sales.length} total sales
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Stats Summary */}
      {stats && (
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Sales
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.salesCount || 0}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Revenue
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatCurrency(stats.totalAmount || 0)}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={sales}
        renderItem={renderSaleItem}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Sales Found
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              This staff member has not made any sales yet
            </Text>
          </View>
        }
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  separator: {
    height: 12,
  },
  saleCard: {
    padding: 16,
    borderRadius: 16,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  saleNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 12,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  saleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: '#666',
  },
});