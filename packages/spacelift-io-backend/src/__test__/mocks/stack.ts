import { Stack } from '../../types';

export const mockStack: Stack = {
  id: 'stack-id',
  name: 'stack-name',
  description: 'stack-description',
  labels: ['label1', 'label2'],
  state: 'FINISHED',
  branch: 'main',
  spaceDetails: {
    id: 'space-id',
    name: 'space-name',
  },
};

export const generateMockStacks = (count: number): Stack[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockStack,
    id: `stack-id-${index}`,
    name: `stack-name-${index}`,
    description: `stack-description-${index}`,
  }));
};
