#!/usr/bin/env node

/**
 * CLI for running @ethanhann/nav v1 → v2 codemods.
 *
 * Usage:
 *   npx @ethanhann/nav-codemods --path ./src
 *   npx @ethanhann/nav-codemods --transform rename-sidebar --path ./src
 *   npx @ethanhann/nav-codemods --path ./src --dry
 *   npx @ethanhann/nav-codemods --list
 */

import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRANSFORMS } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function printUsage() {
  console.log(`
Usage: nav-codemods [options]

Options:
  --path <dir>         Directory to run codemods on (required unless --list)
  --transform <name>   Run a specific transform (default: all)
  --dry                Dry run — show changes without writing
  --list               List available transforms
  --help               Show this help

Available transforms:
${TRANSFORMS.map((t) => `  - ${t}`).join('\n')}
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--list')) {
    console.log('Available transforms:');
    for (const t of TRANSFORMS) {
      console.log(`  ${t}`);
    }
    process.exit(0);
  }

  const pathIdx = args.indexOf('--path');
  const targetPath = pathIdx >= 0 ? args[pathIdx + 1] : null;
  if (!targetPath) {
    console.error('Error: --path is required');
    process.exit(1);
  }

  const transformIdx = args.indexOf('--transform');
  const specificTransform = transformIdx >= 0 ? args[transformIdx + 1] : null;
  const isDry = args.includes('--dry');

  const transforms = specificTransform
    ? [specificTransform]
    : [...TRANSFORMS];

  for (const transform of transforms) {
    const transformPath = resolve(__dirname, 'transforms', `${transform}.ts`);
    const cmd = [
      'npx',
      'jscodeshift',
      '--parser=tsx',
      `--transform=${transformPath}`,
      '--extensions=tsx,ts,jsx,js',
      isDry ? '--dry' : '',
      resolve(targetPath),
    ]
      .filter(Boolean)
      .join(' ');

    console.log(`\nRunning: ${transform}`);
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch {
      console.error(`Transform ${transform} failed`);
    }
  }
}

main();
