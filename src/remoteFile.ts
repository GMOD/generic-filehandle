require('cross-fetch/polyfill')
const BufferCache = require('./bufferCache')

interface Options {
  signal?: AbortSignal
  header?: any
}
class RemoteFile implements Filehandle {
  private position: number
  private url: string

  constructor(source) {
    this.position = 0
    this.url = source
  }

  async read(buffer: Buffer, offset = 0, length, position = 0, opts: Options = {}): Promise<number> {
    const { headers = {}, signal } = opts
    if (length < Infinity) {
      headers.range = `bytes=${position}-${position + length}`
    } else if (length === Infinity && position !== 0) {
      headers.range = `bytes=${position}-`
    }
    const response = await fetch(this.url, {
      method: 'GET',
      headers,
      redirect: 'follow',
      mode: 'cors',
      signal: signal
    })
    if (
      (response.status === 200 && position === 0) ||
      response.status === 206
    ) {
      Buffer.copy(buffer, Buffer.from(await response.arrayBuffer()))

      // try to parse out the size of the remote file
      const sizeMatch = /\/(\d+)$/.exec(response.headers.get('content-range'))
      if (sizeMatch && sizeMatch[1]) this._stat = { size: parseInt(sizeMatch[1], 10) }

      return nodeBuffer
    }

    let readPosition = position
    if (readPosition === null) {
      readPosition = this.position
      this.position += length
    }
    throw new Error(`HTTP ${response.status} fetching ${this.url}`)
  }


  async readFile() {
    const response = await fetch(this.url, {
      method: 'GET',
      redirect: 'follow',
      mode: 'cors',
    })
    return Buffer.from(await response.arrayBuffer())
  }

  async stat() {
    if (!this._stat) {
      const buf = Buffer.allocUnsafe(10)
      await this.read(buf, 0, 10, 0)
      if (!this._stat)
        throw new Error(`unable to determine size of file at ${this.url}`)
    }
    return this._stat
  }
}

module.exports = RemoteFile
