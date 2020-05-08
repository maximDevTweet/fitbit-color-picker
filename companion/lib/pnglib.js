import tinycolor from "./tinycolor";
import * as base64 from "./base64js";

const HEADER = '\x89PNG\r\n\x1A\n';

/* Create crc32 lookup table */
const _crc32 = new Array();
for (let i = 0; i < 256; i++) {
	let c = i;
	for (let j = 0; j < 8; j++) {
		if (c & 1) {
			c = -306674912 ^ ((c >> 1) & 0x7fffffff);
		} else {
			c = (c >> 1) & 0x7fffffff;
		}
	}
	_crc32[i] = c;
}

// compute crc32 of the PNG chunks
function crc32(buffer, offset, size) {
	let crc = -1;
	for (var i = 4; i < size - 4; i++) {
		crc = _crc32[(crc ^ buffer[offset + i]) & 0xff] ^ ((crc >> 8) & 0x00ffffff);
	}
	write4(buffer, offset + size - 4, crc ^ -1);
}

function write4(buffer, offset, value) {
	buffer[offset++] = (value >> 24) & 255;
	buffer[offset++] = (value >> 16) & 255;
	buffer[offset++] = (value >> 8) & 255;
	buffer[offset++] = value & 255;
	return offset;
}

function write2(buffer, offset, value) {
	buffer[offset++] = (value >> 8) & 255;
	buffer[offset++] = value & 255;
	return offset;
}

function write2lsb(buffer, offset, value) {
	buffer[offset++] = value & 255;
	buffer[offset++] = (value >> 8) & 255;
	return offset;
}

function writeString(buffer, offset, string) {
	for (let i = 0, n = string.length; i < n; i++) {
		buffer[offset++] = string.charCodeAt(i);
	}
	return offset;
}

export function createPngImage(width, height, depth, backgroundColor = 'transparent') {
	var pngImage = {};

	pngImage.width = width;
	pngImage.height = height;
	pngImage.depth = depth;

	// pixel data and row filter identifier size
	pngImage.bit_depth = 8;
	pngImage.pix_format = 3; // indexed
	pngImage.pix_size = height * (width + 1);

	// deflate header, pix_size, block headers, adler32 checksum
	pngImage.data_size = 2 + pngImage.pix_size + 5 * Math.floor((0xfffe + pngImage.pix_size) / 0xffff) + 4;

	// offsets and sizes of Png chunks
	pngImage.ihdr_offs = 0;                                 // IHDR offset and size
	pngImage.ihdr_size = 4 + 4 + 13 + 4;
	pngImage.plte_offs = pngImage.ihdr_offs + pngImage.ihdr_size;   // PLTE offset and size
	pngImage.plte_size = 4 + 4 + 3 * depth + 4;
	pngImage.trns_offs = pngImage.plte_offs + pngImage.plte_size;   // tRNS offset and size
	pngImage.trns_size = 4 + 4 + depth + 4;
	pngImage.idat_offs = pngImage.trns_offs + pngImage.trns_size;   // IDAT offset and size
	pngImage.idat_size = 4 + 4 + pngImage.data_size + 4;
	pngImage.iend_offs = pngImage.idat_offs + pngImage.idat_size;   // IEND offset and size
	pngImage.iend_size = 4 + 4 + 4;
	pngImage.buffer_size = pngImage.iend_offs + pngImage.iend_size;    // total PNG size

	// allocate buffers
	const rawBuffer = new ArrayBuffer(HEADER.length + pngImage.buffer_size);
	writeString(new Uint8Array(rawBuffer), 0, HEADER);
	const buffer = new Uint8Array(rawBuffer, HEADER.length, pngImage.buffer_size);
	pngImage.buffer = buffer;
	pngImage.palette = new Object();
	pngImage.pindex = 0;

	// initialize non-zero elements
	let off = write4(buffer, pngImage.ihdr_offs, pngImage.ihdr_size - 12);
	off = writeString(buffer, off, 'IHDR');
	off = write4(buffer, off, width);
	off = write4(buffer, off, height);
	buffer[off++] = pngImage.bit_depth;
	buffer[off++] = pngImage.pix_format;
	off = write4(buffer, pngImage.plte_offs, pngImage.plte_size - 12);
	writeString(buffer, off, 'PLTE');
	off = write4(buffer, pngImage.trns_offs, pngImage.trns_size - 12);
	writeString(buffer, off, 'tRNS');
	off = write4(buffer, pngImage.idat_offs, pngImage.idat_size - 12);
	writeString(buffer, off, 'IDAT');
	off = write4(buffer, pngImage.iend_offs, pngImage.iend_size - 12);
	writeString(buffer, off, 'IEND')

	// initialize deflate header
	let header = ((8 + (7 << 4)) << 8) | (3 << 6);
	header += 31 - (header % 31);
	write2(buffer, pngImage.idat_offs + 8, header);

	// initialize deflate block headers
	for (let i = 0; (i << 16) - 1 < pngImage.pix_size; i++) {
		let size, bits;
		if (i + 0xffff < pngImage.pix_size) {
			size = 0xffff;
			bits = 0;
		} else {
			size = pngImage.pix_size - (i << 16) - i;
			bits = 1;
		}
		let off = pngImage.idat_offs + 8 + 2 + (i << 16) + (i << 2);
		buffer[off++] = bits;
		off = write2lsb(buffer, off, size);
		write2lsb(buffer, off, ~size);
	}
	pngImage.backgroundColor = createColor(pngImage, backgroundColor);

	return pngImage;
}

