import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';

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
        label: 'Out of Stock',
        icon: 'close-circle-outline' as const,
      };
    }
    if (product.currentStock <= product.minStock) {
      return {
        color: theme.colors.warning,
        label: 'Low Stock',
        icon: 'alert-circle-outline' as const,
      };
    }
    return {
      color: theme.colors.success,
      label: 'In Stock',
      icon: 'checkmark-circle-outline' as const,
    };
  };

  const getProfitMargin = () => {
    const margin = ((product.sellingPrice - product.costPrice) / product.costPrice) * 100;
    return Math.round(margin);
  };

  const stockStatus = getStockStatus();
  const profitMargin = getProfitMargin();

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => onQuickAction('sell')}
      >
        <Ionicons name="cart-outline" size={20} color={theme.colors.white} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
        onPress={() => onQuickAction('restock')}
      >
        <Ionicons name="add-circle-outline" size={20} color={theme.colors.white} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.info }]}
        onPress={() => onQuickAction('adjust')}
      >
        <Ionicons name="create-outline" size={20} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  const CardContent = () => (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Stock Status Indicator */}
      <View style={[styles.statusIndicator, { backgroundColor: stockStatus.color + '20' }]}>
        <Ionicons name={stockStatus.icon} size={16} color={stockStatus.color} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Product Info Row */}
        <View style={styles.productInfoRow}>
          <View style={styles.productNameContainer}>
            <Text style={[styles.productName, { color: theme.colors.text }]}>
              {product.name}
            </Text>
            {product.sku && (
              <Text style={[styles.skuText, { color: theme.colors.textTertiary }]}>
                SKU: {product.sku}
              </Text>
            )}
          </View>
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.color + '20' }]}>
            <Text style={[styles.stockText, { color: stockStatus.color }]}>
              {product.currentStock} {product.unit}
            </Text>
          </View>
        </View>

        {/* Category & Details */}
        <View style={styles.detailsRow}>
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag-outline" size={12} color={theme.colors.textTertiary} />
            <Text style={[styles.categoryText, { color: theme.colors.textTertiary }]}>
              {product.category}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: theme.colors.text }]}>
              ₦{product.sellingPrice.toLocaleString()}
            </Text>
            <Text style={[styles.marginText, { 
              color: profitMargin >= 0 ? theme.colors.success : theme.colors.error 
            }]}>
              {profitMargin >= 0 ? '+' : ''}{profitMargin}%
            </Text>
          </View>
        </View>

        {/* Stock Level & Min Stock */}
        <View style={styles.stockInfoRow}>
          <View style={styles.stockLevelContainer}>
            <View style={styles.stockLevelBar}>
              <View 
                style={[
                  styles.stockLevelFill,
                  { 
                    width: `${Math.min((product.currentStock / (product.minStock * 3)) * 100, 100)}%`,
                    backgroundColor: stockStatus.color,
                  }
                ]} 
              />
            </View>
            <Text style={[styles.minStockText, { color: theme.colors.textTertiary }]}>
              Min: {product.minStock}
            </Text>
          </View>
          <View style={styles.costContainer}>
            <Text style={[styles.costLabel, { color: theme.colors.textTertiary }]}>
              Cost:
            </Text>
            <Text style={[styles.costText, { color: theme.colors.textSecondary }]}>
              ₦{product.costPrice.toLocaleString()}
            </Text>
          </View>
        </View>
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

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <CardContent />
    </Swipeable>
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
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  skuText: {
    fontSize: 11,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  marginText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLevelContainer: {
    flex: 1,
    marginRight: 12,
  },
  stockLevelBar: {
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  stockLevelFill: {
    height: '100%',
    borderRadius: 2,
  },
  minStockText: {
    fontSize: 10,
    fontWeight: '500',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  costText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  actionButton: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 12,
  },
});

export default ProductCard;