/**
 * Codemod: Remove `NavProvider` wrapper
 *
 * In v2, NavShell provides context directly — NavProvider is no longer needed.
 *
 * Transforms:
 *   import { NavProvider } from '@ethanhann/nav';
 *   <NavProvider value={...}>
 *     {children}
 *   </NavProvider>
 *
 * Into:
 *   {children}
 *
 * Also removes the NavProvider import.
 */
import type { API, FileInfo } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Remove NavProvider JSX — unwrap children
  root
    .find(j.JSXElement, {
      openingElement: {
        name: { type: 'JSXIdentifier', name: 'NavProvider' },
      },
    })
    .forEach((path) => {
      // Replace <NavProvider ...>{children}</NavProvider> with just {children}
      const children = path.node.children;
      if (children.length === 1) {
        j(path).replaceWith(children[0]);
      } else {
        j(path).replaceWith(j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), children));
      }
      hasChanges = true;
    });

  // Remove NavProvider from import
  root
    .find(j.ImportDeclaration, {
      source: { value: '@ethanhann/nav' },
    })
    .forEach((path) => {
      const specifiers = path.node.specifiers;
      if (!specifiers) return;

      const filtered = specifiers.filter((s) => {
        if (
          s.type === 'ImportSpecifier' &&
          s.imported.type === 'Identifier' &&
          (s.imported.name === 'NavProvider' || s.imported.name === 'NavProviderProps')
        ) {
          hasChanges = true;
          return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        j(path).remove();
      } else {
        path.node.specifiers = filtered;
      }
    });

  return hasChanges ? root.toSource() : file.source;
}
