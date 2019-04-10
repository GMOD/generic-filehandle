import "cross-fetch/polyfill";

class RemoteFile implements Filehandle {
  private position: number;
  private url: string;

  public constructor(source) {
    this.position = 0;
    this.url = source;
  }

  public async read(
    buffer: Buffer,
    offset = 0,
    length: number,
    position = 0,
    opts?: ReadOptions = {}
  ): Promise<number> {
    const { headers = {}, signal } = opts;
    if (length < Infinity) {
      headers.range = `bytes=${position}-${position + length}`;
    } else if (length === Infinity && position !== 0) {
      headers.range = `bytes=${position}-`;
    }
    const response = await fetch(this.url, {
      ...headers,
      method: "GET",
      redirect: "follow",
      mode: "cors",
      signal
    });

    if (
      (response.status === 200 && position === 0) ||
      response.status === 206
    ) {
      const resp = await response.arrayBuffer();
      const ret = Buffer.from(resp);

      ret.copy(buffer, offset);

      // try to parse out the size of the remote file
      const sizeMatch = /\/(\d+)$/.exec(response.headers.get("content-range"));
      if (sizeMatch && sizeMatch[1])
        this._stat = { size: parseInt(sizeMatch[1], 10) };
      this.position += length;

      return resp.byteLength;
    }

    throw new Error(`HTTP ${response.status} fetching ${this.url}`);
  }

  public async readFile(opts: Options = {}): Buffer {
    const { headers = {}, signal } = opts;
    const response = await fetch(this.url, {
      ...headers,
      method: "GET",
      redirect: "follow",
      mode: "cors",
      signal
    });
    return Buffer.from(await response.arrayBuffer());
  }

  public async stat(): { size: number } {
    if (!this._stat) {
      const buf = Buffer.allocUnsafe(10);
      await this.read(buf, 0, 10, 0);
      if (!this._stat)
        throw new Error(`unable to determine size of file at ${this.url}`);
    }
    return this._stat;
  }
}

module.exports = RemoteFile;
