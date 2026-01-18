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
import { GlassButton } from '../../components/ui/GlassButton';
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
  period: 'today' | 'week' | 'month' | 'all';
  paymentMethod: 'all' | 'cash' | 'card' | 'transfer';
  status: 'all' | 'completed' | 'pending' | 'cancelled';
  sortBy: 'recent' | 'amount' | 'agent';
}

export default function SalesScreen({ navigation }: any) {
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
  }, []);

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

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(sale =>
        sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.agentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply period filter
    const now = new Date();
    switch (filters.period) {
      case 'today':
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(sale => new Date(sale.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(sale => new Date(sale.createdAt) >= monthAgo);
        break;
    }

    // Apply payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(sale =>
        sale.paymentMethod === filters.paymentMethod
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(sale => sale.status === filters.status);
    }

    // Apply sorting
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

  const getTotalSales = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Sales
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {filteredSales.length} sales • ₦{getTotalSales().toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.newSaleButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('NewSale')}
      >
        <Ionicons name="add" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <GlassView style={styles.searchContainer} intensity={20}>
      <Ionicons name="search-outline" size={20} color={theme.colors.textTertiary} />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search sales by number or agent..."
        placeholderTextColor={theme.colors.textTertiary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Ionicons name="filter-outline" size={20} color={theme.colors.text} />
        {getActiveFilterCount() > 0 && (
          <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
          </View>
        )}
      </TouchableOpacity>
    </GlassView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Sales Found
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {searchQuery || getActiveFilterCount() > 0
          ? 'Try adjusting your search or filters'
          : 'Make your first sale to get started'
        }
      </Text>
      {!searchQuery && getActiveFilterCount() === 0 && (
        <GlassButton
          title="New Sale"
          onPress={() => navigation.navigate('NewSale')}
          icon="add"
          size="medium"
          variant="primary"
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  const renderSaleItem = ({ item }: { item: Sale }) => (
    <SaleCard
      sale={item}
      onPress={() => navigation.navigate('SaleDetail', { saleId: item.id })}
    />
  );

  if (loading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {renderHeader()}
      {renderSearchBar()}

      <FlatList
        data={filteredSales}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
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
  newSaleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
    height: '100%',
  },
  filterButton: {
    position: 'relative',
    padding: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 8,
  },
  separator: {
    height: 12,
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
    marginTop: 12,
    minWidth: 160,
  },
});