/**
 * Codemod: Replace `EnvironmentIndicator` with Mantine's `Badge`
 *
 * Transforms:
 *   import { EnvironmentIndicator } from '@ethanhann/nav';
 *   <EnvironmentIndicator environment="staging" color="orange" />
 *
 * Into:
 *   import { Badge } from '@mantine/core';
 *   <Badge color="orange" variant="light" size="sm">staging</Badge>
 */
import type { API, FileInfo } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Remove EnvironmentIndicator from @ethanhann/nav import
  root
    .find(j.ImportDeclaration, {
      source: { value: '@ethanhann/nav' },
    })
    .forEach((path) => {
      const specifiers = path.node.specifiers;
      if (!specifiers) return;

      const hasEnvIndicator = specifiers.some(
        (s) =>
          s.type === 'ImportSpecifier' &&
          s.imported.type === 'Identifier' &&
          s.imported.name === 'EnvironmentIndicator',
      );

      if (hasEnvIndicator) {
        path.node.specifiers = specifiers.filter(
          (s) =>
            !(
              s.type === 'ImportSpecifier' &&
              s.imported.type === 'Identifier' &&
              s.imported.name === 'EnvironmentIndicator'
            ),
        );

        if (path.node.specifiers!.length === 0) {
          j(path).remove();
        }

        hasChanges = true;
      }
    });

  if (hasChanges) {
    // Add Mantine Badge import
    const mantineImport = root.find(j.ImportDeclaration, {
      source: { value: '@mantine/core' },
    });

    if (mantineImport.length > 0) {
      const specifiers = mantineImport.get().node.specifiers || [];
      const hasBadge = specifiers.some(
        (s: any) =>
          s.type === 'ImportSpecifier' && s.imported.name === 'Badge',
      );
      if (!hasBadge) {
        specifiers.push(j.importSpecifier(j.identifier('Badge')));
      }
    } else {
      const newImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('Badge'))],
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

    // Transform JSX: <EnvironmentIndicator environment="X" color="Y" />
    // into: <Badge color="Y" variant="light" size="sm">X</Badge>
    root
      .find(j.JSXElement, {
        openingElement: {
          name: { type: 'JSXIdentifier', name: 'EnvironmentIndicator' },
        },
      })
      .forEach((path) => {
        const attrs = path.node.openingElement.attributes || [];
        let envValue: any = null;
        const otherAttrs: any[] = [];

        for (const attr of attrs) {
          if (
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'environment'
          ) {
            envValue = attr.value;
          } else {
            otherAttrs.push(attr);
          }
        }

        // Add variant="light" and size="sm"
        otherAttrs.push(
          j.jsxAttribute(j.jsxIdentifier('variant'), j.literal('light')),
        );
        otherAttrs.push(
          j.jsxAttribute(j.jsxIdentifier('size'), j.literal('sm')),
        );

        const children: any[] = [];
        if (envValue) {
          if (envValue.type === 'StringLiteral' || envValue.type === 'Literal') {
            children.push(j.jsxText(envValue.value));
          } else if (envValue.type === 'JSXExpressionContainer') {
            children.push(envValue);
          }
        }

        const newElement = j.jsxElement(
          j.jsxOpeningElement(j.jsxIdentifier('Badge'), otherAttrs, children.length === 0),
          children.length > 0 ? j.jsxClosingElement(j.jsxIdentifier('Badge')) : null,
          children,
        );

        j(path).replaceWith(newElement);
      });
  }

  return hasChanges ? root.toSource() : file.source;
}
