//@ts-nocheck
import fs from 'fs'
import { BlobFile } from '../src/'
import { toString } from './util'

describe('blob filehandle', () => {
  it('reads whole file', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const fileContents = await blobFile.readFile()
    expect(toString(fileContents)).toEqual('testing\n')
  })
  it('reads whole file with encoding', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const fileContents = await blobFile.readFile('utf8')
    expect(fileContents).toEqual('testing\n')
    const fileContents2 = await blobFile.readFile({ encoding: 'utf8' })
    expect(fileContents2).toEqual('testing\n')
    // @ts-expect-error
    await expect(blobFile.readFile('fakeEncoding')).rejects.toThrow(
      /unsupported encoding/,
    )
  })
  it('reads file part', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const buf = Buffer.allocUnsafe(3)
    const { bytesRead } = await blobFile.read(buf, 0, 3, 0)
    expect(toString(buf)).toEqual('tes')
    expect(bytesRead).toEqual(3)
  })
  it('reads zero length file part', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const buf = Buffer.allocUnsafe(3)
    const { bytesRead } = await blobFile.read(buf, 0, 0, 0)
    expect(toString(buf.slice(0, bytesRead))).toEqual('')
    expect(bytesRead).toEqual(0)
  })
  it('reads file part clipped at end', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const buf = Buffer.allocUnsafe(3)
    const { bytesRead } = await blobFile.read(buf, 0, 3, 6)
    expect(toString(buf.slice(0, bytesRead))).toEqual('g\n')
    expect(bytesRead).toEqual(2)
  })
  it('gets stat', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const s = await blobFile.stat()
    expect(s.size).toEqual(8)
  })
})
