/**
 * A minimal ZIP writer using the STORE method (no compression).
 *
 * Task files are a few hundred bytes of markdown each, so compression buys nothing
 * worth a ~100 KB dependency. Everything below is the standard PKZIP layout:
 * a local header + data per entry, a central directory, then the end-of-central-
 * directory record.
 *
 * Pure: takes and returns bytes.
 */

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Pack a Date into the DOS date/time pair ZIP headers use. */
function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time:
      (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

class ByteWriter {
  constructor() {
    this.chunks = [];
    this.length = 0;
  }

  bytes(data) {
    this.chunks.push(data);
    this.length += data.length;
  }

  u16(value) {
    this.bytes(new Uint8Array([value & 0xff, (value >>> 8) & 0xff]));
  }

  u32(value) {
    this.bytes(
      new Uint8Array([
        value & 0xff,
        (value >>> 8) & 0xff,
        (value >>> 16) & 0xff,
        (value >>> 24) & 0xff,
      ])
    );
  }

  concat() {
    const out = new Uint8Array(this.length);
    let offset = 0;
    for (const chunk of this.chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    return out;
  }
}

/**
 * Build a ZIP archive from a `filename -> string` map.
 * Returns a `Uint8Array`; the caller wraps it in a Blob to download.
 */
export function createZip(files, now = new Date()) {
  const encoder = new TextEncoder();
  const { time, date } = dosDateTime(now);
  const body = new ByteWriter();
  const entries = [];

  for (const [name, text] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(text);
    const crc = crc32(data);
    entries.push({ nameBytes, size: data.length, crc, offset: body.length });

    body.u32(LOCAL_SIG);
    body.u16(20); // version needed
    body.u16(0x0800); // flags: filename is UTF-8
    body.u16(0); // method: store
    body.u16(time);
    body.u16(date);
    body.u32(crc);
    body.u32(data.length); // compressed size
    body.u32(data.length); // uncompressed size
    body.u16(nameBytes.length);
    body.u16(0); // extra field length
    body.bytes(nameBytes);
    body.bytes(data);
  }

  const centralStart = body.length;
  for (const entry of entries) {
    body.u32(CENTRAL_SIG);
    body.u16(20); // version made by
    body.u16(20); // version needed
    body.u16(0x0800);
    body.u16(0);
    body.u16(time);
    body.u16(date);
    body.u32(entry.crc);
    body.u32(entry.size);
    body.u32(entry.size);
    body.u16(entry.nameBytes.length);
    body.u16(0); // extra
    body.u16(0); // comment
    body.u16(0); // disk number
    body.u16(0); // internal attrs
    body.u32(0); // external attrs
    body.u32(entry.offset);
    body.bytes(entry.nameBytes);
  }
  const centralSize = body.length - centralStart;

  body.u32(EOCD_SIG);
  body.u16(0); // this disk
  body.u16(0); // disk with central directory
  body.u16(entries.length);
  body.u16(entries.length);
  body.u32(centralSize);
  body.u32(centralStart);
  body.u16(0); // comment length

  return body.concat();
}
