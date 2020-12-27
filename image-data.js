const { assert } = require("./assert");

module.exports = {
    create_image_data,
    rgb_triplets_from
}

function create_image_data(width = 0, height = 0, data = Buffer.alloc(width * height * 4)) {
    assert(width != null, height != null);
    const result = { width, height, data: data || Buffer.alloc(width * height * 4) };
    assert(result.width * result.height * 4 === result.data.length)
    return result;
}

function rgb_triplets_from(image = create_image_data()) {
    assert(image);
    assert(image.data);
    const colors = [];
    for (var y = 0; y < image.height; y++) {
        for (var x = 0; x < image.width; x++) {
            var idx = (image.width * y + x) << 2;

            colors.push(image.data[idx], image.data[idx + 1], image.data[idx + 2]);
        }
    }
    assert(colors.length === image.width * image.height * 3);
    return colors;
}