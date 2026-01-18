import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';

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
  style?: ViewStyle;
}

const SaleCard: React.FC<SaleCardProps> = ({ sale, onPress, style }) => {
  const { theme } = useTheme();

  const getVariant = () => {
    switch (sale.status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

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
        return 'checkmark-circle' as const;
      case 'pending':
        return 'time' as const;
      case 'cancelled':
        return 'close-circle' as const;
      default:
        return 'help-circle' as const;
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
  const variant = getVariant();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
      <GlassCard variant={variant} style={styles.card}>
        <View style={styles.container}>
          {/* Main Content */}
          <View style={styles.content}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.saleNumberContainer}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="receipt" size={14} color={theme.colors.primary} />
                </View>
                <Text style={[styles.saleNumber, { color: theme.colors.text }]}>
                  {sale.saleNumber}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Ionicons name={statusIcon} size={12} color={statusColor} style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {sale.status}
                </Text>
              </View>
            </View>

            {/* Amount Row */}
            <View style={styles.amountRow}>
              <Text style={[styles.amount, { color: theme.colors.text }]}>
                ₦{sale.totalAmount.toLocaleString()}
              </Text>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {sale.agentName}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailItem}>
                <Ionicons name={paymentIcon} size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {sale.paymentMethod}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {sale.itemsCount} items
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.date, { color: theme.colors.textTertiary }]}>
                {moment(sale.createdAt).format('MMM D, YYYY • HH:mm')}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
  },
  container: {
    padding: 16,
  },
  content: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amountRow: {
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SaleCard;