/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RemoteFile } from "../src";

const fileUrlBase = `file://${process.cwd()}/test/data`;

describe("remote file with file urls", () => {
  it("reads file", async () => {
    const f = new RemoteFile(`${fileUrlBase}/test.txt`);
    const b = await f.readFile();
    expect(b.toString()).toEqual("testing\n");
  });
  it("reads file with encoding", async () => {
    const f = new RemoteFile(`${fileUrlBase}/test.txt`);
    const fileText = await f.readFile("utf8");
    expect(fileText).toEqual("testing\n");
    const fileText2 = await f.readFile({ encoding: "utf8" });
    expect(fileText2).toEqual("testing\n");
    await expect(f.readFile("fakeEncoding")).rejects.toThrow(/is invalid/);
  });
  it("reads remote partially", async () => {
    const f = new RemoteFile(`${fileUrlBase}/test.txt`);
    const buf = Buffer.allocUnsafe(3);
    const bytesRead = await f.read(buf, 0, 3, 0);
    expect(buf.toString()).toEqual("tes");
    expect(bytesRead).toEqual(3);
  });
  it("reads remote clipped at the end", async () => {
    const f = new RemoteFile(`${fileUrlBase}/test.txt`);
    const buf = Buffer.allocUnsafe(3);
    const bytesRead = await f.read(buf, 0, 3, 6);
    expect(buf.slice(0, bytesRead).toString()).toEqual("g\n");
    expect(bytesRead).toEqual(2);
  });
  it("length infinity", async () => {
    const f = new RemoteFile(`${fileUrlBase}/test.txt`);
    const buf = Buffer.allocUnsafe(5);
    const bytesRead = await f.read(buf, 0, Infinity, 3);
    expect(buf.toString()).toEqual("ting\n");
    expect(bytesRead).toEqual(5);
  });
  it("zero read", async () => {
    const f = new RemoteFile(`${fileUrlBase}/test.txt`);
    const buf = Buffer.alloc(10);
    const bytesRead = await f.read(buf, 0, 0, 0);
    expect(buf.toString().length).toBe(10);
    expect(buf.toString()[0]).toBe("\0");
    expect(bytesRead).toEqual(0);
  });
  it("stat", async () => {
    const f = new RemoteFile(`${fileUrlBase}/test.txt`);
    const stat = await f.stat();
    expect(stat.size).toEqual(8);
  });
});
