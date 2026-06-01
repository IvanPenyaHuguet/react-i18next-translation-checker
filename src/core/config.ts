import { ErrorTypes, ToggleRule } from './enums';
import type { IAppConfig } from './interface';

const config: IAppConfig = {
    defaultValues: {
        rules: {
            zombieKeys: ErrorTypes.warning,
            keysOnViews: ErrorTypes.error,
            emptyKeys: ErrorTypes.warning,
            deepSearch: ToggleRule.disable,
            maxWarning: 0,
            ignoredKeys: [],
            customRegExpToFindKeys: []
        },
        projectPath: './src/**/*.{html,ts,resx,js}',
        languagesPath: './src/assets/i18n/*.json'
    }
};

export { config };
