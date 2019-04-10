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
      const resp = await response.arrayBuffer()
      const ret = Buffer.from(resp)

      ret.copy(buffer)

      // try to parse out the size of the remote file
      const sizeMatch = /\/(\d+)$/.exec(response.headers.get('content-range'))
      if (sizeMatch && sizeMatch[1]) this._stat = { size: parseInt(sizeMatch[1], 10) }
      this.position += length

      return resp.byteLength
    }

    throw new Error(`HTTP ${response.status} fetching ${this.url}`)
  }


  async readFile(opts: Options = {}) {
    const { headers = {}, signal } = opts
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
