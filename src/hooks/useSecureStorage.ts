import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface UseSecureStorageReturn {
  value: string | null;
  setValue: (value: string) => Promise<void>;
  removeValue: () => Promise<void>;
  isLoading: boolean;
}

export const useSecureStorage = (key: string): UseSecureStorageReturn => {
  const [value, setStoredValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, [key]);

  const loadValue = async () => {
    try {
      const storedValue = await SecureStore.getItemAsync(key);
      setStoredValue(storedValue);
    } catch (error) {
      console.error('Error loading secure storage value:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setValue = async (newValue: string) => {
    try {
      await SecureStore.setItemAsync(key, newValue);
      setStoredValue(newValue);
    } catch (error) {
      console.error('Error setting secure storage value:', error);
      throw error;
    }
  };

  const removeValue = async () => {
    try {
      await SecureStore.deleteItemAsync(key);
      setStoredValue(null);
    } catch (error) {
      console.error('Error removing secure storage value:', error);
      throw error;
    }
  };

  return {
    value,
    setValue,
    removeValue,
    isLoading,
  };
}; 