import { LocalFile,open, fromUrl } from "../src/";

describe("test util functions", () => {
  it("fromUrl", async () => {
    const ret = fromUrl("file:///var/");
    expect(ret.constructor.name).toEqual("LocalFile");
  });
  it("fromUrl local", async () => {
    const ret = fromUrl("http://google.com");
    expect(ret.constructor.name).toEqual("RemoteFile");
  });
  it("open", async () => {
    const f = new LocalFile('/var')
    expect(open("http://google.com").constructor.name).toEqual("RemoteFile");
    expect(open(undefined, "/var/").constructor.name).toEqual("LocalFile");
    expect(open(undefined, undefined, f).constructor.name).toEqual("LocalFile");
    expect(() => open(undefined, undefined, undefined)).toThrow(/cannot open/);
  });
});
