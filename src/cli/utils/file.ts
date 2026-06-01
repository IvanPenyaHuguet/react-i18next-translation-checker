import * as fs from 'fs';

import { FatalErrorModel, red } from '../../core';

// tslint:disable-next-line:no-any
function parseJsonFile(filePath: string): any {
    if (!fs.existsSync(filePath)) {
        throw new FatalErrorModel(red(`File doesn't exists by path ${filePath}`));
    }
    const configFile: Buffer = fs.readFileSync(filePath);
    // tslint:disable-next-line:no-any
    const result: any = JSON.parse(configFile.toString());
    return result;
}

export {
    parseJsonFile
};
