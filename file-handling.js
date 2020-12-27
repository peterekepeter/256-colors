const { PRIORITY_ABOVE_NORMAL } = require('constants');
const fs = require('fs');
const { assert } = require('./assert');

module.exports = {
    read_file
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

function write_file(filepath = '', buffer = Buffer.alloc(0)) {
    assert(filepath != null && filepath !== '')
    return new Promise(
        fs.writeFile(file_path, buffer, (err) => {
            if (err) { reject(err) }
        })
    )
}