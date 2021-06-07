import uri2path from 'file-uri-to-path'
import { FilehandleOptions } from './filehandle'
import LocalFile from './localFile'
import RemoteFile from './remoteFile'

export default class RemoteFileWithFileUrl extends RemoteFile {
  public constructor(source: string, opts: FilehandleOptions = {}) {
    // if it is a file URL, monkey-patch ourselves to act like a LocalFile
    if (source.startsWith('file://')) {
      const fetch = (): void => {
        /* intentionally blank */
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      super(source, { ...opts, fetch })
      const path = uri2path(source)
      if (!path) {
        throw new TypeError('invalid file url')
      }
      const localFile = new LocalFile(path)
      this.read = localFile.read.bind(localFile)
      this.readFile = localFile.readFile.bind(localFile)
      this.stat = localFile.stat.bind(localFile)
    } else {
      super(source, opts)
    }
  }
}
