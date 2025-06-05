import { useApi } from '@backstage/core-plugin-api';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { TriggerRunResponse } from '../types';
import { useTriggerRun } from './useTriggerRun';

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
const mockStackId = 'stack123';
const mockResponse: TriggerRunResponse = { id: 'run-abc', state: 'APPLYING' };
const mockError = new Error('Failed to trigger run');

describe('useTriggerRun', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue(mockSpaceliftApi);
    mockSpaceliftApi.triggerRun.mockClear();
  });

  it('should initialize with loading false and null error', () => {
    const { result } = renderHook(() => useTriggerRun());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should trigger run successfully and return response', async () => {
    mockSpaceliftApi.triggerRun.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useTriggerRun());

    let response: TriggerRunResponse | null = null;
    await act(async () => {
      response = await result.current.triggerRun(mockStackId);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(response).toEqual(mockResponse);
    expect(mockSpaceliftApi.triggerRun).toHaveBeenCalledWith(mockStackId);
    expect(mockSpaceliftApi.triggerRun).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when triggering run', async () => {
    mockSpaceliftApi.triggerRun.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTriggerRun());

    let response: TriggerRunResponse | null = null;
    await act(async () => {
      response = await result.current.triggerRun(mockStackId);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(response).toBeNull();
    expect(mockSpaceliftApi.triggerRun).toHaveBeenCalledWith(mockStackId);
    expect(mockSpaceliftApi.triggerRun).toHaveBeenCalledTimes(1);
  });

  it('should set loading to true during the API call and false afterwards', async () => {
    mockSpaceliftApi.triggerRun.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useTriggerRun());

    act(() => {
      result.current.triggerRun(mockStackId);
    });

    expect(result.current.loading).toBe(true);

    await waitFor(async () => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should clear error when clear function is called', async () => {
    mockSpaceliftApi.triggerRun.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useTriggerRun());

    await act(async () => {
      await result.current.triggerRun(mockStackId);
    });
    expect(result.current.error).toEqual(mockError);

    act(() => {
      result.current.clear();
    });

    expect(result.current.error).toBeNull();
  });
});
