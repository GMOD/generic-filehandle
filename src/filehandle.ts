declare interface Options {
  signal?: AbortSignal;
  headers?: any;
  overrides?: any;
  encoding?: string | null;
}

declare interface Filehandle {
  read(
    buf: Buffer,
    offset: number,
    length: number,
    position: number,
    opts?: Options
  ): Promise<number>;
  readFile(options?: Options): Promise<Buffer | string>;
}
