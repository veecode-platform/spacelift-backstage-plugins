import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { z } from 'zod';
import { 
  createSpaceliftService, 
  type SpaceliftServiceCtx,
  type Stack 
} from '@veecode/spacelift-io-backstage-integration-backend';

/**
 * Creates a scaffolder action to create Spacelift stacks
 *
 * @public
 */
export const createStackAction = (options: {
  config: Config;
}) => {
  const { config } = options;
  return createTemplateAction<{
    name: string;
    description?: string;
    labels: string[];
    branch: string;
    spaceId: string;
    repository: string;
    projectRoot: string;
  }>({
    id: 'spacelift:create-stack',
    description: 'Creates a new Spacelift stack',
    schema: {
      input: z.object({
        name: z
          .string()
          .describe('The name of the Spacelift stack to create'),
        description: z
          .string()
          .optional()
          .describe('Optional description for the stack'),
        labels: z
          .array(z.string())
          .default([])
          .describe('Labels to assign to the stack'),
        branch: z
          .string()
          .describe('The Git branch to use for the stack'),
        spaceId: z
          .string()
          .describe('The ID of the Spacelift space where the stack will be created'),
        repository: z
          .string()
          .describe('The repository ID or URL for the stack'),
        projectRoot: z
          .string()
          .default('.')
          .describe('The project root directory within the repository'),
      }),
    },
    supportsDryRun: true,
    async handler(ctx) {
      const { name, description, labels, branch, spaceId, repository, projectRoot } = ctx.input;
      
      // Read Spacelift configuration from Backstage config
      const hostUrl = config.getString('spacelift.hostUrl');
      const apiKey = config.getString('spacelift.apiKey');
      const apiSecret = config.getString('spacelift.apiSecret');
      
      if (ctx.isDryRun) {
        ctx.logger.info(`🔄 DRY RUN: Would create stack '${name}' in space ${spaceId}`);
        ctx.logger.info(`🔄 DRY RUN: Repository: ${repository}, Branch: ${branch}`);
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
        
        ctx.logger.info(`🚀 Creating Spacelift stack: ${name}`);
        
        // Prepare the stack data
        const stackData: Stack = {
          id: '', // Will be assigned by Spacelift
          name,
          description,
          labels,
          state: 'NONE', // Initial state
          branch,
          spaceDetails: {
            id: spaceId,
            name: '', // Will be populated by the API response
          },
          repository,
          projectRoot,
        };
        
        // Create the stack
        const result: Stack = await spaceliftService.createStack(stackData);
        
        ctx.logger.info(`✅ Successfully created stack '${result.name}' with ID: ${result.id}`);
        ctx.logger.info(`📊 Stack state: ${result.state}`);
        ctx.logger.info(`🏢 Space: ${result.spaceDetails.name} (${result.spaceDetails.id})`);
        
        // Output the result for potential use in subsequent steps
        ctx.output('stackId', result.id);
        ctx.output('stackName', result.name);
        ctx.output('stackState', result.state);
        ctx.output('spaceId', result.spaceDetails.id);
        ctx.output('spaceName', result.spaceDetails.name);
        
      } catch (error) {
        ctx.logger.error(`❌ Failed to create stack '${name}':`, error);
        throw error;
      }
    },
  });
};
