import { GenericFilehandle, FilehandleOptions, Stats } from './filehandle'

/**
 * Blob of binary data fetched from a local file (with FileReader).
 *
 * Adapted by Robert Buels and Garrett Stevens from the BlobFetchable object in
 * the Dalliance Genome Explorer, which is copyright Thomas Down 2006-2011.
 */
export default class BlobFile implements GenericFilehandle {
  private blob: Blob
  private size: number

  public constructor(blob: Blob) {
    this.blob = blob
    this.size = blob.size
  }

  public async read(
    length: number,
    position = 0,
  ): Promise<Uint8Array<ArrayBuffer>> {
    // short-circuit a read of 0 bytes here, because browsers actually sometimes
    // crash if you try to read 0 bytes from a local file!
    if (!length) {
      return new Uint8Array(0)
    }

    const start = position
    const end = start + length

    return new Uint8Array(await this.blob.slice(start, end).arrayBuffer())
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
    const encoding = typeof options === 'string' ? options : options?.encoding
    if (encoding === 'utf8') {
      return this.blob.text()
    } else if (encoding) {
      throw new Error(`unsupported encoding: ${encoding}`)
    } else {
      return new Uint8Array(await this.blob.arrayBuffer())
    }
  }

  public async stat(): Promise<Stats> {
    return { size: this.size }
  }

  public async close(): Promise<void> {
    return
  }
}
