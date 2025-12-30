import { useState, useEffect } from 'react';
import { useBackendAuth } from '@/hooks/useBackendAuth';
import { api } from '@/services/api';

export const useAdmin = () => {
  const { user } = useBackendAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const response: any = await api<{ isAdmin: boolean }>('/auth/check-admin');
        if (response.data.success && response.data.data) {
          setIsAdmin(response.data.data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  return { isAdmin, loading };
};
