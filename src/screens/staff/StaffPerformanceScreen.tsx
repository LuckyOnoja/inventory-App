import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '../../config';

const { width } = Dimensions.get('window');
const API_URL = config.API_URL;

export default function StaffPerformanceScreen({ navigation, route }: any) {
  const { staffId, name } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [performance, setPerformance] = useState<any>(null);
  const { theme } = useTheme();
  const { token } = useAuth();

  useEffect(() => {
    fetchPerformanceData();
  }, [staffId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/${staffId}/performance?period=month`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPerformance(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPerformanceData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const summary = performance?.summary || {};
  const topProducts = performance?.topProducts || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Performance Summary</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, ...theme.shadows.md }]}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${theme.colors.primary.replace('#', '')}&color=fff&size=128` }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{name}</Text>
            <View style={[styles.scoreTag, { backgroundColor: theme.colors.success + '20' }]}>
              <Text style={[styles.scoreText, { color: theme.colors.success }]}>Performance Score: {performance?.performance?.score || 0}%</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statTile, { backgroundColor: theme.colors.surface, width: '48%' }]}>
            <Ionicons name="cash-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatCurrency(summary.totalAmount || 0)}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Revenue</Text>
          </View>
          <View style={[styles.statTile, { backgroundColor: theme.colors.surface, width: '48%' }]}>
            <Ionicons name="receipt-outline" size={24} color={theme.colors.info} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{summary.totalSales || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Sales Units</Text>
          </View>
        </View>

        {/* Secondary Stats */}
        <View style={styles.secondaryStats}>
          <View style={[styles.statTileSmall, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValueSmall, { color: theme.colors.text }]}>{formatCurrency(summary.averageSale || 0)}</Text>
            <Text style={[styles.statLabelSmall, { color: theme.colors.textSecondary }]}>Avg Ticket Size</Text>
          </View>
          <View style={[styles.statTileSmall, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValueSmall, { color: theme.colors.text }]}>{formatCurrency(summary.lifetimeRevenue || 0)}</Text>
            <Text style={[styles.statLabelSmall, { color: theme.colors.textSecondary }]}>Lifetime Rev</Text>
          </View>
          <View style={[styles.statTileSmall, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValueSmall, { color: theme.colors.text }]}>{summary.lifetimeSales || 0}</Text>
            <Text style={[styles.statLabelSmall, { color: theme.colors.textSecondary }]}>Total Sales</Text>
          </View>
        </View>

        {/* Top Selling Products */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Best Selling Inventory</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Volume based ranking</Text>
        </View>

        {topProducts.map((product: any, index: number) => (
          <View key={product.productId} style={[styles.productCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.indexBadge, { backgroundColor: theme.colors.primary + '10' }]}>
              <Text style={[styles.indexText, { color: theme.colors.primary }]}>{index + 1}</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: theme.colors.text }]}>{product.productName}</Text>
              <Text style={[styles.productStats, { color: theme.colors.textSecondary }]}>{product.quantity} Units Sold</Text>
            </View>
            <View style={styles.progressContainer}>
               <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                 <View style={[styles.progressFill, { width: `${(product.quantity / topProducts[0].quantity) * 100}%`, backgroundColor: theme.colors.primary }]} />
               </View>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('StaffSales', { staffId, staffName: name })}
        >
          <Text style={styles.actionButtonText}>View Complete Transaction History</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>

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
    padding: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statTile: {
    padding: 20,
    borderRadius: 24,
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statTileSmall: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  statValueSmall: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabelSmall: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '800',
  },
  productInfo: {
    flex: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  productStats: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    marginTop: 20,
    gap: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
