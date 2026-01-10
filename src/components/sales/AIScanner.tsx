import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import AIScannerService from "../../services/aiScanner.service";
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

interface AIScannerProps {
  visible: boolean;
  onClose: () => void;
  onProductScanned: (product: any) => void;
  token: string;
}

export default function AIScanner({
  visible,
  onClose,
  onProductScanned,
  token,
}: AIScannerProps) {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [availableSizes, setAvailableSizes] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [step, setStep] = useState<"camera" | "result" | "manual">("camera");

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (visible) {
      resetScanner();
    }
  }, [visible]);

  const resetScanner = () => {
    setScannedImage(null);
    setRecognitionResult(null);
    setAvailableSizes([]);
    setSelectedSize("");
    setStep("camera");
    setIsScanning(false);
  };

  const handleTakePicture = async () => {
  if (!cameraRef.current) return;

  setIsScanning(true);
  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: false,
    });

    setScannedImage(photo.uri);

    // Call AI service
    const result = await AIScannerService.scanProduct(photo.uri, token);

    if (result.success && result.data.success) {
      const productData = result.data.primaryMatch || result.data;
      setRecognitionResult(productData);

      // Get sizes if product has sizes
      if (productData.hasSizes && productData.productId) {
        const sizes = await AIScannerService.getProductSizes(
          productData.productId,
          token
        );
        setAvailableSizes(sizes);
        if (sizes.length > 0) {
          setSelectedSize(sizes[0].value);
        }
      }

      setStep("result");
      
      // Show appropriate message based on match
      if (result.data.primaryMatch) {
        Alert.alert(
          "Product Found! 🎯",
          `Successfully matched with: ${result.data.primaryMatch.name}\n\n` +
          `Category: ${result.data.primaryMatch.category}\n` +
          `Price: ₦${result.data.primaryMatch.sellingPrice?.toLocaleString()}\n` +
          `Stock: ${result.data.primaryMatch.currentStock} ${result.data.primaryMatch.unit}\n\n` +
          `Confidence: ${Math.round((result.data.confidence || 0) * 100)}%`,
          [{ text: "Add to Cart" }]
        );
      } else if (result.data.alternatives && result.data.alternatives.length > 0) {
        // Show alternatives for user to choose from
        Alert.alert(
          "Multiple Matches Found",
          "Select a product:",
          result.data.alternatives.map((alt: { name: any; confidence: number; productId: string; }) => ({
            text: `${alt.name} (${Math.round(alt.confidence * 100)}%)`,
            onPress: () => {
              // Fetch the selected product details
              handleSelectAlternative(alt.productId);
            }
          })).concat([
            { 
              text: "Cancel", 
              style: "cancel" 
            }
          ])
        );
      } else {
        Alert.alert(
          "Product Recognized",
          `The AI recognized: ${result.data.searchTerms
            ?.slice(0, 3)
            .join(", ")}\n\n` +
            `Confidence: ${Math.round(
              (result.data.confidence || 0) * 100
            )}%\n` +
            `No exact match found in inventory.`,
          [{ text: "OK" }]
        );
      }
    } else {
      Alert.alert(
        "Scan Failed",
        result.data?.message ||
          "Could not recognize product. Try manual selection.",
        [
          { text: "Try Again", onPress: resetScanner },
          { text: "Manual Select", onPress: () => setStep("manual") },
        ]
      );
    }
  } catch (error: any) {
    Alert.alert("Error", error.message || "Failed to scan");
  } finally {
    setIsScanning(false);
  }
};

