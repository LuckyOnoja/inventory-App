// screens/reports/ReportsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { GlassView } from "../../components/ui/GlassView";
import { GlassCard } from "../../components/ui/GlassCard";
import { LineChart, BarChart } from "react-native-chart-kit";
import axios from "axios";
import config from "../../config";

const { width: screenWidth } = Dimensions.get("window");

interface ReportData {
  sales: {
    daily: { date: string; amount: number }[];
    weekly: { week: string; amount: number }[];
    monthly: { month: string; amount: number }[];
  };
  inventory: {
    lowStock: { product: string; quantity: number; minStock: number }[];
    topSelling: { product: string; sales: number; revenue: number }[];
    categories: { category: string; count: number; value: number }[];
  };
}

export default function ReportsScreen({ navigation }: any) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"sales" | "inventory" | "staff" | "security">("sales");
  const { theme } = useTheme();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Mock data for immediate visual feedback of the new design
      const mockData: ReportData = {
        sales: {
          daily: [
            { date: "Mon", amount: 45000 },
            { date: "Tue", amount: 52000 },
            { date: "Wed", amount: 38000 },
            { date: "Thu", amount: 61000 },
            { date: "Fri", amount: 72000 },
            { date: "Sat", amount: 89000 },
            { date: "Sun", amount: 42000 },
          ],
          weekly: [
            { week: "W1", amount: 320000 },
            { week: "W2", amount: 385000 },
            { week: "W3", amount: 410000 },
            { week: "W4", amount: 465000 },
          ],
          monthly: [
            { month: "Jan", amount: 1250000 },
            { month: "Feb", amount: 1420000 },
            { month: "Mar", amount: 1380000 },
          ],
        },
        inventory: {
          lowStock: [
            { product: "Coke 50cl", quantity: 12, minStock: 30 },
            { product: "Indomie Chicken", quantity: 18, minStock: 25 },
            { product: "Golden Penny Spaghetti", quantity: 8, minStock: 20 },
          ],
          topSelling: [
            { product: "Indomie Chicken", sales: 245, revenue: 490000 },
            { product: "Coke 50cl", sales: 189, revenue: 283500 },
          ],
          categories: [
            { category: "Food", count: 45, value: 1250000 },
            { category: "Drinks", count: 32, value: 850000 },
          ],
        },
      };
      setReportData(mockData);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
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
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.headerGreeting, { color: theme.colors.textTertiary }]}>ANALYTICS ENGINE</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Intelligence Hub</Text>
        </View>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.colors.primary + '15' }]}
          onPress={() => {}}
        >
          <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(["sales", "inventory", "staff", "security"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 }
            ]}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? theme.colors.primary : theme.colors.textTertiary }
            ]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSalesTab = () => {
    if (!reportData) return null;
    
    const chartData = {
      labels: reportData.sales.daily.map(d => d.date),
      datasets: [{ data: reportData.sales.daily.map(d => d.amount / 1000) }]
    };

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsRow}>
          <GlassView style={styles.statCard} intensity={20}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>₦{(450).toFixed(1)}k</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>AVG DAILY</Text>
          </GlassView>
          <GlassView style={styles.statCard} intensity={20}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>+12%</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>GROWTH</Text>
          </GlassView>
        </View>

        <GlassCard style={styles.chartCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Revenue Velocity</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 72}
            height={220}
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: "transparent",
              backgroundGradientTo: "transparent",
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.textTertiary,
              decimalPlaces: 0,
              propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary }
            }}
            bezier
            style={styles.chart}
          />
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Efficiency Nodes</Text>
        </View>

        <GlassView style={styles.efficiencyCard} intensity={15}>
          <View style={styles.efficiencyItem}>
            <View style={[styles.efficiencyIcon, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="flash-outline" size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.efficiencyTitle, { color: theme.colors.text }]}>System Latency</Text>
              <Text style={[styles.efficiencyValue, { color: theme.colors.textSecondary }]}>0.24ms Response</Text>
            </View>
          </View>
          <View style={styles.efficiencyItem}>
            <View style={[styles.efficiencyIcon, { backgroundColor: theme.colors.success + '15' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.success} />
            </View>
            <View>
              <Text style={[styles.efficiencyTitle, { color: theme.colors.text }]}>Integrity Score</Text>
              <Text style={[styles.efficiencyValue, { color: theme.colors.textSecondary }]}>99.9% Verified</Text>
            </View>
          </View>
        </GlassView>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>CHANNELING INTELLIGENCE...</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {renderHeader()}
        {activeTab === "sales" && renderSalesTab()}
        {activeTab === "inventory" && (
           <View style={styles.tabContent}>
             <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>Inventory telemetry stream active. Querying datalake...</Text>
           </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerGreeting: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  tab: {
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  chartCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  chart: {
    marginLeft: -16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  efficiencyCard: {
    padding: 20,
    borderRadius: 24,
    gap: 20,
  },
  efficiencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  efficiencyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  efficiencyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  efficiencyValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 40,
  },
});
