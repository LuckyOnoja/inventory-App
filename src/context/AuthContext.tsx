import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import axios from "axios";
import config from "../config";

const API_URL = config.API_URL;

// Set global API Key
if (config.API_KEY) {
  axios.defaults.headers.common['x-auth-key'] = config.API_KEY;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "SALES_AGENT" | "SUPERVISOR";
  business?: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
  avatar: string | null;
  status: "ACTIVE" | "INACTIVE";
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessName: string;
  businessType: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Set default axios header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Failed to load stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      // FIX: Access the nested data property
      const { user: userData, token: authToken } = response.data.data;

      // Store token and user
      await AsyncStorage.setItem("token", authToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      setUser(userData);
      setToken(authToken);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error || "Login failed. Please try again.";
      throw new Error(errorMessage);
    }
  };
  const register = async (data: RegisterData) => {
    try {
      console.log("📤 Sending registration request:", data);
      const response = await axios.post(`${API_URL}/auth/register`, data);
      console.log("✅ Registration response:", response.data.data);

      // FIX: Access the nested data property
      const { user: userData, token: authToken } = response.data.data;

      // Store token and user
      await AsyncStorage.setItem("token", authToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      setUser(userData);
      setToken(authToken);
    } catch (error: any) {
      console.error("❌ Registration error details:", {
        message: error.message,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      // Try multiple error message locations
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      // Remove axios header
      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
