import 'mocha';

import path from 'path';
import { assert, expect } from 'chai';

import {
    config as defaultConfig,
    ErrorFlow,
    ErrorTypes,
    IRulesConfig,
    KeyModelWithLanguages,
    LanguagesModel,
    ReactI18nextLint,
    ResultCliModel,
    ResultErrorModel,
    ToggleRule,
} from './../../src/core';

import { assertFullModel } from './results/arguments.full';
import { assertDefaultModel } from './results/default.full';
import { assertCustomConfig } from './results/custom.config';
import { configValues } from './results/config.values';
import { getAbsolutePath, projectFolder } from './utils';

/*
TODO: RL: Keys
<h1>{t('welcome.title')}<h1>{t('welcome title-2')}</h1></h1>
<h1>{t('welcome.title', {framework:'React'})}<h2>{t('Welcome to React")}</h2></h1>
import('web-vitals')).then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
*/
describe('Core Integration', () => {
    const ignorePath: string = '';

    const projectIgnorePath: string = './test/integration/inputs/views/pipe.keys.html';
    const projectWithMaskPath: string = './test/integration/inputs/views/*.{html,ts,js}';
    const projectAbsentMaskPath: string = './test/integration/inputs/views/';

    const languagesIgnorePath: string = './test/integration/inputs/locales/EN-eu.json';
    const languagesWithMaskPath: string = './test/integration/inputs/locales/EN-*.json';
    const languagesIncorrectFile: string = './test/integration/inputs/locales/incorrect.json';
    const languagesAbsentMaskPath: string = './test/integration/inputs/locales';

    describe('Custom RegExp to find keys', () => {
       it('should be find keys', () => {
           // Arrange
           const errorConfig: IRulesConfig = {
               ...defaultConfig.defaultValues.rules,
               customRegExpToFindKeys: [/marker\("(.*)"\)/gm]
           };

           // Act
           const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath, undefined, errorConfig);
           const result: ResultCliModel = model.lint();

           // Assert
           assert.deepEqual(result.errors.find(x => x.value === 'CUSTOM.REGEXP.ONE')?.errorType, ErrorTypes.warning);
       });
    });
    describe('Empty Keys', () => {
        it('should be warning by default', () => {
            // Arrange
            const hasEmptyKeys: boolean = true;
            const countEmptyKeys: number = 1;
            const errorType: ErrorTypes = ErrorTypes.warning;
            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(errorType, result.getEmptyKeys()[0].errorType);
            assert.deepEqual(hasEmptyKeys, result.hasEmptyKeys());
            assert.deepEqual(countEmptyKeys, result.countEmptyKeys());
        });
        it('should be error', () => {
            // Arrange
            const hasEmptyKeys: boolean = true;
            const countEmptyKeys: number = 1;
            const errorType: ErrorTypes = ErrorTypes.error;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rules,
                emptyKeys: ErrorTypes.error,
            };
            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath, undefined, errorConfig);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(errorType, result.getEmptyKeys()[0].errorType);
            assert.deepEqual(hasEmptyKeys, result.hasEmptyKeys());
            assert.deepEqual(countEmptyKeys, result.countEmptyKeys());
        });
    });

    describe('Warnings', () => {
        it('should be 0 by default', () => {
            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath);
            const result:  ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(0, result.maxCountWarning);
        });
        it('should be error if warnings more thant 2', () => {
            // Arrange
            const ignorePath: string = '';
            const maxWarnings: number = 5;
            const ifFullOfWarning: boolean = true;
            const errorConfig: IRulesConfig = {
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.warning,
                emptyKeys: ErrorTypes.warning,
                maxWarning: 1,
                deepSearch: ToggleRule.enable,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                customRegExpToFindKeys: []
            };

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result:  ResultCliModel = model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning());
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
        it('should be warning if warnings less thant 10', () => {
            // Arrange
            const maxWarnings: number = 20;
            const ifFullOfWarning: boolean = false;

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath);
            const result: ResultCliModel = model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning());
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
    });
    describe('Ignore', () => {
        it('should be relative and absolute and have projects and languages files', () => {
            // Arrange
            const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
            const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}`;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rules,
                deepSearch: ToggleRule.enable
            };

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result.errors);
        });

        it('should be empty or incorrect', () => {
            // Arrange
            const ignorePath: string = `null, 0, undefined, '',`;

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath, ignorePath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result.errors);
        });
    });
    describe('Path', () => {
        it('should be relative and absolute', () => {
            // Arrange
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(absolutePathProject, languagesWithMaskPath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result.errors);
        });

        it('should be absent mask', () => {
            // Arrange
            const ignorePath: string = `${languagesIgnorePath}, ${projectIgnorePath}, ${languagesIncorrectFile}`;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rules,
                deepSearch: ToggleRule.enable
            };
            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectAbsentMaskPath, languagesAbsentMaskPath, ignorePath, errorConfig);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result.errors);
        });
        it('should be empty and incorrect', () => {
            // Arrange
            const emptyFolder: string = '';
            const incorrectFolder: string = '../files';

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(emptyFolder, incorrectFolder);

            // Assert
            expect(() => { model.lint(); }).to.throw();
        });

        it('should with parse error', () => {
            // Arrange
            const absoluteIncorrectLanguagesPath: string = path.resolve(__dirname, process.cwd(), languagesIncorrectFile);
            const errorMessage: string = `Can't parse JSON file: ${absoluteIncorrectLanguagesPath}`;

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesIncorrectFile);

            // Assert
            // model.lint();
            assert.throws(() => { model.lint(); }, errorMessage);
        });
    });

    describe('Config', () => {
        it('should be default', () => {
            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath);
            const result:  ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result.errors);
        });
        it('should be incorrect', () => {
            // Arrange
            const errorConfig: object = {
                keysOnViews: 'incorrect',
                anotherIncorrectKey: ErrorTypes.disable
            };

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig as IRulesConfig);

            // Assert
            expect(() => { model.lint(); }).to.throw();
        });
        it('should be custom', () => {
            // Arrange
            const errorConfig: IRulesConfig = {
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.disable,
                emptyKeys: ErrorTypes.warning,
                maxWarning: 1,
                deepSearch: ToggleRule.enable,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                customRegExpToFindKeys: []
            };

            // Act
            const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertCustomConfig, result.errors);
        });
    });
    describe('API', () => {
        describe('getLanguages', () => {
           it('should be correct', () => {
               // Arrange
               const countOfLanguage: number = 2;
               // Act
               const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath);
               const result: LanguagesModel[] = model.getLanguages();

               // Assert
               assert.equal(result.length, countOfLanguage);
           });
        });
        describe('getKeys', () => {
            it('should be correct', () => {
                // Arrange
                 const countOfKeys: number = configValues.totalKeys;
                // Act
                const model: ReactI18nextLint = new ReactI18nextLint(projectWithMaskPath, languagesWithMaskPath);
                const result: KeyModelWithLanguages[] = model.getKeys();

                // Assert
                assert.equal(result.length, countOfKeys);
            });
        });
    });
    it('with full arguments', () => {
        // Arrange
        const errorConfig: IRulesConfig = {
            keysOnViews: ErrorTypes.error,
            zombieKeys: ErrorTypes.warning,
            emptyKeys: ErrorTypes.warning,
            maxWarning: 1,
            deepSearch: ToggleRule.enable,
            ignoredKeys: ["IGNORED.KEY.FLAG"],
            customRegExpToFindKeys: []
        };
        const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);
        const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
        const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}`;

        // Act
        const model: ReactI18nextLint = new ReactI18nextLint(absolutePathProject, languagesWithMaskPath, ignorePath, errorConfig);
        const result: ResultCliModel = model.lint();

        // Assert
        assert.deepEqual(assertFullModel, result.errors);
    });
});
