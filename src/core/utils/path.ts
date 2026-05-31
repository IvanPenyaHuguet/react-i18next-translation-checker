import * as path from 'node:path';
import * as glob from 'glob';
import dirGlob from 'dir-glob';
import { concat } from 'lodash';

class PathUtils {
    public static resolvePath(filePath: string): string {
        return (path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)).split(path.sep).join('/');
    }

    public static getNormalizeFiles(folder: string, ignores: string[] = []): string[] {
        const correctFilesPathList: string[] = dirGlob.sync(PathUtils.resolvePath(folder), {
            extensions: [ 'html', 'ts', 'json', 'js']
        }).map((filePath: string) => {
            return filePath.split(path.sep).join('/');
        });
        const correctIgnorePath: string[] = ignores.map((path: string) => PathUtils.resolvePath(path.trim()));

        const result: string[] = correctFilesPathList.reduce((acum: string[], filePath: string) => {
            const filesPathList: string[] = glob.globSync(filePath, {
                ignore: correctIgnorePath,
            });
            acum = concat(acum, filesPathList);
            return acum;
        }, []);
        return result.map((filePath: string) => {
            return path.normalize(filePath);
        });
    }
}

export { PathUtils };
