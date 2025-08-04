import { StackSchema, TriggerRunResponseSchema } from './';

describe('Common Types Schemas', () => {
  describe('StackSchema', () => {
    it('should validate a correct stack object', () => {
      const stackData = {
        id: 'stack-id',
        name: 'My Stack',
        description: 'A description of my stack',
        labels: ['label1', 'label2'],
        state: 'FINISHED',
        branch: 'main',
        spaceDetails: {
          id: 'space-id',
          name: 'My Space',
        },
        // Optional fields that were added for frontend compatibility
        repository: 'my-repo',
        projectRoot: '/',
        apiHost: 'https://my.spacelift.app',
      };
      const result = StackSchema.safeParse(stackData);
      expect(result.success).toBe(true);
    });

    it('should validate a correct stack object with minimal fields', () => {
      const stackData = {
        id: 'stack-id',
        name: 'My Stack',
        labels: [],
        state: 'PLANNING',
        branch: 'develop',
        spaceDetails: {
          id: 'space-id-2',
          name: 'Another Space',
        },
      };
      const result = StackSchema.safeParse(stackData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should fail validation for an incorrect stack object (e.g. missing required field)', () => {
      const stackData = {
        // id: 'stack-id', // Missing id
        name: 'My Stack',
        labels: [],
        state: 'FAILED',
        branch: 'main',
        spaceDetails: {
          id: 'space-id',
          name: 'My Space',
        },
      };
      const result = StackSchema.safeParse(stackData);
      expect(result.success).toBe(false);
    });

    it('should fail validation for an invalid state enum', () => {
      const stackData = {
        id: 'stack-id',
        name: 'My Stack',
        labels: [],
        state: 'INVALID_STATE', // Invalid state
        branch: 'main',
        spaceDetails: {
          id: 'space-id',
          name: 'My Space',
        },
      };
      const result = StackSchema.safeParse(stackData);
      expect(result.success).toBe(false);
    });
  });

  describe('TriggerRunResponseSchema', () => {
    it('should validate a correct trigger run response object', () => {
      const responseData = {
        id: 'run-id',
        state: 'QUEUED',
      };
      const result = TriggerRunResponseSchema.safeParse(responseData);
      expect(result.success).toBe(true);
    });

    it('should fail validation for an incorrect trigger run response object (e.g. missing field)', () => {
      const responseData = {
        state: 'QUEUED',
      };
      const result = TriggerRunResponseSchema.safeParse(responseData);
      expect(result.success).toBe(false);
    });
  });
});
