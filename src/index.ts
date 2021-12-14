import LocalFile from './localFile'
import RemoteFile from './remoteFile'
import BlobFile from './blobFile'
import { GenericFilehandle, FilehandleOptions } from './filehandle'
export * from './filehandle'

function fromUrl(
  source: string,
  opts: FilehandleOptions = {},
): GenericFilehandle {
  return new RemoteFile(source, opts)
}
function open(
  maybeUrl?: string,
  maybePath?: string,
  maybeFilehandle?: GenericFilehandle,
  opts: FilehandleOptions = {},
): GenericFilehandle {
  if (maybeFilehandle !== undefined) {
    return maybeFilehandle
  }
  if (maybeUrl !== undefined) {
    return fromUrl(maybeUrl, opts)
  }
  if (maybePath !== undefined) {
    return new LocalFile(maybePath, opts)
  }
  throw new Error('no url, path, or filehandle provided, cannot open')
}

export { open, fromUrl, RemoteFile, LocalFile, BlobFile }
