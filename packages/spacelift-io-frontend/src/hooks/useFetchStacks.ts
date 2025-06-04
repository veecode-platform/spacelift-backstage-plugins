import { useApi } from '@backstage/core-plugin-api';
import { useCallback, useEffect, useState } from 'react';

import { ISpaceliftApi, spaceliftApiRef } from '../api/SpaceliftApiClient';
import { POLL_INTERVAL } from '../constants';
import { Stack } from '../types';

export const useFetchStacks = () => {
  const spaceliftApi = useApi<ISpaceliftApi>(spaceliftApiRef);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStacks = useCallback(async () => {
    try {
      const response = await spaceliftApi.getStacks();
      setStacks(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setStacks([]);
    } finally {
      setLoading(false);
    }
  }, [spaceliftApi]);

  useEffect(() => {
    const poll = setInterval(() => {
      fetchStacks();
    }, POLL_INTERVAL);

    fetchStacks();

    return () => {
      clearInterval(poll);
    };
  }, [fetchStacks]);

  return {
    stacks,
    loading,
    error,
    retry: fetchStacks,
    clear: () => setError(null),
  };
};
