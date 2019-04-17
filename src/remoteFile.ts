import uri2path from "file-uri-to-path";
import { GenericFilehandle, FilehandleOptions } from "./filehandle";
import { LocalFile } from ".";

const myGlobal =
  typeof window !== "undefined"
    ? window
    : typeof self !== "undefined"
    ? self
    : { fetch: undefined };

interface Stats {
  size: number;
}
export default class RemoteFile implements GenericFilehandle {
  private url: string;
  private _stat?: Stats;
  private fetch: Function;
  private baseOverrides: any = {};

  public constructor(source: string, opts: FilehandleOptions = {}) {
    this.url = source;

    // if it is a file URL, monkey-patch ourselves to act like a LocalFile
    if (source.startsWith("file://")) {
      const path = uri2path(source);
      if (!path) throw new TypeError("invalid file url");
      const localFile = new LocalFile(path);
      this.read = localFile.read.bind(localFile);
      this.readFile = localFile.readFile.bind(localFile);
      this.stat = localFile.stat.bind(localFile);
      this.fetch = () => {};
      return;
    }

    const fetch = opts.fetch || myGlobal.fetch;
    if (!fetch) {
      throw new TypeError(
        `no fetch function supplied, and none found in global environment`
      );
    }
    if (opts.overrides) {
      this.baseOverrides = opts.overrides;
    }
    this.fetch = fetch;
  }

  public async read(
    buffer: Buffer,
    offset = 0,
    length: number,
    position = 0,
    opts: FilehandleOptions = {}
  ): Promise<number> {
    const { headers = {}, signal, overrides = {} } = opts;
    if (length < Infinity) {
      headers.range = `bytes=${position}-${position + length}`;
    } else if (length === Infinity && position !== 0) {
      headers.range = `bytes=${position}-`;
    }

    const response = await this.fetch(this.url, {
      headers,
      method: "GET",
      redirect: "follow",
      mode: "cors",
      signal,
      ...this.baseOverrides,
      ...overrides
    });

    if (
      (response.status === 200 && position === 0) ||
      response.status === 206
    ) {
      const resp = await response.arrayBuffer();
      const ret = Buffer.from(resp);

      ret.copy(buffer, offset);

      // try to parse out the size of the remote file
      const res = response.headers.get("content-range");
      const sizeMatch = /\/(\d+)$/.exec(res || "");
      if (sizeMatch && sizeMatch[1])
        this._stat = { size: parseInt(sizeMatch[1], 10) };

      return resp.byteLength; // bytes read
    }

    throw new Error(`HTTP ${response.status} fetching ${this.url}`);
  }

  public async readFile(
    options: FilehandleOptions | string = {}
  ): Promise<Buffer | string> {
    let encoding;
    let opts;
    if (typeof options === "string") {
      encoding = options;
      opts = {};
    } else {
      encoding = options.encoding;
      opts = options;
      delete opts.encoding;
    }
    const { headers = {}, signal, overrides = {} } = opts;
    const response = await this.fetch(this.url, {
      headers,
      method: "GET",
      redirect: "follow",
      mode: "cors",
      signal,
      ...this.baseOverrides,
      ...overrides
    });
    if (response.status !== 200) {
      throw Object.assign(
        new Error(`HTTP ${response.status} fetching ${this.url}`),
        {
          status: response.status
        }
      );
    }
    if (encoding === "utf8") return response.text();
    if (encoding) throw new Error(`unsupported encoding: ${encoding}`);
    return Buffer.from(await response.arrayBuffer());
  }

  public async stat(): Promise<Stats> {
    if (!this._stat) {
      const buf = Buffer.allocUnsafe(10);
      await this.read(buf, 0, 10, 0);
      if (!this._stat)
        throw new Error(`unable to determine size of file at ${this.url}`);
    }
    return this._stat;
  }
}
