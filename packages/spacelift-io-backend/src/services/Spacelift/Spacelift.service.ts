import { gql, request } from 'graphql-request';
import { validateStacks, validateTriggerRunResult, validateStackCreationResult } from '../../helpers/validations';
import { SpaceliftService, SpaceliftServiceCtx } from './types';

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
            },
            repository,
            projectRoot
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

      const validationResult = validateStacks(rawResponse.stacks);

      logger.info('Stacks fetched and validated successfully 🎉');
      return validationResult;
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

      const validationResult = validateTriggerRunResult(rawResponse.runTrigger);

      logger.info(`Run triggered and validated successfully for stack ${stackId} 🎉`);
      return validationResult;
    },
    createStack: async (stack) => {
      const currentToken = await getToken();

      const createStackMutation = gql`
        mutation CreateStack(
          $name: String!
          $branch: String!
          $space: ID!
          $repository: ID!
          $projectRoot: String!
          $labels: [String!]!
          $description: String
        ) {
          stackCreate(
            input: {
              name: $name
              branch: $branch
              space: $space
              repository: $repository
              projectRoot: $projectRoot
              administrative: true
              autodeploy: true
              labels: $labels
              description: $description
            }
            manageState: true
          ) {
            id
            name
            description
            labels
            state
            branch
            spaceDetails {
              id
              name
            }
          }
        }
      `;

      logger.info(`Creating stack ${stack.name}`);
      const rawResponse = await request<{ stackCreate: unknown }>(
        apiUrl,
        createStackMutation,
        {
          name: stack.name,
          branch: stack.branch,
          space: stack.spaceDetails.id,
          repository: stack.repository || '',
          projectRoot: stack.projectRoot || '',
          labels: stack.labels,
          description: stack.description,
        },
        { Authorization: `Bearer ${currentToken}` }
      );

      const validationResult = validateStackCreationResult(rawResponse.stackCreate);

      logger.info(`Stack created and validated successfully: ${stack.name} 🎉`);
      return validationResult;
    },
  };
}
