const { assert } = require("./assert");
const { encode_pcx } = require("./encode-pcx");
const { write_file } = require("./file-handling");
const { map_to_palette } = require("./map-to-palette");

module.exports = {
    write_pcx
}

async function write_pcx(file_path = '', image = map_to_palette()){
    assert(file_path && file_path != '');
    assert(image.data_indexed);
    assert(image.palette);
    const pcx_data = encode_pcx(image);
    await write_file(file_path, pcx_data);
}