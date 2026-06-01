import { ErrorTypes, ToggleRule } from './../enums';

interface IRulesConfig {
    emptyKeys: ErrorTypes;
    zombieKeys: ErrorTypes;
    keysOnViews: ErrorTypes;
    deepSearch: ToggleRule;
    maxWarning: number;
    ignoredKeys: string[];
    customRegExpToFindKeys: string[] | RegExp[];
}

export type { IRulesConfig };
