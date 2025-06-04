import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { SpaceliftApi, spaceliftApiRef } from './api/SpaceliftApiClient';
import { rootRouteRef } from './routes';

export const spaceliftIoPlugin = createPlugin({
  id: 'spacelift',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: spaceliftApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) => new SpaceliftApi(discoveryApi, fetchApi),
    }),
  ],
});

export const SpaceliftIoPage = spaceliftIoPlugin.provide(
  createRoutableExtension({
    name: 'SpaceliftIoPage',
    component: () => import('./components/Stacks').then(m => m.StacksPage),
    mountPoint: rootRouteRef,
  })
);
