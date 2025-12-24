import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  category: string;
}

interface LowStockAlertProps {
  items: LowStockItem[];
  onViewAll?: () => void;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ items, onViewAll }) => {
  const { theme } = useTheme();

  if (items.length === 0) {
    return null;
  }

  const getStockStatus = (current: number, min: number) => {
    const percentage = (current / min) * 100;
    if (percentage <= 25) return { color: theme.colors.error, label: 'Critical' };
    if (percentage <= 50) return { color: theme.colors.warning, label: 'Low' };
    return { color: theme.colors.info, label: 'Warning' };
  };

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const status = getStockStatus(item.currentStock, item.minStock);
        const percentage = Math.round((item.currentStock / item.minStock) * 100);

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}
            activeOpacity={0.7}
          >
            {/* Left Section */}
            <View style={styles.itemLeft}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: status.color + '20' }
              ]}>
                <Ionicons 
                  name="alert-circle-outline" 
                  size={20} 
                  color={status.color} 
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemCategory, { color: theme.colors.textTertiary }]}>
                  {item.category}
                </Text>
              </View>
            </View>

            {/* Right Section */}
            <View style={styles.itemRight}>
              <View style={styles.stockInfo}>
                <Text style={[styles.stockCount, { color: theme.colors.text }]}>
                  {item.currentStock} / {item.minStock}
                </Text>
                <View style={styles.stockBar}>
                  <View 
                    style={[
                      styles.stockFill,
                      { 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: status.color,
                      }
                    ]} 
                  />
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {onViewAll && items.length > 0 && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={onViewAll}
        >
          <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
            View All Low Stock Items
          </Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  stockInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  stockCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stockFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LowStockAlert;