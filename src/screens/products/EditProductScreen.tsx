import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const categories = [
  'Beverages',
  'Food',
  'Snacks',
  'Dairy',
  'Household',
  'Personal Care',
  'Electronics',
  'Clothing',
  'Pharmaceuticals',
  'Other',
];

const units = [
  'Piece',
  'Pack',
  'Box',
  'Carton',
  'Crate',
  'Kilogram',
  'Liter',
  'Meter',
  'Dozen',
  'Other',
];

export default function EditProductScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    minStock: '',
    description: '',
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { theme } = useTheme();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/${productId}`);
      const product = response.data;
      
      setFormData({
        name: product.name,
        sku: product.sku || '',
        category: product.category,
        unit: product.unit,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        currentStock: product.currentStock.toString(),
        minStock: product.minStock?.toString() || '10',
        description: product.description || '',
        active: product.active,
      });
    } catch (error) {
      console.error('Failed to fetch product:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = 'Valid cost price is required';
    }

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }

    if (parseFloat(formData.sellingPrice) < parseFloat(formData.costPrice)) {
      newErrors.sellingPrice = 'Selling price must be greater than cost price';
    }

    if (!formData.currentStock || parseInt(formData.currentStock) < 0) {
      newErrors.currentStock = 'Valid current stock is required';
    }

    if (!formData.minStock || parseInt(formData.minStock) < 0) {
      newErrors.minStock = 'Valid minimum stock is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || undefined,
        category: formData.category,
        unit: formData.unit,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        currentStock: parseInt(formData.currentStock),
        minStock: parseInt(formData.minStock),
        description: formData.description.trim() || undefined,
        active: formData.active,
      };

      await axios.put(`${API_URL}/products/${productId}`, productData);
      
      Alert.alert(
        'Success',
        'Product updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to update product:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update product. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/products/${productId}`);
              Alert.alert('Success', 'Product deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const toggleActiveStatus = () => {
    Alert.alert(
      formData.active ? 'Deactivate Product' : 'Activate Product',
      formData.active 
        ? 'Deactivated products will not appear in sales. Are you sure?'
        : 'Activate this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: formData.active ? 'Deactivate' : 'Activate',
          style: formData.active ? 'destructive' : 'default',
          onPress: () => {
            setFormData(prev => ({ ...prev, active: !prev.active }));
          },
        },
      ]
    );
  };

  const calculateProfit = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    if (cost > 0 && selling > 0) {
      const profit = selling - cost;
      const margin = ((profit) / cost) * 100;
      return {
        profit,
        margin: Math.round(margin),
      };
    }
    return null;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const profitData = calculateProfit();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Edit Product
            </Text>
            <TouchableOpacity onPress={toggleActiveStatus}>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: formData.active 
                    ? theme.colors.success + '20' 
                    : theme.colors.error + '20',
                }
              ]}>
                <Ionicons 
                  name={formData.active ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={formData.active ? theme.colors.success : theme.colors.error} 
                />
                <Text style={[
                  styles.statusText,
                  { color: formData.active ? theme.colors.success : theme.colors.error }
                ]}>
                  {formData.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Basic Information
              </Text>
              
              {/* Product Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Product Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: errors.name ? theme.colors.error : theme.colors.border,
                      color: theme.colors.text,
                    }
                  ]}
                  placeholder="Enter product name"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
                {errors.name && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* SKU */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  SKU
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    }
                  ]}
                  placeholder="Enter SKU"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.sku}
                  onChangeText={(value) => handleInputChange('sku', value)}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Category *
                </Text>
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        { 
                          backgroundColor: formData.category === category 
                            ? theme.colors.primary + '20' 
                            : theme.colors.surfaceLight,
                          borderColor: formData.category === category 
                            ? theme.colors.primary 
                            : theme.colors.border,
                        }
                      ]}
                      onPress={() => handleInputChange('category', category)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        { 
                          color: formData.category === category 
                            ? theme.colors.primary 
                            : theme.colors.text 
                        }
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.category && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.category}
                  </Text>
                )}
              </View>

              {/* Unit */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Unit of Measurement *
                </Text>
                <View style={styles.unitGrid}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        { 
                          backgroundColor: formData.unit === unit 
                            ? theme.colors.primary + '20' 
                            : theme.colors.surfaceLight,
                          borderColor: formData.unit === unit 
                            ? theme.colors.primary 
                            : theme.colors.border,
                        }
                      ]}
                      onPress={() => handleInputChange('unit', unit)}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        { 
                          color: formData.unit === unit 
                            ? theme.colors.primary 
                            : theme.colors.text 
                        }
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.unit && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.unit}
                  </Text>
                )}
              </View>
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Pricing
              </Text>
              
              <View style={styles.row}>
                {/* Cost Price */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Cost Price *
                  </Text>
                  <View style={[
                    styles.inputContainer,
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: errors.costPrice ? theme.colors.error : theme.colors.border,
                    }
                  ]}>
                    <Text style={[styles.currency, { color: theme.colors.text }]}>
                      ₦
                    </Text>
                    <TextInput
                      style={[styles.input, styles.currencyInput, { color: theme.colors.text }]}
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={formData.costPrice}
                      onChangeText={(value) => handleInputChange('costPrice', value.replace(/[^0-9.]/g, ''))}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {errors.costPrice && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.costPrice}
                    </Text>
                  )}
                </View>

                {/* Selling Price */}
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Selling Price *
                  </Text>
                  <View style={[
                    styles.inputContainer,
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: errors.sellingPrice ? theme.colors.error : theme.colors.border,
                    }
                  ]}>
                    <Text style={[styles.currency, { color: theme.colors.text }]}>
                      ₦
                    </Text>
                    <TextInput
                      style={[styles.input, styles.currencyInput, { color: theme.colors.text }]}
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={formData.sellingPrice}
                      onChangeText={(value) => handleInputChange('sellingPrice', value.replace(/[^0-9.]/g, ''))}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {errors.sellingPrice && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.sellingPrice}
                    </Text>
                  )}
                </View>
              </View>

              {/* Profit Display */}
              {profitData && (
                <View style={[
                  styles.profitContainer,
                  { backgroundColor: profitData.margin >= 0 ? theme.colors.success + '20' : theme.colors.error + '20' }
                ]}>
                  <Ionicons 
                    name={profitData.margin >= 0 ? 'trending-up' : 'trending-down'} 
                    size={20} 
                    color={profitData.margin >= 0 ? theme.colors.success : theme.colors.error} 
                  />
                  <View style={styles.profitInfo}>
                    <Text style={[
                      styles.profitLabel,
                      { color: profitData.margin >= 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      Profit: ₦{profitData.profit.toLocaleString()} ({profitData.margin}%)
                    </Text>
                    <Text style={[
                      styles.profitSubtext,
                      { color: profitData.margin >= 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      {profitData.margin >= 0 ? 'Good profit margin' : 'Selling below cost!'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Stock Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Stock Information
              </Text>
              
              <View style={styles.row}>
                {/* Current Stock */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Current Stock *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.colors.surface,
                        borderColor: errors.currentStock ? theme.colors.error : theme.colors.border,
                        color: theme.colors.text,
                      }
                    ]}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.currentStock}
                    onChangeText={(value) => handleInputChange('currentStock', value.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                  />
                  {errors.currentStock && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.currentStock}
                    </Text>
                  )}
                </View>

                {/* Minimum Stock */}
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Minimum Stock *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.colors.surface,
                        borderColor: errors.minStock ? theme.colors.error : theme.colors.border,
                        color: theme.colors.text,
                      }
                    ]}
                    placeholder="10"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.minStock}
                    onChangeText={(value) => handleInputChange('minStock', value.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                  />
                  {errors.minStock && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.minStock}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Additional Information
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Description
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    }
                  ]}
                  placeholder="Enter product description or notes"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.deleteButton, { 
                backgroundColor: theme.colors.error + '20',
                borderColor: theme.colors.error,
              }]}
              onPress={handleDelete}
              disabled={saving}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.deleteButtonText, { color: theme.colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
            
            <View style={styles.saveButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }]}
                onPress={() => navigation.goBack()}
                disabled={saving}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { 
                    backgroundColor: theme.colors.primary,
                    opacity: saving ? 0.7 : 1,
                  }
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color={theme.colors.white} />
                    <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
                      Save Changes
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  currencyInput: {
    borderWidth: 0,
    paddingHorizontal: 0,
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
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
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 12,
  },
  profitInfo: {
    flex: 1,
  },
  profitLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  profitSubtext: {
    fontSize: 12,
  },
  textArea: {
    fontSize: 16,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});