const neuquant = require('neuquant');
const { PNG } = require('pngjs');
const fs = require('fs');
const { rgb_triplets_from, create_image_data } = require('./image-data');
const { map_to_palette } = require('./map-to-palette');
const { read_png } = require('./read-png');
const { write_png } = require('./write-png');
const { write_bmp } = require('./write-bmp');
const { detect_format_from_file_name, strip_extension } = require('./file-handling');
const { write_pcx } = require('./write-pcx');

setTimeout(main, 0);

async function main() {
    const in_file_path = process.argv[2] || 'bnf.PNG';
    let out_file_path = process.argv[3];

    const in_format = detect_format_from_file_name(in_file_path);

    if (!fs.existsSync(in_file_path))
    {
        console.error('input file not found');
        print_usage_and_exit();
    }

    const out_format = (typeof out_file_path === 'string' && out_file_path.length > 0)
        ? detect_format_from_file_name(out_file_path) || 'pcx' 
        : 'pcx';

    if (!out_file_path){
        out_file_path =  strip_extension(in_file_path) + '-256.' + out_format;
    }

    console.log(in_file_path, 'reading');
    const image = await read_input(in_file_path, in_format);

    console.log(in_file_path, 'quantizing');
    const palette = get_palette(image, { quality: 1, gamma_bias: 1 });
    const result = map_to_palette(image, palette, { error_propagation: 0.8 });

    console.log(in_file_path, 'writing', out_file_path);
    write_output(out_file_path, out_format, result);
}

function print_usage_and_exit(){
    console.error('exactly 2 arguments are required', `${process.argv0} ${process.argv[1]} input.png output.png`);
    process.exit(1);
}

async function read_input(file_path, format = 'png'){
    switch (format){
        case 'png':
            return await read_png(file_path);
        default: 
            throw new Error('input format not supported')
    }
}

async function write_output(file_path = '', format = 'png', image = map_to_palette()){
    switch (format){
        case "bmp": 
            return await write_bmp(file_path, image);
        case "png":
            return await write_png(file_path, image);
        case "pcx":
            return await write_pcx(file_path, image)
        default:
            throw new Error('unsupported output format');
    }
}

function get_palette(image = create_image_data(), options = { quality: 1, gamma_bias: 1 }){
    options = { quality: 1, gamma_bias: 1, ...options };
    if (gamma_bias === 1){
        return neuquant.getPalette(rgb_triplets_from(image), quality);
    } else {
        const colors = rgb_triplets_from(image).map(c=>Math.floor(Math.pow(c/256.0,gamma_bias)*256.0));
        const palette = neuquant.getPalette(colors, quality);
        return palette.map(c=>Math.floor(Math.pow(c/256,1/gamma_bias)*256));
    }
}
