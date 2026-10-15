import { apiClient } from '../api/client';

export const inboundService = {
  async create(data) {
    return apiClient('/inbound-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
