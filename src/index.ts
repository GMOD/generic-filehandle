import LocalFile from "./localFile";
import RemoteFile from "./remoteFile";
import BlobFile from "./blobFile";

function fromUrl(source: string, opts: Options = {}): Filehandle {
  return new RemoteFile(source, opts);
}
function open(
  maybeUrl?: string,
  maybePath?: string,
  maybeFilehandle?: Filehandle,
  opts: Options = {}
): Filehandle {
  if (maybeFilehandle !== undefined) return maybeFilehandle;
  if (maybeUrl !== undefined) return fromUrl(maybeUrl, opts);
  if (maybePath !== undefined) return new LocalFile(maybePath, opts);
  throw new Error("no url, path, or filehandle provided, cannot open");
}

export { open, fromUrl, RemoteFile, LocalFile, BlobFile };
