import fs from 'fs'
import { GenericFilehandle, FilehandleOptions } from './filehandle'

const fsp = fs.promises

export default class LocalFile implements GenericFilehandle {
  private fd?: Promise<fs.promises.FileHandle>
  private filename: string

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(source: string, opts: FilehandleOptions = {}) {
    this.filename = source
  }

  private getFd() {
    if (!this.fd) {
      this.fd = fsp.open(this.filename, 'r')
    }
    return this.fd
  }

  public async read(
    buffer: Buffer,
    offset = 0,
    length: number,
    position = 0,
  ): Promise<{ bytesRead: number; buffer: Buffer }> {
    const fetchLength = Math.min(buffer.length - offset, length)
    const fd = await this.getFd()
    return fd.read(buffer, offset, fetchLength, position)
  }

  public async readFile(): Promise<Buffer>
  public async readFile(options: BufferEncoding): Promise<string>
  public async readFile<T extends undefined>(
    options:
      | Omit<FilehandleOptions, 'encoding'>
      | (Omit<FilehandleOptions, 'encoding'> & { encoding: T }),
  ): Promise<Buffer>
  public async readFile<T extends BufferEncoding>(
    options: Omit<FilehandleOptions, 'encoding'> & { encoding: T },
  ): Promise<string>
  public async readFile(
    options?: FilehandleOptions | BufferEncoding,
  ): Promise<Buffer | string> {
    return fsp.readFile(this.filename, options)
  }
  // todo memoize
  public async stat(): Promise<any> {
    return this.getFd().then(fd => fd.stat())
  }

  public async close(): Promise<void> {
    return this.getFd().then(fd => fd.close())
  }
}
