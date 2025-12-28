import axios from 'axios';
import config from '../config';

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
      const filename = imageUri.split('/').pop() || 'product.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      const response = await axios.post(`${API_URL}/ai/scan`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Scan error:', error);
      throw new Error(error.response?.data?.message || 'Failed to scan product');
    }
  }

  async getProductSizes(productId: string, token: string): Promise<Array<{value: string; label: string}>> {
    try {
      const response = await axios.get(`${API_URL}/ai/products/${productId}/sizes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching sizes:', error);
      return [];
    }
  }

  async searchProducts(query: string, token: string): Promise<ScannedProduct[]> {
    try {
      const response = await axios.post(
        `${API_URL}/ai/search`,
        { query, limit: 5 },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Mock data for testing when API is not available
  getMockProduct(): ScannedProduct {
    return {
      productId: 'prod_mock_001',
      name: 'Coca-Cola 50cl',
      sku: 'COKE-50CL',
      category: 'Beverages',
      currentStock: 50,
      sellingPrice: 150,
      unit: 'bottle',
      hasSizes: true,
      sizeOptions: [
        { value: '50cl', label: '50cl' },
        { value: '1l', label: '1 Liter' },
        { value: '1.5l', label: '1.5 Liter' },
        { value: '2l', label: '2 Liter' },
      ],
      confidence: 0.85,
    };
  }
}

export default new AIScannerService();