//@ts-nocheck
import fs from 'fs'
import { BlobFile } from '../src/'

describe('blob filehandle', () => {
  it('reads whole file', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const fileContents = await blobFile.readFile()
    expect(fileContents.toString()).toEqual('testing\n')
  })
  it('reads whole file with encoding', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const fileContents = await blobFile.readFile('utf8')
    expect(fileContents).toEqual('testing\n')
    const fileContents2 = await blobFile.readFile({ encoding: 'utf8' })
    expect(fileContents2).toEqual('testing\n')
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
    expect(buf.toString()).toEqual('tes')
    expect(bytesRead).toEqual(3)
  })
  it('reads zero length file part', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const buf = Buffer.allocUnsafe(3)
    const { bytesRead } = await blobFile.read(buf, 0, 0, 0)
    expect(buf.slice(0, bytesRead).toString()).toEqual('')
    expect(bytesRead).toEqual(0)
  })
  it('reads file part clipped at end', async () => {
    const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
    const blob = new Blob([fileBuf], { type: 'text/plain' })
    const blobFile = new BlobFile(blob)
    const buf = Buffer.allocUnsafe(3)
    const { bytesRead } = await blobFile.read(buf, 0, 3, 6)
    expect(buf.slice(0, bytesRead).toString()).toEqual('g\n')
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
