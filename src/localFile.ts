import { promises as fs } from 'fs'
import { GenericFilehandle, FilehandleOptions } from './filehandle'

export default class LocalFile implements GenericFilehandle {
  private fd?: Promise<fs.FileHandle>

  private filename: string

  public constructor(source: string, _opts: FilehandleOptions = {}) {
    this.filename = source
  }

  private getFd() {
    if (!this.fd) {
      this.fd = fs.open(this.filename)
    }
    return this.fd
  }

  public async read(length: number, position = 0): Promise<Uint8Array> {
    const fd = await this.getFd()
    const { bytesRead, buffer } = await fd.read(
      Buffer.alloc(length),
      0,
      length,
      position,
    )
    return buffer.subarray(0, bytesRead)
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
  public async readFile(
    options?: FilehandleOptions | BufferEncoding,
  ): Promise<Uint8Array | string> {
    return fs.readFile(this.filename, options)
  }
  // todo memoize
  public async stat(): Promise<any> {
    const fd = await this.getFd()
    return fd.stat()
  }

  public async close(): Promise<void> {
    const fd = await this.getFd()
    fd.close()
  }
}
