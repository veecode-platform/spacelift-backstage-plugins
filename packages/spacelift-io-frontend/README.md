# Spacelift Frontend Plugin

This frontend plugin for Backstage provides a user interface to view and interact with your Spacelift stacks and runs.

## Installation

1. Install the plugin package in your Backstage frontend app:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @veecode/spacelift-io-backstage-integration-frontend
   ```

2. Add the plugin to your `packages/app/src/App.tsx`:

   ```tsx
   // packages/app/src/App.tsx
   import { SpaceliftIoPage } from '@veecode/spacelift-io-backstage-integration-frontend';

   // ...

   const routes = (
     <FlatRoutes>
       {/* ...other routes */}
       <Route path="/spacelift" element={<SpaceliftIoPage />} />
     </FlatRoutes>
   );
   ```

3. Add the plugin to the sidebar in `packages/app/src/components/Root/Root.tsx`:

   ```tsx
   // packages/app/src/components/Root/Root.tsx
   import SpaceliftIcon from '@material-ui/icons/CloudQueue'; // Example icon, choose an appropriate one

   // ...

   export const Root = ({ children }: PropsWithChildren<{}>) => (
     <SidebarPage>
       <Sidebar>
         {/* ...other sidebar items */}
         <SidebarItem icon={SpaceliftIcon} to="spacelift" text="Spacelift" />
       </Sidebar>
       {/* ... */}
     </SidebarPage>
   );
   ```

## Configuration

This plugin requires the `spacelift.hostUrl` to be configured in your `app-config.yaml` to allow the frontend to make requests to the Spacelift API via the backend plugin.

```yaml
spacelift:
  hostUrl: '<your-subdomain>.app.spacelift.io' # Your Spacelift instance URL (WITHOUT https://)
```

Make sure to replace `<your-subdomain>` with your actual Spacelift subdomain.

### Important Note on Permissions

This frontend plugin relies on the permissions configured for the Spacelift API Key in the backend plugin. It does not implement separate user-level permission checks within the frontend components.

Ensure that your Backstage instance has appropriate general permissions set up to control access to this plugin's pages and functionalities. This is crucial to prevent users from performing actions in Spacelift for which they are not authorized via the configured API key.

## Compatibility

This plugin requires:

- `@backstage/core-components` >= 0.17.1
- `@backstage/core-plugin-api` >= 1.10.6
- `@backstage/plugin-catalog-react` >= 1.17.0

It is compatible with Backstage 1.17.0 or later.

## Backend Plugin

This frontend plugin requires the [Spacelift Backend Plugin](https://github.com/spacelift-io/backstage-plugins/blob/main/packages/spacelift-io-backend/README.md) to be installed and configured.

## Spacelift Documentation

For more information about Spacelift, please refer to the [official Spacelift documentation](https://docs.spacelift.io/integrations/external-integrations/backstage).
