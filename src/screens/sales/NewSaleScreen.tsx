// screens/sales/NewSaleScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import config from "../../config";
import AIScanner from "../../components/sales/AIScanner";

const API_URL = config.API_URL;

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  sellingPrice: number;
  unit: string;
  hasSizes?: boolean;
  sizeOptions?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  size?: string;
}

// Payment methods
const paymentMethods = [
  { value: "CASH", label: "Cash", icon: "cash-outline" },
  { value: "CARD", label: "Card", icon: "card-outline" },
  { value: "TRANSFER", label: "Transfer", icon: "swap-horizontal-outline" },
  { value: "POS", label: "POS", icon: "hardware-chip-outline" },
  { value: "OTHER", label: "Other", icon: "ellipsis-horizontal-outline" },
];

export default function NewSaleScreen({ navigation, route }: any) {
  const { productId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASH");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const { theme } = useTheme();
  const { token } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product && !cart.find((item) => item.product.id === productId)) {
        addToCart(product);
      }
    }
  }, [productId, products]);

  useEffect(() => {
    applySearch();
  }, [products, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeProducts = response.data.data.filter(
        (p: Product) => p.currentStock > 0
      );
      setProducts(activeProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product, size?: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => 
        item.product.id === product.id && item.size === size
      );
      
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            unitPrice: product.sellingPrice,
            discount: 0,
            size: size,
          },
        ];
      }
    });
  };

  const handleProductScanned = (scannedProduct: any) => {
    // Create product object from scanned data
    const product: Product = {
      id: scannedProduct.productId || `temp_${Date.now()}`,
      name: scannedProduct.name,
      sku: scannedProduct.sku || `SCAN_${Date.now()}`,
      category: scannedProduct.category || "Scanned",
      currentStock: scannedProduct.currentStock || 999,
      sellingPrice: scannedProduct.sellingPrice || 0,
      unit: scannedProduct.unit || "piece",
      hasSizes: scannedProduct.hasSizes,
      sizeOptions: scannedProduct.sizeOptions ? 
        JSON.stringify(scannedProduct.sizeOptions) : undefined,
    };

    addToCart(product, scannedProduct.size);
    
    Alert.alert(
      "Product Added",
      `${scannedProduct.name} ${scannedProduct.size ? `(${scannedProduct.size})` : ''} added to cart`,
      [{ text: "OK" }]
    );
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCart((prev) => prev.filter((item) => 
      !(item.product.id === productId && item.size === size)
    ));
  };

  const updateCartItem = (productId: string, size: string | undefined, updates: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size ? { ...item, ...updates } : item
      )
    );
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const totalDiscount = cart.reduce(
      (sum, item) => sum + item.discount * item.quantity,
      0
    );
    const tax = subtotal * 0.075; // 7.5% tax
    const total = subtotal - totalDiscount + tax;

    return {
      subtotal,
      totalDiscount,
      tax,
      total,
    };
  };

  const handleQuantityChange = (productId: string, size: string | undefined, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }

    const cartItem = cart.find((item) => item.product.id === productId && item.size === size);
    if (cartItem && quantity > cartItem.product.currentStock) {
      Alert.alert(
        "Error",
        `Only ${cartItem.product.currentStock} items in stock`
      );
      return;
    }

    updateCartItem(productId, size, { quantity });
  };

  const handleDiscountChange = (productId: string, size: string | undefined, discount: string) => {
    const discountValue = parseFloat(discount) || 0;
    const cartItem = cart.find((item) => item.product.id === productId && item.size === size);
    if (cartItem && discountValue > cartItem.unitPrice) {
      Alert.alert("Error", "Discount cannot exceed unit price");
      return;
    }
    updateCartItem(productId, size, { discount: discountValue });
  };

  const handlePriceChange = (productId: string, size: string | undefined, price: string) => {
    const priceValue = parseFloat(price) || 0;
    if (priceValue < 0) {
      Alert.alert("Error", "Price cannot be negative");
      return;
    }
    updateCartItem(productId, size, { unitPrice: priceValue });
  };

  const validateSale = () => {
    if (cart.length === 0) {
      Alert.alert("Error", "Please add at least one product to the sale");
      return false;
    }

    for (const item of cart) {
      if (item.quantity > item.product.currentStock) {
        Alert.alert(
          "Insufficient Stock",
          `Only ${item.product.currentStock} ${item.product.unit}s of ${item.product.name} available`
        );
        return false;
      }
    }

    return true;
  };

  const handleCompleteSale = async () => {
    if (!validateSale()) return;

    setProcessing(true);
    try {
      const saleData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          size: item.size,
        })),
        paymentMethod: selectedPaymentMethod,
        customerName: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
        discount: calculateTotals().totalDiscount,
      };

      const response = await axios.post(`${API_URL}/sales`, saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Alert.alert(
          "Success",
          `Sale #${response.data.data.saleNumber} completed successfully!`,
          [
            {
              text: "New Sale",
              onPress: () => {
                resetForm();
                fetchProducts();
              },
            },
            {
              text: "View Sale",
              onPress: () => {
                resetForm();
                fetchProducts();
                navigation.navigate("SaleDetail", {
                  saleId: response.data.data.id,
                });
              },
            },
            {
              text: "Done",
              onPress: () => {
                resetForm();
                fetchProducts();
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Failed to complete sale:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to complete sale. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setCart([]);
    setCustomerName("");
    setNotes("");
    setSelectedPaymentMethod("CASH");
    setSearchQuery("");
    setScannedImageUri(null);
  };

  const handleScanPress = () => {
    setShowScanner(true);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => addToCart(item)}
      disabled={item.currentStock === 0}
    >
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <View style={styles.productDetails}>
          <Text
            style={[
              styles.productCategory,
              { color: theme.colors.textTertiary },
            ]}
          >
            {item.category}
          </Text>
          <Text
            style={[
              styles.productStock,
              {
                color:
                  item.currentStock === 0
                    ? theme.colors.error
                    : item.currentStock <= 10
                    ? theme.colors.warning
                    : theme.colors.success,
              },
            ]}
          >
            {item.currentStock} {item.unit} in stock
          </Text>
        </View>
      </View>
      <View style={styles.productPrice}>
        <Text style={[styles.priceText, { color: theme.colors.text }]}>
          ₦{item.sellingPrice.toLocaleString()}
        </Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor:
                item.currentStock === 0
                  ? theme.colors.error + "20"
                  : theme.colors.primary + "20",
            },
          ]}
          onPress={() => addToCart(item)}
          disabled={item.currentStock === 0}
        >
          <Ionicons
            name={item.currentStock === 0 ? "close-outline" : "add"}
            size={20}
            color={
              item.currentStock === 0
                ? theme.colors.error
                : theme.colors.primary
            }
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const cartItemId = `${item.product.id}-${item.size || 'no-size'}`;
    
    return (
      <View style={[styles.cartItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cartItemHeader}>
          <View style={styles.cartItemTitle}>
            <Text style={[styles.cartItemName, { color: theme.colors.text }]}>
              {item.product.name}
            </Text>
            {item.size && (
              <Text style={[styles.cartItemSize, { color: theme.colors.primary }]}>
                ({item.size})
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => removeFromCart(item.product.id, item.size)}>
            <Ionicons name="close" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.cartItemDetails}>
          {/* Quantity */}
          <View style={styles.cartItemField}>
            <Text
              style={[styles.fieldLabel, { color: theme.colors.textTertiary }]}
            >
              Qty
            </Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  { backgroundColor: theme.colors.surfaceLight },
                ]}
                onPress={() =>
                  handleQuantityChange(
                    item.product.id,
                    item.size,
                    (item.quantity - 1).toString()
                  )
                }
              >
                <Ionicons name="remove" size={16} color={theme.colors.text} />
              </TouchableOpacity>
              <TextInput
                style={[styles.quantityInput, { color: theme.colors.text }]}
                value={item.quantity.toString()}
                onChangeText={(value) =>
                  handleQuantityChange(item.product.id, item.size, value)
                }
                keyboardType="number-pad"
              />
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  { backgroundColor: theme.colors.surfaceLight },
                ]}
                onPress={() =>
                  handleQuantityChange(
                    item.product.id,
                    item.size,
                    (item.quantity + 1).toString()
                  )
                }
                disabled={item.quantity >= item.product.currentStock}
              >
                <Ionicons name="add" size={16} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Unit Price */}
          <View style={styles.cartItemField}>
            <Text
              style={[styles.fieldLabel, { color: theme.colors.textTertiary }]}
            >
              Unit Price
            </Text>
            <View
              style={[
                styles.priceInputContainer,
                { backgroundColor: theme.colors.surfaceLight },
              ]}
            >
              <Text
                style={[styles.currency, { color: theme.colors.textTertiary }]}
              >
                ₦
              </Text>
              <TextInput
                style={[styles.priceInput, { color: theme.colors.text }]}
                value={item.unitPrice.toString()}
                onChangeText={(value) =>
                  handlePriceChange(item.product.id, item.size, value)
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Discount */}
          <View style={styles.cartItemField}>
            <Text
              style={[styles.fieldLabel, { color: theme.colors.textTertiary }]}
            >
              Discount
            </Text>
            <View
              style={[
                styles.priceInputContainer,
                { backgroundColor: theme.colors.surfaceLight },
              ]}
            >
              <Text
                style={[styles.currency, { color: theme.colors.textTertiary }]}
              >
                ₦
              </Text>
              <TextInput
                style={[styles.priceInput, { color: theme.colors.text }]}
                value={item.discount.toString()}
                onChangeText={(value) =>
                  handleDiscountChange(item.product.id, item.size, value)
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Line Total */}
        <View style={styles.cartItemTotal}>
          <Text style={[styles.totalLabel, { color: theme.colors.textTertiary }]}>
            Line Total:
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.text }]}>
            ₦{((item.unitPrice - item.discount) * item.quantity).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              New Sale
            </Text>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: theme.colors.primary + "20" }]}
                onPress={handleScanPress}
              >
                <Ionicons name="scan-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.scanButtonText, { color: theme.colors.primary }]}>
                  AI Scan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.clearButton,
                  { backgroundColor: cart.length > 0 ? theme.colors.error + "20" : theme.colors.surfaceLight },
                ]}
                onPress={() => {
                  if (cart.length > 0) {
                    Alert.alert(
                      "Clear Cart",
                      "Are you sure you want to clear all items from the cart?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Clear",
                          style: "destructive",
                          onPress: () => setCart([]),
                        },
                      ]
                    );
                  }
                }}
                disabled={cart.length === 0}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={cart.length > 0 ? theme.colors.error : theme.colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scan Banner */}
          <TouchableOpacity
            style={[styles.scanBanner, { backgroundColor: theme.colors.primary + "10" }]}
            onPress={handleScanPress}
          >
            <Ionicons name="scan-outline" size={24} color={theme.colors.primary} />
            <View style={styles.scanBannerContent}>
              <Text style={[styles.scanBannerTitle, { color: theme.colors.primary }]}>
                Quick AI Scan
              </Text>
              <Text style={[styles.scanBannerText, { color: theme.colors.textSecondary }]}>
                Use camera to instantly identify products
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </TouchableOpacity>

          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.colors.textTertiary}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search products to add..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Products List */}
          <View style={styles.productsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Available Products ({filteredProducts.length})
            </Text>
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            />
          </View>

          {/* Cart Items */}
          <View style={styles.cartSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Cart Items ({cart.length})
              </Text>
              {cart.length > 0 && (
                <Text
                  style={[
                    styles.cartTotal,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Total: ₦{totals.total.toLocaleString()}
                </Text>
              )}
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons
                  name="cart-outline"
                  size={48}
                  color={theme.colors.textTertiary}
                />
                <Text
                  style={[
                    styles.emptyCartText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Your cart is empty
                </Text>
                <Text
                  style={[
                    styles.emptyCartSubtext,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  Scan, search or browse products to add
                </Text>
              </View>
            ) : (
              <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => `${item.product.id}-${item.size || 'no-size'}`}
                scrollEnabled={false}
                contentContainerStyle={styles.cartList}
                ItemSeparatorComponent={() => (
                  <View style={styles.cartSeparator} />
                )}
              />
            )}
          </View>

          {/* Customer & Payment */}
          <View style={styles.detailsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Customer & Payment Details
            </Text>

            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Customer Name (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Enter customer name"
                placeholderTextColor={theme.colors.textTertiary}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Payment Method
              </Text>
              <View style={styles.paymentMethods}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.paymentMethodButton,
                      {
                        backgroundColor:
                          selectedPaymentMethod === method.value
                            ? theme.colors.primary + "20"
                            : theme.colors.surfaceLight,
                        borderColor:
                          selectedPaymentMethod === method.value
                            ? theme.colors.primary
                            : theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.value)}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={
                        selectedPaymentMethod === method.value
                          ? theme.colors.primary
                          : theme.colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        {
                          color:
                            selectedPaymentMethod === method.value
                              ? theme.colors.primary
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Notes (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Add any notes for this sale..."
                placeholderTextColor={theme.colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Summary */}
          <View
            style={[
              styles.summarySection,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Order Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ₦{totals.subtotal.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Discount
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.error }]}
              >
                -₦{totals.totalDiscount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Tax (7.5%)
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ₦{totals.tax.toLocaleString()}
              </Text>
            </View>

            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: theme.colors.border },
              ]}
            />

            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryTotalLabel, { color: theme.colors.text }]}
              >
                Total Amount
              </Text>
              <Text
                style={[
                  styles.summaryTotalValue,
                  { color: theme.colors.primary },
                ]}
              >
                ₦{totals.total.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => navigation.goBack()}
              disabled={processing}
            >
              <Text
                style={[styles.cancelButtonText, { color: theme.colors.text }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.completeButton,
                {
                  backgroundColor:
                    cart.length === 0
                      ? theme.colors.textTertiary
                      : theme.colors.primary,
                  opacity: processing ? 0.7 : 1,
                },
              ]}
              onPress={handleCompleteSale}
              disabled={cart.length === 0 || processing}
            >
              {processing ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={theme.colors.white}
                  />
                  <Text
                    style={[
                      styles.completeButtonText,
                      { color: theme.colors.white },
                    ]}
                  >
                    Complete Sale
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* AI Scanner Modal */}
      <AIScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onProductScanned={handleProductScanned}
        token={token || ""}
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
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  
  // Scan Banner
  scanBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  scanBannerContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  scanBannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  scanBannerText: {
    fontSize: 13,
  },
  
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
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
  },
  
  // Products Section
  productsSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  productsList: {
    gap: 12,
  },
  productItem: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  productDetails: {
    gap: 4,
  },
  productCategory: {
    fontSize: 12,
  },
  productStock: {
    fontSize: 11,
    fontWeight: "500",
  },
  productPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Cart Section
  cartSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cartTotal: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCartSubtext: {
    fontSize: 14,
  },
  cartList: {
    gap: 12,
  },
  cartItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cartItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cartItemTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  cartItemSize: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  cartItemDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  cartItemField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    minWidth: 40,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  currency: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  cartItemTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.1)",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cartSeparator: {
    height: 12,
  },
  
  // Customer & Payment
  detailsSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  paymentMethods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paymentMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minWidth: "48%",
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  textArea: {
    fontSize: 16,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: "top",
  },
  
  // Summary
  summarySection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  completeButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});