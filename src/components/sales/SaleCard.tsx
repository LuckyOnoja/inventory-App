import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useTheme } from '../../context/ThemeContext';

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

interface SaleCardProps {
  sale: Sale;
  onPress: () => void;
}

const SaleCard: React.FC<SaleCardProps> = ({ sale, onPress }) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (sale.status) {
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

  const getStatusIcon = () => {
    switch (sale.status) {
      case 'completed':
        return 'checkmark-circle-outline' as const;
      case 'pending':
        return 'time-outline' as const;
      case 'cancelled':
        return 'close-circle-outline' as const;
      default:
        return 'help-circle-outline' as const;
    }
  };

  const getPaymentIcon = () => {
    switch (sale.paymentMethod) {
      case 'cash':
        return 'cash-outline' as const;
      case 'card':
        return 'card-outline' as const;
      case 'transfer':
        return 'swap-horizontal-outline' as const;
      default:
        return 'wallet-outline' as const;
    }
  };

  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();
  const paymentIcon = getPaymentIcon();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Indicator */}
      <View style={[styles.statusIndicator, { backgroundColor: statusColor + '20' }]}>
        <Ionicons name={statusIcon} size={16} color={statusColor} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.saleNumberContainer}>
            <Ionicons name="receipt-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.saleNumber, { color: theme.colors.primary }]}>
              {sale.saleNumber}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Amount Row */}
        <View style={styles.amountRow}>
          <Text style={[styles.amount, { color: theme.colors.text }]}>
            ₦{sale.totalAmount.toLocaleString()}
          </Text>
          <View style={styles.itemsBadge}>
            <Ionicons name="cube-outline" size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.itemsText, { color: theme.colors.textSecondary }]}>
              {sale.itemsCount} items
            </Text>
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {sale.agentName}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name={paymentIcon} size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {sale.paymentMethod}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {moment(sale.createdAt).format('HH:mm')}
            </Text>
          </View>
        </View>

        {/* Date Row */}
        <Text style={[styles.date, { color: theme.colors.textTertiary }]}>
          {moment(sale.createdAt).format('MMM D, YYYY')}
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={theme.colors.textTertiary} 
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saleNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saleNumber: {
    fontSize: 14,
    fontWeight: '600',
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
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  itemsText: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default SaleCard;