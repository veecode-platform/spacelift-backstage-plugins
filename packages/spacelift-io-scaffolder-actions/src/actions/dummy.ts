import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import { examples } from './dummy.examples';

const inputSchema = z.object({
  message: z
    .string()
    .describe('A message to log')
    .default('Hello from Spacelift.io scaffolder action!'),
  name: z
    .string()
    .describe('Name to include in the greeting')
    .optional(),
});

/**
 * Creates a dummy scaffolder action for demonstration purposes
 *
 * @public
 */
export const createDummyAction = () => {
  return createTemplateAction<{
    message?: string;
    name?: string;
  }>({
    id: 'spacelift:dummy',
    description: 'A simple dummy action for Spacelift.io integration',
    examples,
    schema: {
      input: inputSchema,
    },
    supportsDryRun: true,
    async handler(ctx) {
      const { message, name } = inputSchema.parse(ctx.input);
      
      // Handle dry run first
      if (ctx.isDryRun) {
        ctx.logger.info(' DRY RUN: Spacelift.io dummy action is in dry run');
        if (name) {
          ctx.logger.info(` DRY RUN: Would log "${message} Hello, ${name}!!!"`);
        } else {
          ctx.logger.info(` DRY RUN: Would log "${message}"`);
        }
        ctx.logger.info(' DRY RUN: Action dry run completed successfully');
        return;
      }
      
      // Actual execution
      //ctx.logger.info(`Spacelift.io dummy action executed`);
      
      if (name) {
        ctx.logger.info(`${message} Hello, ${name}!`);
      } else {
        ctx.logger.info(message);
      }
      
      //ctx.logger.info('Dummy action completed successfully');
    },
  });
};
