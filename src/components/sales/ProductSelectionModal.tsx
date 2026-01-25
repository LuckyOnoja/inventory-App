import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { GlassView } from "../../components/ui/GlassView";
import { GlassButton } from "../../components/ui/GlassButton";

export interface ProductAlternative {
  productId: string;
  name: string;
  confidence?: number;
  category?: string;
  sellingPrice?: number;
  currentStock?: number;
  unit?: string;
  hasStock?: boolean;
  matchScore?: number;
}

interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  alternatives: ProductAlternative[];
  searchTerms: string[];
  onProductSelected: (product: ProductAlternative) => void;
  message?: string;
}

export default function ProductSelectionModal({
  visible,
  onClose,
  alternatives,
  searchTerms,
  onProductSelected,
  message = "Multiple matches found. Please select one:",
}: ProductSelectionModalProps) {
  const { theme } = useTheme();

  console.log("🎨 ProductSelectionModal rendering");
  console.log("🎨 Visible:", visible);
  console.log("🎨 Alternatives count:", alternatives?.length);
  console.log("🎨 Alternatives data:", JSON.stringify(alternatives, null, 2));
  console.log("🎨 Search terms:", searchTerms);

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("laptop") || cat.includes("computer") || cat.includes("pc")) return "laptop-outline";
    if (cat.includes("phone") || cat.includes("mobile") || cat.includes("android") || cat.includes("iphone")) return "phone-portrait-outline";
    if (cat.includes("tablet") || cat.includes("ipad")) return "tablet-portrait-outline";
    if (cat.includes("watch") || cat.includes("wearable")) return "watch-outline";
    if (cat.includes("tv") || cat.includes("vision") || cat.includes("monitor")) return "tv-outline";
    if (cat.includes("camera")) return "camera-outline";
    if (cat.includes("headphone") || cat.includes("audio")) return "headset-outline";
    if (cat.includes("game") || cat.includes("console")) return "game-controller-outline";
    if (cat.includes("print")) return "print-outline";
    if (cat.includes("wifi") || cat.includes("network")) return "wifi-outline";
    return "cube-outline";
  };

  const renderProductItem = ({ item }: { item: ProductAlternative }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onProductSelected(item)}
      style={{ marginBottom: 0 }}
    >
      <GlassView
        intensity={20}
        style={[
          styles.productItem,
          {
            borderColor: item.matchScore && item.matchScore > 20
              ? theme.colors.primary
              : (item.hasStock ? theme.colors.border : theme.colors.error + "50"),
            borderWidth: item.matchScore && item.matchScore > 20 ? 2 : 1,
            backgroundColor: item.matchScore && item.matchScore > 20
              ? theme.colors.primary + "10"
              : undefined
          }
        ]}
      >
        {/* AI RECOMMENDED Badge for Primary Match */}
        {(item as any).isPrimary && (
          <View style={[styles.recommendedBadge, { backgroundColor: theme.colors.success }]}>
            <Ionicons name="sparkles" size={12} color="white" />
            <Text style={styles.recommendedText}>AI RECOMMENDED</Text>
          </View>
        )}

        {/* Visual "Image" Placeholder */}
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surface }]}>
          <Ionicons
            name={getCategoryIcon(item.category || "")}
            size={48}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text
              style={[styles.productName, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </View>

          {/* Key Details Row */}
          <View style={styles.keyDetailsRow}>
            {item.sellingPrice && (
              <Text style={[styles.priceLarge, { color: theme.colors.primary }]}>
                ₦{item.sellingPrice.toLocaleString()}
              </Text>
            )}

            {item.matchScore && (
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: theme.colors.success + "20" },
                ]}
              >
                <Text style={[styles.scoreText, { color: theme.colors.success }]}>
                  {Math.round(item.matchScore)} pts
                </Text>
              </View>
            )}
          </View>

          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Category:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]} numberOfLines={1}>
                {item.category || "Uncategorized"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Stock:
              </Text>
              <View style={styles.stockContainer}>
                <Ionicons
                  name={item.hasStock ? "checkmark-circle" : "alert-circle"}
                  size={14}
                  color={item.hasStock ? theme.colors.success : theme.colors.error}
                />
                <Text
                  style={[
                    styles.stockText,
                    { color: item.hasStock ? theme.colors.success : theme.colors.error },
                  ]}
                >
                  {item.currentStock || 0} {item.unit || "units"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Confidence Bar */}
        <View style={styles.confidenceContainerWrapper}>
          <View style={styles.confidenceLabels}>
            <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
              {Math.round((item.confidence || 0) * 100)}% Match
            </Text>
          </View>
          <View
            style={[
              styles.confidenceBarBackground,
              { backgroundColor: theme.colors.surfaceLight },
            ]}
          >
            <View
              style={[
                styles.confidenceBar,
                {
                  backgroundColor: (item.confidence || 0) > 0.8 ? theme.colors.success : theme.colors.primary,
                  width: `${Math.min((item.confidence || 0) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      </GlassView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Dark Background */}
      <View style={styles.backdrop} />

      {/* Content */}
      <View style={styles.modalContainerWrapper}>
        <GlassView
          intensity={40}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Select Product
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.success}
            />
            <View style={styles.messageContent}>
              <Text style={[styles.message, { color: theme.colors.text }]}>
                {message}
              </Text>
              <Text
                style={[
                  styles.searchTerms,
                  { color: theme.colors.textSecondary },
                ]}
              >
                AI detected: {searchTerms.slice(0, 3).join(", ")}
              </Text>
              <Text
                style={[
                  styles.tapInstruction,
                  { color: theme.colors.primary },
                ]}
              >
                👆 Tap a card to add to cart
              </Text>
            </View>
          </View>

          {/* Products List */}
          <View style={styles.listWrapper}>
            <FlatList
              data={alternatives}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.productId}
              contentContainerStyle={styles.listContainer}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={280} // card width + margin
            />
          </View>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <GlassButton
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              size="medium"
            />
          </View>
        </GlassView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    width: '100%',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)", // Very dark background
  },
  modalContainerWrapper: {
    width: '100%',
    paddingBottom: 40,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 24,
    overflow: 'hidden'
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  searchTerms: {
    fontSize: 12,
    fontStyle: "italic",
  },
  tapInstruction: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  listWrapper: {
    height: 340, // More height for larger cards
  },
  productItem: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
    width: 260,
    height: 320,
    marginRight: 15,
    justifyContent: 'space-between',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
    marginBottom: 8,
  },
  productHeader: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  keyDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLarge: {
    fontSize: 20,
    fontWeight: '800',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  productDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  confidenceContainerWrapper: {
    marginTop: 8,
  },
  confidenceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  confidenceLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  confidencePercent: {
    fontSize: 11,
    fontWeight: "bold",
  },
  confidenceBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  confidenceBar: {
    height: "100%",
    borderRadius: 3,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  recommendedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
