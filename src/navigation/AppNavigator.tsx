import React, { useState, useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import config from "../config";

const API_URL = config.API_URL;

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Main Screens
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import ProductsScreen from "../screens/products/ProductsScreen";
import AddProductScreen from "../screens/products/AddProductScreen";
import EditProductScreen from "../screens/products/EditProductScreen";
import SalesScreen from "../screens/sales/SalesScreen";
import NewSaleScreen from "../screens/sales/NewSaleScreen";
import SaleDetailScreen from "../screens/sales/SaleDetailScreen";
import InventoryScreen from "../screens/inventory/InventoryScreen";
import InventoryCheckScreen from "../screens/inventory/InventoryCheckScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import StaffScreen from "../screens/staff/StaffScreen";
import AddStaffScreen from "../screens/staff/AddStaffScreen";
import EditStaffScreen from "../screens/staff/EditStaffScreen";
import StaffSalesScreen from "../screens/staff/StaffSalesScreen";
import CameraScreen from "../screens/camera/CameraScreen";
import ReportsScreen from "../screens/reports/ReportsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const SuperAdminStack = createStackNavigator();

// Global reference to navigation
let globalNavigationRef: any = null;

// Tab Navigator for Sales Agents
function SalesAgentTabs() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Set up interval to refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`);
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "grid" : "grid-outline";
              break;
            case "Sales":
              iconName = focused ? "cart" : "cart-outline";
              break;
            case "Products":
              iconName = focused ? "cube" : "cube-outline";
              break;
            case "Notifications":
              iconName = focused ? "notifications" : "notifications-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          headerShown: false,
          tabBarBadge: undefined 
        }}
      />
      <Tab.Screen 
        name="Sales" 
        component={SalesScreen}
        options={{ 
          headerShown: false,
          tabBarBadge: undefined 
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ 
          headerShown: false,
          tabBarBadge: undefined 
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          headerShown: false,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            fontSize: 10,
            minWidth: 18,
            height: 18,
          }
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// Custom Side Menu Component
const SideMenu = ({
  visible,
  onClose,
  user,
  onLogout,
  unreadCount,
}: {
  visible: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => Promise<void>;
  unreadCount: number;
}) => {
  const menuItems = [
    { name: "Dashboard", icon: "grid-outline", screen: "Dashboard" },
    { name: "Products", icon: "cube-outline", screen: "Products" },
    { name: "Sales", icon: "cart-outline", screen: "Sales" },
    { name: "Inventory", icon: "clipboard-outline", screen: "Inventory" },
    { name: "Staff", icon: "people-outline", screen: "Staff" },
    { name: "Cameras", icon: "camera-outline", screen: "Cameras" },
    { name: "Reports", icon: "document-text-outline", screen: "Reports" },
    {
      name: "Notifications",
      icon: "notifications-outline",
      screen: "Notifications",
      badge: unreadCount,
    },
    { name: "Settings", icon: "settings-outline", screen: "Settings" },
  ];

  const navigateTo = (screen: string) => {
    if (globalNavigationRef) {
      globalNavigationRef.navigate(screen);
      onClose();
    }
  };

  const handleLogout = async () => {
    onClose();
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await onLogout();
            } catch (error) {
              Alert.alert("Error", "Failed to logout");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sideMenuContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.sideMenuContent}
          >
            <ScrollView>
              {/* User Profile Section */}
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{user?.name || "User"}</Text>
                    <Text style={styles.userEmail}>
                      {user?.email || "email@example.com"}
                    </Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>
                        {user?.role?.replace("_", " ") || "User"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.businessInfo}>
                  <Ionicons
                    name="business-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.businessName}>
                    {user?.business?.name || "Business Name"}
                  </Text>
                </View>
              </View>

              {/* Menu Items */}
              <View style={styles.menuItems}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.menuItem}
                    onPress={() => navigateTo(item.screen)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.menuItemText}>{item.name}</Text>
                    {item.badge && item.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Logout Button */}
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color={colors.error}
                />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Header with Menu Button for Super Admin
const SuperAdminHeader = ({
  route,
  user,
  onMenuPress,
  unreadCount,
}: {
  route: any;
  user: any;
  onMenuPress: () => void;
  unreadCount: number;
}) => {
  const navigateToNotifications = () => {
    if (globalNavigationRef) {
      globalNavigationRef.navigate("Notifications");
    }
  };

  return (
    <View style={headerStyles.container}>
      <TouchableOpacity onPress={onMenuPress} style={headerStyles.menuButton}>
        <Ionicons name="menu" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={headerStyles.titleContainer}>
        <Text style={headerStyles.title}>
          {route?.params?.title || route?.name || "Dashboard"}
        </Text>
        <Text style={headerStyles.subtitle}>
          {user?.business?.name || "Business"}
        </Text>
      </View>
      <TouchableOpacity
        style={headerStyles.notificationButton}
        onPress={navigateToNotifications}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
        {unreadCount > 0 && (
          <View style={headerStyles.notificationBadge}>
            <Text style={headerStyles.notificationBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Super Admin Stack Navigator
function SuperAdminNavigator() {
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Set up interval to refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`);
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <>
      <SuperAdminStack.Navigator
        screenOptions={({ route }) => ({
          header: () => (
            <SuperAdminHeader
              route={route}
              user={user}
              onMenuPress={() => setMenuVisible(true)}
              unreadCount={unreadCount}
            />
          ),
        })}
      >
        <SuperAdminStack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ headerShown: true }}
        />
        <SuperAdminStack.Screen 
          name="Products" 
          component={ProductsScreen}
          options={{ headerShown: true }}
        />
        <SuperAdminStack.Screen 
          name="Sales" 
          component={SalesScreen}
          options={{ headerShown: true }}
        />
        <SuperAdminStack.Screen 
          name="Inventory" 
          component={InventoryScreen}
          options={{ headerShown: true }}
        />
        <SuperAdminStack.Screen 
          name="InventoryCheck" 
          component={InventoryCheckScreen}
          options={{ 
            headerShown: true,
            header: () => (
              <SuperAdminHeader
                route={{ name: "Inventory Check", params: { title: "Inventory Check" } }}
                user={user}
                onMenuPress={() => setMenuVisible(true)}
                unreadCount={unreadCount}
              />
            )
          }}
        />
        <SuperAdminStack.Screen 
          name="Staff" 
          component={StaffScreen}
          options={{ headerShown: true }}
        />
        <SuperAdminStack.Screen 
          name="AddStaff" 
          component={AddStaffScreen}
          options={{ headerShown: false }}
        />
        <SuperAdminStack.Screen 
          name="EditStaff" 
          component={EditStaffScreen}
          options={{ headerShown: false }}
        />
        <SuperAdminStack.Screen 
          name="StaffSales" 
          component={StaffSalesScreen}
          options={{ headerShown: false }}
        />
        <SuperAdminStack.Screen 
          name="Cameras" 
          component={CameraScreen}
          options={{ headerShown: true }}
        />
        <SuperAdminStack.Screen 
          name="Reports" 
          component={ReportsScreen}
          options={{ headerShown: true }}
        />
        <SuperAdminStack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{ 
            headerShown: true,
            header: () => (
              <SuperAdminHeader
                route={{ name: "Notifications", params: { title: "Notifications" } }}
                user={user}
                onMenuPress={() => setMenuVisible(true)}
                unreadCount={unreadCount}
              />
            )
          }}
        />
        <SuperAdminStack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: true }}
        />
      </SuperAdminStack.Navigator>

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        user={user}
        onLogout={logout}
        unreadCount={unreadCount}
      />
    </>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { user, isLoading, logout } = useAuth();
  const navigationRef = useRef<any>(null);

  React.useEffect(() => {
    if (navigationRef.current) {
      globalNavigationRef = navigationRef.current;
    }
  }, []);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: colors.background 
      }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        globalNavigationRef = navigationRef.current;
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          cardStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!user ? (
          // Auth Screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ 
                headerShown: false,
                animationTypeForReplace: user ? "push" : "pop"
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: "Reset Password" }}
            />
          </>
        ) : user.role === "SALES_AGENT" ? (
          // Sales Agent Flow
          <Stack.Screen
            name="SalesAgentMain"
            component={SalesAgentTabs}
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }}
          />
        ) : (
          // Super Admin & Supervisor Flow
          <Stack.Screen
            name="SuperAdminMain"
            component={SuperAdminNavigator}
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }}
          />
        )}

        {/* Common Modal Screens */}
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{ 
              title: "Add New Product",
              header: ({ navigation }) => (
                <View style={modalHeaderStyles.container}>
                  <TouchableOpacity 
                    style={modalHeaderStyles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={modalHeaderStyles.title}>Add New Product</Text>
                  <View style={modalHeaderStyles.rightButton} />
                </View>
              )
            }}
          />
          <Stack.Screen
            name="EditProduct"
            component={EditProductScreen}
            options={{ 
              title: "Edit Product",
              header: ({ navigation }) => (
                <View style={modalHeaderStyles.container}>
                  <TouchableOpacity 
                    style={modalHeaderStyles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={modalHeaderStyles.title}>Edit Product</Text>
                  <View style={modalHeaderStyles.rightButton} />
                </View>
              )
            }}
          />
          <Stack.Screen
            name="NewSale"
            component={NewSaleScreen}
            options={{ 
              title: "New Sale",
              header: ({ navigation }) => (
                <View style={modalHeaderStyles.container}>
                  <TouchableOpacity 
                    style={modalHeaderStyles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={modalHeaderStyles.title}>New Sale</Text>
                  <View style={modalHeaderStyles.rightButton} />
                </View>
              )
            }}
          />
          <Stack.Screen
            name="SaleDetail"
            component={SaleDetailScreen}
            options={{ 
              title: "Sale Details",
              header: ({ navigation }) => (
                <View style={modalHeaderStyles.container}>
                  <TouchableOpacity 
                    style={modalHeaderStyles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={modalHeaderStyles.title}>Sale Details</Text>
                  <View style={modalHeaderStyles.rightButton} />
                </View>
              )
            }}
          />
          <Stack.Screen
            name="InventoryCheck"
            component={InventoryCheckScreen}
            options={{ 
              title: "Inventory Check",
              header: ({ navigation }) => (
                <View style={modalHeaderStyles.container}>
                  <TouchableOpacity 
                    style={modalHeaderStyles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={modalHeaderStyles.title}>Inventory Check</Text>
                  <View style={modalHeaderStyles.rightButton} />
                </View>
              )
            }}
          />
          <Stack.Screen
            name="AddStaff"
            component={AddStaffScreen}
            options={{ 
              title: "Add New Staff",
              header: ({ navigation }) => (
                <View style={modalHeaderStyles.container}>
                  <TouchableOpacity 
                    style={modalHeaderStyles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={modalHeaderStyles.title}>Add New Staff</Text>
                  <View style={modalHeaderStyles.rightButton} />
                </View>
              )
            }}
          />
          <Stack.Screen
            name="EditStaff"
            component={EditStaffScreen}
            options={{ 
              title: "Edit Staff",
              header: ({ navigation }) => (
                <View style={modalHeaderStyles.container}>
                  <TouchableOpacity 
                    style={modalHeaderStyles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={modalHeaderStyles.title}>Edit Staff</Text>
                  <View style={modalHeaderStyles.rightButton} />
                </View>
              )
            }}
          />
          <Stack.Screen
            name="StaffSales"
            component={StaffSalesScreen}
            options={{ 
              title: "Staff Sales",
              header: ({ navigation }) => (
                <View style={modalHeaderStyles.container}>
                  <TouchableOpacity 
                    style={modalHeaderStyles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={modalHeaderStyles.title}>Staff Sales</Text>
                  <View style={modalHeaderStyles.rightButton} />
                </View>
              )
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sideMenuContainer: {
    flex: 1,
    width: 280,
  },
  sideMenuContent: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 40,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceDark,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
  },
  businessInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    padding: 10,
    borderRadius: 8,
  },
  businessName: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  menuItems: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceLight,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
    marginLeft: 15,
  },
});

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
});

const modalHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginRight: 40,
  },
  rightButton: {
    width: 40,
  },
});