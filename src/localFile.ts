import { promisify } from "es6-promisify";
declare var __webpack_require__: any; // eslint-disable-line @typescript-eslint/camelcase

// don't load fs native module if running in webpacked code
const fs = typeof __webpack_require__ !== "function" ? require("fs") : null; // eslint-disable-line @typescript-eslint/camelcase

const fsOpen = fs && promisify(fs.open);
const fsRead = fs && promisify(fs.read);
const fsFStat = fs && promisify(fs.fstat);
const fsReadFile = fs && promisify(fs.readFile);

export default class LocalFile implements Filehandle {
  private fd?: any;
  private filename: string;
  public constructor(source: string) {
    this.filename = source;
  }

  private getFd() {
    if (!this.fd) {
      this.fd = fsOpen(this.filename, "r");
    }
    return this.fd;
  }

  public async read(
    buffer: Buffer,
    offset: number = 0,
    length: number,
    position: number = 0
  ): Promise<number> {
    const fetchLength = Math.min(buffer.length - offset, length);
    const ret = await fsRead(
      await this.getFd(),
      buffer,
      offset,
      fetchLength,
      position
    );
    return ret;
  }

  public async readFile(options?: Options | string): Promise<Buffer | string> {
    return fsReadFile(this.filename, options);
  }
  // todo memoize
  public async stat(): Promise<any> {
    return fsFStat(await this.getFd());
  }
}