// Add this new function to handle alternative selection
const handleSelectAlternative = async (productId: string) => {
  try {
    // Fetch product details for the selected alternative
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.success) {
      const product = response.data.data;
      setRecognitionResult({
        ...product,
        productId: product.id,
        confidence: 0.8, // Default confidence for manual selection
      });
      
      // Get sizes if needed
      if (product.hasSizes) {
        const sizes = await AIScannerService.getProductSizes(product.id, token);
        setAvailableSizes(sizes);
        if (sizes.length > 0) {
          setSelectedSize(sizes[0].value);
        }
      }
      
      Alert.alert(
        "Product Selected",
        `${product.name} selected for adding to cart`,
        [{ text: "OK" }]
      );
    }
  } catch (error) {
    Alert.alert("Error", "Failed to fetch product details");
  }
};

  const handleManualSearch = async (query: string) => {
    try {
      const results = await AIScannerService.searchProducts(query, token);

      if (results.length > 0) {
        // For simplicity, take first result
        const product = results[0];
        setRecognitionResult(product);

        if (product.hasSizes) {
          const sizes = await AIScannerService.getProductSizes(
            product.productId,
            token
          );
          setAvailableSizes(sizes);
          if (sizes.length > 0) {
            setSelectedSize(sizes[0].value);
          }
        }

        setStep("result");
      } else {
        Alert.alert("No Results", "No products found matching your search.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to search products");
    }
  };

  const handleConfirm = () => {
    if (recognitionResult) {
      onProductScanned({
        ...recognitionResult,
        size: selectedSize || undefined,
      });
      resetScanner();
      onClose();
    }
  };

  const handleRetry = () => {
    resetScanner();
  };

  const handleManualSelect = (product: any) => {
    setRecognitionResult(product);
    setStep("result");
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View
          style={[
            styles.permissionContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Ionicons
            name="camera-outline"
            size={64}
            color={theme.colors.primary}
          />
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
            Camera Permission
          </Text>
          <Text
            style={[
              styles.permissionText,
              { color: theme.colors.textSecondary },
            ]}
          >
            We need camera access to scan products
          </Text>
          <TouchableOpacity
            style={[
              styles.permissionButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={requestPermission}
          >
            <Text
              style={[
                styles.permissionButtonText,
                { color: theme.colors.white },
              ]}
            >
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.closeButton, { borderColor: theme.colors.border }]}
            onPress={onClose}
          >
            <Text
              style={[styles.closeButtonText, { color: theme.colors.text }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {step === "camera"
              ? "Scan Product"
              : step === "result"
              ? "Product Details"
              : "Manual Select"}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {step === "camera" && (
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
              <View style={styles.cameraOverlay}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <Text style={[styles.scanHint, { color: theme.colors.white }]}>
                  Align product within frame
                </Text>
              </View>
            </CameraView>

            <View style={styles.controls}>
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleTakePicture}
                disabled={isScanning}
              >
                {isScanning ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Ionicons
                    name="camera"
                    size={32}
                    color={theme.colors.white}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.manualButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => setStep("manual")}
              >
                <Ionicons name="search" size={20} color={theme.colors.text} />
                <Text
                  style={[
                    styles.manualButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  Manual Search
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "result" && recognitionResult && (
          <ScrollView contentContainerStyle={styles.resultContainer}>
            {scannedImage && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: scannedImage }} style={styles.image} />
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Ionicons
                    name="refresh"
                    size={20}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View
              style={[
                styles.resultCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.resultHeader}>
                <Text
                  style={[styles.productName, { color: theme.colors.text }]}
                >
                  {recognitionResult.name}
                </Text>
                <View
                  style={[
                    styles.confidenceBadge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.confidenceText,
                      { color: theme.colors.white },
                    ]}
                  >
                    {Math.round((recognitionResult.confidence || 0) * 100)}%
                    match
                  </Text>
                </View>
              </View>

              <View style={styles.productDetails}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  SKU: {recognitionResult.sku || "N/A"}
                </Text>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Category: {recognitionResult.category}
                </Text>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Stock: {recognitionResult.currentStock}{" "}
                  {recognitionResult.unit}
                </Text>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Price: ₦{recognitionResult.sellingPrice?.toLocaleString()}
                </Text>
              </View>

              {availableSizes.length > 0 && (
                <View style={styles.sizeSection}>
                  <Text
                    style={[styles.sizeLabel, { color: theme.colors.text }]}
                  >
                    Select Size:
                  </Text>
                  <View style={styles.sizeOptions}>
                    {availableSizes.map((size) => (
                      <TouchableOpacity
                        key={size.value}
                        style={[
                          styles.sizeButton,
                          {
                            backgroundColor:
                              selectedSize === size.value
                                ? theme.colors.primary
                                : theme.colors.surfaceLight,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        onPress={() => setSelectedSize(size.value)}
                      >
                        <Text
                          style={[
                            styles.sizeButtonText,
                            {
                              color:
                                selectedSize === size.value
                                  ? theme.colors.white
                                  : theme.colors.text,
                            },
                          ]}
                        >
                          {size.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleConfirm}
              >
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color={theme.colors.white}
                />
                <Text
                  style={[
                    styles.confirmButtonText,
                    { color: theme.colors.white },
                  ]}
                >
                  Add to Cart
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.backButton, { borderColor: theme.colors.border }]}
              onPress={handleRetry}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
              <Text
                style={[styles.backButtonText, { color: theme.colors.text }]}
              >
                Scan Another
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === "manual" && (
          <View style={styles.manualContainer}>
            <TouchableOpacity
              style={[
                styles.backButton,
                { borderColor: theme.colors.border, margin: 20 },
              ]}
              onPress={() => setStep("camera")}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
              <Text
                style={[styles.backButtonText, { color: theme.colors.text }]}
              >
                Back to Camera
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.manualSearch,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text style={[styles.manualTitle, { color: theme.colors.text }]}>
                Search Products
              </Text>
              <Text
                style={[
                  styles.manualText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Enter product name, SKU, or category
              </Text>

              {/* In a real app, you'd add a TextInput here for search */}
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => {
                  // For demo, use a mock product
                  const mockProduct = AIScannerService.getMockProduct();
                  handleManualSelect(mockProduct);
                }}
              >
                <Text
                  style={[
                    styles.searchButtonText,
                    { color: theme.colors.white },
                  ]}
                >
                  Use Mock Product (Demo)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    backgroundColor: "transparent",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#fff",
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanHint: {
    marginTop: 30,
    fontSize: 16,
    fontWeight: "500",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 15,
  },
  scanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  manualButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  imagePreview: {
    position: "relative",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  retryButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  productDetails: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  sizeSection: {
    marginBottom: 20,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  sizeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  manualContainer: {
    flex: 1,
  },
  manualSearch: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  manualText: {
    fontSize: 14,
    marginBottom: 20,
  },
  searchButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
