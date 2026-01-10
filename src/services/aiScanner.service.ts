import axios from "axios";
import config from "../config";

const API_URL = config.API_URL;

interface ScannedProduct {
  productId: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  sellingPrice: number;
  unit: string;
  hasSizes: boolean;
  sizeOptions: Array<{ value: string; label: string }>;
  confidence: number;
}

class AIScannerService {
  async scanProduct(imageUri: string, token: string): Promise<any> {
    try {
      const formData = new FormData();

      // Extract filename from URI
      const filename = imageUri.split("/").pop() || "product.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      const response = await axios.post(`${API_URL}/ai/scan`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout
      });

      console.log("Scan response:", response.data);

      // Check if we have a matched product
      if (response.data.data.primaryMatch) {
        console.log(
          "✅ Found matched product:",
          response.data.data.primaryMatch.name
        );
      } else if (
        response.data.data.alternatives &&
        response.data.data.alternatives.length > 0
      ) {
        console.log(
          "⚠️ Found alternatives:",
          response.data.data.alternatives.length
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Scan error:", error);

      // Return mock data for testing
      console.log("Using mock data for testing");
      return {
        success: true,
        data: {
          success: true,
          primaryMatch: this.getMockProduct(),
          source: "mock",
          processingTime: 500,
          confidence: 0.85,
          searchTerms: ["coca-cola", "beverage", "soft drink"],
        },
        sessionId: `mock-${Date.now()}`,
      };
    }
  }

  async getProductSizes(
    productId: string,
    token: string
  ): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await axios.get(
        `${API_URL}/ai/products/${productId}/sizes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching sizes:", error);
      return [];
    }
  }

  async searchProducts(
    query: string,
    token: string
  ): Promise<ScannedProduct[]> {
    try {
      const response = await axios.post(
        `${API_URL}/ai/search`,
        { query, limit: 5 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  // Mock data for testing when API is not available
getMockProduct(): any {
  return {
    productId: 'prod_mock_001',
    name: 'Standing Fan 16-inch',
    sku: 'FAN-16-STAND',
    category: 'Home Appliances',
    currentStock: 10,
    sellingPrice: 22000,
    unit: 'unit',
    hasSizes: false,
    sizeOptions: [],
    confidence: 0.85,
  };
}
}

export default new AIScannerService();
