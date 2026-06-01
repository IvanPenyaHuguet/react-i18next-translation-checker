import type { ILogger } from "./../interface";
import { ErrorTypes } from "./../enums";
import { red, yellow } from './../utils';

class StylishLogger implements ILogger {
    private logger: ILogger;
    private errorType: ErrorTypes;

    constructor(
        logger: ILogger,
        errorType: ErrorTypes = ErrorTypes.error,
    ) {
        this.logger = logger;
        this.errorType = errorType;
    } 

    public error(message: string): void {
        // tslint:disable-next-line:no-console
        console.error(red(message));
    }

    public log(message: string): void {
        // tslint:disable-next-line:no-console
        console.log(yellow(message));
    }

    public printMessage(message: string, errorType: ErrorTypes = this.errorType): void {
        switch (errorType) {
            case ErrorTypes.error:
                this.error(message);
                break;
            case ErrorTypes.warning:
                this.log(message);
                break;
            default:
                this.log(message);
                break;
        }
    }
}

export { StylishLogger };
