import { test, expect } from 'vitest'
import fs from 'fs'
import { BlobFile } from '../src/'
import { TextDecoder } from 'util'

function toString(a: Uint8Array<ArrayBuffer>) {
  return new TextDecoder('utf8').decode(a)
}

// Blob.prototype.text = function () {
//   const fileReader = new FileReader()
//
//   return new Promise((resolve, reject): void => {
//     fileReader.onerror = (): void => {
//       fileReader.abort()
//       reject(new Error('problem reading blob'))
//     }
//
//     fileReader.onabort = (): void => {
//       reject(new Error('blob reading was aborted'))
//     }
//
//     fileReader.onload = (): void => {
//       if (fileReader.result && typeof fileReader.result === 'string') {
//         resolve(fileReader.result)
//       } else {
//         reject(new Error('unknown error reading blob'))
//       }
//     }
//     fileReader.readAsText(this)
//   })
// }
//
// Blob.prototype.arrayBuffer = function () {
//   const fileReader = new FileReader()
//
//   return new Promise((resolve, reject): void => {
//     fileReader.onerror = (): void => {
//       fileReader.abort()
//       reject(new Error('problem reading blob'))
//     }
//
//     fileReader.onabort = (): void => {
//       reject(new Error('blob reading was aborted'))
//     }
//
//     fileReader.onload = (): void => {
//       if (fileReader.result && typeof fileReader.result !== 'string') {
//         resolve(fileReader.result)
//       } else {
//         reject(new Error('unknown error reading blob'))
//       }
//     }
//     fileReader.readAsArrayBuffer(this)
//   })
// }

test('reads whole file', async () => {
  const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
  const blob = new Blob([fileBuf], { type: 'text/plain' })
  const blobFile = new BlobFile(blob)
  const fileContents = await blobFile.readFile()
  expect(toString(fileContents)).toEqual('testing\n')
})
test('reads whole file with encoding', async () => {
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
test('reads file part', async () => {
  const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
  const blob = new Blob([fileBuf], { type: 'text/plain' })
  const blobFile = new BlobFile(blob)
  const buf = await blobFile.read(3, 0)
  expect(toString(buf)).toEqual('tes')
})
test('reads zero length file part', async () => {
  const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
  const blob = new Blob([fileBuf], { type: 'text/plain' })
  const blobFile = new BlobFile(blob)
  const buf = await blobFile.read(0, 0)
  expect(toString(buf)).toEqual('')
})
test('reads file part clipped at end', async () => {
  const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
  const blob = new Blob([fileBuf], { type: 'text/plain' })
  const blobFile = new BlobFile(blob)
  const buf = await blobFile.read(3, 6)
  expect(toString(buf)).toEqual('g\n')
})
test('gets stat', async () => {
  const fileBuf = fs.readFileSync(require.resolve('./data/test.txt'))
  const blob = new Blob([fileBuf], { type: 'text/plain' })
  const blobFile = new BlobFile(blob)
  const s = await blobFile.stat()
  expect(s.size).toEqual(8)
})
