import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { createSpaceliftService } from '@veecode/spacelift-io-shared';

/**
 * spaceliftIoPlugin backend plugin
 *
 * @public
 */
export const spaceliftIoPlugin = createBackendPlugin({
  pluginId: 'spacelift-io',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ logger, httpAuth, httpRouter, config }) {
        const spaceliftService = await createSpaceliftService({
          logger,
          api: {
            hostUrl: config.getString('spacelift.hostUrl'),
            apiKey: config.getString('spacelift.apiKey'),
            apiSecret: config.getString('spacelift.apiSecret'),
          },
        });

        httpRouter.use(
          await createRouter({
            httpAuth,
            spaceliftService,
            logger,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
