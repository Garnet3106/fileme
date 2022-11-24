import { FileItemIdentifier, ItemPath, ItemPathErrorKind } from "../fs/path";

/* Append Path */

test('append directory to root path', () => {
    expect((new ItemPath(undefined, [], true)).append('dir', true).getFullPath()).toEqual('/dir/');
});

test('append directory to child path', () => {
    expect((new ItemPath('C', ['parent'], true)).append('dir', true).getFullPath()).toEqual('C:/parent/dir/');
});

test('[failure] append to file path', () => {
    expect(() => (new ItemPath(undefined, ['file.txt'], false)).append('dir', true).getFullPath()).toThrowError(ItemPathErrorKind.CannotAppendToFilePath);
});

/* Parent Path */

test('create root parent path', () => {
    expect((new ItemPath(undefined, [], true)).getFullPath()).toEqual('/');
});

test('create root parent path with drive letter', () => {
    expect((new ItemPath('C', [], true)).getFullPath()).toEqual('C:/');
});

// test('create parent path with formatting', () => {
//     expect((new ItemPath(['', 'C:/', 'parent1/parent2'], '', true)).getParents()).toEqual(['C', 'parent1', 'parent2']);
// });

/* Full Path */

test('get full root path without parent', () => {
    expect((new ItemPath(undefined, [], true)).getFullPath()).toEqual('/');
});

test('get full drive path without parent', () => {
    expect((new ItemPath('C', [], true)).getFullPath()).toEqual('C:/');
});

test('get full directory path with drive parent', () => {
    expect((new ItemPath('C', ['dir'], true)).getFullPath()).toEqual('C:/dir/');
});

test('get full file path without parent', () => {
    expect((new ItemPath(undefined, ['file.txt'], false)).getFullPath()).toEqual('/file.txt');
});

test('get full directory path without parent', () => {
    expect((new ItemPath(undefined, ['dir'], true)).getFullPath()).toEqual('/dir/');
});

test('get full directory path with parents', () => {
    expect((new ItemPath('C', ['parent1', 'parent2', 'dir'], true)).getFullPath()).toEqual('C:/parent1/parent2/dir/');
});

test('get full file path with parents', () => {
    expect((new ItemPath('C', ['parent1', 'parent2', 'file.txt'], false)).getFullPath()).toEqual('C:/parent1/parent2/file.txt');
});

/* File Identifier */

test('[failure] generate empty file identifier', () => {
    expect(() => FileItemIdentifier.from('')).toThrowError(ItemPathErrorKind.EmptyFileIdentifier);
});

test('generate normal file identifier', () => {
    expect(FileItemIdentifier.from('file.txt')).toEqual(new FileItemIdentifier('file', 'txt'));
});

test('generate file identifier without extension', () => {
    expect(FileItemIdentifier.from('file')).toEqual(new FileItemIdentifier('file', ''));
});

test('generate file identifier without name', () => {
    expect(FileItemIdentifier.from('.txt')).toEqual(new FileItemIdentifier('', 'txt'));
});
