import { apiClient } from '../api/client';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient('/uploads', {
    method: 'POST',
    body: formData,
  });
}

export const uploadService = {
  uploadFile,
};
