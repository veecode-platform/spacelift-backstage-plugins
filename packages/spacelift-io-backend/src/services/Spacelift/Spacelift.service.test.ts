import { mockServices } from '@backstage/backend-test-utils';
import { request } from 'graphql-request';
import { generateMockStacks, mockStack } from '../../__test__/mocks/stack';
import { createSpaceliftService } from './Spacelift.service';
import { SpaceliftServiceCtx } from './types';

// Mock graphql-request
jest.mock('graphql-request', () => ({
  request: jest.fn(),
  gql: jest.fn(query => query),
}));

const mockLogger = mockServices.logger.mock();

const mockApiConfig = {
  hostUrl: 'test.spacelift.io',
  apiKey: 'test-key',
  apiSecret: 'test-secret',
};

const mockServiceContext: SpaceliftServiceCtx = {
  api: mockApiConfig,
  logger: mockLogger,
};

const checkGqlQuery = (query: string) => {
  return expect.arrayContaining([expect.stringContaining(query)]);
};

const endpoint = `https://${mockApiConfig.hostUrl}/graphql`;
const authorizationHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('createSpaceliftService', () => {
  let service: Awaited<ReturnType<typeof createSpaceliftService>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await createSpaceliftService(mockServiceContext);
  });

  describe('getToken', () => {
    it('should fetch a new token if not cached', async () => {
      (request as jest.Mock).mockResolvedValueOnce({ apiKeyUser: { jwt: 'new-jwt-token' } });
      (request as jest.Mock).mockResolvedValueOnce({ stacks: [] });
      await service.getStacks();

      expect(request).toHaveBeenCalledTimes(2);
      expect(request).toHaveBeenNthCalledWith(
        1,
        endpoint,
        checkGqlQuery('mutation GetSpaceliftToken'),
        { apiKey: mockApiConfig.apiKey, apiSecret: mockApiConfig.apiSecret }
      );
      // Second call: getStacks
      expect(request).toHaveBeenNthCalledWith(
        2,
        endpoint,
        checkGqlQuery('query GetStacks'),
        {},
        authorizationHeader('new-jwt-token')
      );
    });

    it('should use a cached token if available and not expired', async () => {
      const cachedToken = 'cached-jwt-token';
      (request as jest.Mock).mockResolvedValueOnce({ apiKeyUser: { jwt: cachedToken } });
      (request as jest.Mock).mockResolvedValueOnce({ stacks: [] });
      await service.getStacks();

      (request as jest.Mock).mockResolvedValueOnce({ stacks: [mockStack] });
      await service.getStacks();

      expect(request).toHaveBeenCalledTimes(3);
      expect(request).toHaveBeenNthCalledWith(
        1,
        endpoint,
        checkGqlQuery('mutation GetSpaceliftToken'),
        { apiKey: mockApiConfig.apiKey, apiSecret: mockApiConfig.apiSecret }
      );
      expect(request).toHaveBeenNthCalledWith(
        2,
        endpoint,
        checkGqlQuery('query GetStacks'),
        {},
        authorizationHeader(cachedToken)
      );
      expect(request).toHaveBeenNthCalledWith(
        3,
        endpoint,
        checkGqlQuery('query GetStacks'),
        {},
        authorizationHeader(cachedToken)
      );
    });

    it('should re-fetch token if cached token is expired', async () => {
      jest.useFakeTimers();
      const expiringToken = 'expiring-jwt-token';
      const newFreshToken = 'new-after-expiry-token';

      (request as jest.Mock).mockResolvedValueOnce({ apiKeyUser: { jwt: expiringToken } });
      (request as jest.Mock).mockResolvedValueOnce({ stacks: [] });
      await service.getStacks();

      jest.advanceTimersByTime(70 * 1000); // Simulate time passing

      (request as jest.Mock).mockResolvedValueOnce({
        apiKeyUser: { jwt: newFreshToken },
      });
      (request as jest.Mock).mockResolvedValueOnce({ stacks: [mockStack] });
      await service.getStacks();

      expect(request).toHaveBeenCalledTimes(4);
      expect(request).toHaveBeenNthCalledWith(
        1,
        endpoint,
        checkGqlQuery('mutation GetSpaceliftToken'),
        { apiKey: mockApiConfig.apiKey, apiSecret: mockApiConfig.apiSecret }
      );
      expect(request).toHaveBeenNthCalledWith(
        2,
        endpoint,
        checkGqlQuery('query GetStacks'),
        {},
        authorizationHeader(expiringToken)
      );
      expect(request).toHaveBeenNthCalledWith(
        3,
        endpoint,
        checkGqlQuery('mutation GetSpaceliftToken'),
        { apiKey: mockApiConfig.apiKey, apiSecret: mockApiConfig.apiSecret }
      );
      expect(request).toHaveBeenNthCalledWith(
        4,
        endpoint,
        checkGqlQuery('query GetStacks'),
        {},
        authorizationHeader(newFreshToken)
      );
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('should throw if token fetching fails', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch token'));
      await expect(service.getStacks()).rejects.toThrow('Failed to fetch token');

      (request as jest.Mock).mockRejectedValueOnce('Failed with unknown error');
      await expect(service.getStacks()).rejects.toThrow('Unknown error');
    });
  });

  describe('getStacks', () => {
    const mockToken = 'test-jwt-token';

    beforeEach(() => {
      (request as jest.Mock).mockResolvedValueOnce({ apiKeyUser: { jwt: mockToken } });
    });

    it('should fetch and validate stacks successfully', async () => {
      const mockStacksData = generateMockStacks(5);
      (request as jest.Mock).mockResolvedValueOnce({ stacks: mockStacksData }); // Mock for the getStacks query itself

      const stacks = await service.getStacks();

      expect(request).toHaveBeenCalledTimes(2); // 1 for token (in beforeEach), 1 for getStacks

      // First call: getToken (mocked in beforeEach)
      expect(request).toHaveBeenNthCalledWith(
        1,
        endpoint,
        checkGqlQuery('mutation GetSpaceliftToken'),
        { apiKey: mockApiConfig.apiKey, apiSecret: mockApiConfig.apiSecret }
      );
      expect(request).toHaveBeenNthCalledWith(
        2,
        endpoint,
        checkGqlQuery('query GetStacks'),
        {},
        authorizationHeader(mockToken)
      );
      expect(stacks).toEqual(mockStacksData);
    });

    it('should throw if API returns invalid stack data', async () => {
      const invalidMockStacks = [{ id: 'stack1', name: 123 }];
      (request as jest.Mock).mockResolvedValueOnce({ stacks: invalidMockStacks }); // Mock for getStacks query

      await expect(service.getStacks()).rejects.toThrow(/Invalid stack:/g);

      expect(request).toHaveBeenCalledTimes(2); // Token call + getStacks call
    });

    it('should throw if API call for stacks fails', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('API error fetching stacks')); // Mock for getStacks query

      await expect(service.getStacks()).rejects.toThrow(/API error fetching stacks/g);
      expect(request).toHaveBeenCalledTimes(2); // Token call + getStacks call
    });
  });

  describe('triggerRun', () => {
    const stackId = 'test-stack-id';
    const mockToken = 'test-jwt-token'; // Consistent token for this describe block

    beforeEach(() => {
      (request as jest.Mock).mockResolvedValueOnce({ apiKeyUser: { jwt: mockToken } });
    });

    it('should trigger a run and validate result successfully', async () => {
      const mockRunResultData = { id: 'run1', state: 'QUEUED' };
      (request as jest.Mock).mockResolvedValueOnce({ runTrigger: mockRunResultData }); // Mock for triggerRun mutation

      const result = await service.triggerRun(stackId);

      expect(request).toHaveBeenCalledTimes(2); // 1 for token, 1 for triggerRun
      // First call: getToken (mocked in beforeEach)
      expect(request).toHaveBeenNthCalledWith(
        1,
        endpoint,
        checkGqlQuery('mutation GetSpaceliftToken'),
        { apiKey: mockApiConfig.apiKey, apiSecret: mockApiConfig.apiSecret }
      );
      expect(request).toHaveBeenNthCalledWith(
        2,
        endpoint,
        checkGqlQuery('mutation TriggerRun'),
        { stackId },
        authorizationHeader(mockToken)
      );
      expect(result).toEqual(mockRunResultData);
    });

    it('should throw if API returns invalid run trigger data', async () => {
      const invalidMockRunResult = { id: 'run1', state: 123 };
      (request as jest.Mock).mockResolvedValueOnce({ runTrigger: invalidMockRunResult }); // Mock for triggerRun mutation

      await expect(service.triggerRun(stackId)).rejects.toThrow(/Invalid run trigger result:/g);
      expect(request).toHaveBeenCalledTimes(2); // Token call + triggerRun call
    });

    it('should throw if API call for triggering run fails', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('API error triggering run')); // Mock for triggerRun mutation

      await expect(service.triggerRun(stackId)).rejects.toThrow('API error triggering run');
      expect(request).toHaveBeenCalledTimes(2); // Token call + triggerRun call
    });
  });
});
