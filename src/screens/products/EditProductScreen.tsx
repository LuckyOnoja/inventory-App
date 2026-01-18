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
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassView } from '../../components/ui/GlassView';
import { GlassButton } from '../../components/ui/GlassButton';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

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
      const product = response.data.data;

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
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  const profitData = calculateProfit();

  return (
    <ScreenWrapper>
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
              style={[styles.backButton, { backgroundColor: theme.colors.surfaceLight + '80' }]}
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
            <GlassView style={styles.section} intensity={25}>
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
                      backgroundColor: theme.colors.surfaceLight + '40',
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
                      backgroundColor: theme.colors.surfaceLight + '40',
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
                      activeOpacity={0.7}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: formData.category === category
                            ? theme.colors.primary + '30'
                            : theme.colors.surfaceLight + '20',
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
                      activeOpacity={0.7}
                      style={[
                        styles.unitButton,
                        {
                          backgroundColor: formData.unit === unit
                            ? theme.colors.primary + '30'
                            : theme.colors.surfaceLight + '20',
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
            </GlassView>

            {/* Pricing */}
            <GlassView style={styles.section} intensity={25}>
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
                      backgroundColor: theme.colors.surfaceLight + '40',
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
                      backgroundColor: theme.colors.surfaceLight + '40',
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
            </GlassView>

            {/* Stock Information */}
            <GlassView style={styles.section} intensity={25}>
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
                        backgroundColor: theme.colors.surfaceLight + '40',
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
                        backgroundColor: theme.colors.surfaceLight + '40',
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
            </GlassView>

            {/* Description */}
            <GlassView style={styles.section} intensity={25}>
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
                      backgroundColor: theme.colors.surfaceLight + '40',
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
            </GlassView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GlassButton
              title="Delete"
              onPress={handleDelete}
              variant="danger"
              icon="trash-outline"
              disabled={saving}
            />

            <View style={styles.saveButtons}>
              <GlassButton
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="secondary"
                style={{ flex: 1 }}
                disabled={saving}
              />

              <GlassButton
                title="Save"
                onPress={handleSave}
                loading={saving}
                icon="save-outline"
                variant="primary"
                style={{ flex: 1, marginLeft: 12 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 10,
    borderRadius: 12,
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
    padding: 20,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 56,
    borderRadius: 16,
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
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
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
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlignVertical: 'top',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 8,
    gap: 12,
  },
  saveButtons: {
    flexDirection: 'row',
    gap: 0, // Handled by marginLeft in button style
  },
});