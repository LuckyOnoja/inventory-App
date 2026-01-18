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

interface ProductAlternative {
  productId: string;
  name: string;
  confidence: number;
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

  const renderProductItem = ({ item }: { item: ProductAlternative }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onProductSelected(item)}
      style={{ marginBottom: 10 }}
    >
      <GlassView
        intensity={15}
        style={[
          styles.productItem,
          {
            borderColor: item.hasStock ? theme.colors.success + "50" : theme.colors.error + "50",
            borderWidth: 1,
          }
        ]}
      >
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={[styles.productName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            {item.matchScore && (
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Text style={[styles.scoreText, { color: theme.colors.primary }]}>
                  {Math.round(item.matchScore)} pts
                </Text>
              </View>
            )}
          </View>

          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Category:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {item.category || "Uncategorized"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Stock:
              </Text>
              <View style={styles.stockContainer}>
                <Ionicons
                  name={item.hasStock ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={
                    item.hasStock ? theme.colors.success : theme.colors.error
                  }
                />
                <Text
                  style={[
                    styles.stockText,
                    {
                      color: item.hasStock
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                >
                  {item.currentStock || 0} {item.unit || "units"}
                </Text>
              </View>
            </View>

            {item.sellingPrice && (
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Price:
                </Text>
                <Text style={[styles.priceText, { color: theme.colors.primary }]}>
                  ₦{item.sellingPrice.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Confidence Bar */}
        <View style={styles.confidenceContainerWrapper}>
          <View style={styles.confidenceLabels}>
            <Text
              style={[
                styles.confidenceLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Match Confidence:
            </Text>
            <Text
              style={[styles.confidencePercent, { color: theme.colors.primary }]}
            >
              {Math.round(item.confidence * 100)}%
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
                  backgroundColor: theme.colors.primary,
                  width: `${Math.min(item.confidence * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      </GlassView>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.7)" }]}>
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
              name="search-outline"
              size={24}
              color={theme.colors.primary}
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
            </View>
          </View>

          {/* Products List */}
          <FlatList
            data={alternatives}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

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
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  productItem: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productInfo: {
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
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
});
