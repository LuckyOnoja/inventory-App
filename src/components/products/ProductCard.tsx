import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GlassCard } from '../ui/GlassCard';
import { GlassView } from '../ui/GlassView';

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

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onQuickAction: (action: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onQuickAction,
}) => {
  const { theme } = useTheme();

  const getStockStatus = () => {
    if (product.currentStock === 0) {
      return {
        color: theme.colors.error,
        label: 'DEPLETED',
        icon: 'close-circle-outline' as const,
        variant: 'error' as const,
        bg: theme.colors.error + '10',
      };
    }
    if (product.currentStock <= product.minStock) {
      return {
        color: theme.colors.warning,
        label: 'CRITICAL',
        icon: 'alert-circle-outline' as const,
        variant: 'warning' as const,
        bg: theme.colors.warning + '10',
      };
    }
    return {
      color: theme.colors.success,
      label: 'NOMINAL',
      icon: 'checkmark-circle-outline' as const,
      variant: 'default' as const,
      bg: theme.colors.success + '10',
    };
  };

  const status = getStockStatus();
  const margin = Math.round(((product.sellingPrice - product.costPrice) / product.costPrice) * 100);

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => onQuickAction('sell')}
      >
        <Ionicons name="cart-outline" size={20} color={theme.colors.white} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.info }]}
        onPress={() => onQuickAction('adjust')}
      >
        <Ionicons name="create-outline" size={20} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <GlassCard style={styles.card} variant={status.variant}>
          <View style={styles.header}>
            <View style={styles.titleArea}>
              <Text style={[styles.sku, { color: theme.colors.textTertiary }]}>#{product.sku || 'NO-SKU'}</Text>
              <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{product.name}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: theme.colors.textTertiary }]}>INVENTORY</Text>
              <View style={styles.stockRow}>
                <Text style={[styles.stockValue, { color: theme.colors.text }]}>{product.currentStock}</Text>
                <Text style={[styles.unitLabel, { color: theme.colors.textSecondary }]}>{product.unit}</Text>
              </View>
              <View style={styles.stockBarBg}>
                <View 
                  style={[
                    styles.stockBarFill, 
                    { 
                      width: `${Math.min((product.currentStock / Math.max(product.minStock * 4, 10)) * 100, 100)}%`,
                      backgroundColor: status.color
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: theme.colors.textTertiary }]}>PRICING</Text>
              <Text style={[styles.priceValue, { color: theme.colors.primary }]}>₦{product.sellingPrice.toLocaleString()}</Text>
              <View style={styles.marginRow}>
                <Ionicons name={margin >= 0 ? "trending-up" : "trending-down"} size={12} color={margin >= 0 ? theme.colors.success : theme.colors.error} />
                <Text style={[styles.marginValue, { color: margin >= 0 ? theme.colors.success : theme.colors.error }]}>{Math.abs(margin)}% Margin</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.categoryArea}>
              <Ionicons name="pricetag-outline" size={10} color={theme.colors.textTertiary} />
              <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{product.category}</Text>
            </View>
            <Text style={[styles.costPrice, { color: theme.colors.textTertiary }]}>Cost: ₦{product.costPrice.toLocaleString()}</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Swipeable>
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
  titleArea: {
    flex: 1,
    marginRight: 12,
  },
  sku: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  stockValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  unitLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  marginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marginValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: 12,
  },
  categoryArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  costPrice: {
    fontSize: 11,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    paddingRight: 20,
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 100,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductCard;