import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface FilterState {
  category: string;
  stockStatus: 'all' | 'low' | 'out' | 'normal';
  sortBy: 'name' | 'stock' | 'price' | 'recent';
  sortOrder: 'asc' | 'desc';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  categories: string[];
  onFilterChange: (filters: Partial<FilterState>) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  categories,
  onFilterChange,
}) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const stockStatusOptions = [
    { value: 'all', label: 'All Stock' },
    { value: 'low', label: 'Low Stock' },
    { value: 'out', label: 'Out of Stock' },
    { value: 'normal', label: 'Normal Stock' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'stock', label: 'Stock Level' },
    { value: 'price', label: 'Price' },
    { value: 'recent', label: 'Recently Added' },
  ];

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      category: 'all',
      stockStatus: 'all',
      sortBy: 'recent',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const toggleSortOrder = () => {
    setLocalFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Filter & Sort
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={[styles.resetText, { color: theme.colors.error }]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Category
              </Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      { 
                        backgroundColor: localFilters.category === category 
                          ? theme.colors.primary + '20' 
                          : theme.colors.surfaceLight,
                        borderColor: localFilters.category === category 
                          ? theme.colors.primary 
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      category 
                    }))}
                  >
                    <Text style={[
                      styles.categoryText,
                      { 
                        color: localFilters.category === category 
                          ? theme.colors.primary 
                          : theme.colors.text 
                      }
                    ]}>
                      {category === 'all' ? 'All Categories' : category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stock Status Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Stock Status
              </Text>
              <View style={styles.statusGrid}>
                {stockStatusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusButton,
                      { 
                        backgroundColor: localFilters.stockStatus === option.value 
                          ? getStatusColor(option.value, theme) + '20' 
                          : theme.colors.surfaceLight,
                        borderColor: localFilters.stockStatus === option.value 
                          ? getStatusColor(option.value, theme)
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      stockStatus: option.value as any 
                    }))}
                  >
                    <Ionicons 
                      name={getStatusIcon(option.value)} 
                      size={16} 
                      color={localFilters.stockStatus === option.value 
                        ? getStatusColor(option.value, theme)
                        : theme.colors.text
                      } 
                    />
                    <Text style={[
                      styles.statusText,
                      { 
                        color: localFilters.stockStatus === option.value 
                          ? getStatusColor(option.value, theme)
                          : theme.colors.text 
                      }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Sort By
              </Text>
              <View style={styles.sortGrid}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortButton,
                      { 
                        backgroundColor: localFilters.sortBy === option.value 
                          ? theme.colors.primary + '20' 
                          : theme.colors.surfaceLight,
                        borderColor: localFilters.sortBy === option.value 
                          ? theme.colors.primary 
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      sortBy: option.value as any 
                    }))}
                  >
                    <Ionicons 
                      name={getSortIcon(option.value)} 
                      size={16} 
                      color={localFilters.sortBy === option.value 
                        ? theme.colors.primary
                        : theme.colors.text
                      } 
                    />
                    <Text style={[
                      styles.sortText,
                      { 
                        color: localFilters.sortBy === option.value 
                          ? theme.colors.primary
                          : theme.colors.text 
                      }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort Order Toggle */}
              <TouchableOpacity
                style={[styles.orderButton, { backgroundColor: theme.colors.surfaceLight }]}
                onPress={toggleSortOrder}
              >
                <Ionicons 
                  name={localFilters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.orderText, { color: theme.colors.primary }]}>
                  {localFilters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleApply}
            >
              <Ionicons name="checkmark" size={20} color={theme.colors.white} />
              <Text style={[styles.applyText, { color: theme.colors.white }]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Helper functions
const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'low': return theme.colors.warning;
    case 'out': return theme.colors.error;
    case 'normal': return theme.colors.success;
    default: return theme.colors.info;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'low': return 'alert-circle-outline';
    case 'out': return 'close-circle-outline';
    case 'normal': return 'checkmark-circle-outline';
    default: return 'apps-outline';
  }
};

const getSortIcon = (sortBy: string) => {
  switch (sortBy) {
    case 'name': return 'text-outline';
    case 'stock': return 'trending-up-outline';
    case 'price': return 'cash-outline';
    default: return 'time-outline';
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minWidth: '48%',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minWidth: '48%',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  orderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;