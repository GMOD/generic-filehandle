export interface Filehandle {
  read(buf: Buffer, offset: number, length: number, position: number, opts: any): Promise<number>
  readFile(): Promise<Buffer>
}
