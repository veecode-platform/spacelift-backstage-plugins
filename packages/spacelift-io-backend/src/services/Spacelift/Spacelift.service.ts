import { gql, request } from 'graphql-request';
import {
  RunTriggerResultSchema,
  SpaceliftService,
  SpaceliftServiceCtx,
  StacksSchema,
} from './types';

export async function createSpaceliftService({
  api,
  logger,
}: SpaceliftServiceCtx): Promise<SpaceliftService> {
  const apiUrl = `https://${api.hostUrl}/graphql`;
  let apiToken: string | null = null;
  let tokenExpiry: Date | null = null;

  const getToken = async (): Promise<string> => {
    if (apiToken && tokenExpiry && new Date() < tokenExpiry) {
      logger.info('Using cached API token');
      return apiToken;
    }

    if (apiToken && tokenExpiry && new Date() >= tokenExpiry) {
      logger.info('Cached API token expired, clearing cache');
      apiToken = null;
      tokenExpiry = null;
    }

    logger.info('Fetching new API token');

    const getSpaceliftTokenMutation = gql`
      mutation GetSpaceliftToken($apiKey: ID!, $apiSecret: String!) {
        apiKeyUser(id: $apiKey, secret: $apiSecret) {
          id
          jwt
        }
      }
    `;

    try {
      const response = await request<{ apiKeyUser: { jwt: string } }>(
        apiUrl,
        getSpaceliftTokenMutation,
        {
          apiKey: api.apiKey,
          apiSecret: api.apiSecret,
        }
      );
      apiToken = response.apiKeyUser.jwt;
      // Tokens are short-lived, set expiry to 1 minute from now
      tokenExpiry = new Date(new Date().getTime() + 60 * 1000);
      logger.info('New API token fetched and cached');
      return apiToken;
    } catch (error) {
      logger.error('Error fetching JWT:', error as Error);
      apiToken = null;
      tokenExpiry = null;
      throw new Error(
        `Failed to authenticate with Spacelift API: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  return {
    getStacks: async () => {
      const currentToken = await getToken();

      const stacksQuery = gql`
        query GetStacks () {
          stacks {
            id
            name,
            description,
            labels,
            state,
            branch,
            spaceDetails {
              id
              name
            }
          }
        }
      `;

      logger.info('Fetching stacks');
      const rawResponse = await request<{ stacks: unknown[] }>(
        apiUrl,
        stacksQuery,
        {},
        { Authorization: `Bearer ${currentToken}` }
      );

      const validationResult = StacksSchema.safeParse(rawResponse.stacks);
      if (!validationResult.success) {
        logger.error('Invalid stacks data received from API:', validationResult.error);
        throw new Error(`Invalid stacks data received from API: ${validationResult.error.message}`);
      }

      logger.info('Stacks fetched and validated successfully 🎉');
      return validationResult.data;
    },
    triggerRun: async (stackId: string) => {
      const currentToken = await getToken();

      const triggerRunMutation = gql`
        mutation TriggerRun($stackId: ID!) {
          runTrigger(stack: $stackId) {
            id
            state
          }
        }
      `;

      logger.info(`Triggering run for stack ${stackId}`);
      const rawResponse = await request<{ runTrigger: unknown }>(
        apiUrl,
        triggerRunMutation,
        { stackId },
        { Authorization: `Bearer ${currentToken}` }
      );

      const validationResult = RunTriggerResultSchema.safeParse(rawResponse.runTrigger);
      if (!validationResult.success) {
        logger.error('Invalid run trigger result data received from API:', validationResult.error);
        throw new Error(
          `Invalid run trigger result data received from API: ${validationResult.error.message}`
        );
      }

      logger.info(`Run triggered and validated successfully for stack ${stackId} 🎉`);
      return validationResult.data;
    },
  };
}
