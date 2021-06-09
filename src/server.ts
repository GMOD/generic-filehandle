import { BlobFile, FilehandleOptions, GenericFilehandle, open as clientOpen } from '.'
import LocalFile from './localFile'
import RemoteFile from './remoteFileWithFileUrl'

function fromUrl(source: string, opts: FilehandleOptions = {}): GenericFilehandle {
  return new RemoteFile(source, opts)
}

function open(
  maybeUrl?: string,
  maybePath?: string,
  maybeFilehandle?: GenericFilehandle,
  opts: FilehandleOptions = {},
): GenericFilehandle {
  if (maybePath !== undefined) {
    return new LocalFile(maybePath, opts)
  }
  if (maybeUrl !== undefined) {
    return fromUrl(maybeUrl, opts)
  }
  return clientOpen(undefined, undefined, maybeFilehandle, opts)
}

export * from './filehandle'
export { open, fromUrl, RemoteFile, BlobFile, LocalFile }
