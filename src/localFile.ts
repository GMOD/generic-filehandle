import fs from 'fs'
import { promisify } from 'es6-promisify'
import { GenericFilehandle, FilehandleOptions } from './filehandle'

const fsOpen = fs && promisify(fs.open)
const fsRead = fs && promisify(fs.read)
const fsFStat = fs && promisify(fs.fstat)
const fsReadFile = fs && promisify(fs.readFile)
const fsClose = fs && promisify(fs.close)

export default class LocalFile implements GenericFilehandle {
  private fd?: any
  private filename: string

  public constructor(source: string, _opts: FilehandleOptions = {}) {
    this.filename = source
  }

  private getFd(): any {
    if (!this.fd) {
      this.fd = fsOpen(this.filename, 'r')
    }
    return this.fd
  }

  public async read(length: number, position = 0): Promise<Uint8Array> {
    const buf = Buffer.alloc(length)
    fsRead(await this.getFd(), buf, 0, length, position)
    return buf
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
    return fsReadFile(this.filename, options)
  }
  // todo memoize
  public async stat(): Promise<any> {
    return fsFStat(await this.getFd())
  }

  public async close(): Promise<void> {
    return fsClose(await this.getFd())
  }
}
