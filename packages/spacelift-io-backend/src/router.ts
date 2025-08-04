import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { ClientError } from '@veecode/spacelift-io-shared';
import { SpaceliftService } from '@veecode/spacelift-io-shared';

// Helper to map service errors to HTTP responses
function handleError(res: express.Response, logger: LoggerService, error: any, context: string) {
  logger.error(`${context}:`, error as Error);

  if (error instanceof ClientError) {
    const gqlError = error.response.errors?.[0];
    const message = gqlError?.message || 'GraphQL request failed';
    const statusCode = error.response.status ?? 500;

    res.status(statusCode).json({ error: message, details: gqlError?.extensions });
    return;
  }

  // Other errors (e.g., network issues, unexpected errors in service)
  if (error.status && typeof error.status === 'number') {
    res.status(error.status).json({ error: error.message || 'An internal error occurred' });
  } else {
    res.status(500).json({ error: 'An unexpected internal error occurred' });
  }
}

export async function createRouter({
  spaceliftService,
  logger,
}: {
  httpAuth: HttpAuthService;
  spaceliftService: SpaceliftService;
  logger: LoggerService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, res) => {
    logger.info('PONG!');
    res.json({ status: 'ok' });
  });

  router.get('/stacks', async (_req, res) => {
    try {
      const stacks = await spaceliftService.getStacks();
      res.json(stacks);
    } catch (error) {
      handleError(res, logger, error, 'Error fetching stacks');
    }
  });

  router.post('/stacks/:stackId/trigger', async (req, res) => {
    const { stackId } = req.params;
    try {
      const runTrigger = await spaceliftService.triggerRun(stackId);
      res.json(runTrigger);
    } catch (error) {
      handleError(res, logger, error, `Error triggering run for stack ${stackId}`);
    }
  });

  return router;
}
