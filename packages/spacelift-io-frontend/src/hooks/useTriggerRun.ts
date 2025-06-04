import { useApi } from '@backstage/core-plugin-api';
import { useCallback, useState } from 'react';
import { ISpaceliftApi, spaceliftApiRef } from '../api/SpaceliftApiClient';

export const useTriggerRun = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const spaceliftApi = useApi<ISpaceliftApi>(spaceliftApiRef);

  const triggerRun = useCallback(
    async (stackId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await spaceliftApi.triggerRun(stackId);
        return response;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [spaceliftApi]
  );

  return { triggerRun, loading, error, clear: () => setError(null) };
};
