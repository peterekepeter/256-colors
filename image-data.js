const { assert } = require("./assert");

module.exports = {
    create_image_data,
    rgb_triplets_from: rgb_24bpp_from,
    abgr_32bpp_from,
    rgb_24bpp_from
}

function create_image_data(width = 0, height = 0, data = Buffer.alloc(width * height * 4)) {
    assert(width != null, height != null);
    const result = { width, height, data: data || Buffer.alloc(width * height * 4) };
    assert(result.width * result.height * 4 === result.data.length)
    return result;
}

function rgb_24bpp_from(image = create_image_data()) {
    assert(image);
    assert(image.data);
    const colors = Buffer.alloc(image.width * image.height * 3);
    for (var y = 0; y < image.height; y++) {
        for (var x = 0; x < image.width; x++) {
            const pixel_idx = (image.width * y + x);
            const src_idx = pixel_idx * 4;
            const dst_idx = pixel_idx * 3;
            for (let i=0; i<3; i++){
                colors[dst_idx + i] = image.data[src_idx + i];
            }
        }
    }
    assert(colors.length === image.width * image.height * 3);
    return colors;
}

function abgr_32bpp_from(image = create_image_data()){
    assert(image);
    assert(image.data);
    const colors = Buffer.alloc(image.width * image.height * 4);
    for (var y = 0; y < image.height; y++) {
        for (var x = 0; x < image.width; x++) {
            const pixel_idx = (image.width * y + x);
            const src_idx = pixel_idx * 4;
            const dst_idx = pixel_idx * 4;
            // swap RGBA to ARGB
            colors[dst_idx + 0] = image.data[src_idx + 3];
            colors[dst_idx + 1] = image.data[src_idx + 2];
            colors[dst_idx + 2] = image.data[src_idx + 1];
            colors[dst_idx + 3] = image.data[src_idx + 0];
        }
    }
    return colors;
}