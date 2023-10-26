/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { LocalFile } from '../src/'

describe('local file tests', () => {
  it('reads file', async () => {
    const f = new LocalFile(require.resolve('./data/test.txt'))
    const b = await f.readFile()
    expect(b.toString()).toEqual('testing\n')
  })
  it('reads file with encoding', async () => {
    const f = new LocalFile(require.resolve('./data/test.txt'))
    const fileText = await f.readFile('utf8')
    expect(fileText).toEqual('testing\n')
    const fileText2 = await f.readFile({ encoding: 'utf8' })
    expect(fileText2).toEqual('testing\n')
  })
  it('reads local file', async () => {
    const f = new LocalFile(require.resolve('./data/test.txt'))
    const buf = await f.read(3, 0)
    expect(buf.toString()).toEqual('tes')
    expect(buf.byteLength).toEqual(3)
  })
  it('length infinity', async () => {
    const f = new LocalFile(require.resolve('./data/test.txt'))
    const buf = await f.read(Infinity, 3)
    expect(buf.toString()).toEqual('ting\n')
    expect(buf.byteLength).toEqual(5)
  })
  it('zero read', async () => {
    const f = new LocalFile(require.resolve('./data/test.txt'))
    const buf = await f.read(0, 0)
    expect(buf.toString().length).toBe(10)
    expect(buf.toString()[0]).toBe('\0')
    expect(buf.byteLength).toEqual(0)
  })
  it('reads local file clipped at the end', async () => {
    const f = new LocalFile(require.resolve('./data/test.txt'))
    const buf2 = await f.read(3, 6)
    expect(buf2.slice(0, buf2.byteLength).toString()).toEqual('g\n')
    expect(buf2.byteLength).toEqual(2)
  })
  it('get stat', async () => {
    const f = new LocalFile(require.resolve('./data/test.txt'))
    const ret = await f.stat()
    expect(ret.size).toEqual(8)
  })
})
