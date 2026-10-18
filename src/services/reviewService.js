import { apiClient } from '../api/client';

export const reviewService = {
  createReview(dto) {
    return apiClient('/reviews', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  updateReview(id, dto) {
    return apiClient(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  getMyReviews() {
    return apiClient('/reviews/my');
  },

  getProductReviews(productId) {
    return apiClient(`/reviews/product/${productId}`);
  },

  getWebsiteReviews() {
    return apiClient('/reviews/website');
  },
};
