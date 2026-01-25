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
import { GlassView } from "../../components/ui/GlassView";
import { GlassButton } from "../../components/ui/GlassButton";
import AIScannerService from "../../services/aiScanner.service";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;

interface Product {
  productId: string;
  name: string;
  sku?: string;
  category: string;
  sellingPrice: number;
  currentStock: number;
  unit: string;
  confidence?: number;
  hasSizes?: boolean;
  id?: string;
  searchTerms?: string[];
  size?: string;
  matchScore?: number;
  isPrimary?: boolean;
}

interface SizeOption {
  value: string;
  label: string;
}

interface AIScannerProps {
  visible: boolean;
  onClose: () => void;
  onProductScanned: (product: Product) => void;
  token: string;
}

type ScanStep = "camera" | "result" | "selection" | "manual";

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
  const [recognitionResult, setRecognitionResult] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [availableSizes, setAvailableSizes] = useState<SizeOption[]>([]);
  const [step, setStep] = useState<ScanStep>("camera");
  const [productAlternatives, setProductAlternatives] = useState<Product[]>([]);
  const [recognitionSearchTerms, setRecognitionSearchTerms] = useState<string[]>([]);

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

  const handleManualSelect = (product: Product) => {
    setRecognitionResult(product);
    setStep("result");
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    setIsScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo) {
        setIsScanning(false);
        return;
      }

      setScannedImage(photo.uri);

      // Call AI service
      const result = await AIScannerService.scanProduct(photo.uri, token);
      console.log("📱 Scan response:", JSON.stringify(result, null, 2));

      if (result.success) {
        // Store search terms
        if (result.data.searchTerms) {
          setRecognitionSearchTerms(result.data.searchTerms);
        }

        // FIRST: Check if AI recognition was successful
        if (!result.data.success) {
          console.log("❌ AI recognition failed");
          Alert.alert(
            "Scan Failed",
            result.data.message || "Could not recognize product.",
            [
              { text: "Try Again", onPress: resetScanner },
              { text: "Manual Search", onPress: () => setStep("manual") },
            ]
          );
          setIsScanning(false);
          return;
        }

        // SECOND: Check if we have a primary match
        const hasPrimaryMatch =
          result.data.primaryMatch && result.data.primaryMatch.productId;

        console.log("🔍 Match status:", { hasPrimaryMatch });
        console.log("📦 Primary match:", result.data.primaryMatch);

        if (!hasPrimaryMatch) {
          // No match found at all
          console.log("❌ No matches found");
          Alert.alert(
            "Product Not in Inventory",
            `The AI recognized this as: ${result.data.searchTerms
              ?.slice(0, 3)
              .join(", ")}\n\n` +
            "This product is not currently in your inventory.",
            [
              {
                text: "Try Again",
                onPress: resetScanner,
              },
              {
                text: "Manual Search",
                onPress: () => setStep("manual"),
              },
            ]
          );
          setIsScanning(false);
          return;
        }

        // INSTANT ADD TO CART - No selection modal!
        console.log("✅ Primary match found, adding directly to cart...");

        try {
          // Fetch full product details
          const response = await axios.get(
            `${API_URL}/products/${result.data.primaryMatch.productId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data.success) {
            const fullProduct = response.data.data;
            console.log("✅ Full product details fetched:", fullProduct);

            // Create product data for cart
            const productData: Product = {
              ...result.data.primaryMatch,
              ...fullProduct,
              productId: fullProduct.id,
              confidence: result.data.confidence,
            };

            // Check if product has sizes
            if (fullProduct.hasSizes && fullProduct.sizeOptions?.length > 0) {
              console.log("📏 Product has sizes, showing result screen for size selection");
              // If product has sizes, show the result screen for size selection
              setRecognitionResult(productData);
              setStep("result");

              const sizes = await AIScannerService.getProductSizes(
                fullProduct.id,
                token
              );
              setAvailableSizes(sizes);
              if (sizes.length > 0) {
                setSelectedSize(sizes[0].value);
              }
            } else {
              // No sizes - directly add to cart and close scanner
              console.log("✅ No sizes needed, adding directly to cart");
              console.log("🚪 Closing scanner and returning to sale screen...");

              // Add to cart
              onProductScanned(productData);

              // Close the scanner immediately
              onClose();

              // Show brief success toast
              Alert.alert(
                "✅ Added to Cart",
                `${fullProduct.name} - ₦${fullProduct.sellingPrice?.toLocaleString()}`,
                [{ text: "OK" }],
                { cancelable: true }
              );
            }
          }
        } catch (error) {
          console.error("❌ Error fetching product details:", error);
          Alert.alert("Error", "Failed to add product to cart");
          setIsScanning(false);
        }
      } else {
        Alert.alert(
          "Scan Failed",
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

  if (!permission) {
    return (
      <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen" transparent={true}>
        <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 20, color: theme.colors.textSecondary }}>Initializing camera...</Text>
          <TouchableOpacity
            style={{ marginTop: 40, padding: 10 }}
            onPress={() => {
              // Allow closing if it hangs
              onClose();
            }}
          >
            <Text style={{ color: theme.colors.error }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
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
        style={[styles.container, { backgroundColor: "black" }]}
      >
        {/* BACKGROUND: Camera View (Visible in 'camera' and 'selection' modes) */}
        {(step === "camera" || step === "selection") && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          </View>
        )}

        {/* FOREGROUND: Interfaces */}
        <View style={[styles.contentContainer, { zIndex: 1 }]}>

          {/* Header - Always visible on top */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={[styles.title, { color: "white" }]}>
              {step === "camera"
                ? "Scan Product"
                : step === "result"
                  ? "Product Details"
                  : step === "selection"
                    ? "Select Product"
                    : "Manual Select"}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Camera Controls & Overlay - Only in 'camera' mode */}
          {step === "camera" && (
            <View style={styles.cameraInterface}>
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

          {/* Result View - Opaque background */}
          {step === "result" && recognitionResult && (
            <View style={[styles.opaqueContainer, { backgroundColor: theme.colors.background }]}>
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

                <GlassView intensity={20} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text
                      style={[styles.productName, { color: theme.colors.text }]}
                    >
                      {recognitionResult.name}
                    </Text>
                    <View
                      style={[
                        styles.confidenceBadge,
                        { backgroundColor: theme.colors.primary + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.confidenceText,
                          { color: theme.colors.primary },
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
                            onPress={() => setSelectedSize(size.value)}
                            style={{ minWidth: '30%' }}
                          >
                            <GlassView
                              intensity={selectedSize === size.value ? 40 : 10}
                              style={[
                                styles.sizeButton,
                                selectedSize === size.value && { borderColor: theme.colors.primary }
                              ]}
                            >
                              <Text
                                style={[
                                  styles.sizeButtonText,
                                  {
                                    color:
                                      selectedSize === size.value
                                        ? theme.colors.primary
                                        : theme.colors.text,
                                  },
                                ]}
                              >
                                {size.label}
                              </Text>
                            </GlassView>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <GlassButton
                    title="Add to Cart"
                    onPress={handleConfirm}
                    icon="cart-outline"
                    variant="primary"
                    style={styles.confirmButton}
                  />
                </GlassView>

                <GlassButton
                  title="Scan Another"
                  onPress={handleRetry}
                  icon="arrow-back"
                  variant="secondary"
                  style={styles.backButton}
                />
              </ScrollView>
            </View>
          )}

          {/* Manual Search - Opaque background */}
          {step === "manual" && (
            <View style={[styles.opaqueContainer, { backgroundColor: theme.colors.background }]}>
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

                <GlassView intensity={20} style={styles.manualSearch}>
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
                  <GlassButton
                    title="Use Mock Product (Demo)"
                    onPress={() => {
                      // For demo, use a mock product
                      const mockProduct = AIScannerService.getMockProduct();
                      handleManualSelect(mockProduct);
                    }}
                    variant="primary"
                    style={styles.searchButton}
                  />
                </GlassView>
              </View>
            </View>
          )}

        </View>
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
    overflow: 'hidden',
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
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    width: '100%',
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
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
  contentContainer: {
    flex: 1,
  },
  cameraInterface: {
    flex: 1,
  },
  opaqueContainer: {
    flex: 1,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
  }
});