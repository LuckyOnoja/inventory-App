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
      style={[
        styles.productItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: item.hasStock
            ? theme.colors.success + "30"
            : theme.colors.error + "30",
          borderWidth: 1,
        },
      ]}
      onPress={() => onProductSelected(item)}
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
      <View style={styles.confidenceContainer}>
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
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
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
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: theme.colors.border },
              ]}
              onPress={onClose}
            >
              <Text
                style={[styles.cancelButtonText, { color: theme.colors.text }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 12,
  },
  productStock: {
    fontSize: 12,
    fontWeight: "500",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    // React Native StyleSheet doesn't support the CSS `gap` property on Views.
    // Use spacing on child elements instead.
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
  confidenceContainer: {
    height: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  confidenceText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
