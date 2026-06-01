#!/usr/bin/env node

import { Option, program } from 'commander';
import { OptionModel } from './models';
import {
    ErrorTypes,
    FatalErrorModel,
    ReactI18nextLint,
    ResultCliModel,
    ResultModel,
    StatusCodes,
    ToggleRule,
    red,
} from "./../core";
import type { IRulesConfig } from "./../core";

import { config } from './../core/config';
import { OptionsLongNames } from './enums';
import { parseJsonFile } from './utils';

const name: string = 'react-i18next-translation-checker';
declare const PACKAGE_VERSION: string;
const packageVersion: string = typeof PACKAGE_VERSION === 'undefined'
    ? process.env.npm_package_version || '0.0.0'
    : PACKAGE_VERSION;

// tslint:disable-next-line:no-any
const docs: any = {
    name,
    usage: '[options]',
    description: 'Simple CLI tools for check `react-i18next` keys in app',
    examples: `

Examples:

    $ ${name} -p ${config.defaultValues.projectPath} -l ${config.defaultValues.languagesPath}
    $ ${name} -p ${config.defaultValues.projectPath} -z ${ErrorTypes.disable} -v ${ErrorTypes.error}
    $ ${name} -p ${config.defaultValues.projectPath} -i ./src/assets/i18n/EN-us.json, ./src/app/app.*.{json}
    $ ${name} -p ${config.defaultValues.projectPath} -l https://8.8.8.8/locales/EN-eu.json

`
};

class Cli {
    // tslint:disable-next-line:no-any
    private cliClient: any;
    private cliOptions: OptionModel[] = [];

    constructor(options: OptionModel[]) {
        this.cliOptions = options;
    }

    public static run(options: OptionModel[]): void {
        const cli: Cli = new Cli(options);
        cli.init();
        cli.parse();
        cli.runCli();
    }

    public static async runAsync(options: OptionModel[]): Promise<void> {
        const cli: Cli = new Cli(options);
        cli.init();
        cli.parse();
        await cli.runCliAsync();
    }

    public init(options: OptionModel[] = this.cliOptions): void {
        this.cliClient = program;

        options.forEach((option: OptionModel) => {
            const optionFlag: string = option.getFlag();
            const optionDescription: string = option.getDescription();
            const optionDefaultValue: string | ErrorTypes | undefined = option.default;
            this.cliClient.addOption(new Option(optionFlag, optionDescription).default(optionDefaultValue));
        });

        this.cliClient.version(packageVersion, '-v, --version', `Print current version of ${name}`);

        this.cliClient
            .name(docs.name)
            .usage(docs.usage)
            .description(docs.description)
            .on(`--${OptionsLongNames.help}`, () => {
                // tslint:disable-next-line:no-console
                console.log(docs.examples);
            });
    }

    public runCli(): void {
        try {
            const options: CliOptions = this.getOptions();
            const lintOptions: LintOptions = this.getLintOptions(options);

            this.printCurrentVersion();

            if (options.project && options.languages) {
                this.runLintFromOptions(lintOptions);
            } else {
                const cliHasError: boolean = this.validate();
                if (cliHasError) {
                    process.exit(StatusCodes.crash);
                } else {
                    this.cliClient.help();
                }
            }
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.error(error);
            process.exitCode = StatusCodes.crash;
        } finally {
            process.exit();
        }
    }

    public async runCliAsync(): Promise<void> {
        try {
            const options: CliOptions = this.getOptions();
            const lintOptions: LintOptions = this.getLintOptions(options);

            this.printCurrentVersion();

            if (options.project && options.languages) {
                await this.runLintAsyncFromOptions(lintOptions);
            } else {
                const cliHasError: boolean = this.validate();
                if (cliHasError) {
                    process.exit(StatusCodes.crash);
                } else {
                    this.cliClient.help();
                }
            }
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.error(error);
            process.exitCode = StatusCodes.crash;
        } finally {
            process.exit();
        }
    }

    public parse(): void {
        this.cliClient.parse(process.argv);
    }

    private validate(): boolean {
        const requiredOptions: OptionModel[] = this.cliOptions.filter((option: OptionModel) => option.required);
        const missingRequiredOption: boolean = requiredOptions.reduce((accum: boolean, option: OptionModel) => {
            if (!this.cliClient.opts()[String(option.longName)]) {
                accum = false;
                // tslint:disable-next-line: no-console
                console.error(`Missing required argument: ${option.getFlag()}`);
            }
            return accum;
        }, false);

        return missingRequiredOption;
    }

    public runLint(
        project: string,
        languages: string,
        zombies?: ErrorTypes,
        views?: ErrorTypes,
        ignore?: string,
        maxWarning: number = 1,
        emptyKeys?: ErrorTypes,
        deepSearch?: ToggleRule,
        ignoredKeys: string[] = [],
        customRegExpToFindKeys: string[] | RegExp[] = [],
        tsConfigPath?: string,
    ): void {
            const errorConfig: IRulesConfig = {
                deepSearch: deepSearch || ToggleRule.disable,
                zombieKeys: zombies || ErrorTypes.warning,
                emptyKeys: emptyKeys || ErrorTypes.warning,
                keysOnViews: views || ErrorTypes.error,
                maxWarning,
                ignoredKeys,
                customRegExpToFindKeys,
            };
            const validationModel: ReactI18nextLint = new ReactI18nextLint(project, languages, ignore, errorConfig, tsConfigPath);
            const resultCliModel: ResultCliModel = validationModel.lint(maxWarning);
            this.printLintResult(resultCliModel);
    }

