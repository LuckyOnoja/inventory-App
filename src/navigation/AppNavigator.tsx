import React, { useState, useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import axios from "axios";
import config from "../config";
import { GlassTabBarBackground, GlassHeaderBackground } from "../components/ui/GlassNavigation";
import { GlassView } from "../components/ui/GlassView";

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
  const { theme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
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

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={iconName as any} size={24} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarBackground: () => <GlassTabBarBackground />,
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          borderTopWidth: 0,
          bottom: 30,
          marginHorizontal: 20,
          borderRadius: 35,
          height: 70,
          // Floating Shadow
          shadowColor: theme.mode === 'dark' ? '#000' : '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 8,
          marginTop: -4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          borderRadius: 35,
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerBackground: () => <GlassHeaderBackground />,
        headerStyle: {
          backgroundColor: 'transparent',
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme.colors.text,
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
            backgroundColor: theme.colors.error,
            fontSize: 10,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            fontWeight: 'bold',
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
  const { theme } = useTheme();

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
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <GlassView
          intensity={95}
          style={[styles.sideMenuContainer, { borderRadius: 0, borderRightWidth: 1, borderRightColor: theme.colors.border }]}
        >
          <View style={[styles.sideMenuContent, { paddingTop: Platform.OS === 'ios' ? 50 : 20 }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* User Profile Section */}
              <View style={[styles.profileSection, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.white }]}>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
                      {user?.name || "User"}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {user?.email || "email@example.com"}
                    </Text>
                    <View
                      style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '20' }]}
                    >
                      <Text style={[styles.roleText, { color: theme.colors.primary }]}>
                        {user?.role?.replace("_", " ") || "User"}
                      </Text>
                    </View>
                  </View>
                </View>
                {user?.business && (
                  <View style={[styles.businessInfo, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1}>
                      {user.business.name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Menu Items */}
              <View style={styles.menuItems}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={[styles.menuItem, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}
                    onPress={() => navigateTo(item.screen)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                      {item.name}
                    </Text>
                    {item.badge && item.badge > 0 && (
                      <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                        <Text style={[styles.badgeText, { color: theme.colors.white }]}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={[styles.logoutButton, {
                  borderTopColor: theme.colors.border,
                  backgroundColor: theme.colors.error + '10',
                  marginHorizontal: 20,
                  borderRadius: 12,
                }]}
                onPress={handleLogout}
              >
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color={theme.colors.error}
                />
                <Text style={[styles.logoutText, { color: theme.colors.error }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </GlassView>
      </View>
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
  const { theme } = useTheme();

  const navigateToNotifications = () => {
    if (globalNavigationRef) {
      globalNavigationRef.navigate("Notifications");
    }
  };

  return (
    <View style={[headerStyles.container, {
      backgroundColor: 'transparent',
      borderBottomColor: theme.colors.border,
    }]}>
      {/* Absolute background element */}
      <View style={StyleSheet.absoluteFill}>
        <GlassHeaderBackground />
      </View>

      <TouchableOpacity onPress={onMenuPress} style={headerStyles.menuButton}>
        <Ionicons name="menu" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={headerStyles.titleContainer}>
        <Text style={[headerStyles.title, { color: theme.colors.text }]}>
          {route?.params?.title || route?.name || "Dashboard"}
        </Text>
        <Text style={[headerStyles.subtitle, { color: theme.colors.textSecondary }]}>
          {user?.business?.name || "Business"}
        </Text>
      </View>
      <TouchableOpacity
        style={headerStyles.notificationButton}
        onPress={navigateToNotifications}
      >
        <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
        {unreadCount > 0 && (
          <View style={[headerStyles.notificationBadge, { backgroundColor: theme.colors.error }]}>
            <Text style={[headerStyles.notificationBadgeText, { color: theme.colors.white }]}>
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
          headerBackground: () => <GlassHeaderBackground />,
          headerStyle: { backgroundColor: 'transparent' },
          cardStyle: { backgroundColor: 'transparent' }, // Allow ScreenWrapper bg to show
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
  const { theme } = useTheme();
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
        backgroundColor: theme.colors.background
      }}>
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>Loading...</Text>
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
          headerBackground: () => <GlassHeaderBackground />,
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          cardStyle: {
            backgroundColor: theme.colors.background,
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
              header: ({ navigation }) => {
                const { theme } = useTheme();
                return (
                  <View style={modalHeaderStyles.container}>
                    <View style={StyleSheet.absoluteFill}>
                      <GlassHeaderBackground />
                    </View>
                    <TouchableOpacity
                      style={modalHeaderStyles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[modalHeaderStyles.title, { color: theme.colors.text }]}>
                      Add New Product
                    </Text>
                    <View style={modalHeaderStyles.rightButton} />
                  </View>
                );
              }
            }}
          />
          <Stack.Screen
            name="EditProduct"
            component={EditProductScreen}
            options={{
              title: "Edit Product",
              header: ({ navigation }) => {
                const { theme } = useTheme();
                return (
                  <View style={modalHeaderStyles.container}>
                    <View style={StyleSheet.absoluteFill}>
                      <GlassHeaderBackground />
                    </View>
                    <TouchableOpacity
                      style={modalHeaderStyles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[modalHeaderStyles.title, { color: theme.colors.text }]}>
                      Edit Product
                    </Text>
                    <View style={modalHeaderStyles.rightButton} />
                  </View>
                );
              }
            }}
          />
          <Stack.Screen
            name="NewSale"
            component={NewSaleScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SaleDetail"
            component={SaleDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="InventoryCheck"
            component={InventoryCheckScreen}
            options={{
              title: "Inventory Check",
              header: ({ navigation }) => {
                const { theme } = useTheme();
                return (
                  <View style={modalHeaderStyles.container}>
                    <View style={StyleSheet.absoluteFill}>
                      <GlassHeaderBackground />
                    </View>
                    <TouchableOpacity
                      style={modalHeaderStyles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[modalHeaderStyles.title, { color: theme.colors.text }]}>
                      Inventory Check
                    </Text>
                    <View style={modalHeaderStyles.rightButton} />
                  </View>
                );
              }
            }}
          />
          <Stack.Screen
            name="AddStaff"
            component={AddStaffScreen}
            options={{
              title: "Add New Staff",
              header: ({ navigation }) => {
                const { theme } = useTheme();
                return (
                  <View style={modalHeaderStyles.container}>
                    <View style={StyleSheet.absoluteFill}>
                      <GlassHeaderBackground />
                    </View>
                    <TouchableOpacity
                      style={modalHeaderStyles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[modalHeaderStyles.title, { color: theme.colors.text }]}>
                      Add New Staff
                    </Text>
                    <View style={modalHeaderStyles.rightButton} />
                  </View>
                );
              }
            }}
          />
          <Stack.Screen
            name="EditStaff"
            component={EditStaffScreen}
            options={{
              title: "Edit Staff",
              header: ({ navigation }) => {
                const { theme } = useTheme();
                return (
                  <View style={modalHeaderStyles.container}>
                    <View style={StyleSheet.absoluteFill}>
                      <GlassHeaderBackground />
                    </View>
                    <TouchableOpacity
                      style={modalHeaderStyles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[modalHeaderStyles.title, { color: theme.colors.text }]}>
                      Edit Staff
                    </Text>
                    <View style={modalHeaderStyles.rightButton} />
                  </View>
                );
              }
            }}
          />
          <Stack.Screen
            name="StaffSales"
            component={StaffSalesScreen}
            options={{
              title: "Staff Sales",
              header: ({ navigation }) => {
                const { theme } = useTheme();
                return (
                  <View style={modalHeaderStyles.container}>
                    <View style={StyleSheet.absoluteFill}>
                      <GlassHeaderBackground />
                    </View>
                    <TouchableOpacity
                      style={modalHeaderStyles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[modalHeaderStyles.title, { color: theme.colors.text }]}>
                      Staff Sales
                    </Text>
                    <View style={modalHeaderStyles.rightButton} />
                  </View>
                );
              }
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
    overflow: 'hidden',
  },
  sideMenuContent: {
    flex: 1,
    paddingTop: 40,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  businessInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  businessName: {
    fontSize: 12,
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
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    marginTop: 10,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 15,
  },
});

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
    borderRadius: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    borderRadius: 6,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
  },
});

const modalHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginRight: 40,
    letterSpacing: 0.5,
  },
  rightButton: {
    width: 40,
  },
});