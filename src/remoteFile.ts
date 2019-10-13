import uri2path from 'file-uri-to-path'
import { GenericFilehandle, FilehandleOptions, Stats, Fetcher, PolyfilledResponse } from './filehandle'
import { LocalFile } from '.'

const myGlobal = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : { fetch: undefined }

export default class RemoteFile implements GenericFilehandle {
  public url: string
  public _stat?: Stats
  public fetch?: Fetcher
  public baseOverrides: any = {}

  private async getBufferFromResponse(response: PolyfilledResponse): Promise<Buffer> {
    if (typeof response.buffer === 'function') {
      return response.buffer()
    } else if (typeof response.arrayBuffer === 'function') {
      const resp = await response.arrayBuffer()
      return Buffer.from(resp)
    } else {
      throw new TypeError('invalid HTTP response object, has no buffer method, and no arrayBuffer method')
    }
  }

  public constructor(source: string, opts: FilehandleOptions = {}) {
    this.url = source

    // if it is a file URL, monkey-patch ourselves to act like a LocalFile
    if (source.startsWith('file://')) {
      const path = uri2path(source)
      if (!path) throw new TypeError('invalid file url')
      const localFile = new LocalFile(path)
      this.read = localFile.read.bind(localFile)
      this.readFile = localFile.readFile.bind(localFile)
      this.stat = localFile.stat.bind(localFile)
      return
    }

    const fetch = opts.fetch || (myGlobal.fetch && myGlobal.fetch.bind(myGlobal))
    if (!fetch) {
      throw new TypeError(`no fetch function supplied, and none found in global environment`)
    }
    this.fetch = fetch

    if (opts.overrides) {
      this.baseOverrides = opts.overrides
    }
  }

  public async getFetch(opts: FilehandleOptions): Promise<PolyfilledResponse> {
    if (!this.fetch) throw new Error('a fetch function must be available unless using a file:// url')
    const { headers = {}, signal, overrides = {} } = opts
    const requestOptions = {
      headers,
      method: 'GET',
      redirect: 'follow',
      mode: 'cors',
      signal,
      ...this.baseOverrides,
      ...overrides,
    }
    const response = await this.fetch(this.url, requestOptions)
    if (!this._stat) {
      // try to parse out the size of the remote file
      if (requestOptions.headers && requestOptions.headers.range) {
        const contentRange = response.headers.get('content-range')
        const sizeMatch = /\/(\d+)$/.exec(contentRange || '')
        if (sizeMatch && sizeMatch[1]) this._stat = { size: parseInt(sizeMatch[1], 10) }
      } else {
        const contentLength = response.headers.get('content-length')
        if (contentLength) this._stat = { size: parseInt(contentLength, 10) }
      }
    }
    return response
  }

  public async headFetch(): Promise<PolyfilledResponse> {
    return this.getFetch({ overrides: { method: 'HEAD' } })
  }

  public async read(
    buffer: Buffer,
    offset = 0,
    length: number,
    position = 0,
    opts: FilehandleOptions = {},
  ): Promise<{ bytesRead: number; buffer: Buffer }> {
    opts.headers = opts.headers || {}
    if (length < Infinity) {
      opts.headers.range = `bytes=${position}-${position + length}`
    } else if (length === Infinity && position !== 0) {
      opts.headers.range = `bytes=${position}-`
    }

    const response = await this.getFetch(opts)
    if ((response.status === 200 && position === 0) || response.status === 206) {
      const responseData = await this.getBufferFromResponse(response)
      const bytesCopied = responseData.copy(buffer, offset, 0, Math.min(length, responseData.length))

      return { bytesRead: bytesCopied, buffer }
    }

    // TODO: try harder here to gather more information about what the problem is
    throw new Error(`HTTP ${response.status} fetching ${this.url}`)
  }

  public async readFile(options: FilehandleOptions | string = {}): Promise<Buffer | string> {
    let encoding
    let opts
    if (typeof options === 'string') {
      encoding = options
      opts = {}
    } else {
      encoding = options.encoding
      opts = options
      delete opts.encoding
    }
    const response = await this.getFetch(opts)
    if (response.status !== 200) {
      throw Object.assign(new Error(`HTTP ${response.status} fetching ${this.url}`), {
        status: response.status,
      })
    }
    if (encoding === 'utf8') return response.text()
    if (encoding) throw new Error(`unsupported encoding: ${encoding}`)
    return this.getBufferFromResponse(response)
  }

  public async stat(): Promise<Stats> {
    if (!this._stat) await this.headFetch()
    if (!this._stat) await this.read(Buffer.allocUnsafe(10), 0, 10, 0)
    if (!this._stat) throw new Error(`unable to determine size of file at ${this.url}`)
    return this._stat
  }
}
