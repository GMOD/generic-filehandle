export function toString(buf: Uint8Array) {
  let str = ''
  for (let i = 0; i < buf.byteLength; i++) {
    str += String.fromCharCode(buf[i])
  }
  return str
}
