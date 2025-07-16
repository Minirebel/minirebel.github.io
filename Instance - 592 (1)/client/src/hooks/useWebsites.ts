import { useState, useEffect } from 'react';

interface Website {
  id: number;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  response_time: number | null;
  last_checked: string;
}

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites');
      if (response.ok) {
        const data = await response.json();
        setWebsites(data);
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAllWebsites = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/websites/check', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setWebsites(data);
      }
    } catch (error) {
      console.error('Error checking websites:', error);
    } finally {
      setChecking(false);
    }
  };

  const deleteWebsite = async (id: number) => {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWebsites(websites.filter(w => w.id !== id));
      }
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  return {
    websites,
    loading,
    checking,
    fetchWebsites,
    checkAllWebsites,
    deleteWebsite
  };
}
