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
}

const SaleCard: React.FC<SaleCardProps> = ({ sale, onPress }) => {
  const { theme } = useTheme();

  const getStatusConfig = () => {
    const s = sale.status ? sale.status.toLowerCase() : '';
    switch (s) {
      case 'completed':
        return { color: theme.colors.success, label: 'VERIFIED', variant: 'default' as const };
      case 'pending':
        return { color: theme.colors.warning, label: 'WAITING', variant: 'warning' as const };
      case 'cancelled':
        return { color: theme.colors.error, label: 'TERMINATED', variant: 'error' as const };
      default:
        return { color: theme.colors.info, label: 'SYSTEM', variant: 'default' as const };
    }
  };

  const status = getStatusConfig();
  const paymentIcon = sale.paymentMethod === 'cash' ? 'cash-outline' : sale.paymentMethod === 'card' ? 'card-outline' : 'swap-horizontal-outline';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <GlassCard style={styles.card} variant={status.variant}>
        <View style={styles.header}>
          <View style={styles.tokenArea}>
            <Text style={[styles.tokenLabel, { color: theme.colors.textTertiary }]}>TRANSACTION_TOKEN</Text>
            <Text style={[styles.tokenValue, { color: theme.colors.text }]}>#{sale.saleNumber}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: status.color + '10' }]}>
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.mainInfo}>
            <Text style={[styles.amount, { color: theme.colors.text }]}>₦{sale.totalAmount.toLocaleString()}</Text>
            <View style={styles.paymentRow}>
              <Ionicons name={paymentIcon as any} size={14} color={theme.colors.primary} />
              <Text style={[styles.paymentText, { color: theme.colors.textSecondary }]}>{sale.paymentMethod.toUpperCase()}</Text>
              <View style={styles.dot} />
              <Text style={[styles.itemsText, { color: theme.colors.textSecondary }]}>{sale.itemsCount} ITEMS</Text>
            </View>
          </View>
          <View style={styles.chevronArea}>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.agentArea}>
            <Ionicons name="person-outline" size={10} color={theme.colors.textTertiary} />
            <Text style={[styles.agentName, { color: theme.colors.textSecondary }]}>{sale.agentName}</Text>
          </View>
          <Text style={[styles.date, { color: theme.colors.textTertiary }]}>{moment(sale.createdAt).format('YYYY-MM-DD • HH:mm')}</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 4,
    padding: 16,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tokenArea: {
    flex: 1,
  },
  tokenLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  tokenValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  itemsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevronArea: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: 12,
  },
  agentArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agentName: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default SaleCard;