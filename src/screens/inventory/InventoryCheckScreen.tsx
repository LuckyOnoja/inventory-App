// screens/inventory/InventoryCheckScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

interface CheckItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  expectedQty: number;
  actualQty: number;
  unit: string;
  discrepancyQty: number;
  status: 'pending' | 'matched' | 'discrepancy';
}

interface InventoryCheck {
  id?: string;
  cyclePeriod: string;
  items: CheckItem[];
  notes?: string;
}

export default function InventoryCheckScreen({ navigation }: any) {
  const [check, setCheck] = useState<InventoryCheck>({
    cyclePeriod: 'daily',
    items: [],
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchProductsForCheck();
  }, []);

  const fetchProductsForCheck = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products?active=true&limit=100`);
      
      if (response.data.success) {
        const products = response.data.data;
        const checkItems: CheckItem[] = products.map((product: any) => ({
          id: product.id,
          productId: product.id,
          productName: product.name,
          sku: product.sku || 'N/A',
          expectedQty: product.currentStock,
          actualQty: product.currentStock, // Start with expected value
          unit: product.unit,
          discrepancyQty: 0,
          status: 'pending',
        }));
        
        setCheck(prev => ({ ...prev, items: checkItems }));
      }
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCheck(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.productId === productId) {
          const discrepancyQty = newQuantity - item.expectedQty;
          return {
            ...item,
            actualQty: newQuantity,
            discrepancyQty,
            status: discrepancyQty === 0 ? 'matched' : 'discrepancy',
          };
        }
        return item;
      }),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate at least one item has been checked
      const checkedItems = check.items.filter(item => item.status !== 'pending');
      if (checkedItems.length === 0) {
        Alert.alert('Warning', 'Please check at least one item before saving');
        setSaving(false);
        return;
      }

      // Format items for API
      const itemsForApi = check.items
        .filter(item => item.status !== 'pending')
        .map(item => ({
          productId: item.productId,
          actualQty: item.actualQty,
        }));

      const checkData = {
        cyclePeriod: check.cyclePeriod,
        items: itemsForApi,
        notes: check.notes,
      };

      const response = await axios.post(`${API_URL}/inventory/checks`, checkData);
      
      if (response.data.success) {
        Alert.alert(
          'Success', 
          'Inventory check saved successfully!',
          [
            {
              text: 'View Summary',
              onPress: () => navigation.navigate('InventoryCheckDetail', { 
                checkId: response.data.data.id 
              }),
            },
            {
              text: 'Back to Inventory',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Failed to save inventory check:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to save inventory check');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
        return theme.colors.success;
      case 'discrepancy':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'matched':
        return 'Matched';
      case 'discrepancy':
        return 'Discrepancy';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getSummary = () => {
    const totalItems = check.items.length;
    const checkedItems = check.items.filter(item => item.status !== 'pending').length;
    const matched = check.items.filter(item => item.status === 'matched').length;
    const discrepancies = check.items.filter(item => item.status === 'discrepancy').length;
    const pending = check.items.filter(item => item.status === 'pending').length;
    const totalDiscrepancy = Math.abs(check.items.reduce((sum, item) => sum + item.discrepancyQty, 0));
    
    return { totalItems, checkedItems, matched, discrepancies, pending, totalDiscrepancy };
  };

  const summary = getSummary();

  const cyclePeriods = [
    { value: 'daily', label: 'Daily Check', icon: 'calendar-outline' },
    { value: 'weekly', label: 'Weekly Check', icon: 'calendar-outline' },
    { value: 'monthly', label: 'Monthly Check', icon: 'calendar-outline' },
    { value: 'quarterly', label: 'Quarterly Check', icon: 'calendar-outline' },
    { value: 'yearly', label: 'Yearly Check', icon: 'calendar-outline' },
    { value: 'random', label: 'Random Spot Check', icon: 'shuffle-outline' },
  ];

  const getCycleLabel = (value: string) => {
    const period = cyclePeriods.find(p => p.value === value);
    return period?.label || 'Daily Check';
  };

  const toggleItem = (productId: string) => {
    setCheck(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.productId === productId) {
          const status = item.status === 'pending' ? 'matched' : 'pending';
          const actualQty = status === 'pending' ? item.expectedQty : item.actualQty;
          const discrepancyQty = status === 'pending' ? 0 : actualQty - item.expectedQty;
          
          return {
            ...item,
            status,
            actualQty,
            discrepancyQty,
          };
        }
        return item;
      }),
    }));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Inventory Check
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.saveButton, { 
          backgroundColor: saving ? theme.colors.background : theme.colors.primary,
          opacity: saving ? 0.7 : 1,
        }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={theme.colors.white} />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color={theme.colors.white} />
            <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
              Save
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCycleSelector = () => (
    <TouchableOpacity
      style={[styles.cycleSelector, { backgroundColor: theme.colors.surface }]}
      onPress={() => setShowCycleModal(true)}
    >
      <View style={styles.cycleInfo}>
        <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
        <View style={styles.cycleTexts}>
          <Text style={[styles.cycleLabel, { color: theme.colors.textSecondary }]}>
            Check Type
          </Text>
          <Text style={[styles.cycleValue, { color: theme.colors.text }]}>
            {getCycleLabel(check.cyclePeriod)}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  const renderCycleModal = () => (
    <Modal
      visible={showCycleModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCycleModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowCycleModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Select Check Type
                </Text>
                <TouchableOpacity onPress={() => setShowCycleModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.cycleList}>
                {cyclePeriods.map((period) => (
                  <TouchableOpacity
                    key={period.value}
                    style={[
                      styles.cycleItem,
                      { 
                        backgroundColor: check.cyclePeriod === period.value 
                          ? theme.colors.primary + '20' 
                          : 'transparent',
                        borderBottomColor: theme.colors.border,
                      }
                    ]}
                    onPress={() => {
                      setCheck(prev => ({ ...prev, cyclePeriod: period.value }));
                      setShowCycleModal(false);
                    }}
                  >
                    <View style={styles.cycleItemContent}>
                      <Ionicons 
                        name={period.icon as any} 
                        size={20} 
                        color={check.cyclePeriod === period.value 
                          ? theme.colors.primary 
                          : theme.colors.text
                        } 
                      />
                      <Text style={[
                        styles.cycleItemText,
                        { 
                          color: check.cyclePeriod === period.value 
                            ? theme.colors.primary 
                            : theme.colors.text 
                        }
                      ]}>
                        {period.label}
                      </Text>
                    </View>
                    {check.cyclePeriod === period.value && (
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderSummary = () => (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {summary.totalItems}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Total Items
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
            {summary.matched}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Matched
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
            {summary.discrepancies}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Discrepancies
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {summary.checkedItems}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Checked
          </Text>
        </View>
      </View>
      
      {summary.totalDiscrepancy > 0 && (
        <View style={[styles.discrepancyAlert, { backgroundColor: theme.colors.error + '10' }]}>
          <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
          <Text style={[styles.discrepancyAlertText, { color: theme.colors.error }]}>
            Total discrepancy: {summary.totalDiscrepancy} units
          </Text>
        </View>
      )}
    </View>
  );

  const renderCheckItem = (item: CheckItem) => {
    const statusColor = getStatusColor(item.status);
    const isPending = item.status === 'pending';
    
    return (
      <View key={item.id} style={[
        styles.itemCard, 
        { 
          backgroundColor: theme.colors.surface,
          opacity: isPending ? 0.7 : 1,
        }
      ]}>
        <TouchableOpacity 
          style={styles.itemHeader}
          onPress={() => toggleItem(item.productId)}
        >
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={[styles.productName, { color: theme.colors.text }]}>
                {item.productName}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Ionicons 
                  name={item.status === 'matched' ? 'checkmark' : 
                        item.status === 'discrepancy' ? 'warning' : 'time'} 
                  size={12} 
                  color={statusColor} 
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
            <Text style={[styles.productCode, { color: theme.colors.textTertiary }]}>
              SKU: {item.sku}
            </Text>
          </View>
          
          <Ionicons 
            name={isPending ? 'radio-button-off' : 'radio-button-on'} 
            size={20} 
            color={isPending ? theme.colors.textTertiary : theme.colors.primary} 
          />
        </TouchableOpacity>

        {!isPending && (
          <>
            <View style={styles.quantitySection}>
              <View style={styles.quantityColumn}>
                <Text style={[styles.quantityLabel, { color: theme.colors.textSecondary }]}>
                  Expected
                </Text>
                <Text style={[styles.quantityValue, { color: theme.colors.text }]}>
                  {item.expectedQty} {item.unit}
                </Text>
              </View>
              
              <Ionicons name="arrow-forward" size={20} color={theme.colors.textTertiary} />
              
              <View style={styles.quantityColumn}>
                <Text style={[styles.quantityLabel, { color: theme.colors.textSecondary }]}>
                  Actual Count
                </Text>
                <View style={styles.quantityInputContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { borderColor: theme.colors.border }]}
                    onPress={() => updateQuantity(item.productId, Math.max(0, item.actualQty - 1))}
                  >
                    <Ionicons name="remove" size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={[styles.quantityInput, { 
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    }]}
                    value={item.actualQty.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      updateQuantity(item.productId, num);
                    }}
                    keyboardType="numeric"
                    editable={!isPending}
                  />
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, { borderColor: theme.colors.border }]}
                    onPress={() => updateQuantity(item.productId, item.actualQty + 1)}
                  >
                    <Ionicons name="add" size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {item.discrepancyQty !== 0 && (
              <View style={[
                styles.discrepancyRow,
                { 
                  backgroundColor: item.discrepancyQty < 0 
                    ? theme.colors.error + '10' 
                    : theme.colors.success + '10' 
                }
              ]}>
                <Ionicons 
                  name={item.discrepancyQty < 0 ? 'arrow-down' : 'arrow-up'} 
                  size={16} 
                  color={item.discrepancyQty < 0 ? theme.colors.error : theme.colors.success} 
                />
                <Text style={[
                  styles.discrepancyText,
                  { color: item.discrepancyQty < 0 ? theme.colors.error : theme.colors.success }
                ]}>
                  {item.discrepancyQty > 0 ? '+' : ''}{item.discrepancyQty} {item.unit}
                  {item.discrepancyQty < 0 ? ' (Missing)' : ' (Extra)'}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {renderCycleSelector()}
          {renderSummary()}
          
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Products to Check ({check.items.length})
            </Text>
            <TouchableOpacity 
              style={styles.checkAllButton}
              onPress={() => {
                const allPending = check.items.every(item => item.status === 'pending');
                setCheck(prev => ({
                  ...prev,
                  items: prev.items.map(item => ({
                    ...item,
                    status: allPending ? 'matched' : 'pending',
                    actualQty: allPending ? item.expectedQty : item.actualQty,
                    discrepancyQty: allPending ? 0 : item.discrepancyQty,
                  })),
                }));
              }}
            >
              <Text style={[styles.checkAllText, { color: theme.colors.primary }]}>
                {check.items.every(item => item.status === 'pending') ? 'Check All' : 'Uncheck All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {check.items.map(item => renderCheckItem(item))}
          
          <View style={styles.noteSection}>
            <Text style={[styles.noteTitle, { color: theme.colors.text }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[styles.noteInput, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Add any notes about this inventory check..."
              placeholderTextColor={theme.colors.textTertiary}
              value={check.notes}
              onChangeText={(text) => setCheck(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.historyButton, { borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('InventoryChecksHistory')}
          >
            <Ionicons name="time-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.historyText, { color: theme.colors.text }]}>
              View Previous Checks
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderCycleModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  cycleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cycleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cycleTexts: {
    gap: 2,
  },
  cycleLabel: {
    fontSize: 12,
  },
  cycleValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cycleList: {
    maxHeight: 400,
  },
  cycleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cycleItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cycleItemText: {
    fontSize: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  discrepancyAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  discrepancyAlertText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  checkAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  productCode: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityColumn: {
    alignItems: 'center',
    flex: 1,
  },
  quantityLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    width: 60,
    height: 40,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  discrepancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  discrepancyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});