const { strip_extension, detect_format_from_file_name } = require('./file-handling');

[
    ['test.png', 'test'],
    ['./test.png', './test'],
    ['./test.whatever.png', './test'],
    ['no_extension', 'no_extension'],
    ['../no_extension', '../no_extension'],
    ['.gitignore', '.gitignore']
].map(item => test(
    `strip_extension "${item[0]}": "${item[1]}"`, () =>
        expect(strip_extension(item[0])).toBe(item[1])
    )
);

[
    ['test.png', 'png'],
    ['test.PNG', 'png'],
    ['test.whatever.png', 'png'],
    ['test.bmp', 'bmp'],
    ['test.BMP', 'bmp'],
].map(item => test(
    `detect_format_from_file_name "${item[0]}": "${item[1]}"`,
    () => expect(detect_format_from_file_name(item[0])).toBe(item[1])
));