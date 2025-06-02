import { generateMockStacks, mockStack } from '../__test__/mocks/stack';
import { validateStacks, validateTriggerRunResult } from './validations';

describe('Common Validations', () => {
  describe('validateStacks', () => {
    it('should return parsed data for valid stacks array', () => {
      const validStacks = generateMockStacks(3);
      const result = validateStacks(validStacks);
      expect(result).toEqual(validStacks);
    });

    it('should return parsed data for an empty array (valid according to schema)', () => {
      const emptyStacks: unknown[] = [];
      const result = validateStacks(emptyStacks);
      expect(result).toEqual(emptyStacks);
    });

    it('should throw an error for invalid stacks data (e.g., not an array)', () => {
      const invalidStacks = { id: 'not-an-array' };
      expect(() => validateStacks(invalidStacks)).toThrowError(/^Invalid stack: /);
    });

    it('should throw an error for stacks array with invalid item', () => {
      const invalidItemStacks = [
        mockStack,
        { ...mockStack, id: undefined }, // Missing required id
      ];
      expect(() => validateStacks(invalidItemStacks)).toThrowError(/^Invalid stack: /);
    });

    it('should throw an error if an item in the array has an invalid state', () => {
      const stacksWithInvalidState = [mockStack, { ...mockStack, state: 'INVALID_STATE' }];
      expect(() => validateStacks(stacksWithInvalidState)).toThrowError(/^Invalid stack: /);
    });
  });

  describe('validateTriggerRunResult', () => {
    it('should return parsed data for a valid trigger run result', () => {
      const validResult = {
        id: 'run-123',
        state: 'QUEUED',
      };
      const result = validateTriggerRunResult(validResult);
      expect(result).toEqual(validResult);
    });

    it('should throw an error for an invalid trigger run result (e.g., missing id)', () => {
      const invalidResult = { state: 'QUEUED' };
      expect(() => validateTriggerRunResult(invalidResult)).toThrowError(
        /^Invalid run trigger result: /
      );
    });

    it('should throw an error for a trigger run result with extra fields (if schema disallows)', () => {
      const resultWithExtra = {
        id: 'run-456',
        state: 'FINISHED',
        extraField: 'should be stripped',
      };
      const parsed = validateTriggerRunResult(resultWithExtra);
      expect(parsed).toEqual({ id: 'run-456', state: 'FINISHED' });
    });
  });
});
