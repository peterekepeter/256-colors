const neuquant = require('neuquant');
const { PNG } = require('pngjs');
const fs = require('fs');
const { rgb_triplets_from } = require('./image-data');
const { map_to_palette } = require('./map-to-palette');
const { read_png } = require('./read-png');
const { write_png } = require('./write-png');

setTimeout(main, 0);

async function main() {
    const in_file_path = process.argv[2];
    let out_file_path = process.argv[3];

    if (!fs.existsSync(in_file_path))
    {
        console.error('input file not found');
        print_usage_and_exit();
    }

    if (!out_file_path){
        out_file_path = in_file_path + '.out-256.png';
    }

    console.log(in_file_path, 'reading');
    const image = await read_png(in_file_path);

    console.log(in_file_path, 'quantizing');
    const palette = neuquant.getPalette(rgb_triplets_from(image), 1);
    const new_image = map_to_palette(image, palette);

    console.log(in_file_path, 'writing', out_file_path);
    await write_png(out_file_path, new_image);
}

function print_usage_and_exit(){
    console.error('exactly 2 arguments are required', `${process.argv0} ${process.argv[1]} input.png output.png`);
    process.exit(1);
}
