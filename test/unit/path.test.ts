import 'mocha';

import fs from 'fs';
import path from 'path';
import { assert } from 'chai';

import { PathUtils } from '../../src/core/utils';

describe('PathUtils', () => {
    it('resolves relative paths from the current working directory', () => {
        const result: string = PathUtils.resolvePath('./test/integration/inputs/views');

        assert.equal(result, path.resolve(process.cwd(), './test/integration/inputs/views').split(path.sep).join('/'));
    });

    it('keeps JavaScript files in normalized glob results', () => {
        const fixtureFolder: string = path.resolve(process.cwd(), './test/unit/.tmp-path-utils');
        const fixtureFile: string = path.resolve(fixtureFolder, 'view.keys.js');
        fs.mkdirSync(fixtureFolder, { recursive: true });
        fs.writeFileSync(fixtureFile, "t('fixture.key');");

        const result: string[] = PathUtils.getNormalizeFiles('./test/unit/.tmp-path-utils/*.{html,ts,js}');

        assert.isTrue(result.some((filePath: string) => filePath.endsWith('.js')));

        fs.rmSync(fixtureFolder, { recursive: true, force: true });
    });
});
