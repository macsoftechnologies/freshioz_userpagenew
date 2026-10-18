import { apiClient } from '../api/client';

export const discountService = {
  getMyDiscounts() {
    return apiClient('/customer-discounts/my');
  },

  validateDiscount(code, cartSubtotal) {
    return apiClient('/customer-discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartSubtotal }),
    });
  },
};
