import { useApi } from '@backstage/core-plugin-api';
import { act, renderHook } from '@testing-library/react';
import { generateMockStacks } from '../../../spacelift-io-backend/src/__test__/mocks/stack';
import { POLL_INTERVAL } from '../constants';
import { useFetchStacks } from './useFetchStacks';

// Mock dependencies
jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

const mockSpaceliftApi = {
  getStacks: jest.fn(),
  triggerRun: jest.fn(),
};

const mockUseApi = useApi as jest.Mock;

describe('useFetchStacks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUseApi.mockReturnValue(mockSpaceliftApi);
    mockSpaceliftApi.getStacks.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should initialize with loading true, empty stacks, and null error', () => {
    const { result, unmount } = renderHook(() => useFetchStacks());

    // Ensure no stacks are fetched initially
    // clears interval immediately
    act(() => {
      unmount();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.stacks).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mockSpaceliftApi.getStacks).toHaveBeenCalledTimes(1);
  });

  it('should fetch stacks successfully and update state', async () => {
    const mockStacks = generateMockStacks(3);
    mockSpaceliftApi.getStacks.mockResolvedValue(mockStacks);

    const { result } = renderHook(() => useFetchStacks());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stacks).toEqual(mockStacks);
    expect(result.current.error).toBeNull();
    expect(mockSpaceliftApi.getStacks).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when fetching stacks', async () => {
    const mockError = new Error('Failed to fetch');
    mockSpaceliftApi.getStacks.mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetchStacks());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stacks).toEqual([]);
    expect(result.current.error).toEqual(mockError);
    expect(mockSpaceliftApi.getStacks).toHaveBeenCalledTimes(1);
  });

  it('should poll for stacks at the defined interval', async () => {
    const mockStacks1 = generateMockStacks(2);
    const mockStacks2 = generateMockStacks(3);

    mockSpaceliftApi.getStacks
      .mockResolvedValueOnce(mockStacks1)
      .mockResolvedValueOnce(mockStacks2);

    const { result } = renderHook(() => useFetchStacks());

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.stacks).toEqual(mockStacks1);
    expect(mockSpaceliftApi.getStacks).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL);
    });

    expect(result.current.stacks).toEqual(mockStacks2);
    expect(mockSpaceliftApi.getStacks).toHaveBeenCalledTimes(2);
  });

  it('should clear interval on unmount', async () => {
    mockSpaceliftApi.getStacks.mockResolvedValue([]);
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useFetchStacks());
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockSpaceliftApi.getStacks).toHaveBeenCalledTimes(1);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    clearIntervalSpy.mockRestore();
  });

  it('should retry fetching when retry function is called', async () => {
    const mockError = new Error('Fetch failed initially');
    const mockStacks = generateMockStacks(2);

    mockSpaceliftApi.getStacks.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockStacks);

    const { result } = renderHook(() => useFetchStacks());

    // Initial fetch (fails)
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.error).toEqual(mockError);
    expect(mockSpaceliftApi.getStacks).toHaveBeenCalledTimes(1);

    // Call retry
    await act(async () => {
      result.current.retry();
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stacks).toEqual(mockStacks);
    expect(result.current.error).toBeNull();
    expect(mockSpaceliftApi.getStacks).toHaveBeenCalledTimes(2);
  });

  it('should clear error when clear function is called', async () => {
    const mockError = new Error('Fetch failed');
    mockSpaceliftApi.getStacks.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useFetchStacks());

    // Initial fetch (fails)
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.error).toEqual(mockError);

    // Call clear
    act(() => {
      result.current.clear();
    });

    expect(result.current.error).toBeNull();
  });
});
