const { create_image_data, abgr_32bpp_from } = require('./image-data');
const { write_file } = require('./file-handling');
const bmp = require("bmp-js");

module.exports = {
    write_bmp
}

async function write_bmp(file_path = '', image = create_image_data())
{
    await write_file(file_path, encode_bmp(image));
}

function encode_bmp(image = create_image_data()){
    return bmp.encode({
        data: abgr_32bpp_from(image),
        width: image.width, 
        height: image.height
    }).data;
}