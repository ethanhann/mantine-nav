/**
 * Codemod: Replace `NavBreadcrumbs` with Mantine's `Breadcrumbs`
 *
 * Transforms:
 *   import { NavBreadcrumbs } from '@ethanhann/nav';
 *   <NavBreadcrumbs items={...} />
 *
 * Into:
 *   import { Breadcrumbs, Anchor } from '@mantine/core';
 *   <Breadcrumbs>{items.map(item => <Anchor href={item.href}>{item.label}</Anchor>)}</Breadcrumbs>
 *
 * NOTE: This transform renames the import and component. The consumer will need
 * to manually adjust the children pattern since Mantine's Breadcrumbs takes
 * children instead of an `items` prop.
 */
import type { API, FileInfo } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Remove NavBreadcrumbs from @ethanhann/nav import
  root
    .find(j.ImportDeclaration, {
      source: { value: '@ethanhann/nav' },
    })
    .forEach((path) => {
      const specifiers = path.node.specifiers;
      if (!specifiers) return;

      const hasNavBreadcrumbs = specifiers.some(
        (s) =>
          s.type === 'ImportSpecifier' &&
          s.imported.type === 'Identifier' &&
          s.imported.name === 'NavBreadcrumbs',
      );

      if (hasNavBreadcrumbs) {
        path.node.specifiers = specifiers.filter(
          (s) =>
            !(
              s.type === 'ImportSpecifier' &&
              s.imported.type === 'Identifier' &&
              s.imported.name === 'NavBreadcrumbs'
            ),
        );

        // Remove entire import if empty
        if (path.node.specifiers!.length === 0) {
          j(path).remove();
        }

        hasChanges = true;
      }
    });

  if (hasChanges) {
    // Add Mantine import for Breadcrumbs
    const mantineImport = root.find(j.ImportDeclaration, {
      source: { value: '@mantine/core' },
    });

    if (mantineImport.length > 0) {
      // Add Breadcrumbs to existing Mantine import
      const specifiers = mantineImport.get().node.specifiers || [];
      const hasBreadcrumbs = specifiers.some(
        (s: any) =>
          s.type === 'ImportSpecifier' &&
          s.imported.name === 'Breadcrumbs',
      );
      if (!hasBreadcrumbs) {
        specifiers.push(
          j.importSpecifier(j.identifier('Breadcrumbs')),
        );
      }
    } else {
      // Create new Mantine import
      const newImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('Breadcrumbs'))],
        j.literal('@mantine/core'),
      );
      const body = root.get().node.program.body;
      const lastImportIdx = body.reduce(
        (acc: number, node: any, i: number) =>
          node.type === 'ImportDeclaration' ? i : acc,
        -1,
      );
      body.splice(lastImportIdx + 1, 0, newImport);
    }

    // Rename JSX usage
    root
      .find(j.JSXIdentifier, { name: 'NavBreadcrumbs' })
      .forEach((path) => {
        const parent = path.parent.node;
        if (
          parent.type === 'JSXOpeningElement' ||
          parent.type === 'JSXClosingElement'
        ) {
          path.node.name = 'Breadcrumbs';
        }
      });
  }

  return hasChanges ? root.toSource() : file.source;
}
