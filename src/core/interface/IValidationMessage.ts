interface IValidationMessage {
    value?: string;
    message(): string[] | string | null;
}

export type { IValidationMessage };
