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
  //eslint-disable-next-line @typescript-eslint/ban-types
  buffer?: Function | void
}

export interface FilehandleOptions {
  /**
   * optional AbortSignal object for aborting the request
   */
  signal?: AbortSignal
  headers?: any
  overrides?: any
  encoding?: BufferEncoding
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
    buf: Uint8Array,
    offset: number,
    length: number,
    position: number,
    opts?: FilehandleOptions,
  ): Promise<{ bytesRead: number; buffer: Uint8Array }>
  readFile(): Promise<Uint8Array>
  readFile(options: BufferEncoding): Promise<string>
  readFile<T extends undefined>(
    options:
      | Omit<FilehandleOptions, 'encoding'>
      | (Omit<FilehandleOptions, 'encoding'> & { encoding: T }),
  ): Promise<Uint8Array>
  readFile<T extends BufferEncoding>(
    options: Omit<FilehandleOptions, 'encoding'> & { encoding: T },
  ): Promise<string>
  readFile<T extends BufferEncoding>(
    options: Omit<FilehandleOptions, 'encoding'> & { encoding?: T },
  ): T extends BufferEncoding
    ? Promise<Uint8Array>
    : Promise<Uint8Array | string>
  readFile(
    options?: FilehandleOptions | BufferEncoding,
  ): Promise<Uint8Array | string>
  stat(): Promise<Stats>
  close(): Promise<void>
}
