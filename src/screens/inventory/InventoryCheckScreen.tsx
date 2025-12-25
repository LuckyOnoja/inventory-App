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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

interface CheckItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  expectedQuantity: number;
  actualQuantity: number;
  unit: string;
  discrepancy: number;
  status: 'pending' | 'completed' | 'discrepancy';
}

export default function InventoryCheckScreen({ navigation }: any) {
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkTitle, setCheckTitle] = useState('Daily Inventory Check');
  const { theme } = useTheme();

  useEffect(() => {
    fetchCheckItems();
  }, []);

  const fetchCheckItems = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockItems: CheckItem[] = [
        {
          id: '1',
          productId: 'P001',
          productName: 'Indomie Chicken',
          productCode: 'IND-001',
          expectedQuantity: 45,
          actualQuantity: 45,
          unit: 'pack',
          discrepancy: 0,
          status: 'completed',
        },
        {
          id: '2',
          productId: 'P002',
          productName: 'Coke 50cl',
          productCode: 'COK-001',
          expectedQuantity: 12,
          actualQuantity: 10,
          unit: 'bottle',
          discrepancy: -2,
          status: 'discrepancy',
        },
        {
          id: '3',
          productId: 'P003',
          productName: 'Peak Milk Tin',
          productCode: 'PM-001',
          expectedQuantity: 0,
          actualQuantity: 0,
          unit: 'tin',
          discrepancy: 0,
          status: 'completed',
        },
        {
          id: '4',
          productId: 'P004',
          productName: 'Golden Penny Spaghetti',
          productCode: 'GPS-001',
          expectedQuantity: 25,
          actualQuantity: 0,
          unit: 'pack',
          discrepancy: -25,
          status: 'discrepancy',
        },
        {
          id: '5',
          productId: 'P005',
          productName: 'Sprite Can',
          productCode: 'SPC-001',
          expectedQuantity: 30,
          actualQuantity: 30,
          unit: 'can',
          discrepancy: 0,
          status: 'pending',
        },
      ];
      setCheckItems(mockItems);
    } catch (error) {
      console.error('Failed to fetch check items:', error);
      Alert.alert('Error', 'Failed to load inventory check data');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCheckItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const discrepancy = newQuantity - item.expectedQuantity;
        return {
          ...item,
          actualQuantity: newQuantity,
          discrepancy,
          status: discrepancy === 0 ? 'completed' : 'discrepancy',
        };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // API call to save inventory check
      Alert.alert('Success', 'Inventory check saved successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save inventory check:', error);
      Alert.alert('Error', 'Failed to save inventory check');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'discrepancy':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  const getSummary = () => {
    const totalItems = checkItems.length;
    const completed = checkItems.filter(item => item.status === 'completed').length;
    const withDiscrepancy = checkItems.filter(item => item.status === 'discrepancy').length;
    const pending = checkItems.filter(item => item.status === 'pending').length;
    const totalDiscrepancy = checkItems.reduce((sum, item) => sum + Math.abs(item.discrepancy), 0);
    
    return { totalItems, completed, withDiscrepancy, pending, totalDiscrepancy };
  };

  const summary = getSummary();

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
          {new Date().toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
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
            {summary.completed}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Matched
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
            {summary.withDiscrepancy}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Discrepancies
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {summary.totalDiscrepancy}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Items Off
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCheckItem = (item: CheckItem) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <View key={item.id} style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.itemHeader}>
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.colors.text }]}>
              {item.productName}
            </Text>
            <Text style={[styles.productCode, { color: theme.colors.textTertiary }]}>
              {item.productCode}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons 
              name={item.status === 'completed' ? 'checkmark' : 
                    item.status === 'discrepancy' ? 'warning' : 'time'} 
              size={12} 
              color={statusColor} 
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status === 'completed' ? 'Matched' : 
               item.status === 'discrepancy' ? 'Discrepancy' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.quantitySection}>
          <View style={styles.quantityColumn}>
            <Text style={[styles.quantityLabel, { color: theme.colors.textSecondary }]}>
              Expected
            </Text>
            <Text style={[styles.quantityValue, { color: theme.colors.text }]}>
              {item.expectedQuantity} {item.unit}
            </Text>
          </View>
          
          <Ionicons name="arrow-forward" size={20} color={theme.colors.textTertiary} />
          
          <View style={styles.quantityColumn}>
            <Text style={[styles.quantityLabel, { color: theme.colors.textSecondary }]}>
              Actual
            </Text>
            <View style={styles.quantityInputContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: theme.colors.border }]}
                onPress={() => updateQuantity(item.id, Math.max(0, item.actualQuantity - 1))}
              >
                <Ionicons name="remove" size={16} color={theme.colors.text} />
              </TouchableOpacity>
              
              <TextInput
                style={[styles.quantityInput, { color: theme.colors.text }]}
                value={item.actualQuantity.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  updateQuantity(item.id, num);
                }}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: theme.colors.border }]}
                onPress={() => updateQuantity(item.id, item.actualQuantity + 1)}
              >
                <Ionicons name="add" size={16} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {item.discrepancy !== 0 && (
          <View style={[
            styles.discrepancyRow,
            { backgroundColor: item.discrepancy < 0 ? theme.colors.error + '10' : theme.colors.success + '10' }
          ]}>
            <Ionicons 
              name={item.discrepancy < 0 ? 'arrow-down' : 'arrow-up'} 
              size={16} 
              color={item.discrepancy < 0 ? theme.colors.error : theme.colors.success} 
            />
            <Text style={[
              styles.discrepancyText,
              { color: item.discrepancy < 0 ? theme.colors.error : theme.colors.success }
            ]}>
              {item.discrepancy > 0 ? '+' : ''}{item.discrepancy} {item.unit}
              {item.discrepancy < 0 ? ' (Missing)' : ' (Extra)'}
            </Text>
          </View>
        )}

        <View style={styles.unitDisplay}>
          <Text style={[styles.unitText, { color: theme.colors.textTertiary }]}>
            Unit: {item.unit}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {renderSummary()}
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Items to Check ({checkItems.length})
          </Text>
          
          {checkItems.map(item => renderCheckItem(item))}
          
          <TouchableOpacity 
            style={[styles.addItemButton, { borderColor: theme.colors.border }]}
            onPress={() => Alert.alert('Add Item', 'Add item functionality would be implemented here')}
          >
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.addItemText, { color: theme.colors.primary }]}>
              Add Missing Item
            </Text>
          </TouchableOpacity>
          
          <View style={styles.noteSection}>
            <Text style={[styles.noteTitle, { color: theme.colors.text }]}>
              Notes
            </Text>
            <TextInput
              style={[styles.noteInput, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Add any notes about this inventory check..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
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
    marginBottom: 4,
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
    borderColor: 'rgba(148, 163, 184, 0.2)',
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
  unitDisplay: {
    alignItems: 'flex-end',
  },
  unitText: {
    fontSize: 11,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 20,
    gap: 8,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteSection: {
    marginBottom: 32,
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
  },
});