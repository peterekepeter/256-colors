const { encode_pcx, __pcx_rle_encode } = require("./encode-pcx")

const zeroes = [];
for (let i=0; i<256; i++) { zeroes.push(0,0,0); }

const dummy_pcx = encode_pcx({
    width: 4,
    height: 1, 
    data: [0,1,1,1],
    palette: [0,0,0, 255,255,255, ...zeroes.slice(0, 3*254)]
});

test('dummy_pcx contains encoded data', () => {
    expect(dummy_pcx[128]).toBe(0);
    expect(dummy_pcx[128 + 1]).toBe(0xc3);
    expect(dummy_pcx[128 + 2]).toBe(0x01);
});

test('dummy_pcx contains palette', () => {
    expect(dummy_pcx[dummy_pcx.length - 768 - 1]).toBe(0x0C);
});

test('header 0x00: fixed value 0x0A is written', () => 
    expect(dummy_pcx[0x00]).toBe(0x0A)
)

test('header 0x01: version 5 is written ', () => 
    expect(dummy_pcx[0x01]).toBe(0x05)
)

test('header 0x02: RLE is used by default', () => 
    expect(dummy_pcx[0x02]).toBe(0x01)
)

test('header 0x03: BPP per pixel is written, 8 by default', () => 
    expect(dummy_pcx[0x03]).toBe(0x08)
)

test('zero width throws', () => expect(() =>
    encode_pcx({ width: 0, height: 1, data:[], palette: dummy_pcx.palette })).toThrow()
)

test('zero height throws', () => expect(() =>
    encode_pcx({ width: 1, height: 0, data:[], palette: dummy_pcx.palette })).toThrow()
)

test('header 0x04: minimum x coordinate', () => 
    expect(dummy_pcx.readUInt16LE(0x04)).toBe(0)
)
test('header 0x06: minimum y coordinate', () => 
    expect(dummy_pcx.readUInt16LE(0x06)).toBe(0)
)

test('header 0x08: maximum x coordinate', () => 
    expect(dummy_pcx.readUInt16LE(0x08)).toBe(3)
)
test('header 0x10: maximum y coordinate', () => 
    expect(dummy_pcx.readUInt16LE(0x0A)).toBe(0)
)

test('header 0x12: horizontal dpi hardoded to 192', () => 
    expect(dummy_pcx.readUInt16LE(0x0C)).toBe(192)
)

test('header 0x14: vertical dpi hardoded to 192', () => 
    expect(dummy_pcx.readUInt16LE(0x0E)).toBe(192)
)

test('header ega palette is zero', () => {
    for (let i=0x10; i<0x10+16; i++){
        expect(dummy_pcx[i]).toBe(0);
    }
})

test('header 0x41: color planes', () => 
    expect(dummy_pcx[0x41]).toBe(1)
)

test('header 0x42: bytes per scanline', () => 
    expect(dummy_pcx.readUInt16LE(0x42)).toBe(4)
)

test('header 0x44: palette mode color', () => 
    expect(dummy_pcx.readUInt16LE(0x44)).toBe(1)
)

test('header 0x46: horizontal resolution of the source screen hardoded to 0', () => 
    expect(dummy_pcx.readUInt16LE(0x46)).toBe(0)
)

test('header 0x48: vertical resolution of the source screen hardoded to 0', () => 
    expect(dummy_pcx.readUInt16LE(0x48)).toBe(0)
)

test('header second reserved field is empty', () => {
    for (let i=0x4A; i<0x4a+54; i++){
        expect(dummy_pcx[i]).toBe(0);
    }
});

[
    [[], []],
    [[42], [42]],
    [[13,42], [13,42]],
    [[13,13], [0xC2,13]],
    [[13,13,13], [0xC3,13]],
    [[13,13,13,69,0,0,0,0], [0xC3,13,69,0xC4,0]],
    [[192], [0xC1,192]],
    [[255], [0xC1,255]],
].map(item => test(`__pcx_rle_encode(${
        JSON.stringify(item[0])}) == ${JSON.stringify(item[1])}`,
    () => expect(__pcx_rle_encode(item[0])).toEqual(item[1])
));

