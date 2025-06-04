import { createApiRef, DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { Stack, TriggerRunResponse } from '../types';

export interface ISpaceliftApi {
  getStacks(): Promise<Stack[]>;
  triggerRun(stackId: string): Promise<TriggerRunResponse>;
}

export const spaceliftApiRef = createApiRef<ISpaceliftApi>({
  id: 'plugin.spacelift.io.service',
});

export class SpaceliftApi implements ISpaceliftApi {
  constructor(private discoveryApi: DiscoveryApi, private fetchApi: FetchApi) {}

  async getStacks(): Promise<Stack[]> {
    const url = await this.discoveryApi.getBaseUrl('spacelift-io');

    const response = await this.fetchApi.fetch(`${url}/stacks`);
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }
    return response.json();
  }

  async triggerRun(stackId: string): Promise<TriggerRunResponse> {
    const url = await this.discoveryApi.getBaseUrl('spacelift-io');

    const response = await this.fetchApi.fetch(`${url}/stacks/${stackId}/trigger`, {
      method: 'POST',
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }
    return response.json();
  }
}
