export type Fetcher = (
  input: RequestInfo,
  init?: RequestInit,
) => Promise<PolyfilledResponse>

/**
 * a fetch response object that might have some additional properties
 * that come from the underlying fetch implementation, such as the
 * `buffer` method on node-fetch responses.
 */
export interface PolyfilledResponse extends Response {
  buffer?: Function | void
}

export interface FilehandleOptions {
  /**
   * optional AbortSignal object for aborting the request
   */
  signal?: AbortSignal
  headers?: any
  overrides?: any
  encoding?: BufferEncoding | null
  /**
   * fetch function to use for HTTP requests. defaults to environment's
   * global fetch. if there is no global fetch, and a fetch function is not provided,
   * throws an error.
   */
  fetch?: Fetcher
}

export interface Stats {
  size: number
  [key: string]: any
}

export interface GenericFilehandle {
  read(
    buf: Buffer,
    offset: number,
    length: number,
    position: number,
    opts?: FilehandleOptions,
  ): Promise<{ bytesRead: number; buffer: Buffer }>
  readFile(options?: FilehandleOptions | BufferEncoding): Promise<Buffer | string>
  stat(): Promise<Stats>
}
