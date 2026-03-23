import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
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

    data.recentSales.slice(0, 2).forEach((sale) => {
      activities.push({
        id: sale.id,
        type: "sale",
        title: "Sale Completed",
        message: `Sale ${sale.saleNumber} - ₦${sale.totalAmount.toLocaleString()}`,
        time: formatTimeAgo(sale.createdAt),
        icon: "checkmark-circle-outline",
        color: theme.colors.success,
      });
    });

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Bento stat card — varied sizes
  const StatCard = ({ title, value, icon, color, subtitle, trend, variant = "default", width = '48%', height, onPress }: any) => (
    <TouchableOpacity
      style={[
        styles.statCard,
        {
          width: width as any,
          height: height ?? 140,
          backgroundColor: theme.colors.surface,
          borderColor: variant === 'error' && stats.unreadNotifications > 0 ? theme.colors.error : theme.colors.border,
          borderWidth: variant === 'error' && stats.unreadNotifications > 0 ? 1.5 : 1,
          borderRadius: theme.borderRadius.lg,
          ...theme.shadows.sm,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statCardTop}>
        <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {!!trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? theme.colors.success + '15' : theme.colors.error + '15' }]}>
            <Ionicons
              name={trend > 0 ? "trending-up" : "trending-down"}
              size={11}
              color={trend > 0 ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.trendText, { color: trend > 0 ? theme.colors.success : theme.colors.error }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <View>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
        {!!subtitle && (
          <Text style={[styles.statSubtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Quick action button
  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Simple bar chart
  const SalesTrendChart = () => {
    const data = [65, 45, 75, 50, 85, 60, 95];
    const max = Math.max(...data);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <View style={[styles.chartCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Sales This Week</Text>
            <Text style={[styles.chartSubtitle, { color: theme.colors.textTertiary }]}>Revenue trend — last 7 days</Text>
          </View>
          <View style={styles.chartValueContainer}>
            <Text style={[styles.chartTotal, { color: theme.colors.primary }]}>
              ₦{(stats.todaySales * 7.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
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
                    height: (val / max) * 80,
                    backgroundColor: i === data.length - 1 ? theme.colors.primary : theme.colors.primary + '35',
                  }
                ]}
              />
              <Text style={[styles.chartBarLabel, { color: theme.colors.textTertiary }]}>
                {days[i].charAt(0)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

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
          Loading...
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              Good day,
            </Text>
            <Text style={[styles.headerName, { color: theme.colors.text }]}>
              {user?.name?.split(" ")[0]}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.avatarButton, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '40', borderWidth: 1 }]}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={[styles.avatarInitial, { color: theme.colors.primary }]}>
              {user?.name?.charAt(0)}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.summaryBanner}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={theme.gradients.primary as unknown as [string, string, ...string[]]}
            style={[StyleSheet.absoluteFill, { borderRadius: theme.borderRadius.lg }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.bannerContent}>
            <View>
              <Text style={styles.summaryLabel}>Today's Revenue</Text>
              <Text style={styles.summaryValue}>₦{stats.todaySales.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRight}>
              <Ionicons name="trending-up" size={32} color="rgba(255,255,255,0.4)" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Sales"
            value={stats.todaySalesCount}
            icon="cart-outline"
            color={theme.colors.primary}
            width="60%"
            height={150}
            trend={15}
            subtitle={`₦${stats.todaySales.toLocaleString()}`}
            onPress={() => navigation.navigate("Sales", { initialFilter: { period: 'today' } })}
          />
          <StatCard
            title="Total Items"
            value={stats.totalProducts}
            icon="cube-outline"
            width="37%"
            height={150}
            color={theme.colors.info}
            subtitle={`${stats.lowStockCount} low`}
            onPress={handleProductsNavigation}
          />
          <StatCard
            title="Unread"
            value={stats.unreadNotifications}
            icon="notifications"
            width="37%"
            color={theme.colors.error}
            variant={stats.unreadNotifications > 0 ? "error" : "default"}
            subtitle="Alerts"
            onPress={() => navigation.navigate("Notifications")}
          />
          <StatCard
            title="Total Revenue"
            value={`₦${(stats.allTimeRevenue || 0).toLocaleString()}`}
            icon="wallet-outline"
            width="60%"
            color={theme.colors.success}
            subtitle={`${stats.allTimeSalesCount || 0} sales`}
            onPress={() => navigation.navigate("Sales", { initialFilter: { period: 'all' } })}
          />
        </View>

        {/* Sales Chart */}
        <View style={styles.section}>
          <SalesTrendChart />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
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
              title="Cameras"
              icon="videocam-outline"
              color={theme.colors.info}
              onPress={handleCamerasNavigation}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.activityCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <View key={activity.id}>
                  <View style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: activity.color + '20' }]}>
                      <Ionicons name={activity.icon as any} size={16} color={activity.color} />
                    </View>
                    <View style={styles.activityContent}>
                      <View style={styles.activityRow}>
                        <Text style={[styles.activityTitle, { color: theme.colors.text }]}>{activity.title}</Text>
                        <Text style={[styles.activityTime, { color: theme.colors.textTertiary }]}>{activity.time}</Text>
                      </View>
                      <Text style={[styles.activityMessage, { color: theme.colors.textSecondary }]}>{activity.message}</Text>
                    </View>
                  </View>
                  {index < recentActivities.length - 1 && (
                    <View style={[styles.activityDivider, { backgroundColor: theme.colors.border }]} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="time-outline" size={28} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyActivityText, { color: theme.colors.textTertiary }]}>
                  No recent activity
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 13,
    marginBottom: 2,
  },
  headerName: {
    fontSize: 24,
    fontWeight: "700",
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryBanner: {
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 16,
    height: 100,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  summaryRight: {
    opacity: 0.6,
  },
  statsGrid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    padding: 16,
    justifyContent: 'space-between',
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chartCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
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
    fontSize: 17,
    fontWeight: '700',
  },
  chartTrendLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  chartBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    paddingHorizontal: 4,
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  chartBar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAction: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activityCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  activityDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  activityTime: {
    fontSize: 11,
    marginLeft: 8,
  },
  activityMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  emptyActivity: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyActivityText: {
    fontSize: 14,
  },
});