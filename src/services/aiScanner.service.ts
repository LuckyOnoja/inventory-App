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
        timeout: 30000,
      });

      console.log("Scan response:", response.data);

      // If we have alternatives, we might need to fetch more details
      if (
        response.data.data.alternatives &&
        response.data.data.alternatives.length > 0
      ) {
        console.log(
          `Found ${response.data.data.alternatives.length} alternatives`
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Scan error:", error);

      // Mock data for testing with alternatives
      return {
        success: true,
        data: {
          success: false,
          message: "Multiple matches found",
          confidence: 0.85,
          searchTerms: ["laptop", "computer", "electronic device"],
          alternatives: [
            {
              productId: "prod_lap_001",
              name: "MacBook Laptop",
              confidence: 0.85,
              category: "Electronics",
              sellingPrice: 350000,
              currentStock: 5,
              unit: "unit",
            },
            {
              productId: "prod_lap_002",
              name: "HP Laptop 15-inch",
              confidence: 0.78,
              category: "Electronics",
              sellingPrice: 320000,
              currentStock: 3,
              unit: "unit",
            },
            {
              productId: "prod_fan_001",
              name: "Standing Fan 16-inch",
              confidence: 0.25,
              category: "Home Appliances",
              sellingPrice: 22000,
              currentStock: 10,
              unit: "unit",
            },
          ],
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
      productId: "prod_mock_001",
      name: "Standing Fan 16-inch",
      sku: "FAN-16-STAND",
      category: "Home Appliances",
      currentStock: 10,
      sellingPrice: 22000,
      unit: "unit",
      hasSizes: false,
      sizeOptions: [],
      confidence: 0.85,
    };
  }
}

export default new AIScannerService();
