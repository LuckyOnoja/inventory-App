import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlassView } from "../../components/ui/GlassView";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;

interface DashboardStats {
  todaySales: number;
  todaySalesCount: number;
  allTimeSalesCount: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeDevices: number;
  pendingChecks: number;
  weeklySales: number[];
  weeklyLabels: string[];
  unreadNotifications: number;
  totalRevenue: number;
  allTimeRevenue: number;
  recentSales: Array<{
    id: string;
    saleNumber: string;
    totalAmount: number;
    agentName: string;
    createdAt: string;
    itemsCount: number;
  }>;
  recentNotifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    data: any;
  }>;
  businessId: string;
}

interface RecentActivity {
  id: string;
  type:
  | "sale"
  | "device_offline"
  | "low_stock"
  | "inventory_check"
  | "discrepancy"
  | "notification";
  title: string;
  message: string;
  time: string;
  icon: string;
  color: string;
}

export default function DashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todaySalesCount: 0,
    allTimeSalesCount: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    activeDevices: 0,
    pendingChecks: 0,
    weeklySales: [],
    weeklyLabels: [],
    unreadNotifications: 0,
    totalRevenue: 0,
    allTimeRevenue: 0,
    recentSales: [],
    recentNotifications: [],
    businessId: "",
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dashboard/stats`);

      if (response.data.success) {
        const data = response.data.data;
        setStats(data);

        // Transform recent activities from notifications and sales
        const activities = transformToRecentActivities(data);
        setRecentActivities(activities);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch dashboard data:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const transformToRecentActivities = (
    data: DashboardStats
  ): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Add recent sales as activities
    data.recentSales.slice(0, 2).forEach((sale) => {
      activities.push({
        id: sale.id,
        type: "sale",
        title: "Sale Completed",
        message: `Sale ${sale.saleNumber
          } - ₦${sale.totalAmount.toLocaleString()}`,
        time: formatTimeAgo(sale.createdAt),
        icon: "checkmark-circle-outline",
        color: theme.colors.success,
      });
    });

    // Add recent notifications as activities
    data.recentNotifications.slice(0, 3).forEach((notification) => {
      let icon = "notifications-outline";
      let activityType: RecentActivity["type"] = "notification";

      switch (notification.type) {
        case "device_offline":
        case "camera_alert":
          icon = "camera-outline";
          activityType = "device_offline";
          break;
        case "low_stock":
          icon = "warning-outline";
          activityType = "low_stock";
          break;
        case "inventory_check":
        case "discrepancy":
          icon = "clipboard-outline";
          activityType = "inventory_check";
          break;
        case "sale":
          icon = "cart-outline";
          activityType = "sale";
          break;
        case "restock":
          icon = "refresh-circle-outline";
          activityType = "notification";
          break;
        case "welcome":
        case "role_change":
          icon = "person-outline";
          activityType = "notification";
          break;
      }

      activities.push({
        id: notification.id,
        type: activityType,
        title: notification.title,
        message: notification.message,
        time: formatTimeAgo(notification.createdAt),
        icon,
        color: getNotificationColor(notification.type, theme.colors),
      });
    });

    // Sort by time (newest first)
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  };

  const getNotificationColor = (type: string, colors: any) => {
    switch (type) {
      case "device_offline":
      case "camera_alert":
        return colors.error;
      case "low_stock":
        return colors.warning;
      case "inventory_check":
      case "discrepancy":
        return colors.info;
      case "sale":
      case "restock":
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const formatTimeAgo = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Enhanced Stat Component with better visual hierarchy
  const ModernStatCard = ({ title, value, icon, color, subtitle, trend, variant = "default", onPress }: any) => (
    <TouchableOpacity 
      style={styles.modernStatCardWrapper} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <GlassCard
        style={styles.modernStatCard}
        variant={variant}
      >
        <View style={styles.modernStatHeader}>
          <View style={[styles.modernStatIcon, { backgroundColor: color + "15" }]}>
            <Ionicons name={icon} size={22} color={color} />
          </View>
          {!!trend && (
            <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? theme.colors.success + "15" : theme.colors.error + "15" }]}>
              <Ionicons 
                name={trend > 0 ? "trending-up" : "trending-down"} 
                size={12} 
                color={trend > 0 ? theme.colors.success : theme.colors.error} 
              />
              <Text style={[styles.trendText, { color: trend > 0 ? theme.colors.success : theme.colors.error }]}>
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
        <View style={styles.modernStatContent}>
          <Text style={[styles.modernStatValue, { color: theme.colors.text }]}>{value}</Text>
          <Text style={[styles.modernStatTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
        </View>
        {!!subtitle && (
          <Text style={[styles.modernStatSubtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text>
        )}
      </GlassCard>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity
      style={styles.quickActionWrapper}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <GlassView style={styles.quickAction} intensity={25}>
        <View style={[styles.quickActionIcon, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
          {title}
        </Text>
      </GlassView>
    </TouchableOpacity>
  );

  // Simple visual chart using View components
  const SalesTrendChart = () => {
    const data = [65, 45, 75, 50, 85, 60, 95];
    const max = Math.max(...data);
    
    return (
      <GlassView style={styles.chartCard} intensity={12}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Sales Performance</Text>
            <Text style={[styles.chartSubtitle, { color: theme.colors.textTertiary }]}>Last 7 days revenue trend</Text>
          </View>
          <View style={styles.chartValueContainer}>
            <Text style={[styles.chartTotal, { color: theme.colors.primary }]}>₦{(stats.todaySales * 7.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
            <Text style={[styles.chartTrendLabel, { color: theme.colors.success }]}>+12.5%</Text>
          </View>
        </View>
        <View style={styles.chartBody}>
          {data.map((val, i) => (
            <View key={i} style={styles.chartBarWrapper}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    height: (val / max) * 100,
                    backgroundColor: i === data.length - 1 ? theme.colors.primary : theme.colors.primary + "40"
                  }
                ]} 
              />
              <Text style={[styles.chartBarLabel, { color: theme.colors.textTertiary }]}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </Text>
            </View>
          ))}
        </View>
      </GlassView>
    );
  };

  // Check user role
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isSalesAgent = user?.role === "SALES_AGENT";
  const isSupervisor = user?.role === "SUPERVISOR";

  const handleInventoryNavigation = () => {
    if (isSuperAdmin || isSupervisor) navigation.navigate("Inventory");
  };

  const handleReportsNavigation = () => {
    if (isSuperAdmin || isSupervisor) navigation.navigate("Reports");
  };

  const handleCamerasNavigation = () => {
    if (isSuperAdmin) navigation.navigate("Cameras");
  };

  const handleProductsNavigation = () => {
    navigation.navigate("Products");
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Synchronizing Intelligence Core...
        </Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Status Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerGreeting, { color: theme.colors.textTertiary }]}>SYSTEM ONLINE,</Text>
              <Text style={[styles.headerName, { color: theme.colors.text }]}>
                {user?.name.split(" ")[0]} 🛰️
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border, borderWidth: 1 }]}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={[styles.profileInitials, { color: theme.colors.primary }]}>
                {user?.name.charAt(0)}
              </Text>
            </TouchableOpacity>
          </View>
          
          <GlassView style={styles.systemStatusCard} intensity={25}>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.statusText, { color: theme.colors.text }]}>Operational Pulse Active</Text>
              </View>
              <Text style={[styles.statusTime, { color: theme.colors.textTertiary }]}>Updated: Just now</Text>
            </View>
            <View style={styles.statusDetailRow}>
              <View style={styles.statusItem}>
                <Ionicons name="cloud-done" size={14} color={theme.colors.success} />
                <Text style={[styles.statusItemText, { color: theme.colors.textSecondary }]}>Cloud Sync</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="radio" size={14} color={theme.colors.primary} />
                <Text style={[styles.statusItemText, { color: theme.colors.textSecondary }]}>Edge Nodes</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="shield-checkmark" size={14} color={theme.colors.info} />
                <Text style={[styles.statusItemText, { color: theme.colors.textSecondary }]}>Secured</Text>
              </View>
            </View>
          </GlassView>
        </View>

        {/* Primary Stats Grid */}
        <View style={styles.statsGrid}>
          <ModernStatCard
            title="Today's Sales"
            value={stats.todaySalesCount}
            icon="cart-outline"
            color={theme.colors.primary}
            trend={15}
            subtitle={`₦${stats.todaySales.toLocaleString()}`}
            onPress={() => navigation.navigate("Sales", { initialFilter: { period: 'today' } })}
          />
          <ModernStatCard
            title="All-Time Sales"
            value={stats.allTimeSalesCount || 0}
            icon="receipt-outline"
            color={theme.colors.success}
            trend={12}
            subtitle={`₦${(stats.allTimeRevenue || 0).toLocaleString()}`}
            onPress={() => navigation.navigate("Sales", { initialFilter: { period: 'all' } })}
          />
          <ModernStatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="cube-outline"
            color={theme.colors.info}
            subtitle={`${stats.lowStockCount} items require reorder`}
            onPress={handleProductsNavigation}
          />
          <ModernStatCard
            title="System Alerts"
            value={stats.unreadNotifications}
            icon="notifications-outline"
            color={theme.colors.error}
            variant={stats.unreadNotifications > 0 ? "error" : "default"}
            subtitle="Pending review"
            onPress={() => navigation.navigate("Notifications")}
          />
        </View>

        {/* Sales Trend Visualization */}
        <View style={styles.section}>
          <SalesTrendChart />
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Command Center</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="New Sale"
              icon="add-circle-outline"
              color={theme.colors.primary}
              onPress={() => navigation.navigate("NewSale")}
            />
            <QuickAction
              title="Inventory"
              icon="clipboard-outline"
              color={theme.colors.success}
              onPress={handleInventoryNavigation}
            />
            <QuickAction
              title="Reports"
              icon="stats-chart-outline"
              color={theme.colors.warning}
              onPress={handleReportsNavigation}
            />
            <QuickAction
              title="Live Ops"
              icon="videocam-outline"
              color={theme.colors.info}
              onPress={handleCamerasNavigation}
            />
          </View>
        </View>

        {/* Recent Activity Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Operational Feed</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View Stream</Text>
            </TouchableOpacity>
          </View>

          <GlassView style={styles.activityCard} intensity={12}>
            {recentActivities.length > 0 ? (
              <View style={styles.timelineContainer}>
                {recentActivities.map((activity, index) => (
                  <View key={activity.id} style={styles.timelineItem}>
                    <View style={styles.timelineLineWrapper}>
                      <View style={[styles.timelineDot, { backgroundColor: activity.color }]} />
                      {index < recentActivities.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={[styles.activityTitle, { color: theme.colors.text }]}>{activity.title}</Text>
                        <Text style={[styles.activityTime, { color: theme.colors.textTertiary }]}>{activity.time}</Text>
                      </View>
                      <Text style={[styles.activityText, { color: theme.colors.textSecondary }]}>{activity.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="pulse-outline" size={32} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyActivityText, { color: theme.colors.textTertiary }]}>
                  Waiting for system pulses...
                </Text>
              </View>
            )}
          </GlassView>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            ToryAi Intelligence Core • v1.2.1 • {stats.businessId || 'Initializing...'} • Operational
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerGreeting: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerName: {
    fontSize: 28,
    fontWeight: "bold",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  systemStatusCard: {
    padding: 16,
    borderRadius: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusDetailRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusItemText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  modernStatCardWrapper: {
    width: '48%',
  },
  modernStatCard: {
    padding: 16,
    borderRadius: 24,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  modernStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modernStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modernStatContent: {
    marginTop: 12,
  },
  modernStatValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modernStatTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modernStatSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 6,
  },
  chartCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chartValueContainer: {
    alignItems: 'flex-end',
  },
  chartTotal: {
    fontSize: 20,
    fontWeight: '800',
  },
  chartTrendLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  chartBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 10,
  },
  chartBarWrapper: {
    alignItems: 'center',
    width: 20,
    gap: 12,
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionWrapper: {
    width: '48%',
  },
  quickAction: {
    padding: 16,
    borderRadius: 24,
    alignItems: "flex-start",
    gap: 12,
    height: 100,
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  activityCard: {
    borderRadius: 24,
    padding: 20,
  },
  timelineContainer: {
    gap: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineLineWrapper: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    position: 'absolute',
    top: 12,
    bottom: -22,
    borderRadius: 1,
    opacity: 0.3,
  },
  timelineContent: {
    flex: 1,
    marginTop: -2,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  activityTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyActivity: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyActivityText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});