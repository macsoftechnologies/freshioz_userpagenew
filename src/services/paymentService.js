import { apiClient } from '../api/client';

export const paymentService = {
  /**
   * Fetch public gateway status and active key_id (Safe, no secrets)
   */
  async getPublicConfig() {
    try {
      return await apiClient('/payments/razorpay/public-config');
    } catch (e) {
      console.warn('Failed to fetch payment config, defaulting to COD:', e);
      return { enabled: false, activeMode: 'TEST', keyId: null };
    }
  },

  /**
   * Create Razorpay server order with authentic amount in INR
   */
  async createRazorpayOrder({ amount, receipt, notes }) {
    return apiClient('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, receipt, notes }),
    });
  },

  /**
   * Verify HMAC signature on server and atomically commit PAID order
   */
  async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderPayload }) {
    return apiClient('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderPayload,
      }),
    });
  },

  /**
   * Dynamically loads Razorpay checkout.js script only when needed
   */
  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay checkout script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },
};
