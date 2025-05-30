import { LoggerService } from '@backstage/backend-plugin-api';
import { z } from 'zod';

export const StackSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  labels: z.array(z.string()),
  state: z.enum([
    'APPLYING',
    'CONFIRMED',
    'DESTROYING',
    'DISCARDED',
    'FAILED',
    'FINISHED',
    'INITIALIZING',
    'NONE',
    'PLANNING',
    'PREPARING',
    'PREPARING_APPLY',
    'PREPARING_REPLAN',
    'REPLAN_REQUESTED',
    'STOPPED',
    'UNCONFIRMED',
  ]),
  branch: z.string(),
  spaceDetails: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
export const StacksSchema = z.array(StackSchema);
export type Stack = z.infer<typeof StackSchema>;

export const RunTriggerResultSchema = z.object({
  id: z.string(),
  state: z.string(),
});
export type RunTriggerResult = z.infer<typeof RunTriggerResultSchema>;

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
  triggerRun: (stackId: string) => Promise<RunTriggerResult>;
};
