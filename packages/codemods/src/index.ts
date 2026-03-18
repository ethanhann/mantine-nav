export { default as renameSidebar } from './transforms/rename-sidebar.js';
export { default as renameNavbar } from './transforms/rename-navbar.js';
export { default as renameNavLayout } from './transforms/rename-nav-layout.js';
export { default as removeNavProvider } from './transforms/remove-nav-provider.js';
export { default as replaceBreadcrumbs } from './transforms/replace-breadcrumbs.js';
export { default as replaceEnvIndicator } from './transforms/replace-env-indicator.js';

export const TRANSFORMS = [
  'rename-sidebar',
  'rename-navbar',
  'rename-nav-layout',
  'remove-nav-provider',
  'replace-breadcrumbs',
  'replace-env-indicator',
] as const;

export type TransformName = (typeof TRANSFORMS)[number];
