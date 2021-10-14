import fs from 'fs'
import { promisify } from 'es6-promisify'
import { GenericFilehandle, FilehandleOptions } from './filehandle'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const fsOpen = fs && promisify(fs.open || (() => {}))
// eslint-disable-next-line @typescript-eslint/no-empty-function
const fsRead = fs && promisify(fs.read || (() => {}))
// eslint-disable-next-line @typescript-eslint/no-empty-function
const fsFStat = fs && promisify(fs.fstat || (() => {}))
// eslint-disable-next-line @typescript-eslint/no-empty-function
const fsReadFile = fs && promisify(fs.readFile || (() => {}))
// eslint-disable-next-line @typescript-eslint/no-empty-function
const fsClose = fs && promisify(fs.close || (() => {}))

export default class LocalFile implements GenericFilehandle {
  private fd?: any
  private filename: string

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(source: string, opts: FilehandleOptions = {}) {
    this.filename = source
  }

  private getFd(): any {
    if (!this.fd) {
      this.fd = fsOpen(this.filename, 'r')
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
    const ret = await fsRead(await this.getFd(), buffer, offset, fetchLength, position)
    return { bytesRead: ret, buffer }
  }

  public async readFile(options?: FilehandleOptions | string): Promise<Buffer | string> {
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
