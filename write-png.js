const { PNG } = require("pngjs");
const { create_image_data } = require("./image-data");
const fs = require('fs');

module.exports = {
    write_png
}

async function write_png(file_path = '', image = create_image_data()) {
    const dst = new PNG({
        width: image.width,
        height: image.height
    });
    dst.data = Buffer.alloc(dst.width * dst.height * 4);
    console.log(dst.data.length);
    PNG.bitblt(image, dst, 0, 0, image.width, image.height, 0, 0);
    console.log(dst.data.length);
    dst.pack();
    console.log(dst.data);
    dst.pipe(fs.createWriteStream(file_path));
}
