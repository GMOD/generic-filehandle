import * as url from "url";
import LocalFile from "./localFile";
import RemoteFile from "./remoteFile";

function fromUrl(source:string): Filehandle {
  const { protocol, pathname } = url.parse(source);
  if (protocol === "file:") {
    return new LocalFile(decodeURI(pathname||''));
  }
  return new RemoteFile(source);
}
function open(
  maybeUrl?: string,
  maybePath?: string,
  maybeFilehandle?: Filehandle
): Filehandle {
  if (maybeFilehandle!==undefined) return maybeFilehandle;
  if (maybeUrl!==undefined) return fromUrl(maybeUrl);
  if (maybePath!==undefined) return new LocalFile(maybePath);
  throw new Error("no url, path, or filehandle provided, cannot open");
}

export {open, fromUrl, RemoteFile, LocalFile}
