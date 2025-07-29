import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description: 'Simple greeting with default message',
    example: yaml.stringify({
      steps: [
        {
          action: 'spacelift:dummy',
          id: 'spacelift-greeting',
          name: 'Spacelift Greeting',
          input: {
            name: 'Developer',
          },
        },
      ],
    }),
  },
  {
    description: 'Custom message with name',
    example: yaml.stringify({
      steps: [
        {
          action: 'spacelift:dummy',
          id: 'spacelift-custom',
          name: 'Spacelift Custom Message',
          input: {
            message: 'Welcome to Spacelift.io!',
            name: 'Platform Team',
          },
        },
      ],
    }),
  },
  {
    description: 'Default message only',
    example: yaml.stringify({
      steps: [
        {
          action: 'spacelift:dummy',
          id: 'spacelift-default',
          name: 'Spacelift Default',
          input: {},
        },
      ],
    }),
  },
];
