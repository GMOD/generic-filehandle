import { readFile, stat, open } from 'fs/promises'
import { GenericFilehandle, FilehandleOptions } from './filehandle'

export default class LocalFile implements GenericFilehandle {
  private filename: string

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(source: string, opts: FilehandleOptions = {}) {
    this.filename = source
  }

  public async read(
    length: number,
    position = 0,
  ): Promise<Uint8Array<ArrayBuffer>> {
    const arr = new Uint8Array(length)
    const fd = await open(this.filename, 'r')
    const res = await fd.read(arr, 0, length, position)
    await fd.close()
    return res.buffer.subarray(0, res.bytesRead)
  }

  public async readFile(): Promise<Uint8Array<ArrayBuffer>>
  public async readFile(options: BufferEncoding): Promise<string>
  public async readFile<T extends undefined>(
    options:
      | Omit<FilehandleOptions, 'encoding'>
      | (Omit<FilehandleOptions, 'encoding'> & { encoding: T }),
  ): Promise<Uint8Array<ArrayBuffer>>
  public async readFile<T extends BufferEncoding>(
    options: Omit<FilehandleOptions, 'encoding'> & { encoding: T },
  ): Promise<string>
  public async readFile(
    options?: FilehandleOptions | BufferEncoding,
  ): Promise<Uint8Array<ArrayBuffer> | string> {
    const res = await readFile(this.filename, options)
    return typeof res === 'string' ? res : new Uint8Array(res)
  }

  public async stat() {
    return stat(this.filename)
  }

  public async close(): Promise<void> {
    /* do nothing */
  }
}
