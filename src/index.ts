import RemoteFile from './remoteFile'
import BlobFile from './blobFile'
import { GenericFilehandle, FilehandleOptions } from './filehandle'
export * from './filehandle'

function fromUrl(source: string, opts: FilehandleOptions = {}): GenericFilehandle {
  return new RemoteFile(source, opts)
}
function open(
  maybeUrl?: string,
  maybePath?: string,
  maybeFilehandle?: GenericFilehandle,
  opts: FilehandleOptions = {},
): GenericFilehandle {
  if (maybePath) {
    throw new Error(
      'cannot open from a path, please use "open" from "generic-filehandle/server" instead',
    )
  }
  if (maybeFilehandle !== undefined) {
    return maybeFilehandle
  }
  if (maybeUrl !== undefined) {
    return fromUrl(maybeUrl, opts)
  }
  throw new Error('no url, or filehandle provided, cannot open')
}

export { open, fromUrl, RemoteFile, BlobFile }
