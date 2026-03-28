import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/products/ProductCard';
import FilterModal from '../../components/products/FilterModal';
import axios from 'axios';
import debounce from 'lodash/debounce';
import config from '../../config';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';
import { GlassCard } from '../../components/ui/GlassCard';

const API_URL = config.API_URL;

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  active: boolean;
}

interface FilterState {
  category: string;
  stockStatus: 'all' | 'low' | 'out' | 'normal';
  sortBy: 'name' | 'stock' | 'price' | 'recent';
  sortOrder: 'asc' | 'desc';
}

export default function ProductsScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    stockStatus: 'all',
    sortBy: 'recent',
    sortOrder: 'desc',
  });
  const { theme } = useTheme();
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product =>
        product.category === filters.category
      );
    }

    // Apply stock status filter
    switch (filters.stockStatus) {
      case 'low':
        filtered = filtered.filter(product =>
          product.currentStock <= product.minStock && product.currentStock > 0
        );
        break;
      case 'out':
        filtered = filtered.filter(product => product.currentStock === 0);
        break;
      case 'normal':
        filtered = filtered.filter(product => product.currentStock > product.minStock);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stock':
          comparison = a.currentStock - b.currentStock;
          break;
        case 'price':
          comparison = a.sellingPrice - b.sellingPrice;
          break;
        case 'recent':
          comparison = 0;
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredProducts(filtered);
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearch = (query: string) => {
    debouncedSearch(query);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleProductPress = (product: Product) => {
    if (user?.role === 'STAFF') {
      // Sellers can't edit products, maybe show a toast or just do nothing
      return;
    }
    navigation.navigate('EditProduct', { productId: product.id });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.stockStatus !== 'all') count++;
    if (filters.sortBy !== 'recent') count++;
    return count;
  };

  const getCategories = () => {
    const categories = new Set(products.map(p => p.category));
    return ['all', ...Array.from(categories)];
  };

  const renderHeader = () => {
    const lowStock = products.filter(p => p.currentStock <= p.minStock).length;
    
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerGreeting, { color: theme.colors.textTertiary }]}>Inventory</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Products</Text>
          </View>
          {user?.role !== 'STAFF' && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddProduct}
            >
              <Ionicons name="add" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { width: '38%', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border }]}>
            <Text style={[styles.statusLabel, { color: theme.colors.textTertiary }]}>SQUAD</Text>
            <Text style={[styles.statusValue, { color: theme.colors.text }]}>{products.length}</Text>
          </View>
          <View style={[styles.statusCard, { width: '28%', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border }]}>
            <Text style={[styles.statusLabel, { color: theme.colors.textTertiary }]}>LOW</Text>
            <Text style={[styles.statusValue, { color: lowStock > 0 ? theme.colors.warning : theme.colors.success }]}>{lowStock}</Text>
          </View>
          <View style={[styles.statusCard, { width: '28%', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border }]}>
            <Text style={[styles.statusLabel, { color: theme.colors.textTertiary }]}>VIEW</Text>
            <Text style={[styles.statusValue, { color: theme.colors.primary }]}>{filteredProducts.length}</Text>
          </View>
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
          placeholder="Search products..."
          placeholderTextColor={theme.colors.textTertiary}
          onChangeText={handleSearch}
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
        <Ionicons name="cube-outline" size={48} color={theme.colors.textTertiary} />
      </GlassView>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Products Found</Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        No products match your current search or filters.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { borderColor: theme.colors.primary, borderWidth: 1 }]}
        onPress={() => {
          setSearchQuery('');
          setFilters({
            category: 'all',
            stockStatus: 'all',
            sortBy: 'recent',
            sortOrder: 'desc',
          });
        }}
      >
        <Text style={[styles.emptyButtonText, { color: theme.colors.primary }]}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onQuickAction={(action) => handleQuickAction(item, action)}
    />
  );

  const handleQuickAction = (product: Product, action: string) => {
    switch (action) {
      case 'sell':
        navigation.navigate('NewSale', { productId: product.id });
        break;
      case 'restock':
        break;
      case 'adjust':
        break;
    }
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading products...</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
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

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        categories={getCategories()}
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
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusCard: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    borderRadius: 6,
    minWidth: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
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