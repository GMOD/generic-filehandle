import { test, expect } from 'vitest'
import { LocalFile } from '../src/'
import { TextDecoder } from 'util'

function toString(a: Uint8Array<ArrayBuffer>) {
  return new TextDecoder('utf8').decode(a)
}

test('reads file', async () => {
  const f = new LocalFile(require.resolve('./data/test.txt'))
  const b = await f.readFile()
  expect(toString(b)).toEqual('testing\n')
})
test('reads file with encoding', async () => {
  const f = new LocalFile(require.resolve('./data/test.txt'))
  const fileText = await f.readFile('utf8')
  expect(fileText).toEqual('testing\n')
  const fileText2 = await f.readFile({ encoding: 'utf8' })
  expect(fileText2).toEqual('testing\n')
})
test('reads local file', async () => {
  const f = new LocalFile(require.resolve('./data/test.txt'))
  const buf = await f.read(3, 0)
  expect(toString(buf)).toEqual('tes')
})

test('zero read', async () => {
  const f = new LocalFile(require.resolve('./data/test.txt'))
  const buf = await f.read(0, 0)
  expect(toString(buf)[0]).toBe(undefined)
})
test('reads local file clipped at the end', async () => {
  const f = new LocalFile(require.resolve('./data/test.txt'))
  const buf = await f.read(3, 6)
  const s = toString(buf).replace('\0', '')
  expect(s).toEqual('g\n')
})
test('get stat', async () => {
  const f = new LocalFile(require.resolve('./data/test.txt'))
  const ret = await f.stat()
  expect(ret.size).toEqual(8)
})
