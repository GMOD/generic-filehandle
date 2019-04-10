export interface ReadOptions {
  signal?: AbortSignal;
  header?: any;
}

export interface Filehandle {
  read(
    buf: Buffer,
    offset: number,
    length: number,
    position: number,
    opts?: ReadOptions
  ): Promise<number>;
  readFile(): Promise<Buffer>;
}
