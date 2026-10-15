import { apiClient } from '../api/client';

export const productService = {
  async getAll() {
    return apiClient('/products');
  },
  async getById(id) {
    return apiClient(`/products/${id}`);
  },
};
