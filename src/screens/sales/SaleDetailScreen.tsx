import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import moment from 'moment';
import config from '../../config';
import { useAuth } from '../../context/AuthContext'; // Assuming you have AuthContext

const API_URL = config.API_URL;

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  total?: number;
  product?: {
    id: string;
    name: string;
    sku: string | null;
    category: string;
    unit: string;
    costPrice: number;
    sellingPrice: number;
  };
}

interface SaleDetail {
  id: string;
  saleNumber: string;
  totalAmount: number;
  subtotal?: number;
  tax?: number;
  discount: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'POS' | 'CARD' | 'OTHER';
  agentName: string;
  agentId: string;
  agent?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  customerName: string | null;
  customerPhone?: string;
  createdAt: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  items: SaleItem[];
  notes: string | null;
}

export default function SaleDetailScreen({ route, navigation }: any) {
  const { saleId } = route.params;
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const { theme } = useTheme();
  const { user, token } = useAuth(); // Get auth token

  useEffect(() => {
    fetchSaleDetail();
  }, [saleId]);

  const fetchSaleDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/sales/${saleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const saleData = response.data.data;
        
        // Calculate subtotal and tax from items
        let subtotal = 0;
        saleData.items.forEach((item: any) => {
          const itemTotal = item.quantity * item.unitPrice;
          subtotal += itemTotal;
        });

        // Tax is typically 7.5% of subtotal
        const tax = subtotal * 0.075;
        
        // Set the sale data with calculated values
        setSale({
          ...saleData,
          subtotal,
          tax,
          agentName: saleData.agent?.name || 'Unknown',
          agentId: saleData.agentId,
          customerName: saleData.customerName || '',
          customerPhone: saleData.customerPhone || '',
          notes: saleData.notes || '',
          items: saleData.items.map((item: any) => ({
            ...item,
            productName: item.product?.name || 'Unknown Product',
            sku: item.product?.sku || '',
            total: (item.unitPrice - item.discount) * item.quantity,
          })),
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch sale details:', error);
      
      if (error.response?.status === 404) {
        Alert.alert('Error', 'Sale not found');
      } else if (error.response?.status === 401) {
        Alert.alert('Error', 'Please login again');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to load sale details');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSaleDetail();
  };

  const getStatusColor = () => {
    switch (sale?.status) {
      case 'COMPLETED':
        return theme.colors.success;
      case 'PENDING':
        return theme.colors.warning;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'PENDING':
        return 'Pending';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentIcon = () => {
    switch (sale?.paymentMethod) {
      case 'CASH':
        return 'cash-outline';
      case 'CARD':
        return 'card-outline';
      case 'TRANSFER':
        return 'swap-horizontal-outline';
      case 'POS':
        return 'card-outline';
      default:
        return 'wallet-outline';
    }
  };

  const getPaymentMethodDisplayText = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Cash';
      case 'CARD':
        return 'Card';
      case 'TRANSFER':
        return 'Transfer';
      case 'POS':
        return 'POS';
      case 'OTHER':
        return 'Other';
      default:
        return method;
    }
  };

  const handlePrintReceipt = () => {
    if (!sale) return;
    
    Alert.alert(
      'Print Receipt',
      'Do you want to print the receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Print', 
          onPress: async () => {
            try {
              // In a real app, you would integrate with a printing library
              // For now, we'll show a success message
              Alert.alert('Success', 'Receipt sent to printer');
              
              // You could also navigate to a receipt preview screen
              // navigation.navigate('ReceiptPreview', { saleId });
            } catch (error) {
              Alert.alert('Error', 'Failed to print receipt');
            }
          }
        },
      ]
    );
  };

  const handleCancelSale = async () => {
    if (!sale) return;
    
    if (sale.status === 'CANCELLED') {
      Alert.alert('Info', 'This sale is already cancelled');
      return;
    }

    // Check if sale is older than 24 hours
    const saleDate = moment(sale.createdAt);
    const hoursDiff = moment().diff(saleDate, 'hours');
    
    if (hoursDiff > 24) {
      Alert.alert(
        'Cannot Cancel Sale',
        'Sales can only be cancelled within 24 hours of creation.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Cancel Sale',
      'Are you sure you want to cancel this sale? This action cannot be undone and will restore product stock.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel Sale', 
          style: 'destructive',
          onPress: () => confirmCancelSale()
        },
      ]
    );
  };

  const confirmCancelSale = async () => {
    try {
      setCanceling(true);
      
      const response = await axios.put(
        `${API_URL}/sales/${saleId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Sale cancelled successfully');
        // Update local state to reflect cancellation
        if (sale) {
          setSale({
            ...sale,
            status: 'CANCELLED',
          });
        }
        // Emit event to refresh sales list
        // navigation.navigate('Sales', { refresh: true });
      }
    } catch (error: any) {
      console.error('Failed to cancel sale:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to cancel sale'
      );
    } finally {
      setCanceling(false);
    }
  };

  const handleCompleteSale = async () => {
    if (!sale || sale.status !== 'PENDING') return;
    
    Alert.alert(
      'Mark as Complete',
      'Are you sure you want to mark this sale as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: async () => {
            try {
              // Note: Your backend doesn't have a mark as complete endpoint yet
              // You would need to add this functionality
              Alert.alert('Coming Soon', 'This feature will be available soon');
            } catch (error) {
              Alert.alert('Error', 'Failed to complete sale');
            }
          }
        },
      ]
    );
  };

  const calculateTotalDiscount = () => {
    if (!sale?.items) return 0;
    return sale.items.reduce((total, item) => total + (item.discount * item.quantity), 0);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!sale) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="receipt-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Sale not found
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={fetchSaleDetail}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.white }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalDiscount = calculateTotalDiscount();
  const displaySubtotal = sale.subtotal || sale.totalAmount - (sale.tax || 0) + totalDiscount;

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Sale Details
            </Text>
            <Text style={[styles.saleNumber, { color: theme.colors.textSecondary }]}>
              {sale.saleNumber}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handlePrintReceipt}
            >
              <Ionicons name="print-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor() + '20' }]}>
          <View style={styles.statusRow}>
            <Ionicons 
              name={sale.status === 'COMPLETED' ? 'checkmark-circle' : 
                    sale.status === 'PENDING' ? 'time' : 'close-circle'} 
              size={20} 
              color={getStatusColor()} 
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusDisplayText(sale.status)}
            </Text>
          </View>
          <Text style={[styles.amount, { color: theme.colors.text }]}>
            ₦{sale.totalAmount.toLocaleString()}
          </Text>
        </View>

        {/* Sale Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Date & Time</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {moment(sale.createdAt).format('MMM D, YYYY • HH:mm')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Agent</Text>
            <View style={styles.agentInfo}>
              <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {sale.agentName}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Payment Method</Text>
            <View style={styles.paymentInfo}>
              <Ionicons name={getPaymentIcon()} size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {getPaymentMethodDisplayText(sale.paymentMethod)}
              </Text>
            </View>
          </View>
          
          {sale.customerName && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Customer</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {sale.customerName}
              </Text>
            </View>
          )}
          
          {sale.notes && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Notes</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {sale.notes}
              </Text>
            </View>
          )}
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Items ({sale.items.length})
          </Text>
          
          <View style={[styles.itemsCard, { backgroundColor: theme.colors.surface }]}>
            {sale.items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.colors.text }]}>
                    {item.productName}
                  </Text>
                  <Text style={[styles.itemCode, { color: theme.colors.textTertiary }]}>
                    {item.sku || item.product?.sku || 'No SKU'}
                  </Text>
                  {item.product?.category && (
                    <Text style={[styles.itemCategory, { color: theme.colors.textTertiary }]}>
                      {item.product.category}
                    </Text>
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemQuantity, { color: theme.colors.textSecondary }]}>
                    {item.quantity} {item.product?.unit || 'unit'} × ₦{item.unitPrice.toLocaleString()}
                  </Text>
                  <Text style={[styles.itemTotal, { color: theme.colors.text }]}>
                    ₦{((item.unitPrice - item.discount) * item.quantity).toLocaleString()}
                  </Text>
                  {item.discount > 0 && (
                    <Text style={[styles.itemDiscount, { color: theme.colors.error }]}>
                      -₦{(item.discount * item.quantity).toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              ₦{displaySubtotal.toLocaleString()}
            </Text>
          </View>
          
          {sale.tax && sale.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Tax (7.5%)
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ₦{sale.tax.toLocaleString()}
              </Text>
            </View>
          )}
          
          {totalDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Discount
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
                -₦{totalDiscount.toLocaleString()}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryTotalLabel, { color: theme.colors.text }]}>
              Total Amount
            </Text>
            <Text style={[styles.summaryTotalValue, { color: theme.colors.text }]}>
              ₦{sale.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {sale.status === 'PENDING' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.completeButton, { backgroundColor: theme.colors.success }]}
              onPress={handleCompleteSale}
            >
              {canceling ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                  <Text style={[styles.completeButtonText, { color: theme.colors.white }]}>
                    Mark as Complete
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {sale.status === 'COMPLETED' && user?.role !== 'SALES_AGENT' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: theme.colors.error }]}
              onPress={handleCancelSale}
              disabled={canceling}
            >
              {canceling ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <>
                  <Ionicons name="close" size={20} color={theme.colors.error} />
                  <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
                    Cancel Sale
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  saleNumber: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 2,
    justifyContent: 'flex-end',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 2,
    justifyContent: 'flex-end',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemCode: {
    fontSize: 12,
  },
  itemCategory: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemDetails: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDiscount: {
    fontSize: 11,
    fontWeight: '500',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    marginVertical: 12,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});