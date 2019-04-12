interface Stats {
  size: number;
}

/**
 * Blob of binary data fetched from a local file (with FileReader).
 *
 * Adapted by Robert Buels and Garrett Stevens from the BlobFetchable object in
 * the Dalliance Genome Explorer, which is copyright Thomas Down 2006-2011.
 */
export default class BlobFile implements Filehandle {
  private blob: Blob;
  private size: number;
  public constructor(blob: Blob) {
    this.blob = blob;
    this.size = blob.size;
  }

  // Using this you can "await" the file like a normal promise
  // https://blog.shovonhasan.com/using-promises-with-filereader/
  private readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    const temporaryFileReader = new FileReader();

    return new Promise(
      (resolve, reject): void => {
        temporaryFileReader.onerror = (): void => {
          temporaryFileReader.abort();
          reject(new Error(`problem reading blob`));
        };

        temporaryFileReader.onabort = (): void => {
          reject(new Error(`blob reading was aborted`));
        };

        temporaryFileReader.onload = (): void => {
          if (
            temporaryFileReader.result &&
            typeof temporaryFileReader.result !== "string"
          )
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsArrayBuffer(blob);
      }
    );
  }

  public async read(
    buffer: Buffer,
    offset = 0,
    length: number,
    position = 0
  ): Promise<number> {
    // short-circuit a read of 0 bytes here, because browsers actually sometimes
    // crash if you try to read 0 bytes from a local file!
    if (!length) {
      return 0;
    }

    const start = position;
    const end = start + length;

    const result = await this.readBlobAsArrayBuffer(
      this.blob.slice(start, end)
    );
    const resultBuffer = Buffer.from(result);

    resultBuffer.copy(buffer, offset);

    return result.byteLength;
  }

  public async readFile(): Promise<Buffer> {
    const result = await this.readBlobAsArrayBuffer(this.blob);
    return Buffer.from(result);
  }

  public async stat(): Promise<Stats> {
    return { size: this.size };
  }
}
