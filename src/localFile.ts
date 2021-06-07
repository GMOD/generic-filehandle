import fs from 'fs'
import util from 'util'
import { GenericFilehandle, FilehandleOptions } from './filehandle'

const fsOpen = util.promisify(fs.open)
const fsRead = util.promisify(fs.read)
const fsReadFile = util.promisify(fs.readFile)
const fsStat = util.promisify(fs.stat)

export default class LocalFile implements GenericFilehandle {
  private filename: string
  private fdPromise?: Promise<number>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(source: string, _opts: FilehandleOptions = {}) {
    this.filename = source
  }

  private async getFd(): Promise<number> {
    if (!this.fdPromise) {
      this.fdPromise = fsOpen(this.filename, 'r')
    }
    return this.fdPromise
  }

  public async read(
    buffer: Buffer,
    offset = 0,
    length: number,
    position = 0,
  ): Promise<{ bytesRead: number; buffer: Buffer }> {
    const fetchLength = Math.min(buffer.length - offset, length)
    const fd = await this.getFd()
    return fsRead(fd, buffer, offset, fetchLength, position)
  }

  public async readFile(options?: FilehandleOptions | string): Promise<Buffer | string> {
    return fsReadFile(this.filename, options)
  }
  // todo memoize
  public async stat(): Promise<import('fs').Stats> {
    return fsStat(this.filename)
  }
}
