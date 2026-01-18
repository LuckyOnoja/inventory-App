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
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeDevices: number;
  pendingChecks: number;
  weeklySales: number[];
  weeklyLabels: string[];
  unreadNotifications: number;
  totalRevenue: number;
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
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    activeDevices: 0,
    pendingChecks: 0,
    weeklySales: [],
    weeklyLabels: [],
    unreadNotifications: 0,
    totalRevenue: 0,
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

  const StatCard = ({
    title,
    value,
    icon,
    color,
    onPress,
    subtitle = "",
    prefix = "",
  }: any) => (
    <TouchableOpacity
      style={styles.statCardWrapper}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <GlassCard
        style={styles.statCard}
        variant={subtitle.includes("low") || subtitle.includes("Offline") ? "warning" : "default"}
      >
        <View style={styles.statHeader}>
          <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
        </View>
        <View style={styles.statContent}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
          <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
            {title}
          </Text>
        </View>
        {subtitle && (
          <Text style={[styles.statSubtitle, { color: theme.colors.textTertiary }]}>
            {subtitle}
          </Text>
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
      <GlassView style={styles.quickAction} intensity={20}>
        <View style={[styles.quickActionIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
          {title}
        </Text>
      </GlassView>
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
    <View style={styles.activityItem}>
      <View
        style={[
          styles.activityIcon,
          { backgroundColor: activity.color + "20" },
        ]}
      >
        <Ionicons
          name={activity.icon as any}
          size={18}
          color={activity.color}
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
          {activity.title}
        </Text>
        <Text style={[styles.activityText, { color: theme.colors.textSecondary }]}>
          {activity.message}
        </Text>
      </View>
      <Text style={[styles.activityTime, { color: theme.colors.textTertiary }]}>
        {activity.time}
      </Text>
    </View>
  );

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

  const handleInventoryChecksNavigation = () => {
    if (isSuperAdmin || isSupervisor) navigation.navigate("InventoryCheck");
  };

  const handleProductsNavigation = () => {
    if (isSuperAdmin || isSupervisor) navigation.navigate("Products");
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading Dashboard...
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
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Welcome, {user?.name.split(" ")[0]}!
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Today's Overview •{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.profileInitials}>
              {user?.name.charAt(0)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Sales"
            value={stats.todaySalesCount}
            icon="cart-outline"
            color={theme.colors.primary}
            subtitle={`${formatCurrency(stats.todaySales)} revenue`}
            onPress={() => navigation.navigate("Sales")}
          />
          {(isSuperAdmin || isSupervisor) && (
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon="cash-outline"
              color={theme.colors.success}
              subtitle="This year"
              onPress={() => isSuperAdmin && navigation.navigate("Reports")}
            />
          )}
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="cube-outline"
            color={theme.colors.info}
            subtitle={`${stats.lowStockCount} low stock`}
            onPress={handleProductsNavigation}
          />
          <StatCard
            title="Alerts"
            value={stats.unreadNotifications}
            icon="notifications-outline"
            color={stats.unreadNotifications > 0 ? theme.colors.error : theme.colors.success}
            subtitle={stats.unreadNotifications > 0 ? "Unread notifications" : "All caught up"}
            onPress={() => navigation.navigate("Notifications")}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="New Sale"
              icon="add-circle-outline"
              color={theme.colors.primary}
              onPress={() => navigation.navigate("NewSale")}
            />
            {(isSuperAdmin || isSupervisor) && (
              <>
                <QuickAction
                  title="Inventory"
                  icon="clipboard-outline"
                  color={theme.colors.success}
                  onPress={handleInventoryNavigation}
                />
                <QuickAction
                  title="Add Product"
                  icon="add-outline"
                  color={theme.colors.info}
                  onPress={() => navigation.navigate("AddProduct")}
                />
              </>
            )}
            {(isSuperAdmin || isSupervisor) && (
              <QuickAction
                title="Reports"
                icon="document-text-outline"
                color={theme.colors.warning}
                onPress={handleReportsNavigation}
              />
            )}
            {isSalesAgent && (
              <>
                <QuickAction
                  title="My Sales"
                  icon="list-outline"
                  color={theme.colors.info}
                  onPress={() => navigation.navigate("Sales")}
                />
                <QuickAction
                  title="Products"
                  icon="cube-outline"
                  color={theme.colors.success}
                  onPress={() => navigation.navigate("Products")}
                />
              </>
            )}
          </View>
        </View>

        {/* Inventory Critical Stats */}
        {(isSuperAdmin || isSupervisor) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Inventory Status
            </Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Low Stock"
                value={stats.lowStockCount}
                icon="warning-outline"
                color={theme.colors.warning}
                subtitle="Needs Reorder"
                onPress={() => handleInventoryNavigation()}
              />
              <StatCard
                title="Out of Stock"
                value={stats.outOfStockCount}
                icon="close-circle-outline"
                color={theme.colors.error}
                subtitle="Critical"
                onPress={() => handleInventoryNavigation()}
              />
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Activity
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <GlassView style={styles.activityCard} intensity={15}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <View key={activity.id} style={index < recentActivities.length - 1 ? styles.activityDivider : undefined}>
                  <ActivityItem activity={activity} />
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="time-outline" size={32} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyActivityText, { color: theme.colors.textTertiary }]}>
                  No recent activity
                </Text>
              </View>
            )}
          </GlassView>
        </View>

        {/* Business Info */}
        {user?.business && (
          <View style={styles.section}>
            <GlassView style={styles.businessCard} intensity={10}>
              <View style={styles.businessHeader}>
                <View style={styles.businessInfo}>
                  <Text style={[styles.businessName, { color: theme.colors.text }]}>
                    {user.business.name}
                  </Text>
                  <Text style={[styles.businessType, { color: theme.colors.textSecondary }]}>
                    {user.business.type} • {user.business.location}
                  </Text>
                </View>
                <Ionicons name="business" size={32} color={theme.colors.primary} style={{ opacity: 0.8 }} />
              </View>
              <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.roleText, { color: theme.colors.primary }]}>
                  {user.role.replace("_", " ")}
                </Text>
              </View>
            </GlassView>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            ToryAi v1.0 • Web3 Edition
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
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileInitials: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
    gap: 12,
  },
  statCardWrapper: {
    width: '48%',
    marginBottom: 4,
  },
  statCard: {
    padding: 16,
    height: 140, // Fixed height for uniformity
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
    marginTop: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'flex-start',
    gap: 12,
  },
  quickActionWrapper: {
    width: '48%', // roughly 2 columns
  },
  quickAction: {
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    gap: 12,
    height: 110,
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  activityCard: {
    padding: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityText: {
    fontSize: 12,
    opacity: 0.7,
  },
  activityTime: {
    fontSize: 11,
    opacity: 0.5,
    fontWeight: '600',
  },
  emptyActivity: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyActivityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  businessCard: {
    padding: 20,
    borderRadius: 24,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  businessType: {
    fontSize: 12,
    opacity: 0.7,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: 'uppercase',
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 10,
    opacity: 0.4,
  },
});