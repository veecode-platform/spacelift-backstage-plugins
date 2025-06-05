import { configApiRef } from '@backstage/core-plugin-api';
import { mockApis, renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { generateMockStacks } from '../../__test__/mocks/stacks';
import { ALLOW_RETRY_STATES, DESCRIPTION_TRUNCATE_LENGTH } from '../../constants';
import { Stack } from '../../types';
import { SpaceliftStacksTable } from './SpaceliftStacksTable';

const mockTriggerRun = jest.fn();

const mockStacks = generateMockStacks(4, true);

const mockConfig = mockApis.config({
  data: {
    spacelift: { hostUrl: 'test.spacelift.io' },
  },
});

const renderInTestEnv = (props: React.ComponentProps<typeof SpaceliftStacksTable>) => {
  return renderInTestApp(
    <TestApiProvider apis={[[configApiRef, mockConfig]]}>
      <SpaceliftStacksTable {...props} />
    </TestApiProvider>
  );
};

describe('SpaceliftStacksTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table with correct columns and data', async () => {
    await renderInTestEnv({
      stacks: mockStacks,
      loading: false,
      triggerRun: mockTriggerRun,
    });
    expect(await screen.findByText('Spacelift Stacks')).toBeInTheDocument();
    await Promise.all(
      mockStacks.map(async stack => {
        return expect(await screen.findByText(stack.name)).toBeInTheDocument();
      })
    );

    // Check for column headers
    expect(await screen.findByText('Name')).toBeInTheDocument();
    expect(await screen.findByText('Description')).toBeInTheDocument();
    expect(await screen.findByText('Labels')).toBeInTheDocument();
    expect(await screen.findByText('Current State')).toBeInTheDocument();
    expect(await screen.findByText('Branch')).toBeInTheDocument();
    expect(await screen.findByText('Space')).toBeInTheDocument();
  });

  it('displays "No stacks found" when stacks is empty', async () => {
    await renderInTestEnv({
      stacks: [],
      loading: false,
      triggerRun: mockTriggerRun,
    });
    expect(await screen.findByText('No stacks found')).toBeInTheDocument();
  });

  it('renders stack names as links', async () => {
    const mockStack = mockStacks[0];
    await renderInTestEnv({
      stacks: [mockStack],
      loading: false,
      triggerRun: mockTriggerRun,
    });
    const link = await screen.findByRole('link', { name: mockStack.name });
    expect(link).toHaveAttribute('href', `https://test.spacelift.io/stack/${mockStack.id}`);
  });

  it('renders short descriptions directly', async () => {
    const shortDescription = 'A short description.';
    const mockStack = { ...mockStacks[0], description: shortDescription };
    await renderInTestEnv({
      stacks: [mockStack],
      loading: false,
      triggerRun: mockTriggerRun,
    });
    expect(await screen.findByText(shortDescription)).toBeInTheDocument();
  });

  it('renders long descriptions truncated and allows expansion', async () => {
    const longDescription =
      'This is a very long description that should be truncated in the table view but can be expanded to show the full text. It contains a lot of information about the stack and its configuration, which is useful for users to understand the context and purpose of the stack.';
    const truncatedDesc = longDescription.slice(0, DESCRIPTION_TRUNCATE_LENGTH) + ' ...';
    const mockStack = { ...mockStacks[0], description: longDescription };
    await renderInTestEnv({
      stacks: [mockStack],
      loading: false,
      triggerRun: mockTriggerRun,
    });

    const descriptionCell = await screen.findByText(truncatedDesc);
    expect(descriptionCell).toBeInTheDocument();

    await userEvent.click(descriptionCell);
    const drawer = await screen.findByRole('presentation');
    expect(drawer).toBeVisible();
    expect(within(drawer).getByText(longDescription)).toBeInTheDocument();

    await userEvent.click(within(drawer).getByRole('button', { name: /close/i }));

    // Wait for drawer to close
    await waitFor(async () => {
      expect(drawer).not.toBeInTheDocument();
      expect(screen.queryByText(longDescription)).not.toBeInTheDocument();
    });
  });

  it('closes the description drawer with the "escape" key', async () => {
    const longDescription =
      'This is a very long description that should be truncated in the table view but can be expanded to show the full text. It contains a lot of information about the stack and its configuration, which is useful for users to understand the context and purpose of the stack.';
    const truncatedDesc = longDescription.slice(0, DESCRIPTION_TRUNCATE_LENGTH) + ' ...';
    const mockStack = { ...mockStacks[0], description: longDescription };
    await renderInTestEnv({
      stacks: [mockStack],
      loading: false,
      triggerRun: mockTriggerRun,
    });

    await userEvent.click(await screen.findByText(truncatedDesc));
    const drawer = await screen.findByRole('presentation');
    expect(drawer).toBeVisible();

    await userEvent.keyboard('{Escape}'); // Close drawer with Escape key

    // Wait for drawer to close
    await waitFor(async () => {
      expect(drawer).not.toBeVisible();
      expect(screen.queryByText(longDescription)).not.toBeInTheDocument();
    });
  });

  it('renders labels as chips', async () => {
    const mockStack = mockStacks[0];
    await renderInTestEnv({
      stacks: [mockStack],
      loading: false,
      triggerRun: mockTriggerRun,
    });
    expect(await screen.findByText('label1')).toBeInTheDocument();
    expect(await screen.findByText('label2')).toBeInTheDocument();
  });

  it('renders labels as neutral chips for unknown state', async () => {
    const mockStack = mockStacks[0];
    await renderInTestEnv({
      stacks: [{ ...mockStack, state: 'UNKNOWN' as Stack['state'] }],
      loading: false,
      triggerRun: mockTriggerRun,
    });
    expect(await screen.findByText('label1')).toBeInTheDocument();
    expect(await screen.findByText('label2')).toBeInTheDocument();
  });

  it('renders "-" if no labels are provided', async () => {
    const mockStack = mockStacks[0];
    await renderInTestEnv({
      stacks: [{ ...mockStack, labels: [] }],
      loading: false,
      triggerRun: mockTriggerRun,
    });
    expect(await screen.findByText('-')).toBeInTheDocument();
  });

  it('renders "-" when labels are empty', async () => {
    const mockStack = { ...mockStacks[0], labels: [] };
    await renderInTestEnv({
      stacks: [mockStack],
      loading: false,
      triggerRun: mockTriggerRun,
    });

    expect(await screen.findAllByText('-')).toHaveLength(1);
  });

  it('renders "Trigger run" button for allowed states and calls triggerRun on click', async () => {
    const allowsRerunStack = mockStacks.find(s => ALLOW_RETRY_STATES.includes(s.state))!;
    const notAllowsRerunStack = mockStacks.find(s => !ALLOW_RETRY_STATES.includes(s.state))!;

    await renderInTestEnv({
      stacks: [allowsRerunStack, notAllowsRerunStack],
      loading: false,
      triggerRun: mockTriggerRun,
    });

    const rows = await screen.findAllByRole('row');

    await Promise.all(
      [allowsRerunStack, notAllowsRerunStack].map(async stack => {
        const row = within(rows.find(r => r.textContent?.includes(stack.name))!);
        if (ALLOW_RETRY_STATES.includes(stack.state)) {
          expect(row.getByRole('button', { name: /trigger run/i })).toBeInTheDocument();
          await userEvent.click(await row.findByRole('button', { name: /trigger run/i }));
          expect(mockTriggerRun).toHaveBeenCalledWith(stack.id);
          return;
        }

        if (!ALLOW_RETRY_STATES.includes(stack.state)) {
          expect(row.queryByRole('button', { name: /trigger run/i })).not.toBeInTheDocument();
        }
      })
    );
  });

  it('shows loading state in the table', async () => {
    await renderInTestEnv({
      stacks: [],
      loading: true,
      triggerRun: mockTriggerRun,
    });

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });
});
