const redCode: number = 31;
const yellowCode: number = 33;

const color: (code: number, message: string) => string = (code: number, message: string): string => {
    return `\u001b[${code}m${message}\u001b[39m`;
};

const red: (message: string) => string = (message: string): string => color(redCode, message);
const yellow: (message: string) => string = (message: string): string => color(yellowCode, message);

export { red, yellow };
