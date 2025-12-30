import { api } from './api';
import { Address } from '@/types';
// Address API Helper
const ADDRESS_API_URL = '/address';

export const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get(ADDRESS_API_URL);
  return response.data.data || response.data;
};

export const addAddress = async (payload: Omit<Address, 'id' | '_id' | 'user' | 'createdAt' | 'updatedAt'>): Promise<Address> => {
  const response = await api.post(ADDRESS_API_URL, payload);
  return response.data.data || response.data;
};

export const updateAddress = async (id: string, payload: Partial<Address>): Promise<Address> => {
  const response = await api.put(`${ADDRESS_API_URL}/${id}`, payload);
  return response.data.data || response.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`${ADDRESS_API_URL}/${id}`);
};

export const setDefaultAddress = async (id: string): Promise<Address> => {
  const response = await api.patch(`${ADDRESS_API_URL}/${id}/default`);
  return response.data.data || response.data;
};
