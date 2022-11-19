import { Dirent } from "fs";
import { FileItem, FileItemIdentifier, FileItemStats, FolderItem, FolderItemStats, Item, ItemKind, ItemPath, ItemStats } from "./item";

export enum FsErrorKind {
    NoSuchFileOrDirectory = 'no such file or directory',
    NotADirectory = 'not a directory',
    NotAFile = 'not a file',
    BusyOrLocked = 'busy or locked',
    CannotReadItemStats = 'cannot read item stats',
    CannotDuplicateRootFolder = 'cannot duplicate root folder',
}

export const fsEncoding = 'utf-8';
export const duplicateItemSuffix = '_copy';

export interface IFs {
    exists(path: ItemPath): boolean;

    getStats(path: ItemPath): Promise<ItemStats>;

    getChildren(path: ItemPath): Promise<Item[]>;

    duplicate(path: ItemPath): Promise<void>;

    watch(path: ItemPath, callback: () => void): void;
}

export default class Fs {
    private static isProdEnv: boolean = process.env.NODE_ENV === 'production';

    private static fs(): IFs {
        return Fs.isProdEnv ? new NativeFs() : new FakeFs();
    }

    public static exists(path: ItemPath): boolean {
        return Fs.fs().exists(path);
    }

    public static getStats(path: ItemPath): Promise<ItemStats> {
        return Fs.fs().getStats(path);
    }

    public static getChildren(path: ItemPath): Promise<Item[]> {
        return Fs.fs().getChildren(path);
    }

    public static duplicate(path: ItemPath): Promise<void> {
        return Fs.fs().duplicate(path);
    }

    public static watch(path: ItemPath, callback: () => void) {
        return Fs.fs().watch(path, callback);
    }
};

export class NativeFs implements IFs {
    private static fsSync(): any {
        return process.env.NODE_ENV === 'test' ? require('fs') : window.require('fs');
    }

    private static fsPromises(): any {
        return this.fsSync().promises;
    }

    public exists(path: ItemPath): boolean {
        return NativeFs.fsSync().existsSync(path.getFullPath());
    }

    public getStats(path: ItemPath): Promise<ItemStats> {
        return new Promise((resolve, reject) => {
            NativeFs.fsPromises().stat(path.getFullPath())
                .then((stats: any) => {
                    const result = stats.isFile() ? {
                        kind: ItemKind.File,
                        size: stats.size !== 0 ? stats.size : undefined,
                        created: new Date(stats.birthtimeMs),
                        lastAccessed: new Date(stats.atimeMs),
                        lastModified: new Date(stats.mtimeMs),
                    } : {
                        kind: ItemKind.Folder,
                        created: new Date(stats.birthtimeMs),
                        lastAccessed: new Date(stats.atimeMs),
                        lastModified: new Date(stats.mtimeMs),
                    };

                    resolve(result);
                })
                .catch((e: any) => {
                    console.error(e);
                    reject(FsErrorKind.CannotReadItemStats);
                });
        });
    }

    public getChildren(path: ItemPath): Promise<Item[]> {
        return new Promise((resolve) => {
            const options = {
                encoding: fsEncoding,
                withFileTypes: true,
            };

            NativeFs.fsPromises().readdir(path.getFullPath(), options)
                .then((dirents: Dirent[]) => {
                    const children: Item[] = [];

                    const promises: Promise<void>[] = dirents.map((eachDirent) => new Promise(async (resolve) => {
                        try {
                            const isFolder = eachDirent.isDirectory();
                            const childPath = path.append(eachDirent.name, isFolder);
                            const stats = await this.getStats(childPath).catch(() => null);

                            if (stats === null) {
                                console.error(FsErrorKind.CannotReadItemStats);
                                resolve();
                                return;
                            }

                            const childItem = !isFolder ? {
                                kind: ItemKind.File,
                                path: path.append(FileItemIdentifier.from(eachDirent.name), isFolder),
                                stats: stats as FileItemStats,
                            } as FileItem : {
                                kind: ItemKind.Folder,
                                path: path.append(eachDirent.name, isFolder),
                                stats: stats as FolderItemStats,
                            } as FolderItem;

                            children.push(new Item(childItem));
                            resolve();
                        } catch (e) {
                            console.error(e);
                        }
                    }));

                    Promise.all(promises).then(() => resolve(children));
                });
        });
    }

    public duplicate(path: ItemPath): Promise<void> {
        return new Promise(async (resolve) => {
            if (path.isRoot()) {
                throw FsErrorKind.CannotDuplicateRootFolder;
            }

            let targetId = path.getIdentifier().toString() + duplicateItemSuffix;

            while (this.exists(path.getParent().append(targetId, false))) {
                targetId += duplicateItemSuffix;
            }

            const targetPath = path.getParent().append(targetId, path.isFolder());
            const fsConstants = NativeFs.fsSync().constants;
            const fsPromises = NativeFs.fsPromises();

            if (!path.isFolder()) {
                // fix
                if (window.confirm(targetPath.getFullPath())) {
                    fsPromises.copyFile(path.getFullPath(), targetPath.getFullPath(), fsConstants.COPYFILE_EXCL).then(resolve);
                }
            } else {
                alert('unimplemented');
                resolve();
            }
        });
    }

    public watch(path: ItemPath, callback: () => void) {
        // unimplemented
    }
}