    public async runLintAsync(
        project: string,
        languages: string,
        zombies?: ErrorTypes,
        views?: ErrorTypes,
        ignore?: string,
        maxWarning: number = 1,
        emptyKeys?: ErrorTypes,
        deepSearch?: ToggleRule,
        ignoredKeys: string[] = [],
        customRegExpToFindKeys: string[] | RegExp[] = [],
        tsConfigPath?: string,
    ): Promise<void> {
            const errorConfig: IRulesConfig = {
                deepSearch: deepSearch || ToggleRule.disable,
                zombieKeys: zombies || ErrorTypes.warning,
                emptyKeys: emptyKeys || ErrorTypes.warning,
                keysOnViews: views || ErrorTypes.error,
                maxWarning,
                ignoredKeys,
                customRegExpToFindKeys,
            };
            const validationModel: ReactI18nextLint = new ReactI18nextLint(project, languages, ignore, errorConfig, tsConfigPath);
            const resultCliModel: ResultCliModel = await validationModel.lintAsync(maxWarning);
            this.printLintResult(resultCliModel);
    }

    private getOptions(): CliOptions {
        return this.cliClient.config ? parseJsonFile(this.cliClient.config) : this.cliClient.opts();
    }

    private getLintOptions(options: CliOptions): LintOptions {
        if (!!options.rules) {
            return {
                project: options.project,
                languages: options.languages,
                zombies: options.rules.zombieKeys,
                views: options.rules.keysOnViews,
                ignore: options.rules.ignore,
                maxWarning: options.rules.maxWarning,
                emptyKeys: options.rules.emptyKeys,
                deepSearch: options.rules.deepSearch,
                ignoredKeys: options.rules.ignoredKeys,
                customRegExpToFindKeys: options.rules.customRegExpToFindKeys,
                tsConfigPath: options.tsConfigPath,
            };
        }

        return {
            project: options.project,
            languages: options.languages,
            zombies: options.zombieKeys,
            views: options.keysOnViews,
            ignore: options.ignore,
            maxWarning: options.maxWarning,
            emptyKeys: options.emptyKeys,
            deepSearch: options.deepSearch,
            ignoredKeys: options.ignoredKeys,
            customRegExpToFindKeys: options.customRegExpToFindKeys,
            tsConfigPath: options.tsConfigPath,
        };
    }

    private runLintFromOptions(options: LintOptions): void {
        this.runLint(
            options.project, options.languages, options.zombies,
            options.views, options.ignore, options.maxWarning, options.emptyKeys, options.deepSearch,
            options.ignoredKeys, options.customRegExpToFindKeys, options.tsConfigPath
        );
    }

    private async runLintAsyncFromOptions(options: LintOptions): Promise<void> {
        await this.runLintAsync(
            options.project, options.languages, options.zombies,
            options.views, options.ignore, options.maxWarning, options.emptyKeys, options.deepSearch,
            options.ignoredKeys, options.customRegExpToFindKeys, options.tsConfigPath
        );
    }

    private printLintResult(resultCliModel: ResultCliModel): void {
        const resultModel: ResultModel = resultCliModel.getResultModel();
        resultModel.printResult();
        resultModel.printSummery();

        process.exitCode = resultCliModel.exitCode();

        if (resultModel.hasError) {
            throw new FatalErrorModel(red(resultModel.message));
        }
    }

    private printCurrentVersion(): void {
        // tslint:disable-next-line:no-console
        console.log(`Current version: ${packageVersion}`);
    }
}

// tslint:disable-next-line:interface-name
interface CliOptions {
    project: string;
    languages: string;
    tsConfigPath?: string;
    rules?: {
        deepSearch?: ToggleRule;
        ignore?: string;
        emptyKeys?: ErrorTypes;
        keysOnViews?: ErrorTypes;
        maxWarning?: number;
        zombieKeys?: ErrorTypes;
        ignoredKeys?: string[];
        customRegExpToFindKeys?: string[] | RegExp[];
    };
    deepSearch?: ToggleRule;
    ignore?: string;
    emptyKeys?: ErrorTypes;
    keysOnViews?: ErrorTypes;
    maxWarning?: number;
    zombieKeys?: ErrorTypes;
    ignoredKeys?: string[];
    customRegExpToFindKeys?: string[] | RegExp[];
}

// tslint:disable-next-line:interface-name
interface LintOptions {
    project: string;
    languages: string;
    zombies?: ErrorTypes;
    views?: ErrorTypes;
    ignore?: string;
    maxWarning?: number;
    emptyKeys?: ErrorTypes;
    deepSearch?: ToggleRule;
    ignoredKeys?: string[];
    customRegExpToFindKeys?: string[] | RegExp[];
    tsConfigPath?: string;
}

export { Cli };
