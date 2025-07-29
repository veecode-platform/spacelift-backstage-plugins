import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description: 'Trigger a run for a specific Spacelift stack',
    example: yaml.stringify({
      steps: [
        {
          action: 'spacelift:trigger-run',
          id: 'trigger-spacelift-run',
          name: 'Trigger Spacelift Run',
          input: {
            stackId: 'my-infrastructure-stack',
          },
        },
      ],
    }),
  },
  {
    description: 'Trigger a run and use the output in subsequent steps',
    example: yaml.stringify({
      steps: [
        {
          action: 'spacelift:trigger-run',
          id: 'trigger-spacelift-run',
          name: 'Trigger Spacelift Run',
          input: {
            stackId: '${{ parameters.stackId }}',
          },
        },
        {
          action: 'debug:log',
          id: 'log-run-details',
          name: 'Log Run Details',
          input: {
            message: 'Triggered run ${{ steps["trigger-spacelift-run"].output.runId }} with state: ${{ steps["trigger-spacelift-run"].output.runState }}',
          },
        },
      ],
    }),
  },
];
