import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { GlassView } from '../ui/GlassView';
import { GlassButton } from '../ui/GlassButton';
import { BlurView } from 'expo-blur';

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
    const resetFilters: FilterState = {
      period: 'today',
      paymentMethod: 'all',
      status: 'all',
      sortBy: 'recent',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  // ... (rest of the file content is unchanged until the end)
  // Ensure you keep the existing code and just add the export at the bottom.
  // Actually, since I need to append to the end of the file, I will target the end.

  // But wait, replace_file_content replaces a block. To fix the export, I should probably replace the end of the file.
  // To fix the type error, I need to replace handleReset.
  // I will do two chunks or just replace the handleReset and then append the export using a separate call or large chunk?
  // I can do it in one go if I target the handleReset and then target the end of the file? No, "replace_file_content" can only do one contiguous block if I don't use multi_replace.
  // I should use "multi_replace_file_content" to do both scattered edits.
  // But wait, the tool definitions say "Use this tool ONLY when you are making MULTIPLE, NON-CONTIGUOUS edits". Yes, that's what I need.


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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <GlassView style={styles.modalContainer} intensity={30}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
                              : theme.colors.surfaceLight + '40',
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
                              : theme.colors.surfaceLight + '40',
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
                              : theme.colors.surfaceLight + '40',
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
                              : theme.colors.surfaceLight + '40',
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
                <GlassButton
                  title="Apply Filters"
                  onPress={handleApply}
                  icon="checkmark"
                  variant="primary"
                />
              </View>
            </GlassView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  closeButton: {
    padding: 4,
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
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    width: '48%',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
});

export default SalesFilterModal;