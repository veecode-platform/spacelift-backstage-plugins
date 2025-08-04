import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { z } from 'zod';
import { 
  createSpaceliftService, 
  type SpaceliftServiceCtx,
  type TriggerRunResponse 
} from '@veecode/spacelift-io-shared';

/**
 * Creates a scaffolder action to trigger Spacelift stack runs
 *
 * @public
 */
export const createTriggerRunAction = (options: {
  config: Config;
}) => {
  const { config } = options;
  return createTemplateAction<{
    stackId: string;
  }>({
    id: 'spacelift:trigger-run',
    description: 'Triggers a run for a Spacelift stack',
    schema: {
      input: z.object({
        stackId: z
          .string()
          .describe('The ID of the Spacelift stack to trigger'),
      }),
    },
    supportsDryRun: true,
    async handler(ctx) {
      const { stackId } = ctx.input;
      
      // Read Spacelift configuration from Backstage config
      const hostUrl = config.getString('spacelift.hostUrl');
      const apiKey = config.getString('spacelift.apiKey');
      const apiSecret = config.getString('spacelift.apiSecret');
      
      if (ctx.isDryRun) {
        ctx.logger.info(`🔄 DRY RUN: Would trigger run for stack ${stackId}`);
        ctx.logger.info(`🔄 DRY RUN: Using Spacelift host: ${hostUrl}`);
        return;
      }
      
      try {
        // Create the Spacelift service instance
        const serviceCtx: SpaceliftServiceCtx = {
          api: {
            hostUrl,
            apiKey,
            apiSecret,
          },
          logger: ctx.logger,
        };
        
        const spaceliftService = await createSpaceliftService(serviceCtx);
        
        ctx.logger.info(`🚀 Triggering run for Spacelift stack: ${stackId}`);
        
        // Trigger the run
        const result: TriggerRunResponse = await spaceliftService.triggerRun(stackId);
        
        ctx.logger.info(`✅ Successfully triggered run ${result.id} for stack ${stackId}`);
        ctx.logger.info(`📊 Run state: ${result.state}`);
        
        // Output the result for potential use in subsequent steps
        ctx.output('runId', result.id);
        ctx.output('runState', result.state);
        
      } catch (error) {
        ctx.logger.error(`❌ Failed to trigger run for stack ${stackId}:`, error);
        throw error;
      }
    },
  });
};
