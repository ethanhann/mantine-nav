/**
 * Codemod: Rename `NavBar` → `NavHeader`
 *
 * Transforms:
 *   import { NavBar } from '@ethanhann/nav';
 *   <NavBar>...</NavBar>
 *
 * Into:
 *   import { NavHeader } from '@ethanhann/nav';
 *   <NavHeader>...</NavHeader>
 */
import type { API, FileInfo } from 'jscodeshift';

const RENAMES: Record<string, string> = {
  NavBar: 'NavHeader',
  NavBarProps: 'NavHeaderProps',
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
            const oldLocal = specifier.local?.type === 'Identifier'
              ? specifier.local.name
              : specifier.imported.name;
            specifier.imported.name = newName;
            if (oldLocal === Object.keys(RENAMES).find((k) => RENAMES[k] === newName || k === oldLocal)) {
              if (specifier.local && specifier.local.type === 'Identifier') {
                specifier.local.name = newName;
              }
            }
            hasChanges = true;
          }
        }
      });
    });

  // Rename JSX usage
  for (const [oldName, newName] of Object.entries(RENAMES)) {
    if (oldName.endsWith('Props')) continue; // Skip type-only renames for JSX
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

  // Rename Identifier references (e.g., in type annotations)
  for (const [oldName, newName] of Object.entries(RENAMES)) {
    root
      .find(j.Identifier, { name: oldName })
      .forEach((path) => {
        // Skip import specifiers (already handled)
        if (path.parent.node.type === 'ImportSpecifier') return;
        // Skip JSX identifiers (already handled)
        if (path.parent.node.type === 'JSXOpeningElement') return;
        if (path.parent.node.type === 'JSXClosingElement') return;
        path.node.name = newName;
        hasChanges = true;
      });
  }

  return hasChanges ? root.toSource() : file.source;
}
