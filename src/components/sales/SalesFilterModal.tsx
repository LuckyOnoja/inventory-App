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
  period: 'today' | 'week' | 'month' | 'all';
  paymentMethod: 'all' | 'cash' | 'card' | 'transfer';
  status: 'all' | 'completed' | 'pending' | 'cancelled';
  sortBy: 'recent' | 'amount' | 'agent';
}

interface SalesFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}

const SalesFilterModal: React.FC<SalesFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onFilterChange,
}) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  const paymentOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'transfer', label: 'Transfer' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'amount', label: 'Highest Amount' },
    { value: 'agent', label: 'By Agent' },
  ];

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      period: 'today',
      paymentMethod: 'all',
      status: 'all',
      sortBy: 'recent',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'today': return 'today-outline';
      case 'week': return 'calendar-outline';
      case 'month': return 'calendar-outline';
      default: return 'time-outline';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return 'cash-outline';
      case 'card': return 'card-outline';
      case 'transfer': return 'swap-horizontal-outline';
      default: return 'wallet-outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle-outline';
      case 'pending': return 'time-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getSortIcon = (sortBy: string) => {
    switch (sortBy) {
      case 'recent': return 'time-outline';
      case 'amount': return 'trending-up-outline';
      case 'agent': return 'people-outline';
      default: return 'funnel-outline';
    }
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
              Filter Sales
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={[styles.resetText, { color: theme.colors.error }]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Period Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Time Period
              </Text>
              <View style={styles.optionsGrid}>
                {periodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: localFilters.period === option.value 
                          ? theme.colors.primary + '20' 
                          : theme.colors.surfaceLight,
                        borderColor: localFilters.period === option.value 
                          ? theme.colors.primary 
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      period: option.value as any 
                    }))}
                  >
                    <Ionicons 
                      name={getPeriodIcon(option.value)} 
                      size={16} 
                      color={localFilters.period === option.value 
                        ? theme.colors.primary
                        : theme.colors.text
                      } 
                    />
                    <Text style={[
                      styles.optionText,
                      { 
                        color: localFilters.period === option.value 
                          ? theme.colors.primary
                          : theme.colors.text 
                      }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Method Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Payment Method
              </Text>
              <View style={styles.optionsGrid}>
                {paymentOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: localFilters.paymentMethod === option.value 
                          ? theme.colors.primary + '20' 
                          : theme.colors.surfaceLight,
                        borderColor: localFilters.paymentMethod === option.value 
                          ? theme.colors.primary 
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      paymentMethod: option.value as any 
                    }))}
                  >
                    <Ionicons 
                      name={getPaymentIcon(option.value)} 
                      size={16} 
                      color={localFilters.paymentMethod === option.value 
                        ? theme.colors.primary
                        : theme.colors.text
                      } 
                    />
                    <Text style={[
                      styles.optionText,
                      { 
                        color: localFilters.paymentMethod === option.value 
                          ? theme.colors.primary
                          : theme.colors.text 
                      }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Sale Status
              </Text>
              <View style={styles.optionsGrid}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: localFilters.status === option.value 
                          ? getStatusColor(option.value, theme) + '20' 
                          : theme.colors.surfaceLight,
                        borderColor: localFilters.status === option.value 
                          ? getStatusColor(option.value, theme)
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      status: option.value as any 
                    }))}
                  >
                    <Ionicons 
                      name={getStatusIcon(option.value)} 
                      size={16} 
                      color={localFilters.status === option.value 
                        ? getStatusColor(option.value, theme)
                        : theme.colors.text
                      } 
                    />
                    <Text style={[
                      styles.optionText,
                      { 
                        color: localFilters.status === option.value 
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
              <View style={styles.optionsGrid}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
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
                      styles.optionText,
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

// Helper function
const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'completed': return theme.colors.success;
    case 'pending': return theme.colors.warning;
    case 'cancelled': return theme.colors.error;
    default: return theme.colors.info;
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minWidth: '48%',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
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

export default SalesFilterModal;