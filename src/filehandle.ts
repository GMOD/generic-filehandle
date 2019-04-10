declare interface Options {
  signal?: AbortSignal;
  headers?: any;
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
