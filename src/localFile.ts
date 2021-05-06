import { promisify } from 'es6-promisify'
import { GenericFilehandle, FilehandleOptions } from './filehandle'
// eslint-disable-next-line @typescript-eslint/camelcase,no-var
declare var __webpack_require__: any

// don't load fs native module if running in webpacked code
const fs = typeof __webpack_require__ !== 'function' ? require('fs') : null // eslint-disable-line @typescript-eslint/camelcase

const fsOpen = fs && fs.open && promisify(fs.open)
const fsRead = fs && fs.read && promisify(fs.read)
const fsFStat = fs && fs.fstat && promisify(fs.fstat)
const fsReadFile = fs && fs.readFile && promisify(fs.readFile)

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
}
