/**
 * Codemod: Rename `NavLayout` → `NavShell`
 *
 * Transforms:
 *   import { NavLayout } from '@ethanhann/nav';
 *   <NavLayout>...</NavLayout>
 *
 * Into:
 *   import { NavShell } from '@ethanhann/nav';
 *   <NavShell>...</NavShell>
 */
import type { API, FileInfo } from 'jscodeshift';

const RENAMES: Record<string, string> = {
  NavLayout: 'NavShell',
  NavLayoutProps: 'NavShellProps',
};

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Rename import specifiers
  root
    .find(j.ImportDeclaration, {
      source: { value: '@ethanhann/nav' },
    })
    .forEach((path) => {
      path.node.specifiers?.forEach((specifier) => {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier'
        ) {
          const newName = RENAMES[specifier.imported.name];
          if (newName) {
            specifier.imported.name = newName;
            if (
              specifier.local &&
              specifier.local.type === 'Identifier' &&
              specifier.local.name in RENAMES
            ) {
              specifier.local.name = newName;
            }
            hasChanges = true;
          }
        }
      });
    });

  // Rename JSX usage
  for (const [oldName, newName] of Object.entries(RENAMES)) {
    if (oldName.endsWith('Props')) continue;
    root
      .find(j.JSXIdentifier, { name: oldName })
      .forEach((path) => {
        const parent = path.parent.node;
        if (
          parent.type === 'JSXOpeningElement' ||
          parent.type === 'JSXClosingElement'
        ) {
          path.node.name = newName;
          hasChanges = true;
        }
      });
  }

  return hasChanges ? root.toSource() : file.source;
}
