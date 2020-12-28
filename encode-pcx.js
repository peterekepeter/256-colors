const { assert } = require("./assert");

'use strict';

module.exports = {
    encode_pcx,
    __pcx_rle_encode : pcx_rle_encode
}

const encoder_input = {
    width: 0, 
    height: 0,
    data_indexed: [0],
    palette: [0]
}


function encode_pcx(input = encoder_input){
    assert(input.width > 0 && input.width <= 65536);
    assert(input.height > 0 && input.height <= 65536);
    assert(input.palette.length === 768); // 256 RGB values

    const bpp = 8;
    const dpi = 192;
    const scanline_bytes = Math.ceil(input.width * bpp / 8);

    const pcx_data = prepare_image_data(input);
    assert(pcx_data);
    const compressed_data = pcx_rle_encode(pcx_data);
    const palette_offset = size_header + compressed_data.length;
    const file_size = palette_offset + 1 + 768;

    const out = Buffer.alloc(file_size);
    
    write_header(out, bpp, input.width, input.height, dpi, scanline_bytes);
    for (let i=0; i<compressed_data.length; i++){
        out.writeUInt8(compressed_data[i], size_header + i);
    }
    out.writeUInt8(palette_magic_value, palette_offset);
    for (let i=0; i<768; i++){
        out.writeUInt8(input.palette[i], palette_offset + 1 + i);
    }
    return out;
}

const header_magic_value = 0x0A;

const header_version_paintbrush_3 = 5;

const encoding_rle = 1;
const encoding_none = 0; // rarely used

const bpp_2_color = 1; // monochrome
const bpp_4_color = 2;
const bpp_16_color = 4;
const bpp_256_color = 8;

const palette_mode_grayscale = 2;
const palette_mode_color = 1; // or monochrome (2 colors)

const color_planes_1 = 1;
const color_planes_3 = 3;
const color_planes_4 = 4;

const palette_magic_value = 0x0C;

const offset_fixed_value = 0x00; // fixed magic value
const offset_paintbrush_version = 0x01; // enum
const offset_encoding = 0x02; // enum
const offset_bpp = 0x03; // enum
const offset_min_x = 0x04; // uint16
const offset_min_y = 0x06; // uint16
const offset_max_x = 0x08; // uint16
const offset_max_y = 0x0A; // uint16
const offset_horizontal_dpi = 0x0C; // uint16
const offset_vertical_dpi = 0x0E; // uint16
const offset_ega_palette = 0x10; // for 16-color images (48 bytes)
const offset_first_reserved_field = 0x40;
const offset_color_planes = 0x41;
const offset_scanline_bytes = 0x42;
const offset_palette_mode = 0x44;
const offset_source_screen_width = 0x46;
const offset_source_screen_height = 0x48;
const offset_second_reserved_field = 0x4A;

const size_ega_palette = 48;
const size_second_reserved_field = 54;
const size_header = 128;

function write_header(
    out = Buffer.alloc(0), 
    bpp = 8, 
    width = 0, 
    height = 0, 
    dpi = 192, 
    scanline_bytes = 0
){

    const min_x = 0;
    const min_y = 0;
    const max_x = width - 1;
    const max_y = height - 1;

    out.writeUInt8(header_magic_value, offset_fixed_value);
    out.writeUInt8(header_version_paintbrush_3, offset_paintbrush_version);
    out.writeUInt8(encoding_rle, offset_encoding);
    out.writeUInt8(bpp, offset_bpp);
    out.writeUInt16LE(min_x, offset_min_x);
    out.writeUInt16LE(min_y, offset_min_y);
    out.writeUInt16LE(max_x, offset_max_x);
    out.writeUInt16LE(max_y, offset_max_y);
    out.writeUInt16LE(dpi, offset_horizontal_dpi);
    out.writeUInt16LE(dpi, offset_vertical_dpi);
    for (let i=0; i<size_ega_palette; i++){
        out.writeUInt8(0, offset_ega_palette + i);
    }
    out.writeUInt8(0, offset_first_reserved_field);
    out.writeUInt8(color_planes_1, offset_color_planes);
    out.writeUInt16LE(palette_mode_color, offset_palette_mode);
    out.writeUInt16LE(scanline_bytes, offset_scanline_bytes);
    out.writeUInt16LE(0, offset_source_screen_width);
    out.writeUInt16LE(0, offset_source_screen_height);
    for (let i=0; i<size_second_reserved_field; i++){
        out.writeUInt8(0, offset_second_reserved_field + i);
    }
}

function pcx_rle_encode(src_bytes = []){
    let stored;
    let counter = 0;
    let src_idx = 0;
    let result_bytes = [];

    for (const value of src_bytes) {
        if (counter === 0){
            stored = value;
            counter = 1;
        } else if (value !== stored || counter === 63){
            write_pixel_or_chunk();
            stored = value;
            counter = 1;
        } else if (value === stored){
            counter ++;
        }
    }

    if (counter > 0){
        // write final pixel or chunk
        write_pixel_or_chunk();
    }

    return result_bytes;

    function write_pixel_or_chunk(){
        if (counter > 1 && counter <= 63 || stored >= 192)
        {
            // pixel or chunk must be stored as a byte pair
            result_bytes.push(counter | 0b1100_0000);
        }
        result_bytes.push(stored);
        counter = 0;
    }
}

function prepare_image_data(input = encoder_input)
{
    if (input.palette && input.palette.length == 768){
        return input.data_indexed; // no need to change
    }
    throw new Error('not supported');
}
