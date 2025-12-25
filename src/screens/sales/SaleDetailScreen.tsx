import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import moment from 'moment';
import config from '../../config';

const API_URL = config.API_URL;

interface SaleItem {
  id: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface SaleDetail {
  id: string;
  saleNumber: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  agentName: string;
  agentId: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'cancelled';
  items: SaleItem[];
  notes: string;
}

export default function SaleDetailScreen({ route, navigation }: any) {
  const { saleId } = route.params;
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchSaleDetail();
  }, [saleId]);

  const fetchSaleDetail = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockSale: SaleDetail = {
        id: saleId,
        saleNumber: 'S-00157',
        totalAmount: 24500,
        subtotal: 23000,
        tax: 1500,
        discount: 1000,
        paymentMethod: 'cash',
        agentName: 'John Doe',
        agentId: 'AG001',
        customerName: 'Customer A',
        customerPhone: '08012345678',
        createdAt: new Date().toISOString(),
        status: 'completed',
        notes: 'Regular customer',
        items: [
          {
            id: '1',
            productName: 'Indomie Chicken',
            productCode: 'IND-001',
            quantity: 5,
            unitPrice: 2000,
            discount: 200,
            total: 9800,
          },
          {
            id: '2',
            productName: 'Coke 50cl',
            productCode: 'COK-001',
            quantity: 3,
            unitPrice: 1500,
            discount: 100,
            total: 4400,
          },
          {
            id: '3',
            productName: 'Peak Milk Tin',
            productCode: 'PM-001',
            quantity: 2,
            unitPrice: 1800,
            discount: 0,
            total: 3600,
          },
        ],
      };
      setSale(mockSale);
    } catch (error) {
      console.error('Failed to fetch sale details:', error);
      Alert.alert('Error', 'Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (sale?.status) {
      case 'completed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  };

  const getPaymentIcon = () => {
    switch (sale?.paymentMethod) {
      case 'cash':
        return 'cash-outline';
      case 'card':
        return 'card-outline';
      case 'transfer':
        return 'swap-horizontal-outline';
      default:
        return 'wallet-outline';
    }
  };

  const handlePrintReceipt = () => {
    Alert.alert('Print', 'Receipt printing functionality would be implemented here');
  };

  const handleCancelSale = () => {
    Alert.alert(
      'Cancel Sale',
      'Are you sure you want to cancel this sale?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            // API call to cancel sale
            Alert.alert('Success', 'Sale cancelled successfully');
            navigation.goBack();
          }
        },
      ]
    );
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Sale not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
              name={sale.status === 'completed' ? 'checkmark-circle' : 
                    sale.status === 'pending' ? 'time' : 'close-circle'} 
              size={20} 
              color={getStatusColor()} 
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
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
                {sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
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
                    {item.productCode}
                  </Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemQuantity, { color: theme.colors.textSecondary }]}>
                    {item.quantity} × ₦{item.unitPrice.toLocaleString()}
                  </Text>
                  <Text style={[styles.itemTotal, { color: theme.colors.text }]}>
                    ₦{item.total.toLocaleString()}
                  </Text>
                  {item.discount > 0 && (
                    <Text style={[styles.itemDiscount, { color: theme.colors.error }]}>
                      -₦{item.discount.toLocaleString()}
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
              ₦{sale.subtotal.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Tax
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              ₦{sale.tax.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Discount
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
              -₦{sale.discount.toLocaleString()}
            </Text>
          </View>
          
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
        {sale.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.completeButton, { backgroundColor: theme.colors.success }]}
              onPress={() => Alert.alert('Complete', 'Mark as complete functionality')}
            >
              <Ionicons name="checkmark" size={20} color={theme.colors.white} />
              <Text style={[styles.completeButtonText, { color: theme.colors.white }]}>
                Mark as Complete
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: theme.colors.error }]}
              onPress={handleCancelSale}
            >
              <Ionicons name="close" size={20} color={theme.colors.error} />
              <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
                Cancel Sale
              </Text>
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
    borderColor: 'transparent',
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
    borderColor: 'transparent',
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
    borderColor: 'transparent',
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