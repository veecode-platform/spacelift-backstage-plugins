import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import { ClientError, GraphQLResponse } from '@veecode/spacelift-io-shared'; // Keep this import
import request from 'supertest';
import { generateMockStacks } from './__test__/mocks/stack';
import { createRouter } from './router';
import { SpaceliftService } from '@veecode/spacelift-io-shared';

// Mock SpaceliftService
const mockSpaceliftService = {
  getStacks: jest.fn(),
  triggerRun: jest.fn(),
} as jest.Mocked<SpaceliftService>;

const mockLogger = mockServices.logger.mock() as jest.Mocked<LoggerService>; // Added type assertion
const mockHttpAuth: jest.Mocked<HttpAuthService> = {
  credentials: jest.fn(),
  issueUserCookie: jest.fn(),
};

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: mockLogger,
      spaceliftService: mockSpaceliftService,
      httpAuth: mockHttpAuth,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
      expect(mockLogger.info).toHaveBeenCalledWith('PONG!');
    });
  });

  describe('GET /stacks', () => {
    it('should return 200 and stacks on success', async () => {
      const mockStacks = generateMockStacks(1);
      mockSpaceliftService.getStacks.mockResolvedValueOnce(mockStacks);

      const response = await request(app).get('/stacks');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockStacks);
      expect(mockSpaceliftService.getStacks).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if service throws an error', async () => {
      mockSpaceliftService.getStacks.mockRejectedValueOnce(new Error('Service Error'));

      const response = await request(app).get('/stacks');

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: 'An unexpected internal error occurred' });
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching stacks:', expect.any(Error));
    });

    it('should handle ClientError from service correctly', async () => {
      const mockErrorResponse = {
        errors: [
          {
            message: 'GraphQL Error Message',
            extensions: { code: 'SOME_ERROR_CODE' },
          },
        ],
        status: 403,
        data: {},
      } as unknown as GraphQLResponse;

      const clientError = new ClientError(mockErrorResponse, { query: '' });
      mockSpaceliftService.getStacks.mockRejectedValueOnce(clientError);

      const response = await request(app).get('/stacks');

      expect(response.status).toEqual(403);
      expect(response.body).toEqual({
        error: 'GraphQL Error Message',
        details: { code: 'SOME_ERROR_CODE' },
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching stacks:',
        expect.any(ClientError)
      );
    });

    it('should handle error with status and message from service correctly', async () => {
      const customError = {
        status: 418,
        message: "I'm a teapot",
      };
      mockSpaceliftService.getStacks.mockRejectedValueOnce(customError);

      const response = await request(app).get('/stacks');

      expect(response.status).toEqual(418);
      expect(response.body).toEqual({ error: "I'm a teapot" });
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching stacks:', customError);
    });
  });

  describe('POST /stacks/:stackId/trigger', () => {
    const stackId = 'test-stack-id';

    it('should return 200 and trigger result on success', async () => {
      const mockTriggerResult = { id: 'run1', state: 'QUEUED' };
      mockSpaceliftService.triggerRun.mockResolvedValueOnce(mockTriggerResult);

      const response = await request(app).post(`/stacks/${stackId}/trigger`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockTriggerResult);
      expect(mockSpaceliftService.triggerRun).toHaveBeenCalledWith(stackId);
    });

    it('should return 500 if service throws an error', async () => {
      mockSpaceliftService.triggerRun.mockRejectedValueOnce(new Error('Service Trigger Error'));

      const response = await request(app).post(`/stacks/${stackId}/trigger`);

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: 'An unexpected internal error occurred' });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error triggering run for stack ${stackId}:`,
        expect.any(Error)
      );
    });

    it('should handle ClientError from service correctly on trigger', async () => {
      const stackId = 'test-stack-id';
      const mockErrorResponse = {
        data: {},
      } as unknown as GraphQLResponse;
      const clientError = new ClientError(mockErrorResponse, { query: '' });
      mockSpaceliftService.triggerRun.mockRejectedValueOnce(clientError);

      const response = await request(app).post(`/stacks/${stackId}/trigger`);

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        error: 'GraphQL request failed',
        details: undefined,
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error triggering run for stack ${stackId}:`,
        expect.any(ClientError)
      );
    });

    it('should handle error with status and message from service correctly on trigger', async () => {
      const stackId = 'test-stack-id';
      const customError = {
        status: 429,
      };
      mockSpaceliftService.triggerRun.mockRejectedValueOnce(customError);

      const response = await request(app).post(`/stacks/${stackId}/trigger`);

      expect(response.status).toEqual(429);
      expect(response.body).toEqual({ error: 'An internal error occurred' });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error triggering run for stack ${stackId}:`,
        customError
      );
    });
  });
});
