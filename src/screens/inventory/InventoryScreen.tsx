// screens/inventory/InventoryScreen.tsx
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface ProductInventory {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface FilterState {
  category: string;
  status: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  sortBy: 'name' | 'quantity' | 'recent';
}

export default function InventoryScreen({ navigation }: any) {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    status: 'all',
    sortBy: 'name',
  });
  const { theme } = useTheme();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, filters, searchQuery]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockInventory: ProductInventory[] = [
        {
          id: '1',
          productId: 'P001',
          productName: 'Indomie Chicken',
          productCode: 'IND-001',
          category: 'Food',
          currentStock: 45,
          minStock: 20,
          maxStock: 100,
          unit: 'pack',
          costPrice: 120,
          sellingPrice: 200,
          lastUpdated: new Date().toISOString(),
          status: 'in_stock',
        },
        {
          id: '2',
          productId: 'P002',
          productName: 'Coke 50cl',
          productCode: 'COK-001',
          category: 'Drinks',
          currentStock: 12,
          minStock: 30,
          maxStock: 150,
          unit: 'bottle',
          costPrice: 90,
          sellingPrice: 150,
          lastUpdated: new Date().toISOString(),
          status: 'low_stock',
        },
        {
          id: '3',
          productId: 'P003',
          productName: 'Peak Milk Tin',
          productCode: 'PM-001',
          category: 'Dairy',
          currentStock: 0,
          minStock: 15,
          maxStock: 50,
          unit: 'tin',
          costPrice: 1500,
          sellingPrice: 1800,
          lastUpdated: new Date().toISOString(),
          status: 'out_of_stock',
        },
        // Add more mock data as needed
      ];
      setInventory(mockInventory);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'quantity':
          return a.currentStock - b.currentStock;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    setFilteredInventory(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return theme.colors.success;
      case 'low_stock':
        return theme.colors.warning;
      case 'out_of_stock':
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  const getStockPercentage = (item: ProductInventory) => {
    if (item.maxStock === 0) return 0;
    return (item.currentStock / item.maxStock) * 100;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Inventory
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {filteredInventory.length} items • {
            filteredInventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length
          } need attention
        </Text>
      </View>
      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigation.navigate('InventoryCheck')}
      >
        <Ionicons name="clipboard-outline" size={20} color={theme.colors.white} />
        <Text style={[styles.newButtonText, { color: theme.colors.white }]}>
          Check
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
      <Ionicons name="search-outline" size={20} color={theme.colors.textTertiary} />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search products..."
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
      </TouchableOpacity>
    </View>
  );

  const renderInventoryItem = ({ item }: { item: ProductInventory }) => {
    const statusColor = getStatusColor(item.status);
    const stockPercentage = getStockPercentage(item);
    
    return (
      <TouchableOpacity
        style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.productName, { color: theme.colors.text }]}>
              {item.productName}
            </Text>
            <Text style={[styles.productCode, { color: theme.colors.textTertiary }]}>
              {item.productCode} • {item.category}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.stockInfo}>
          <View style={styles.stockDetails}>
            <Text style={[styles.stockLabel, { color: theme.colors.textSecondary }]}>
              Current Stock
            </Text>
            <Text style={[styles.stockValue, { color: theme.colors.text }]}>
              {item.currentStock} {item.unit}
            </Text>
          </View>
          
          <View style={styles.stockRange}>
            <Text style={[styles.rangeLabel, { color: theme.colors.textTertiary }]}>
              Min: {item.minStock}
            </Text>
            <Text style={[styles.rangeLabel, { color: theme.colors.textTertiary }]}>
              Max: {item.maxStock}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${stockPercentage}%`,
                  backgroundColor: statusColor,
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {stockPercentage.toFixed(0)}% of max stock
          </Text>
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.priceInfo}>
            <Text style={[styles.costPrice, { color: theme.colors.textSecondary }]}>
              Cost: ₦{item.costPrice.toLocaleString()}
            </Text>
            <Text style={[styles.sellingPrice, { color: theme.colors.text }]}>
              Price: ₦{item.sellingPrice.toLocaleString()}
            </Text>
          </View>
          
          {item.status === 'low_stock' && (
            <TouchableOpacity style={styles.restockButton}>
              <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.restockText, { color: theme.colors.primary }]}>
                Restock
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Inventory Found
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {searchQuery || filters.category !== 'all' || filters.status !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Add products to get started'
        }
      </Text>
      {!searchQuery && filters.category === 'all' && filters.status === 'all' && (
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
          <Text style={[styles.emptyButtonText, { color: theme.colors.white }]}>
            Add Product
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

      <FlatList
        data={filteredInventory}
        renderItem={renderInventoryItem}
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

      {/* Filter Modal would go here */}
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
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  newButtonText: {
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
  filterButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  separator: {
    height: 12,
  },
  itemCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  productCode: {
    fontSize: 12,
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
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockDetails: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stockRange: {
    flexDirection: 'row',
    gap: 12,
  },
  rangeLabel: {
    fontSize: 11,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'right',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flex: 1,
  },
  costPrice: {
    fontSize: 11,
    marginBottom: 2,
  },
  sellingPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  restockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    gap: 4,
  },
  restockText: {
    fontSize: 12,
    fontWeight: '600',
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