// screens/reports/ReportsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import moment from 'moment';

const API_URL = 'http://172.20.10.2:5000/api';
const { width: screenWidth } = Dimensions.get('window');

interface ReportData {
  sales: {
    daily: Array<{ date: string; amount: number }>;
    weekly: Array<{ week: string; amount: number }>;
    monthly: Array<{ month: string; amount: number }>;
  };
  inventory: {
    lowStock: Array<{ product: string; quantity: number; minStock: number }>;
    topSelling: Array<{ product: string; sales: number; revenue: number }>;
    categories: Array<{ category: string; count: number; value: number }>;
  };
  staff: {
    performance: Array<{ name: string; sales: number; revenue: number }>;
    attendance: Array<{ date: string; present: number; total: number }>;
  };
  security: {
    cameraStatus: Array<{ status: string; count: number }>;
    alerts: Array<{ type: string; count: number }>;
  };
  discrepancies: {
    byProduct: Array<{ product: string; discrepancy: number; value: number }>;
    byStaff: Array<{ staff: string; discrepancy: number; count: number }>;
  };
}

export default function ReportsScreen({ navigation }: any) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'staff' | 'security' | 'discrepancies'>('sales');
  const { theme } = useTheme();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockData: ReportData = {
        sales: {
          daily: [
            { date: 'Mon', amount: 45000 },
            { date: 'Tue', amount: 52000 },
            { date: 'Wed', amount: 38000 },
            { date: 'Thu', amount: 61000 },
            { date: 'Fri', amount: 72000 },
            { date: 'Sat', amount: 89000 },
            { date: 'Sun', amount: 42000 },
          ],
          weekly: [
            { week: 'Week 1', amount: 320000 },
            { week: 'Week 2', amount: 385000 },
            { week: 'Week 3', amount: 410000 },
            { week: 'Week 4', amount: 465000 },
          ],
          monthly: [
            { month: 'Jan', amount: 1250000 },
            { month: 'Feb', amount: 1420000 },
            { month: 'Mar', amount: 1380000 },
            { month: 'Apr', amount: 1560000 },
            { month: 'May', amount: 1620000 },
            { month: 'Jun', amount: 1750000 },
          ],
        },
        inventory: {
          lowStock: [
            { product: 'Coke 50cl', quantity: 12, minStock: 30 },
            { product: 'Indomie Chicken', quantity: 18, minStock: 25 },
            { product: 'Golden Penny Spaghetti', quantity: 8, minStock: 20 },
            { product: 'Sprite Can', quantity: 15, minStock: 25 },
            { product: 'Peak Milk Tin', quantity: 5, minStock: 15 },
          ],
          topSelling: [
            { product: 'Indomie Chicken', sales: 245, revenue: 490000 },
            { product: 'Coke 50cl', sales: 189, revenue: 283500 },
            { product: 'Golden Penny Spaghetti', sales: 156, revenue: 312000 },
            { product: 'Peak Milk Tin', sales: 98, revenue: 176400 },
            { product: 'Sprite Can', sales: 87, revenue: 130500 },
          ],
          categories: [
            { category: 'Food', count: 45, value: 1250000 },
            { category: 'Drinks', count: 32, value: 850000 },
            { category: 'Dairy', count: 18, value: 450000 },
            { category: 'Snacks', count: 24, value: 320000 },
            { category: 'Others', count: 15, value: 280000 },
          ],
        },
        staff: {
          performance: [
            { name: 'John Doe', sales: 157, revenue: 2450000 },
            { name: 'Jane Smith', sales: 89, revenue: 1450000 },
            { name: 'Michael Brown', sales: 112, revenue: 1890000 },
            { name: 'Sarah Williams', sales: 45, revenue: 780000 },
            { name: 'David Johnson', sales: 67, revenue: 1120000 },
          ],
          attendance: [
            { date: 'Mon', present: 4, total: 5 },
            { date: 'Tue', present: 5, total: 5 },
            { date: 'Wed', present: 4, total: 5 },
            { date: 'Thu', present: 3, total: 5 },
            { date: 'Fri', present: 5, total: 5 },
            { date: 'Sat', present: 4, total: 5 },
            { date: 'Sun', present: 2, total: 5 },
          ],
        },
        security: {
          cameraStatus: [
            { status: 'Online', count: 4 },
            { status: 'Offline', count: 1 },
            { status: 'Tampered', count: 1 },
            { status: 'Low Battery', count: 1 },
          ],
          alerts: [
            { type: 'Camera Offline', count: 3 },
            { type: 'Low Battery', count: 5 },
            { type: 'Tampering', count: 2 },
            { type: 'Motion Detected', count: 12 },
            { type: 'Connection Lost', count: 4 },
          ],
        },
        discrepancies: {
          byProduct: [
            { product: 'Golden Penny Spaghetti', discrepancy: -25, value: 50000 },
            { product: 'Coke 50cl', discrepancy: -8, value: 12000 },
            { product: 'Indomie Chicken', discrepancy: -5, value: 10000 },
            { product: 'Peak Milk Tin', discrepancy: 3, value: 5400 },
            { product: 'Sprite Can', discrepancy: -12, value: 18000 },
          ],
          byStaff: [
            { staff: 'John Doe', discrepancy: -15, count: 3 },
            { staff: 'Jane Smith', discrepancy: -8, count: 2 },
            { staff: 'Michael Brown', discrepancy: -22, count: 5 },
            { staff: 'Sarah Williams', discrepancy: -5, count: 1 },
          ],
        },
      };
      setReportData(mockData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportData();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Reports & Analytics
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Business insights and performance metrics
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.exportButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => {/* Export functionality */}}
      >
        <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['day', 'week', 'month'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period 
                ? theme.colors.primary + '20' 
                : 'transparent',
              borderColor: selectedPeriod === period 
                ? theme.colors.primary 
                : theme.colors.border,
            },
          ]}
          onPress={() => setSelectedPeriod(period as any)}
        >
          <Text
            style={[
              styles.periodText,
              {
                color: selectedPeriod === period 
                  ? theme.colors.primary 
                  : theme.colors.text,
              },
            ]}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabsContainer}
      contentContainerStyle={styles.tabsContent}
    >
      {[
        { key: 'sales', label: 'Sales', icon: 'cart-outline' },
        { key: 'inventory', label: 'Inventory', icon: 'cube-outline' },
        { key: 'staff', label: 'Staff', icon: 'people-outline' },
        { key: 'security', label: 'Security', icon: 'shield-outline' },
        { key: 'discrepancies', label: 'Discrepancies', icon: 'warning-outline' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            {
              backgroundColor: activeTab === tab.key 
                ? theme.colors.primary + '20' 
                : theme.colors.surface,
              borderColor: activeTab === tab.key 
                ? theme.colors.primary 
                : theme.colors.border,
            },
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons 
            name={tab.icon as any} 
            size={16} 
            color={activeTab === tab.key ? theme.colors.primary : theme.colors.text} 
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab.key 
                  ? theme.colors.primary 
                  : theme.colors.text,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSalesTab = () => {
    if (!reportData) return null;
    
    const data = reportData.sales[selectedPeriod === 'day' ? 'daily' : 
                   selectedPeriod === 'week' ? 'weekly' : 'monthly'];
    
    const chartData = {
      labels: data.map(item => selectedPeriod === 'day' ? item.date : 
                              selectedPeriod === 'week' ? item.week : item.month),
      datasets: [{
        data: data.map(item => item.amount / 1000), // Convert to thousands
      }],
    };

    return (
      <View style={styles.tabContent}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Sales Trend
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              {selectedPeriod === 'day' ? 'Daily' : 
               selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} performance
            </Text>
          </View>
          
          <LineChart
            data={chartData}
            width={screenWidth - 80}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.text,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Sales
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              ₦{data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </Text>
            <View style={styles.statTrend}>
              <Ionicons name="trending-up" size={16} color={theme.colors.success} />
              <Text style={[styles.statTrendText, { color: theme.colors.success }]}>
                +12.5%
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Average Daily
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              ₦{(data.reduce((sum, item) => sum + item.amount, 0) / data.length).toLocaleString()}
            </Text>
            <View style={styles.statTrend}>
              <Ionicons name="trending-up" size={16} color={theme.colors.success} />
              <Text style={[styles.statTrendText, { color: theme.colors.success }]}>
                +8.3%
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Best Day
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {data.reduce((max, item) => item.amount > max.amount ? item : max, data[0]).date}
            </Text>
            <Text style={[styles.statSubtext, { color: theme.colors.textTertiary }]}>
              ₦{Math.max(...data.map(item => item.amount)).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Growth
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              12.5%
            </Text>
            <View style={styles.statTrend}>
              <Ionicons name="arrow-up" size={16} color={theme.colors.success} />
              <Text style={[styles.statTrendText, { color: theme.colors.success }]}>
                vs last period
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderInventoryTab = () => {
    if (!reportData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Products
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {reportData.inventory.categories.reduce((sum, cat) => sum + cat.count, 0)}
            </Text>
            <Text style={[styles.statSubtext, { color: theme.colors.textTertiary }]}>
              across {reportData.inventory.categories.length} categories
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Low Stock
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>
              {reportData.inventory.lowStock.length}
            </Text>
            <Text style={[styles.statSubtext, { color: theme.colors.textTertiary }]}>
              need restocking
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Inventory Value
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              ₦{reportData.inventory.categories.reduce((sum, cat) => sum + cat.value, 0).toLocaleString()}
            </Text>
            <Text style={[styles.statSubtext, { color: theme.colors.textTertiary }]}>
              total stock value
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Top Category
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {reportData.inventory.categories.reduce((max, cat) => cat.value > max.value ? cat : max).category}
            </Text>
            <Text style={[styles.statSubtext, { color: theme.colors.textTertiary }]}>
              by value
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Low Stock Items
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          {reportData.inventory.lowStock.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                  {item.product}
                </Text>
                <Text style={[styles.listItemSubtitle, { color: theme.colors.textSecondary }]}>
                  Current: {item.quantity} • Min: {item.minStock}
                </Text>
              </View>
              <View style={[
                styles.stockIndicator,
                { 
                  backgroundColor: item.quantity < item.minStock * 0.3 
                    ? theme.colors.error + '20' 
                    : theme.colors.warning + '20' 
                }
              ]}>
                <Text style={[
                  styles.stockText,
                  { 
                    color: item.quantity < item.minStock * 0.3 
                      ? theme.colors.error 
                      : theme.colors.warning 
                  }
                ]}>
                  {Math.round((item.quantity / item.minStock) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Top Selling Products
            </Text>
          </View>
          
          {reportData.inventory.topSelling.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                  {item.product}
                </Text>
                <Text style={[styles.listItemSubtitle, { color: theme.colors.textSecondary }]}>
                  {item.sales} sales • ₦{item.revenue.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.rankBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.rankText, { color: theme.colors.primary }]}>
                  #{index + 1}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStaffTab = () => {
    if (!reportData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Staff Performance
            </Text>
          </View>
          
          {reportData.staff.performance.map((staff, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.staffAvatar}>
                <Text style={[styles.avatarText, { color: theme.colors.white }]}>
                  {staff.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                  {staff.name}
                </Text>
                <Text style={[styles.listItemSubtitle, { color: theme.colors.textSecondary }]}>
                  {staff.sales} sales • ₦{staff.revenue.toLocaleString()}
                </Text>
              </View>
              <View style={[
                styles.performanceBadge,
                { 
                  backgroundColor: index < 2 
                    ? theme.colors.success + '20' 
                    : theme.colors.warning + '20' 
                }
              ]}>
                <Text style={[
                  styles.performanceText,
                  { 
                    color: index < 2 
                      ? theme.colors.success 
                      : theme.colors.warning 
                  }
                ]}>
                  {index < 2 ? 'Top' : 'Avg'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Weekly Attendance
            </Text>
          </View>
          
          <BarChart
            data={{
              labels: reportData.staff.attendance.map(item => item.date),
              datasets: [{
                data: reportData.staff.attendance.map(item => (item.present / item.total) * 100),
              }],
            }}
            width={screenWidth - 80}
            height={200}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.text,
              style: {
                borderRadius: 16,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </View>
    );
  };

  const renderSecurityTab = () => {
    if (!reportData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Cameras
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {reportData.security.cameraStatus.reduce((sum, item) => sum + item.count, 0)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Online
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {reportData.security.cameraStatus.find(item => item.status === 'Online')?.count || 0}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Issues
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>
              {reportData.security.cameraStatus
                .filter(item => item.status !== 'Online')
                .reduce((sum, item) => sum + item.count, 0)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Alerts
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {reportData.security.alerts.reduce((sum, item) => sum + item.count, 0)}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Camera Status
            </Text>
          </View>
          
          <PieChart
            data={reportData.security.cameraStatus.map(item => ({
              name: item.status,
              population: item.count,
              color: item.status === 'Online' ? theme.colors.success :
                     item.status === 'Offline' ? theme.colors.error :
                     item.status === 'Tampered' ? theme.colors.warning :
                     theme.colors.info,
              legendFontColor: theme.colors.text,
              legendFontSize: 12,
            }))}
            width={screenWidth - 80}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Recent Alerts
            </Text>
          </View>
          
          {reportData.security.alerts.slice(0, 5).map((alert, index) => (
            <View key={index} style={styles.listItem}>
              <View style={[
                styles.alertIcon,
                { backgroundColor: alert.type.includes('Offline') || alert.type.includes('Tampering') 
                  ? theme.colors.error + '20' 
                  : theme.colors.warning + '20' 
                }
              ]}>
                <Ionicons 
                  name={alert.type.includes('Camera') ? 'camera-outline' : 'warning-outline'} 
                  size={16} 
                  color={alert.type.includes('Offline') || alert.type.includes('Tampering') 
                    ? theme.colors.error 
                    : theme.colors.warning 
                  } 
                />
              </View>
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                  {alert.type}
                </Text>
                <Text style={[styles.listItemSubtitle, { color: theme.colors.textSecondary }]}>
                  {alert.count} alerts this month
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDiscrepanciesTab = () => {
    if (!reportData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Product Discrepancies
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              Last 30 days
            </Text>
          </View>
          
          {reportData.discrepancies.byProduct.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                  {item.product}
                </Text>
                <Text style={[styles.listItemSubtitle, { color: theme.colors.textSecondary }]}>
                  Value: ₦{Math.abs(item.value).toLocaleString()}
                </Text>
              </View>
              <View style={[
                styles.discrepancyBadge,
                { 
                  backgroundColor: item.discrepancy < 0 
                    ? theme.colors.error + '20' 
                    : theme.colors.success + '20' 
                }
              ]}>
                <Text style={[
                  styles.discrepancyText,
                  { 
                    color: item.discrepancy < 0 
                      ? theme.colors.error 
                      : theme.colors.success 
                  }
                ]}>
                  {item.discrepancy > 0 ? '+' : ''}{item.discrepancy}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Staff Discrepancies
            </Text>
          </View>
          
          {reportData.discrepancies.byStaff.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.staffAvatar}>
                <Text style={[styles.avatarText, { color: theme.colors.white }]}>
                  {item.staff.charAt(0)}
                </Text>
              </View>
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                  {item.staff}
                </Text>
                <Text style={[styles.listItemSubtitle, { color: theme.colors.textSecondary }]}>
                  {item.count} incidents
                </Text>
              </View>
              <View style={[
                styles.discrepancyBadge,
                { 
                  backgroundColor: item.discrepancy < 0 
                    ? theme.colors.error + '20' 
                    : theme.colors.warning + '20' 
                }
              ]}>
                <Text style={[
                  styles.discrepancyText,
                  { 
                    color: item.discrepancy < 0 
                      ? theme.colors.error 
                      : theme.colors.warning 
                  }
                ]}>
                  {item.discrepancy}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Loss
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>
              ₦{reportData.discrepancies.byProduct
                .filter(item => item.discrepancy < 0)
                .reduce((sum, item) => sum + Math.abs(item.value), 0)
                .toLocaleString()}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Items Missing
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {reportData.discrepancies.byProduct
                .filter(item => item.discrepancy < 0)
                .reduce((sum, item) => sum + Math.abs(item.discrepancy), 0)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Staff Involved
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {reportData.discrepancies.byStaff.length}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Avg Loss/Day
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>
              ₦{(reportData.discrepancies.byProduct
                .filter(item => item.discrepancy < 0)
                .reduce((sum, item) => sum + Math.abs(item.value), 0) / 30)
                .toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sales':
        return renderSalesTab();
      case 'inventory':
        return renderInventoryTab();
      case 'staff':
        return renderStaffTab();
      case 'security':
        return renderSecurityTab();
      case 'discrepancies':
        return renderDiscrepanciesTab();
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderHeader()}
        {renderPeriodSelector()}
        {renderTabs()}
        {renderTabContent()}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            Data updated: {moment().format('MMM D, YYYY HH:mm')}
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            All values in Nigerian Naira (₦)
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statTrendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 12,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  performanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  performanceText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discrepancyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discrepancyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});