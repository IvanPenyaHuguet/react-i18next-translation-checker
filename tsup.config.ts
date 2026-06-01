import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const packageJson: { version: string } = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
    entry: {
        index: 'src/core/index.ts',
        bin: 'bin.ts',
    },
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    define: {
        PACKAGE_VERSION: JSON.stringify(packageJson.version),
    },
});
