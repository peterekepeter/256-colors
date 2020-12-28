const { assert } = require('./assert');

module.exports = {
    map_to_palette
}

function map_to_palette(
    target_image = { width: 0, height: 0, data: Buffer.from([]) },
    palette = Buffer.from([ 0,0,0, 255,255,255 ]),
    options = {
        error_propagation: 0.8
    }
) {
    const { error_propagation } = { error_propagation: 0.8, ...options }
    const img = target_image
    
    assert(target_image != null)
    assert(typeof img.width === 'number')
    assert(typeof img.height === 'number')
    assert(img.data != null)
    assert(palette != null)
    assert(palette.length % 3 === 0, "required concatenated triplets R,G,B")
    assert(palette.length / 3 >= 2, "need at least 2 colors")

    const result = Buffer.from(img.data);
    const result_index_list = Buffer.alloc(img.width * img.height);
    const result_stats = [];
    for (let i=0; i<256; i++){
        result_stats[i] = 0;
    }
    
    const epf = Math.max(Math.min(error_propagation,1),0);
    
    let err_nr = [], err_ng = [], err_nb = [];
    let err_cr = [], err_cg = [], err_cb = [];
    
    for (let i = 0; i < img.width+2; i++){
        err_nr[i] = err_ng[i] = err_nb[i] = 0;
    }
    
    for (var y = 0; y < img.height; y++) {
    
        let err_nx_r = 0, err_nx_g = 0, err_nx_b = 0;
    
        [err_cr, err_nr] = [err_nr, err_cr];
        [err_cg, err_ng] = [err_ng, err_cg];
        [err_cb, err_nb] = [err_nb, err_cb];
    
        for (let i = 0; i < img.width+2; i++){
            err_nr[i] = err_ng[i] = err_nb[i] = 0;
        }
    
        for (var x = 0; x < img.width; x++) {
            const pixel_idx = img.width * y + x;
            const pixel_idx_32bit = pixel_idx << 2;
            const orig_r = img.data[pixel_idx_32bit + 0];
            const orig_g = img.data[pixel_idx_32bit + 1];
            const orig_b = img.data[pixel_idx_32bit + 2];
            const tgt_r = orig_r + err_nx_r + err_cr[x+1];
            const tgt_g = orig_g + err_nx_g + err_cg[x+1];
            const tgt_b = orig_b + err_nx_b + err_cb[x+1];
            const color_idx = findClosestRGB(palette, 
                tgt_r, tgt_g, tgt_b);
            const pal_idx = color_idx*3;
            const pal_r = palette[pal_idx + 0];
            const pal_g = palette[pal_idx + 1];
            const pal_b = palette[pal_idx + 2];
            const ce_r = epf*(tgt_r - pal_r);
            const ce_g = epf*(tgt_g - pal_g);
            const ce_b = epf*(tgt_b - pal_b);
            err_nx_r = ce_r * 0.4375;
            err_nx_g = ce_g * 0.4375;
            err_nx_b = ce_b * 0.4375;
            err_nr[x+0] += ce_r * 0.1875;
            err_ng[x+0] += ce_g * 0.1875;
            err_nb[x+0] += ce_b * 0.1875;
            err_nr[x+1] += ce_r * 0.3125;
            err_ng[x+1] += ce_g * 0.3125;
            err_nb[x+1] += ce_b * 0.3125;
            err_nr[x+2] += ce_r * 0.0625;
            err_ng[x+2] += ce_g * 0.0625;
            err_nb[x+2] += ce_b * 0.0625;
            result[pixel_idx_32bit + 0] = pal_r;
            result[pixel_idx_32bit + 1] = pal_g;
            result[pixel_idx_32bit + 2] = pal_b;
            result_index_list[pixel_idx] = color_idx;
            result_stats[color_idx]++;
        }
    }
        
    return {
        width: img.width,
        height: img.height,
        data: result,
        data_indexed: result_index_list,
        stat_indexed: result_stats,
        palette: Buffer.from(palette)
    }
}

function findClosestRGB(palette, r, g, b) {
    var minpos = 0;
    var dmin = 256 * 256 * 256;
    
    for (var i = 0; i < palette.length;) {
        var dr = r - palette[i++];
        var dg = g - palette[i++];
        var db = b - palette[i];
        var d = dr * dr + dg * dg + db * db;
        var index = i / 3 | 0;
        if (d < dmin) {
        dmin = d;
        minpos = index;
        }
        
        i++;
    }
    
    return minpos;
}