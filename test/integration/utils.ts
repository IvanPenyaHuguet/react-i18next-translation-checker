import path from 'path';
import { fileURLToPath } from 'url';

const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
const projectFolder: string = path.resolve(__dirname, './inputs/views/');
const languagesFolder: string = path.resolve(__dirname, './inputs/locales/');

function getAbsolutePath(relativeFolder: string, fileName: string): string {
    return path.normalize(path.resolve(process.cwd(), relativeFolder, fileName));
}

export { projectFolder, languagesFolder, getAbsolutePath };
