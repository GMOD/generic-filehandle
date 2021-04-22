import type { promises } from 'fs'
import { GenericFilehandle, FilehandleOptions } from './filehandle'
// eslint-disable-next-line @typescript-eslint/camelcase
declare var __webpack_require__: unknown

// don't load fs native module if running in webpacked code
const fs = typeof __webpack_require__ !== 'function' ? require('fs') : undefined

export default class LocalFile implements GenericFilehandle {
  private fh?: promises.FileHandle
  private filename: string

  public constructor(source: string, opts: FilehandleOptions = {}) {
    this.filename = source
    if (opts.flag && opts.flag !== 'r')
      throw new Error(`filehandle flags ${opts.flag} not supported by LocalFile`)
  }

  private async getFh(): Promise<promises.FileHandle> {
    let fh = this.fh
    if (!fh) {
      let newFh = await fs.promises.open(this.filename,'r')
      this.fh = newFh
      return newFh
    }
    return fh
  }

  public async read(
    buffer: Buffer,
    offset = 0,
    length: number,
    position = 0,
  ): Promise<{ bytesRead: number; buffer: Buffer }> {
    const fetchLength = Math.min(buffer.length - offset, length)
    return (await this.getFh()).read(buffer, offset, fetchLength, position)
  }

  public async readFile(options?: FilehandleOptions | string): Promise<Buffer | string> {
    const fh = await this.getFh()
    const ret = fh.readFile(options)
    return ret
  }
  // todo memoize
  public async stat() {
    return (await this.getFh()).stat()
  }

  public async close() {
    return this.fh?.close()
  }

}
