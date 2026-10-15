import { apiClient } from '../api/client';

export const societyService = {
  async getAll() {
    return apiClient('/societies');
  },
  async getById(id) {
    return apiClient(`/societies/${id}`);
  },
  async requestPayout(id, amount) {
    return apiClient(`/societies/${id}/payout-request`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
};
