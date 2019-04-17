export interface FilehandleOptions {
  /**
   * optional AbortSignal object for aborting the request
   */
  signal?: AbortSignal;
  headers?: any;
  overrides?: any;
  encoding?: string | null;
  /**
   * fetch function to use for HTTP requests. defaults to environment's
   * global fetch. if there is no global fetch, and a fetch function is not provided,
   * throws an error.
   */
  fetch?: Function;
}

export interface GenericFilehandle {
  read(
    buf: Buffer,
    offset: number,
    length: number,
    position: number,
    opts?: FilehandleOptions
  ): Promise<number>;
  readFile(options?: FilehandleOptions): Promise<Buffer | string>;
}
