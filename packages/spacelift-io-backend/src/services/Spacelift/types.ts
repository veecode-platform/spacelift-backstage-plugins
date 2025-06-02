import { LoggerService } from '@backstage/backend-plugin-api';
import { Stack, TriggerRunResponse } from '../../types';

export type SpaceliftServiceCtx = {
  api: {
    hostUrl: string;
    apiKey: string;
    apiSecret: string;
  };
  logger: LoggerService;
};

export type SpaceliftService = {
  getStacks: () => Promise<Stack[]>;
  triggerRun: (stackId: string) => Promise<TriggerRunResponse>;
};
