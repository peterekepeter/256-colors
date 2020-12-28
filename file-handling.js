const fs = require('fs');
const { assert } = require('./assert');

module.exports = {
    read_file,
    write_file,
    strip_extension,
    detect_format_from_file_name
};

function read_file(file_path = '') {
    assert(file_path != null && file_path !== '')
    return new Promise((resolve, reject) => {
        fs.readFile(file_path, (err, data) => {
            if (err) { reject(err) }
            resolve(data);
        })
    });
}

function write_file(file_path = '', buffer = Buffer.alloc(0)) {
    assert(file_path != null && file_path !== '')
    return new Promise((resolve, reject) => {
        fs.writeFile(file_path, buffer, (err) => {
            if (err) { reject(err) }
        })
    })
}

function strip_extension(file_path = ''){
    let file_name_position = file_path.lastIndexOf('/') + 1;
    const dot_position = file_path.indexOf('.', file_name_position);
    const result = dot_position === -1
        ? file_path
        : file_path.substr(0, dot_position);
    if(result.length === 0){
        return file_path;
    }
    return result;
}

function detect_format_from_file_name(file_path = ''){
    if (file_path.endsWith('png') || file_path.endsWith('PNG')) {
        return 'png';
    }
    if (file_path.endsWith('bmp') || file_path.endsWith('BMP')) {
        return 'bmp';
    }
    if (file_path.endsWith('pcx') || file_path.endsWith('PCX')) {
        return 'pcx';
    }
    return null;
}