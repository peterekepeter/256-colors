const { PNG } = require("pngjs");
const { read_file } = require("./file-handling");
const { create_image_data } = require("./image-data");

module.exports = {
    read_png
}

async function read_png(file_path = ''){
    const buffer = await read_file(file_path);
    const png = await decode_png(buffer);
    return create_image_data(png.width, png.height, png.data);
};

async function decode_png(buffer){
    return new Promise((resolve, reject) => codec.parse(buffer, (err, png) => {
        if (err) { reject(err); }
        resolve(png);
    }));
}
const codec = new PNG({
    filterType: 4,
});
