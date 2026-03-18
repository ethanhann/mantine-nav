/**
 * Codemod: Rename `Sidebar` → `NavSidebar`
 *
 * Transforms:
 *   import { Sidebar } from '@ethanhann/nav';
 *   <Sidebar>...</Sidebar>
 *
 * Into:
 *   import { NavSidebar } from '@ethanhann/nav';
 *   <NavSidebar>...</NavSidebar>
 */
import type { API, FileInfo } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Rename import specifier
  root
    .find(j.ImportDeclaration, {
      source: { value: '@ethanhann/nav' },
    })
    .forEach((path) => {
      path.node.specifiers?.forEach((specifier) => {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === 'Sidebar'
        ) {
          specifier.imported.name = 'NavSidebar';
          if (
            specifier.local &&
            specifier.local.type === 'Identifier' &&
            specifier.local.name === 'Sidebar'
          ) {
            specifier.local.name = 'NavSidebar';
          }
          hasChanges = true;
        }
      });
    });

  // Rename JSX usage: <Sidebar> → <NavSidebar>
  root
    .find(j.JSXIdentifier, { name: 'Sidebar' })
    .forEach((path) => {
      // Only rename if it's a component (starts with uppercase) in opening/closing tags
      const parent = path.parent.node;
      if (
        parent.type === 'JSXOpeningElement' ||
        parent.type === 'JSXClosingElement'
      ) {
        path.node.name = 'NavSidebar';
        hasChanges = true;
      }
    });

  // Rename type imports: SidebarProps → NavSidebarProps
  root
    .find(j.ImportDeclaration, {
      source: { value: '@ethanhann/nav' },
    })
    .forEach((path) => {
      path.node.specifiers?.forEach((specifier) => {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === 'SidebarProps'
        ) {
          specifier.imported.name = 'NavSidebarProps';
          if (
            specifier.local &&
            specifier.local.type === 'Identifier' &&
            specifier.local.name === 'SidebarProps'
          ) {
            specifier.local.name = 'NavSidebarProps';
          }
          hasChanges = true;
        }
      });
    });

  // Rename all remaining Identifier references (type annotations, variable refs)
  const renames: Record<string, string> = { Sidebar: 'NavSidebar', SidebarProps: 'NavSidebarProps' };
  for (const [oldName, newName] of Object.entries(renames)) {
    root
      .find(j.Identifier, { name: oldName })
      .forEach((path) => {
        if (path.parent.node.type === 'ImportSpecifier') return;
        if (path.parent.node.type === 'JSXOpeningElement') return;
        if (path.parent.node.type === 'JSXClosingElement') return;
        path.node.name = newName;
        hasChanges = true;
      });
  }

  return hasChanges ? root.toSource() : file.source;
}
