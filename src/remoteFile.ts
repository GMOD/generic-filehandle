import {
  GenericFilehandle,
  FilehandleOptions,
  Stats,
  Fetcher,
} from './filehandle'

export default class RemoteFile implements GenericFilehandle {
  protected url: string
  private _stat?: Stats
  private fetchImplementation: Fetcher
  private baseOverrides: any = {}

  private async getUint8ArrayFromResponse(res: Response): Promise<Uint8Array> {
    const resp = await res.arrayBuffer()
    return new Uint8Array(resp)
  }

  public constructor(source: string, opts: FilehandleOptions = {}) {
    this.url = source
    const fetch = opts.fetch || globalThis.fetch.bind(globalThis)
    if (!fetch) {
      throw new TypeError(
        `no fetch function supplied, and none found in global environment`,
      )
    }
    if (opts.overrides) {
      this.baseOverrides = opts.overrides
    }
    this.fetchImplementation = fetch
  }

  public async fetch(
    input: RequestInfo,
    init: RequestInit | undefined,
  ): Promise<Response> {
    let res
    try {
      res = await this.fetchImplementation(input, init)
    } catch (e) {
      if (`${e}`.includes('Failed to fetch')) {
        // refetch to to help work around a chrome bug (discussed in
        // generic-filehandle issue #72) in which the chrome cache returns a
        // CORS error for content in its cache.  see also
        // https://github.com/GMOD/jbrowse-components/pull/1511
        console.warn(
          `generic-filehandle: refetching ${input} to attempt to work around chrome CORS header caching bug`,
        )
        res = await this.fetchImplementation(input, {
          ...init,
          cache: 'reload',
        })
      } else {
        throw e
      }
    }
    return res
  }

  public async read(
    length: number,
    position = 0,
    opts: FilehandleOptions = {},
  ): Promise<Uint8Array> {
    const { headers = {}, signal, overrides = {} } = opts
    if (length < Infinity) {
      headers.range = `bytes=${position}-${position + length}`
    } else if (length === Infinity && position !== 0) {
      headers.range = `bytes=${position}-`
    }
    const args = {
      ...this.baseOverrides,
      ...overrides,
      headers: {
        ...headers,
        ...overrides.headers,
        ...this.baseOverrides.headers,
      },
      method: 'GET',
      redirect: 'follow',
      mode: 'cors',
      signal,
    }
    const res = await this.fetch(this.url, args)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} ${this.url}`)
    }

    if ((res.status === 200 && position === 0) || res.status === 206) {
      const resData = new Uint8Array(await res.arrayBuffer())

      // try to parse out the size of the remote file
      const range = res.headers.get('content-range')
      const sizeMatch = /\/(\d+)$/.exec(range || '')
      if (sizeMatch?.[1]) {
        this._stat = { size: parseInt(sizeMatch[1], 10) }
      }

      return resData
    }

    if (res.status === 200) {
      throw new Error(`HTTP ${res.status} fetching ${this.url}, expected 206`)
    } else {
      throw new Error(`HTTP ${res.status} fetching ${this.url}`)
    }
  }

  public async readFile(): Promise<Uint8Array>
  public async readFile(options: BufferEncoding): Promise<string>
  public async readFile<T extends undefined>(
    options:
      | Omit<FilehandleOptions, 'encoding'>
      | (Omit<FilehandleOptions, 'encoding'> & { encoding: T }),
  ): Promise<Uint8Array>
  public async readFile<T extends BufferEncoding>(
    options: Omit<FilehandleOptions, 'encoding'> & { encoding: T },
  ): Promise<string>
  readFile<T extends BufferEncoding>(
    options: Omit<FilehandleOptions, 'encoding'> & { encoding: T },
  ): T extends BufferEncoding
    ? Promise<Uint8Array>
    : Promise<Uint8Array | string>
  public async readFile(
    options: FilehandleOptions | BufferEncoding = {},
  ): Promise<Uint8Array | string> {
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
    const { headers = {}, signal, overrides = {} } = opts
    const args = {
      headers,
      method: 'GET',
      redirect: 'follow',
      mode: 'cors',
      signal,
      ...this.baseOverrides,
      ...overrides,
    }
    const response = await this.fetch(this.url, args)

    if (!response) {
      throw new Error('generic-filehandle failed to fetch')
    }

    if (response.status !== 200) {
      throw Object.assign(
        new Error(`HTTP ${response.status} fetching ${this.url}`),
        {
          status: response.status,
        },
      )
    }
    if (encoding === 'utf8') {
      return response.text()
    }
    if (encoding) {
      throw new Error(`unsupported encoding: ${encoding}`)
    }
    return this.getUint8ArrayFromResponse(response)
  }

  public async stat(): Promise<Stats> {
    if (!this._stat) {
      await this.read(10, 0)
      if (!this._stat) {
        throw new Error(`unable to determine size of file at ${this.url}`)
      }
    }
    return this._stat
  }

  public async close(): Promise<void> {
    return
  }
}