export function index(pngImage, x, y) {
	const i = y * (pngImage.width + 1) + x + 1;
	return pngImage.idat_offs + 8 + 2 + 5 * Math.floor((i / 0xffff) + 1) + i;
}

export function color(pngImage, red, green, blue, alpha) {
	alpha = alpha >= 0 ? alpha : 255;
	const color = (((((alpha << 8) | red) << 8) | green) << 8) | blue;

	if (pngImage.palette[color] === undefined) {
		if (pngImage.pindex == pngImage.depth) return 0;

		const ndx = pngImage.plte_offs + 8 + 3 * pngImage.pindex;

		pngImage.buffer[ndx + 0] = red;
		pngImage.buffer[ndx + 1] = green;
		pngImage.buffer[ndx + 2] = blue;
		pngImage.buffer[pngImage.trns_offs + 8 + pngImage.pindex] = alpha;

		pngImage.palette[color] = pngImage.pindex++;
	}
	return pngImage.palette[color];
}

export function getBase64(pngImage) {
	deflate(pngImage);
	return base64.fromByteArray(new Uint8Array(pngImage.buffer.buffer));
}

function deflate(pngImage) {
	const { width, height, buffer } = pngImage;

	// compute adler32 of output pixels + row filter bytes
	const BASE = 65521; // largest prime smaller than 65536
	const NMAX = 5552;  // NMAX is the largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1
	let s1 = 1;
	let s2 = 0;
	let n = NMAX;

	const baseOffset = pngImage.idat_offs + 8 + 2 + 5;
	for (let y = 0; y < height; y++) {
		for (let x = -1; x < width; x++) {
			const i = y * (width + 1) + x + 1;
			s1 += buffer[baseOffset * Math.floor((i / 0xffff) + 1) + i];
			s2 += s1;
			if ((n -= 1) == 0) {
				s1 %= BASE;
				s2 %= BASE;
				n = NMAX;
			}
		}
	}
	s1 %= BASE;
	s2 %= BASE;
	write4(buffer, pngImage.idat_offs + pngImage.idat_size - 8, (s2 << 16) | s1);

	crc32(buffer, pngImage.ihdr_offs, pngImage.ihdr_size);
	crc32(buffer, pngImage.plte_offs, pngImage.plte_size);
	crc32(buffer, pngImage.trns_offs, pngImage.trns_size);
	crc32(buffer, pngImage.idat_offs, pngImage.idat_size);
	crc32(buffer, pngImage.iend_offs, pngImage.iend_size);
}

export function getDataURL(pngImage) {
	return 'data:image/png;base64,' + getBase64(pngImage);
}

export function createColor(pngImage, col) {
	col = tinycolor(col);
	const rgb = col.toRgb();
	return color(pngImage, rgb.r, rgb.g, rgb.b, Math.round(rgb.a * 255));
}

export function setPixel(pngImage, x, y, color) {
	const i = y * (pngImage.width + 1) + x + 1;
	pngImage.buffer[pngImage.idat_offs + 8 + 2 + 5 * Math.floor((i / 0xffff) + 1) + i] = color;
}

export function getPixel(pngImage, x, y) {
	const i = y * (pngImage.width + 1) + x + 1;
	return pngImage.buffer[pngImage.idat_offs + 8 + 2 + 5 * Math.floor((i / 0xffff) + 1) + i];
}
