import fetchMock from "fetch-mock";
import { open, fromUrl } from "../src/";
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
    expect(open("http://google.com").constructor.name).toEqual("RemoteFile");
    expect(open(null, "/var/").constructor.name).toEqual("LocalFile");
    expect(open(null, null, 1)).toEqual(1);
    expect(() => open(null, null, null)).toThrow(/cannot open/);
  });
});
