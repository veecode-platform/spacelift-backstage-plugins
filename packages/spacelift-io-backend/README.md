# Spacelift Backend Plugin

This backend plugin for Backstage integrates with Spacelift to provide information about your Spacelift stacks and runs.

## Installation

1. Install the plugin package in your Backstage backend:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/backend add @spacelift-io/backstage-integration-backend
   ```

2. Add the plugin to your backend in `packages/backend/src/index.ts`:

   ```ts
   // packages/backend/src/index.ts
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();
   // ...
   backend.add(import('@spacelift-io/backstage-integration-backend'));
   // ...
   await backend.start();
   ```

## Configuration

To use this plugin, you need to configure it in your `app-config.yaml`. Add the following section:

```yaml
spacelift:
  hostUrl: 'https://<your-subdomain>.app.spacelift.io' # Your Spacelift instance URL
  apiKey: ${SPACELIFT_API_KEY} # Your Spacelift API Key ID
  apiSecret: ${SPACELIFT_API_SECRET} # Your Spacelift API Key Secret
```

Make sure to replace `<your-subdomain>` with your actual Spacelift subdomain.
The `apiKey` and `apiSecret` should be stored securely, for example, as environment variables.

## Compatibility

This plugin requires:

- `@backstage/backend-plugin-api` >= 1.3.0
- `@backstage/backend-defaults` >= 0.9.0
- `@backstage/catalog-client` >= 1.9.1

It is compatible with Backstage 1.17.0 or later.

## Frontend Plugin

This backend plugin is intended to be used with the [Spacelift Frontend Plugin](https://github.com/spacelift-io/backstage-plugins/blob/main/packages/spacelift-io-frontend/README.md).

## Spacelift Documentation

For more information about Spacelift and its API, please refer to the [official Spacelift documentation](https://docs.spacelift.io/integrations/external-integrations/backstage).
