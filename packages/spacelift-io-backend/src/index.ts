export { spaceliftIoPlugin as default } from './plugin';

// Export Spacelift service for reuse in other packages
export { createSpaceliftService } from './services/Spacelift/Spacelift.service';
export type { SpaceliftService, SpaceliftServiceCtx } from './services/Spacelift/types';

// Export types for scaffolder actions
export type { Stack, TriggerRunResponse } from './types';
