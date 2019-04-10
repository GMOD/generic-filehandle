declare interface Options {
  signal?: AbortSignal;
  headers?: any;
  overrides?: any;
}

declare interface Filehandle {
  read(
    buf: Buffer,
    offset: number,
    length: number,
    position: number,
    opts?: Options
  ): Promise<number>;
  readFile(): Promise<Buffer>;
}
