import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import jscodeshift from 'jscodeshift';

import renameSidebar from '../transforms/rename-sidebar.js';
import renameNavbar from '../transforms/rename-navbar.js';
import renameNavLayout from '../transforms/rename-nav-layout.js';
import removeNavProvider from '../transforms/remove-nav-provider.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '__testfixtures__');

function readFixture(name: string): string {
  return readFileSync(resolve(fixturesDir, name), 'utf-8');
}

function runTransform(
  transform: (file: any, api: any) => string,
  input: string,
): string {
  const api = {
    jscodeshift: jscodeshift.withParser('tsx'),
    stats: () => {},
    report: () => {},
  };
  return transform(
    { source: input, path: 'test.tsx' },
    api,
  );
}

describe('rename-sidebar', () => {
  it('renames Sidebar to NavSidebar in imports and JSX', () => {
    const input = readFixture('rename-sidebar.input.tsx');
    const expected = readFixture('rename-sidebar.output.tsx');
    const result = runTransform(renameSidebar, input);
    expect(result.trim()).toBe(expected.trim());
  });

  it('does not modify files without Sidebar usage', () => {
    const input = `import { NavGroup } from '@ethanhann/nav';\n<NavGroup items={[]} />;`;
    const result = runTransform(renameSidebar, input);
    expect(result).toBe(input);
  });
});

describe('rename-navbar', () => {
  it('renames NavBar to NavHeader in imports and JSX', () => {
    const input = readFixture('rename-navbar.input.tsx');
    const expected = readFixture('rename-navbar.output.tsx');
    const result = runTransform(renameNavbar, input);
    expect(result.trim()).toBe(expected.trim());
  });

  it('does not modify files without NavBar usage', () => {
    const input = `import { NavGroup } from '@ethanhann/nav';\n<NavGroup items={[]} />;`;
    const result = runTransform(renameNavbar, input);
    expect(result).toBe(input);
  });
});

describe('rename-nav-layout', () => {
  it('renames NavLayout to NavShell in imports and JSX', () => {
    const input = readFixture('rename-nav-layout.input.tsx');
    const expected = readFixture('rename-nav-layout.output.tsx');
    const result = runTransform(renameNavLayout, input);
    expect(result.trim()).toBe(expected.trim());
  });
});

describe('remove-nav-provider', () => {
  it('removes NavProvider wrapper and import', () => {
    const input = `import { NavProvider, NavGroup } from '@ethanhann/nav';

function App() {
  return (
    <NavProvider value={{}}>
      <NavGroup items={[]} />
    </NavProvider>
  );
}`;

    const result = runTransform(removeNavProvider, input);

    expect(result).not.toContain('NavProvider');
    expect(result).toContain('NavGroup');
    expect(result).toContain("'@ethanhann/nav'");
  });

  it('removes entire import if NavProvider was the only import', () => {
    const input = `import { NavProvider } from '@ethanhann/nav';

function App() {
  return (
    <NavProvider>
      <div>Content</div>
    </NavProvider>
  );
}`;

    const result = runTransform(removeNavProvider, input);
    expect(result).not.toContain("'@ethanhann/nav'");
    expect(result).not.toContain('NavProvider');
    expect(result).toContain('Content');
  });

  it('does not modify files without NavProvider', () => {
    const input = `import { NavShell } from '@ethanhann/nav';\n<NavShell>content</NavShell>;`;
    const result = runTransform(removeNavProvider, input);
    expect(result).toBe(input);
  });
});
