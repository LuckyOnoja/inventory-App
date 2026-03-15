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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';
import { GlassCard } from '../../components/ui/GlassCard';
import SaleCard from '../../components/sales/SaleCard';
import SalesFilterModal from '../../components/sales/SalesFilterModal';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

interface Sale {
  id: string;
  saleNumber: string;
  totalAmount: number;
  paymentMethod: string;
  agentName: string;
  createdAt: string;
  itemsCount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

interface FilterState {
  period: 'today' | 'week' | 'month' | '3months' | 'all';
  paymentMethod: 'all' | 'cash' | 'card' | 'transfer';
  status: 'all' | 'completed' | 'pending' | 'cancelled';
  sortBy: 'recent' | 'amount' | 'agent';
}

export default function SalesScreen({ navigation, route }: any) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    period: 'today',
    paymentMethod: 'all',
    status: 'all',
    sortBy: 'recent',
  });
  const { theme } = useTheme();

  useEffect(() => {
    fetchSales();
    
    // Check for initial filters passed from Dashboard
    if (route.params?.initialFilter) {
      setFilters(prev => ({ ...prev, ...route.params.initialFilter }));
    }
  }, [route.params]);

  useEffect(() => {
    applyFilters();
  }, [sales, filters, searchQuery]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/sales`);
      setSales(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales();
  };

  const applyFilters = () => {
    let filtered = [...sales];

    if (searchQuery.trim()) {
      filtered = filtered.filter(sale =>
        sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.agentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const now = new Date();
    switch (filters.period) {
      case 'today':
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekLimit = new Date();
        weekLimit.setDate(weekLimit.getDate() - 7);
        filtered = filtered.filter(sale => new Date(sale.createdAt) >= weekLimit);
        break;
      case 'month':
        const monthLimit = new Date();
        monthLimit.setDate(monthLimit.getDate() - 30);
        filtered = filtered.filter(sale => new Date(sale.createdAt) >= monthLimit);
        break;
      case '3months':
        const threeMonthsLimit = new Date();
        threeMonthsLimit.setDate(threeMonthsLimit.getDate() - 90);
        filtered = filtered.filter(sale => new Date(sale.createdAt) >= threeMonthsLimit);
        break;
    }

    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(sale =>
        sale.paymentMethod === filters.paymentMethod
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(sale => 
        sale.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'recent':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'amount':
          comparison = b.totalAmount - a.totalAmount;
          break;
        case 'agent':
          comparison = a.agentName.localeCompare(b.agentName);
          break;
      }
      return comparison;
    });

    setFilteredSales(filtered);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.period !== 'today') count++;
    if (filters.paymentMethod !== 'all') count++;
    if (filters.status !== 'all') count++;
    return count;
  };

  const renderHeader = () => {
    const total = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerGreeting, { color: theme.colors.textTertiary }]}>REVENUE STREAM</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Transaction Hub</Text>
          </View>
          <TouchableOpacity
            style={[styles.newSaleButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('NewSale')}
          >
            <Ionicons name="add" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <GlassView style={styles.statCard} intensity={15}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{filteredSales.length}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>TOTAL OPS</Text>
          </GlassView>
          <GlassView style={styles.statCard} intensity={15}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {total >= 1000 ? `₦${(total / 1000).toFixed(1)}k` : `₦${total.toLocaleString()}`}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>NET VOLUME</Text>
          </GlassView>
        </View>
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <GlassView style={styles.searchContainer} intensity={25}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Filter Transaction Tokens..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: getActiveFilterCount() > 0 ? theme.colors.primary + '20' : 'transparent' }]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={20} color={getActiveFilterCount() > 0 ? theme.colors.primary : theme.colors.text} />
          {getActiveFilterCount() > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </GlassView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassView style={styles.emptyIconContainer} intensity={10}>
        <Ionicons name="receipt-outline" size={48} color={theme.colors.textTertiary} />
      </GlassView>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Nexus Empty</Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No sales transactions have been recorded for the selected frequency.</Text>
      <TouchableOpacity
        style={[styles.emptyButton, { borderColor: theme.colors.primary, borderWidth: 1 }]}
        onPress={() => navigation.navigate('NewSale')}
      >
        <Text style={[styles.emptyButtonText, { color: theme.colors.primary }]}>Initiate Transaction</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>SYNCING SALES ARCHIVE...</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={filteredSales}
        renderItem={({ item }) => (
          <SaleCard
            sale={item}
            onPress={() => navigation.navigate('SaleDetail', { saleId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderSearchBar()}
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <SalesFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerGreeting: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  newSaleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 27,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});