export type FakeFileItem = FileItem;

export type FakeFolderItem = FolderItem & {
    children: {
        id: string,
        isFolder: boolean,
    }[],
};

export type FakeItem = FakeFileItem | FakeFolderItem;

export class FakeFs implements IFs {
    private static items: {
        [index: string]: FakeItem,
    } = {
        '/': {
            kind: ItemKind.Folder,
            path: new ItemPath(undefined, [], true),
            stats: {
                kind: ItemKind.Folder,
                created: new Date(),
                lastAccessed: new Date(),
                lastModified: new Date(),
            },
            children: [
                {
                    id: 'desktop.ini',
                    isFolder: false,
                },
                {
                    id: 'usr',
                    isFolder: true,
                },
            ],
        },
        '/desktop.ini': {
            kind: ItemKind.File,
            path: new ItemPath(undefined, ['desktop.ini'], false),
            stats: {
                kind: ItemKind.File,
                size: 1024,
                created: new Date(),
                lastAccessed: new Date(),
                lastModified: new Date(),
            },
        },
        '/usr/': {
            kind: ItemKind.Folder,
            path: new ItemPath(undefined, ['usr'], true),
            stats: {
                kind: ItemKind.Folder,
                created: new Date(),
                lastAccessed: new Date(),
                lastModified: new Date(),
            },
            children: [
                {
                    id: 'desktop.ini',
                    isFolder: false,
                },
                {
                    id: 'win32.sys',
                    isFolder: false,
                },
            ],
        },
        '/usr/desktop.ini': {
            kind: ItemKind.File,
            path: new ItemPath(undefined, ['usr', 'desktop.ini'], false),
            stats: {
                kind: ItemKind.File,
                size: 1024,
                created: new Date(),
                lastAccessed: new Date(),
                lastModified: new Date(),
            },
        },
        '/usr/win32.sys': {
            kind: ItemKind.File,
            path: new ItemPath(undefined, ['usr', 'win32.sys'], false),
            stats: {
                kind: ItemKind.File,
                size: 1024,
                created: new Date(),
                lastAccessed: new Date(),
                lastModified: new Date(),
            },
        },
    };

    private static watcherPath: ItemPath;
    private static watcherCallback: () => void;

    public static getItem(path: ItemPath): FakeItem | undefined {
        return FakeFs.items[path.getFullPath()];
    }

    public exists(path: ItemPath): boolean {
        return FakeFs.getItem(path) !== undefined;
    }

    public getStats(path: ItemPath): Promise<ItemStats> {
        return new Promise((resolve, reject) => {
            const target = FakeFs.getItem(path);

            if (target === undefined) {
                reject(FsErrorKind.NoSuchFileOrDirectory);
                return;
            }

            resolve(target.stats);
        });
    }

    public getChildren(path: ItemPath): Promise<Item[]> {
        return new Promise((resolve) => {
            const target = FakeFs.getItem(path);

            if (target === undefined) {
                throw FsErrorKind.NoSuchFileOrDirectory;
            }

            if (target.kind !== ItemKind.Folder) {
                throw FsErrorKind.NotADirectory;
            }

            const children = (target as FakeFolderItem).children.map((eachChild) => {
                const absPath = path.append(eachChild.id, eachChild.isFolder);
                return new Item(FakeFs.getItem(absPath)!);
            });

            resolve(children);
        });
    }

    public duplicate(path: ItemPath): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (path.isRoot()) {
                reject(FsErrorKind.CannotDuplicateRootFolder);
                return;
            }

            const isOriginalFolder = path.isFolder();
            const originalStats = await this.getStats(path).catch(() => null);

            if (originalStats === null) {
                reject(FsErrorKind.CannotReadItemStats);
                return;
            }

            const stats: ItemStats = isOriginalFolder ? {
                kind: originalStats.kind,
                created: new Date(),
                lastAccessed: new Date(),
                lastModified: new Date(),
            } : {
                kind: originalStats.kind,
                size: (originalStats as FileItemStats).size,
                created: new Date(),
                lastAccessed: new Date(),
                lastModified: new Date(),
            };

            const originalParent = path.getParent();
            const parentChildren = (FakeFs.items[originalParent.getFullPath()] as FakeFolderItem).children;
            let targetId = path.getIdentifier().toString() + duplicateItemSuffix;

            while (parentChildren.some((v) => v.id === targetId)) {
                targetId += duplicateItemSuffix;
            }

            const targetPath = originalParent.append(targetId, isOriginalFolder);
            const targetFullPath = targetPath.getFullPath();
            const target: FakeItem = isOriginalFolder ? {
                kind: ItemKind.Folder,
                path: targetPath,
                stats: stats,
                // fix
                children: [],
            } : {
                kind: ItemKind.File,
                path: targetPath,
                stats: stats,
            };

            parentChildren.push({
                id: targetId,
                isFolder: isOriginalFolder,
            });
            FakeFs.items[targetFullPath] = target;
            this.dispatchWatcher(originalParent);
            resolve();
        });
    }

    private dispatchWatcher(parentPath: ItemPath) {
        if (FakeFs.watcherPath.isEqual(parentPath)) {
            FakeFs.watcherCallback();
        }
    }

    public watch(path: ItemPath, callback: () => void) {
        FakeFs.watcherPath = path;
        FakeFs.watcherCallback = callback;
    }
}
