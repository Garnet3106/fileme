import Fs, { FsErrorKind, NativeFs } from '../fs/fs';
import { ItemKind } from '../fs/item';
import { FileItemIdentifier, FolderItemIdentifier, ItemIdentifier, ItemPath } from '../fs/path';

function getNativeItemPath(hierarchy: string[], isFolder: boolean): ItemPath {
    return ItemPath.from(`${__dirname}/fs/${hierarchy.join('/')}`, isFolder);
}

const nativeFs = new NativeFs();

describe('NativeFs.exists()', () => {
    test('existing file', async () => {
        expect(await nativeFs.exists(getNativeItemPath(['existence', 'exists'], true))).toEqual(true);
    });

    test('existing directory', async () => {
        expect(await nativeFs.exists(getNativeItemPath(['existence', 'exists.txt'], false))).toEqual(true);
    });

    test('not existing file', async () => {
        expect(await nativeFs.exists(getNativeItemPath(['existence', 'notexists'], true))).toEqual(false);
    });

    test('not existing directory', async () => {
        expect(await nativeFs.exists(getNativeItemPath(['existence', 'notexists.txt'], false))).toEqual(false);
    });

    test('not existing file but exists as a folder', async () => {
        expect(await nativeFs.exists(getNativeItemPath(['existence', 'exists'], false))).toEqual(true);
    });

    test('not existing folder but exists as a file', async () => {
        expect(await nativeFs.exists(getNativeItemPath(['existence', 'exists.txt'], true))).toEqual(true);
    });
});

describe('NativeFs.getStats()', () => {
    test('file stats', async () => {
        expect(await nativeFs.getStats(getNativeItemPath(['stats', 'a.txt'], false))).toEqual({
            kind: ItemKind.File,
            size: 16,
            created: expect.any(Date),
            lastAccessed: expect.any(Date),
            lastModified: expect.any(Date),
        });
    });

    test('get folder stats', async () => {
        expect(await nativeFs.getStats(getNativeItemPath(['stats', 'a'], false))).toEqual({
            kind: ItemKind.Folder,
            size: undefined,
            created: expect.any(Date),
            lastAccessed: expect.any(Date),
            lastModified: expect.any(Date),
        });
    });

    test('not exists', async () => {
        await expect(nativeFs.getStats(getNativeItemPath(['notexists'], true))).rejects
            .toThrowError(FsErrorKind.NotExists);
    });
});

describe('NativeFs.getChildren()', () => {
    test('directory children', async () => {
        const children = await nativeFs.getChildren(getNativeItemPath(['children'], true));

        const sort = (a: string, b: string) => {
            if (a === b) {
                return 0;
            } else {
                return a < b ? -1 : 1;
            }
        };

        const childrenToBe: {
            kind: ItemKind,
            id: ItemIdentifier,
        }[] = [
            {
                kind: ItemKind.Folder,
                id: new FolderItemIdentifier('a'),
            },
            {
                kind: ItemKind.Folder,
                id: new FolderItemIdentifier('b'),
            },
            {
                kind: ItemKind.File,
                id: FileItemIdentifier.from('a.txt'),
            },
            {
                kind: ItemKind.File,
                id: FileItemIdentifier.from('b.txt'),
            },
        ].sort((a, b) => sort(a.id.toString(), b.id.toString()));

        const target = Object.entries(children)
            .map(([_index, item]) => ({
                id: item.getIdentifier(),
                kind: item.getItem().kind,
            }))
            .sort((a, b) => sort(a.id.toString(), b.id.toString()));

        expect(target).toEqual(childrenToBe);
    });

    test('not exists', async () => {
        await expect(nativeFs.getChildren(getNativeItemPath(['notexists'], true))).rejects
            .toThrowError(FsErrorKind.NotExists);
    });
});

describe('Fs.duplicatePath()', () => {
    test('duplicate file path ', async () => {
        const path = getNativeItemPath(['duplicate', 'a.txt'], false);
        const expected = path.getParent().append('a_copy.txt', false).getFullPath();
        expect(Fs.getDuplicatePath(path).getFullPath()).toEqual(expected);
    });

    test('duplicate file path when target exists', async () => {
        const path = getNativeItemPath(['duplicate', 'exists.txt'], false);
        const expected = path.getParent().append('exists_copy_copy.txt', false).getFullPath();
        expect(Fs.getDuplicatePath(path).getFullPath()).toEqual(expected);
    });
});

// describe('NativeFs.duplicate()', () => {
//     test('duplicate file', async () => {
//         const path = getNativeItemPath(['duplicate', 'a.txt'], false);
//         await nativeFs.duplicate(path);
//         expect(nativeFs.exists(path)).toEqual(true);
//         await remove
//     });

//     test('not exists', async () => {
//         await expect(nativeFs.duplicate(getNativeItemPath(['notexists'], true))).rejects
//             .toThrowError(FsErrorKind.NotExists);
//     });
// });
