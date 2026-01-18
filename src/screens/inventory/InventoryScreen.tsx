// screens/inventory/InventoryScreen.tsx
import React, { useState, useEffect } from "react";
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
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { GlassView } from "../../components/ui/GlassView";
import { GlassButton } from "../../components/ui/GlassButton";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;

interface ProductInventory {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

interface FilterState {
  category: string;
  status: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy: "name" | "stock" | "recent";
}

interface CategoryCount {
  category: string;
  count: number;
}

export default function InventoryScreen({ navigation }: any) {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<
    ProductInventory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    status: "all",
    sortBy: "name",
  });
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, filters, searchQuery]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/products?active=true&limit=100`
      );

      if (response.data.success) {
        const products = response.data.data.map((product: any) => ({
          ...product,
          status: getStockStatus(product.currentStock, product.minStock),
        }));

        setInventory(products);

        // Extract unique categories with counts
        const categoryMap = new Map<string, number>();
        products.forEach((product: ProductInventory) => {
          const count = categoryMap.get(product.category) || 0;
          categoryMap.set(product.category, count + 1);
        });

        const categoryList = Array.from(categoryMap.entries()).map(
          ([category, count]) => ({
            category,
            count,
          })
        );

        setCategories(categoryList);
      }
    } catch (error: any) {
      console.error("Failed to fetch inventory:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to load inventory data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStockStatus = (
    currentStock: number,
    minStock: number
  ): "in_stock" | "low_stock" | "out_of_stock" => {
    if (currentStock === 0) return "out_of_stock";
    if (currentStock <= minStock) return "low_stock";
    return "in_stock";
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "stock":
          return a.currentStock - b.currentStock;
        case "recent":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredInventory(filtered);
  };

  const handleRestock = async (productId: string, productName: string) => {
    Alert.prompt(
      "Restock Product",
      `Enter quantity to add to ${productName}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restock",
          onPress: async (quantity: any) => {
            if (!quantity || parseInt(quantity) <= 0) {
              Alert.alert("Error", "Please enter a valid quantity");
              return;
            }

            try {
              const response = await axios.post(
                `${API_URL}/inventory/restock`,
                {
                  productId,
                  quantity: parseInt(quantity),
                  notes: `Manual restock from mobile app`,
                }
              );

              if (response.data.success) {
                Alert.alert("Success", response.data.message);
                fetchInventory(); // Refresh the list
              }
            } catch (error: any) {
              console.error("Failed to restock:", error);
              Alert.alert(
                "Error",
                error.response?.data?.error || "Failed to restock product"
              );
            }
          },
        },
      ],
      "plain-text",
      "1",
      "number-pad"
    );
  };

  const handleAdjustInventory = (productId: string) => {
    navigation.navigate("AdjustInventory", { productId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return theme.colors.success;
      case "low_stock":
        return theme.colors.warning;
      case "out_of_stock":
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      default:
        return "Unknown";
    }
  };

  const getStockPercentage = (item: ProductInventory) => {
    const maxStock = item.minStock * 5; // Use 5x min stock as max for visualization
    if (maxStock === 0) return 0;
    return Math.min((item.currentStock / maxStock) * 100, 100);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Inventory
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          {filteredInventory.length} items •{" "}
          {
            filteredInventory.filter(
              (item) =>
                item.status === "low_stock" || item.status === "out_of_stock"
            ).length
          }{" "}
          need attention
        </Text>
      </View>
      <View style={styles.headerButtons}>
        <GlassButton
          size="small"
          variant="secondary"
          onPress={() => navigation.navigate("InventoryHistory")}
          style={{ width: "auto" }}
          icon="time-outline"
          title="History"
        />
        <GlassButton
          size="small"
          variant="primary"
          onPress={() => navigation.navigate("InventoryCheck")}
          style={{ width: "auto" }}
          icon="clipboard-outline"
          title="Check"
        />
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <GlassView style={styles.searchContainer} intensity={20}>
      <Ionicons
        name="search-outline"
        size={20}
        color={theme.colors.textTertiary}
      />
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
        <View style={styles.filterBadge}>
          <Ionicons name="filter-outline" size={20} color={theme.colors.text} />
          {(filters.category !== "all" || filters.status !== "all") && (
            <View
              style={[
                styles.filterIndicator,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    </GlassView>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <GlassView
              style={styles.modalContent}
              intensity={95}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Filter & Sort
                </Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  Category
                </Text>
                <View style={styles.categoryList}>
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor:
                          filters.category === "all"
                            ? theme.colors.primary
                            : theme.colors.surface,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setFilters({ ...filters, category: "all" })}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color:
                            filters.category === "all"
                              ? theme.colors.white
                              : theme.colors.text,
                        },
                      ]}
                    >
                      All Categories ({inventory.length})
                    </Text>
                  </TouchableOpacity>

                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.category}
                      style={[
                        styles.categoryItem,
                        {
                          backgroundColor:
                            filters.category === cat.category
                              ? theme.colors.primary
                              : theme.colors.surface,
                        },
                        { borderColor: theme.colors.border },
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, category: cat.category })
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          {
                            color:
                              filters.category === cat.category
                                ? theme.colors.white
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {cat.category} ({cat.count})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  Stock Status
                </Text>
                <View style={styles.statusList}>
                  {["all", "in_stock", "low_stock", "out_of_stock"].map(
                    (status) => {
                      const count =
                        status === "all"
                          ? inventory.length
                          : inventory.filter((item) => item.status === status)
                            .length;

                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusItem,
                            {
                              backgroundColor:
                                filters.status === status
                                  ? theme.colors.primary
                                  : theme.colors.surface,
                            },
                            { borderColor: theme.colors.border },
                          ]}
                          onPress={() =>
                            setFilters({ ...filters, status: status as any })
                          }
                        >
                          <View style={styles.statusRow}>
                            <View
                              style={[
                                styles.statusDot,
                                {
                                  backgroundColor:
                                    status === "all"
                                      ? theme.colors.text
                                      : getStatusColor(status),
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    filters.status === status
                                      ? theme.colors.white
                                      : theme.colors.text,
                                },
                              ]}
                            >
                              {status === "all" ? "All" : getStatusText(status)}{" "}
                              ({count})
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  Sort By
                </Text>
                <View style={styles.sortList}>
                  {[
                    { value: "name", label: "Product Name" },
                    { value: "stock", label: "Stock Level" },
                    { value: "recent", label: "Recently Updated" },
                  ].map((sort) => (
                    <TouchableOpacity
                      key={sort.value}
                      style={[
                        styles.sortItem,
                        {
                          backgroundColor:
                            filters.sortBy === sort.value
                              ? theme.colors.primary
                              : theme.colors.surface,
                        },
                        { borderColor: theme.colors.border },
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, sortBy: sort.value as any })
                      }
                    >
                      <Ionicons
                        name={
                          sort.value === "name"
                            ? "text"
                            : sort.value === "stock"
                              ? "stats-chart"
                              : "time"
                        }
                        size={16}
                        color={
                          filters.sortBy === sort.value
                            ? theme.colors.white
                            : theme.colors.text
                        }
                      />
                      <Text
                        style={[
                          styles.sortText,
                          {
                            color:
                              filters.sortBy === sort.value
                                ? theme.colors.white
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {sort.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={() =>
                    setFilters({
                      category: "all",
                      status: "all",
                      sortBy: "name",
                    })
                  }
                >
                  <Text
                    style={[styles.resetText, { color: theme.colors.text }]}
                  >
                    Reset Filters
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    applyFilters();
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    style={[styles.applyText, { color: theme.colors.white }]}
                  >
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback >
    </Modal >
  );

  const renderInventoryItem = ({ item }: { item: ProductInventory }) => {
    const statusColor = getStatusColor(item.status);
    const stockPercentage = getStockPercentage(item);
    const isLowStock = item.status === "low_stock";
    const isOutOfStock = item.status === "out_of_stock";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.id })
        }
        activeOpacity={0.7}
      >
        <GlassView style={styles.itemCard} intensity={25}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={[styles.productName, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <View style={styles.productMeta}>
                {item.sku && (
                  <Text
                    style={[
                      styles.productCode,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    SKU: {item.sku}
                  </Text>
                )}
                <Text
                  style={[
                    styles.productCategory,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  • {item.category}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.stockInfo}>
            <View style={styles.stockDetails}>
              <Text
                style={[styles.stockLabel, { color: theme.colors.textSecondary }]}
              >
                Current Stock
              </Text>
              <Text style={[styles.stockValue, { color: theme.colors.text }]}>
                {item.currentStock} {item.unit}
              </Text>
            </View>

            <View style={styles.stockRange}>
              <Text
                style={[styles.rangeLabel, { color: theme.colors.textTertiary }]}
              >
                Min: {item.minStock}
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${stockPercentage}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.priceInfo}>
              <Text
                style={[styles.costPrice, { color: theme.colors.textSecondary }]}
              >
                Cost: ₦{item.costPrice.toLocaleString()}
              </Text>
              <Text style={[styles.sellingPrice, { color: theme.colors.text }]}>
                Sell: ₦{item.sellingPrice.toLocaleString()}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              {(isLowStock || isOutOfStock) && (
                <GlassButton
                  size="small"
                  variant="primary"
                  onPress={() => handleRestock(item.id, item.name)}
                  icon="add-circle-outline"
                  title="Restock"
                  style={{ flex: 1 }}
                />
              )}

              <GlassButton
                size="small"
                variant="secondary"
                onPress={() => handleAdjustInventory(item.id)}
                icon="swap-horizontal-outline"
                title="Adjust"
                style={{ flex: 1 }}
              />
            </View>
          </View>

        </GlassView>
      </TouchableOpacity >
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="cube-outline"
        size={64}
        color={theme.colors.textTertiary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {searchQuery || filters.category !== "all" || filters.status !== "all"
          ? "No Matching Products"
          : "No Products Yet"}
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {searchQuery || filters.category !== "all" || filters.status !== "all"
          ? "Try adjusting your search or filters"
          : "Add products to start managing your inventory"}
      </Text>
      {!searchQuery &&
        filters.category === "all" &&
        filters.status === "all" && (
          <GlassButton
            size="medium"
            variant="primary"
            onPress={() => navigation.navigate("AddProduct")}
            icon="add"
            title="Add Product"
          />
        )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Loading inventory...
        </Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
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

      {renderFilterModal()}

      <TouchableOpacity
        style={[
          styles.floatingButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={() => navigation.navigate("AddProduct")}
      >
        <Ionicons name="add" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  inventoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  inventoryButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
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
  filterBadge: {
    position: "relative",
  },
  filterIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
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
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productCode: {
    fontSize: 12,
  },
  productCategory: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  stockInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  stockRange: {
    alignItems: "flex-end",
  },
  rangeLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  progressContainer: {
    width: 80,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sortList: {
    gap: 8,
  },
  sortItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  sortText: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  applyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
