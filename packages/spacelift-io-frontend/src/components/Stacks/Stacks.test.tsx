import { configApiRef } from '@backstage/core-plugin-api';
import { mockApis, renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { act } from 'react';

import { generateMockStacks } from '../../__test__/mocks/stacks.ts';
import { useFetchStacks } from '../../hooks/useFetchStacks';
import { useTriggerRun } from '../../hooks/useTriggerRun';
import { StacksPage } from './Stacks.tsx';

// Mock the hooks
jest.mock('../../hooks/useFetchStacks');
jest.mock('../../hooks/useTriggerRun');

// Mock SpaceliftStacksTable for specific tests
jest.mock('../SpaceliftStacksTable', () => ({
  SpaceliftStacksTable: jest.fn(() => <div data-testid="mock-spacelift-stacks-table"></div>),
}));

const mockUseFetchStacks = useFetchStacks as jest.Mock;
const mockUseTriggerRun = useTriggerRun as jest.Mock;

const mockGetStacks = jest.fn();
const mockClearStacksError = jest.fn();
const mockTriggerRun = jest.fn();
const mockClearTriggerRunError = jest.fn();

const mockConfig = mockApis.config({
  data: {
    spacelift: { hostUrl: 'test.spacelift.io' },
  },
});

const renderInTestEnv = async (children: React.ReactNode) => {
  return renderInTestApp(
    <TestApiProvider apis={[[configApiRef, mockConfig]]}>{children}</TestApiProvider>
  );
};

describe('StacksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFetchStacks.mockReturnValue({
      stacks: [],
      loading: false,
      error: null,
      retry: mockGetStacks,
      clear: mockClearStacksError,
    });
    mockUseTriggerRun.mockReturnValue({
      triggerRun: mockTriggerRun,
      loading: false,
      error: null,
      clear: mockClearTriggerRunError,
    });
  });

  it('renders header and content', async () => {
    await renderInTestEnv(<StacksPage />);

    expect(await screen.findByRole('heading', { name: 'Spacelift' })).toBeInTheDocument();
    expect(await screen.findByText('Manage your stacks')).toBeInTheDocument();
    expect(await screen.findByText('List of stacks')).toBeInTheDocument();
  });

  it('displays stacks error alert when stacksError is present', async () => {
    const errorMessage = 'Failed to load stacks';
    mockUseFetchStacks.mockReturnValue({
      stacks: [],
      loading: false,
      error: new Error(errorMessage),
      retry: mockGetStacks,
      clear: mockClearStacksError,
    });

    await renderInTestEnv(<StacksPage />);
    expect(
      await screen.findByText(`Failed to load Spacelift stacks: ${errorMessage}`)
    ).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: /RETRY/i }));
    expect(mockGetStacks).toHaveBeenCalledTimes(1);
  });

  it('displays trigger run error alert when errorTriggerRun is present and no stacksError', async () => {
    const errorMessage = 'Failed to trigger run';
    mockUseTriggerRun.mockReturnValue({
      triggerRun: mockTriggerRun,
      loading: false,
      error: new Error(errorMessage),
      clear: mockClearTriggerRunError,
    });

    await renderInTestEnv(<StacksPage />);
    expect(await screen.findByText(`Spacelift action failed: ${errorMessage}`)).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: /close/i }));
    expect(mockClearTriggerRunError).toHaveBeenCalledTimes(1);
  });

  it('renders SpaceliftStacksTable with correct props', async () => {
    const mockStacksData = generateMockStacks(1);
    mockUseFetchStacks.mockReturnValue({
      stacks: mockStacksData,
      loading: false,
      error: null,
      retry: mockGetStacks,
      clear: mockClearStacksError,
    });
    await renderInTestEnv(<StacksPage />);

    expect(screen.getByTestId('mock-spacelift-stacks-table')).toBeInTheDocument();

    // Verify props passed to the mock
    const MockSpaceliftStacksTable = require('../SpaceliftStacksTable')
      .SpaceliftStacksTable as jest.Mock;
    expect(MockSpaceliftStacksTable).toHaveBeenCalledWith(
      expect.objectContaining({
        stacks: mockStacksData,
        loading: false,
      }),
      expect.anything() // Second argument for component context if any
    );
  });

  it('calls triggerRun and then getStacks on successful run trigger', async () => {
    mockTriggerRun.mockResolvedValue({ id: 'run123' });
    await renderInTestEnv(<StacksPage />);

    const MockSpaceliftStacksTable = require('../SpaceliftStacksTable')
      .SpaceliftStacksTable as jest.Mock;
    // Ensure the mock was called (i.e., the component rendered)
    expect(MockSpaceliftStacksTable).toHaveBeenCalled();

    // Get the props from the latest call to the mock
    const lastCallIndex = MockSpaceliftStacksTable.mock.calls.length - 1;
    const tableProps = MockSpaceliftStacksTable.mock.calls[lastCallIndex][0];

    // Check if tableProps and triggerRun are defined before calling
    if (tableProps && typeof tableProps.triggerRun === 'function') {
      await act(async () => {
        tableProps.triggerRun('stack1');
      });
      await waitFor(() => expect(mockTriggerRun).toHaveBeenCalledWith('stack1'));
      await waitFor(() => expect(mockGetStacks).toHaveBeenCalledTimes(1));
    } else {
      throw new Error('SpaceliftStacksTable mock not called with expected triggerRun prop');
    }
  });

  it('calls triggerRun and do not trigger getStacks on an error call', async () => {
    mockTriggerRun.mockResolvedValue(null);
    await renderInTestEnv(<StacksPage />);

    const MockSpaceliftStacksTable = require('../SpaceliftStacksTable')
      .SpaceliftStacksTable as jest.Mock;
    // Ensure the mock was called (i.e., the component rendered)
    expect(MockSpaceliftStacksTable).toHaveBeenCalled();

    // Get the props from the latest call to the mock
    const lastCallIndex = MockSpaceliftStacksTable.mock.calls.length - 1;
    const tableProps = MockSpaceliftStacksTable.mock.calls[lastCallIndex][0];

    // Check if tableProps and triggerRun are defined before calling
    if (tableProps && typeof tableProps.triggerRun === 'function') {
      await act(async () => {
        tableProps.triggerRun('stack1');
      });
      await waitFor(() => expect(mockTriggerRun).toHaveBeenCalledWith('stack1'));
      await waitFor(() => expect(mockGetStacks).toHaveBeenCalledTimes(0));
    } else {
      throw new Error('SpaceliftStacksTable mock not called with expected triggerRun prop');
    }
  });

  it('shows loading state correctly by passing loading prop', async () => {
    mockUseFetchStacks.mockReturnValue({
      stacks: [],
      loading: true, // Set loading to true
      error: null,
      retry: mockGetStacks,
      clear: mockClearStacksError,
    });
    await renderInTestEnv(<StacksPage />);

    const MockSpaceliftStacksTable = require('../SpaceliftStacksTable')
      .SpaceliftStacksTable as jest.Mock;
    expect(MockSpaceliftStacksTable).toHaveBeenCalledWith(
      expect.objectContaining({
        loading: true,
      }),
      expect.anything()
    );
  });
});
