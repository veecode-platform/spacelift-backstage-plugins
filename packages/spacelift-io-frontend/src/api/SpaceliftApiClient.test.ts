import { MockFetchApi, mockApis, registerMswTestHooks } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { generateMockStacks } from '../__test__/mocks/stacks';
import { TriggerRunResponse } from '../types';
import { SpaceliftApi } from './SpaceliftApiClient';

const mockHost = 'https://example.spacelift.io';

describe('SpaceliftApiClient', () => {
  let client: SpaceliftApi;
  let fetchApi: MockFetchApi;
  let fetchSpy: jest.SpyInstance;
  const server = setupServer();
  registerMswTestHooks(server);

  beforeEach(() => {
    fetchApi = new MockFetchApi({});
    fetchSpy = jest.spyOn(fetchApi, 'fetch');
    client = new SpaceliftApi(mockApis.discovery({ baseUrl: mockHost }), fetchApi);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getStacks', () => {
    it('should fetch stacks successfully', async () => {
      const mockStacks = generateMockStacks(1);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockStacks,
      });
      const stacks = await client.getStacks();

      expect(fetchApi.fetch).toHaveBeenCalledWith(`${mockHost}/api/spacelift-io/stacks`);
      expect(stacks).toEqual(mockStacks);
    });

    it('should throw an error if the fetch fails', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getStacks()).rejects.toThrow('Network error');
    });

    it('should throw an error if the response is not ok', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      await expect(client.getStacks()).rejects.toThrow('Server error');
    });
  });

  describe('triggerRun', () => {
    const stackId = 'test-stack-id';
    const mockRunResponse: TriggerRunResponse = { id: 'run-123', state: 'APPLYING' };

    it('should trigger a run successfully', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockRunResponse,
      });

      const response = await client.triggerRun(stackId);

      expect(fetchApi.fetch).toHaveBeenCalledWith(
        `${mockHost}/api/spacelift-io/stacks/${stackId}/trigger`,
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(response).toEqual(mockRunResponse);
    });

    it('should throw an error if the fetch fails', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.triggerRun(stackId)).rejects.toThrow('Network error');
    });

    it('should throw an error if the response is not ok', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Auth error' }),
      });

      await expect(client.triggerRun(stackId)).rejects.toThrow('Auth error');
    });
  });
});
