import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useTheme } from '../../context/ThemeContext';

interface SaleItem {
  id: string;
  saleNumber: string;
  totalAmount: number;
  agentName: string;
  createdAt: string;
  itemsCount: number;
}

interface RecentSalesProps {
  sales: SaleItem[];
  onViewAll?: () => void;
  onPressSale?: (saleId: string) => void;
}

const RecentSales: React.FC<RecentSalesProps> = ({ 
  sales, 
  onViewAll,
  onPressSale,
}) => {
  const { theme } = useTheme();

  if (sales.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="receipt-outline" size={48} color={theme.colors.textTertiary} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No recent sales
        </Text>
      </View>
    );
  }

  return (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sales.map((sale) => (
          <TouchableOpacity
            key={sale.id}
            style={[styles.saleCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => onPressSale?.(sale.id)}
            activeOpacity={0.7}
          >
            {/* Sale Header */}
            <View style={styles.saleHeader}>
              <View style={styles.saleNumberContainer}>
                <Ionicons name="receipt" size={16} color={theme.colors.primary} />
                <Text style={[styles.saleNumber, { color: theme.colors.primary }]}>
                  {sale.saleNumber}
                </Text>
              </View>
              <Text style={[styles.saleTime, { color: theme.colors.textTertiary }]}>
                {moment(sale.createdAt).format('HH:mm')}
              </Text>
            </View>

            {/* Amount */}
            <Text style={[styles.amount, { color: theme.colors.text }]}>
              ₦{sale.totalAmount.toLocaleString()}
            </Text>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {sale.agentName}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {sale.itemsCount} items
                </Text>
              </View>
            </View>

            {/* Date */}
            <Text style={[styles.date, { color: theme.colors.textTertiary }]}>
              {moment(sale.createdAt).format('MMM D, YYYY')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {onViewAll && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={onViewAll}
        >
          <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
            View All Sales
          </Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  saleCard: {
    width: 200,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saleNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saleNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  saleTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RecentSales;