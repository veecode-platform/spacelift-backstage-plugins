import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createDummyAction, createTriggerRunAction, createStackAction } from './actions';

/**
 * Spacelift.io scaffolder actions plugin
 *
 * @public
 */
export const spaceliftScaffolderActionsModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'spacelift-actions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolderActions, config }) {
        scaffolderActions.addActions(
          createDummyAction(),
          createTriggerRunAction({ config }),
          createStackAction({ config })
        );
      },
    });
  },
});
