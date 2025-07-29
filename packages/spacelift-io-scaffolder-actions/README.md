# @spacelift-io/backstage-scaffolder-actions

This package provides Backstage scaffolder actions for Spacelift.io integration.

## Installation

```bash
yarn add @spacelift-io/backstage-scaffolder-actions
```

## Usage

In your Backstage backend, register the module:

```typescript
import { spaceliftScaffolderActionsModule } from '@spacelift-io/backstage-scaffolder-actions';

const backend = createBackend();
backend.add(spaceliftScaffolderActionsModule);
```

**Important**: Scaffolder actions are modules that extend the scaffolder plugin, not standalone plugins. The module targets the `scaffolder` plugin with a unique `moduleId`.

## Available Actions

### `spacelift:dummy`

A simple dummy action for demonstration purposes.

**Input:**
- `message` (optional): A message to log (default: "Hello from Spacelift.io scaffolder action!")
- `name` (optional): Name to include in the greeting

**Example usage in a template:**

```yaml
steps:
  - id: spacelift-dummy
    name: Run Spacelift dummy action
    action: spacelift:dummy
    input:
      message: "Welcome to Spacelift!"
      name: "Developer"
```

## Development

This plugin follows the standard Backstage plugin development practices:

```bash
# Install dependencies
yarn install

# Build the plugin
yarn build

# Run tests
yarn test

# Start in development mode
yarn start
```
