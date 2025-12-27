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
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
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
      // You might want to show an error message to the user here
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
        message: `Sale ${
          sale.saleNumber
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
      style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
        </Text>
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.statSubtitle, { color: theme.colors.textTertiary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textTertiary}
      />
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
        {title}
      </Text>
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
          size={16}
          color={activity.color}
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
          {activity.title}
        </Text>
        <Text
          style={[styles.activityText, { color: theme.colors.textSecondary }]}
        >
          {activity.message}
        </Text>
        <Text
          style={[styles.activityTime, { color: theme.colors.textTertiary }]}
        >
          {activity.time}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading Dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Welcome, {user?.name.split(" ")[0]}!
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Today's Overview •{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
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
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon="cash-outline"
            color={theme.colors.success}
            subtitle="This year"
            onPress={() => navigation.navigate("Reports")}
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="cube-outline"
            color={theme.colors.info}
            subtitle={`${stats.lowStockCount} low stock`}
            onPress={() => navigation.navigate("Products")}
          />
          <StatCard
            title="Alerts"
            value={stats.unreadNotifications}
            icon="notifications-outline"
            color={
              stats.unreadNotifications > 0
                ? theme.colors.error
                : theme.colors.success
            }
            subtitle={
              stats.unreadNotifications > 0
                ? "Unread notifications"
                : "All caught up"
            }
            onPress={() => navigation.navigate("Notifications")}
          />
        </View>

        {/* Inventory Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Inventory Status
          </Text>
          <View style={styles.inventoryStatus}>
            <StatCard
              title="Low Stock"
              value={stats.lowStockCount}
              icon="warning-outline"
              color={theme.colors.warning}
              onPress={() =>
                navigation.navigate("Inventory", { filter: "low-stock" })
              }
            />
            <StatCard
              title="Out of Stock"
              value={stats.outOfStockCount}
              icon="close-circle-outline"
              color={theme.colors.error}
              onPress={() =>
                navigation.navigate("Inventory", { filter: "out-of-stock" })
              }
            />
          </View>
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
            <QuickAction
              title="Inventory"
              icon="clipboard-outline"
              color={theme.colors.success}
              onPress={() => navigation.navigate("Inventory")}
            />
            <QuickAction
              title="Add Product"
              icon="add-outline"
              color={theme.colors.info}
              onPress={() => navigation.navigate("AddProduct")}
            />
            <QuickAction
              title="Reports"
              icon="document-text-outline"
              color={theme.colors.warning}
              onPress={() => navigation.navigate("Reports")}
            />
          </View>
        </View>

        {/* Security & System Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            System Status
          </Text>
          <View style={styles.systemStatus}>
            <StatCard
              title="Active Cameras"
              value={stats.activeDevices}
              icon="camera-outline"
              color={
                stats.activeDevices > 0
                  ? theme.colors.success
                  : theme.colors.error
              }
              subtitle={stats.activeDevices > 0 ? "Online" : "Offline"}
              onPress={() => navigation.navigate("Cameras")}
            />
            <StatCard
              title="Pending Checks"
              value={stats.pendingChecks}
              icon="time-outline"
              color={theme.colors.warning}
              subtitle="Requires attention"
              onPress={() => navigation.navigate("InventoryChecks")}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Activity
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
            >
              <Text
                style={[styles.seeAllText, { color: theme.colors.primary }]}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.activityCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons
                  name="time-outline"
                  size={32}
                  color={theme.colors.textTertiary}
                />
                <Text
                  style={[
                    styles.emptyActivityText,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  No recent activity
                </Text>
                <Text
                  style={[
                    styles.emptyActivitySubtext,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  Activities will appear here
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Business Info */}
        {user?.business && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Business Information
            </Text>
            <View
              style={[
                styles.businessCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.businessHeader}>
                <Ionicons
                  name="business-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.businessName, { color: theme.colors.text }]}
                >
                  {user.business.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.businessType,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {user.business.type}
              </Text>
              {user.business.location && (
                <View style={styles.businessLocation}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={theme.colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.businessLocationText,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    {user.business.location}
                  </Text>
                </View>
              )}
              <View style={styles.businessFooter}>
                <Text
                  style={[
                    styles.userRole,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {user.role.replace("_", " ")}
                </Text>
                <Text
                  style={[
                    styles.businessId,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  ID: {stats.businessId?.slice(0, 8) || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: theme.colors.textTertiary }]}
          >
            Data updated:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  statsGrid: {
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "48%",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.6,
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
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inventoryStatus: {
    flexDirection: "row",
    gap: 12,
  },
  systemStatus: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  activityText: {
    fontSize: 13,
    marginBottom: 2,
    opacity: 0.9,
  },
  activityTime: {
    fontSize: 11,
    opacity: 0.6,
  },
  emptyActivity: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActivityText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyActivitySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  businessCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  businessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "600",
  },
  businessType: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  businessLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  businessLocationText: {
    fontSize: 12,
  },
  businessFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRole: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.7,
  },
  businessId: {
    fontSize: 10,
    opacity: 0.5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    opacity: 0.5,
  },
});
