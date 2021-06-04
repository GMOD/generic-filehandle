import { GenericFilehandle, FilehandleOptions } from './filehandle'

export default class LocalFile implements GenericFilehandle {
  private filename: string
  private fsPromisesPromise: Promise<typeof import('fs').promises>
  private fileHandlePromise: Promise<import('fs').promises.FileHandle>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(source: string, opts: FilehandleOptions = {}) {
    this.filename = source
    this.fsPromisesPromise = import('fs').then((fs) => fs.promises)
    this.fileHandlePromise = this.fsPromisesPromise.then((fsPromises) =>
      fsPromises.open(source, 'r'),
    )
  }

  public async read(
    buffer: Buffer,
    offset = 0,
    length: number,
    position = 0,
  ): Promise<{ bytesRead: number; buffer: Buffer }> {
    return (await this.fileHandlePromise).read(buffer, offset, length, position)
  }

  public async readFile(options?: FilehandleOptions | string): Promise<Buffer | string> {
    // Don't use (await this.fileHandlePromise).readFile() here because it moves
    // the fileHandle's file position, which makes it so that readFile can only
    // be called once.
    return (await this.fsPromisesPromise).readFile(this.filename, options)
  }
  // todo memoize
  public async stat(): Promise<any> {
    return (await this.fileHandlePromise).stat()
  }
}
