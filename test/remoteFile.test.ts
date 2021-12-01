/* eslint-disable @typescript-eslint/explicit-function-return-type */
//@ts-nocheck
import fetchMock from 'fetch-mock'
import { LocalFile, RemoteFile } from '../src/'
import tenaciousFetch from 'tenacious-fetch'

import rangeParser from 'range-parser'
fetchMock.config.sendAsJson = false

const getFile = (url: string) =>
  new LocalFile(require.resolve(url.replace('http://fakehost/', './data/')))
// fakes server responses from local file object with fetchMock
const readBuffer = async (url: string, args: any) => {
  const file = getFile(url)
  const range = rangeParser(10000, args.headers.range)
  const { start, end } = range[0]
  const len = end - start
  let buf = Buffer.alloc(len)
  const res = await file.read(buf, 0, len, start)
  const stat = await file.stat()
  buf = buf.slice(0, res.bytesRead)
  return {
    status: 206,
    body: buf,
    headers: { 'Content-Range': `${start}-${end}/${stat.size}` },
  }
}

const readFile = async (url: string) => {
  const file = getFile(url)
  const ret = await file.readFile()
  return {
    status: 200,
    body: ret,
  }
}

describe('remote file tests', () => {
  afterEach(() => fetchMock.restore())

  it('tenacious fetch', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', readFile)
    const f = new RemoteFile('http://fakehost/test.txt', {
      fetch: tenaciousFetch,
    })
    const b = await f.readFile({ overrides: { fetcher: fetch } })
    expect(b.toString()).toEqual('testing\n')
  })
  it('tenacious fetch with 404', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', 404)
    const f = new RemoteFile('http://fakehost/test.txt', {
      fetch: tenaciousFetch,
    })
    const res = f.readFile({ overrides: { fetcher: fetch, retries: 0 } })
    await expect(res).rejects.toThrow(/HTTP 404/)
  })
  it('tenacious fetch with 403', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', 403)
    const f = new RemoteFile('http://fakehost/test.txt', {
      fetch: tenaciousFetch,
    })
    const res = f.readFile({ overrides: { fetcher: fetch, retries: 0 } })
    await expect(res).rejects.toThrow(/HTTP 403/)
  })
  it('tenacious fetch base overrides', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', readFile)
    const f = new RemoteFile('http://fakehost/test.txt', {
      fetch: tenaciousFetch,
      overrides: { fetcher: fetch, retries: 0 },
    })
    const b = await f.readFile()
    expect(b.toString()).toEqual('testing\n')
  })
  it('reads file', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', readFile)
    const f = new RemoteFile('http://fakehost/test.txt', { fetch })
    const b = await f.readFile()
    expect(b.toString()).toEqual('testing\n')
  })
  it('reads file with response buffer method disabled', async () => {
    const mockedFetch = fetchMock.sandbox().mock('http://fakehost/test.txt', readFile)
    const f = new RemoteFile('http://fakehost/test.txt', {
      async fetch(url, opts) {
        const res = await mockedFetch(url, opts)
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        res.buffer = 0 // obscure the buffer method to test our arraybuffer parse
        return res
      },
    })
    const b = await f.readFile()
    expect(b.toString()).toEqual('testing\n')
  })
  it('reads file with encoding', async () => {
    fetchMock.mock('http://fakehost/test.txt', readFile)
    const f = new RemoteFile('http://fakehost/test.txt')
    const fileText = await f.readFile('utf8')
    expect(fileText).toEqual('testing\n')
    const fileText2 = await f.readFile({ encoding: 'utf8' })
    expect(fileText2).toEqual('testing\n')
    await expect(f.readFile('fakeEncoding')).rejects.toThrow(/unsupported encoding/)
  })
  it('reads remote partially', async () => {
    fetchMock.mock('http://fakehost/test.txt', readBuffer)
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.allocUnsafe(3)
    const { bytesRead } = await f.read(buf, 0, 3, 0)
    expect(buf.toString()).toEqual('tes')
    expect(bytesRead).toEqual(3)
  })
  it('reads remote clipped at the end', async () => {
    fetchMock.mock('http://fakehost/test.txt', readBuffer)
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.allocUnsafe(3)
    const res = await f.read(buf, 0, 3, 6)
    expect(buf.slice(0, res.bytesRead).toString()).toEqual('g\n')
    expect(res.bytesRead).toEqual(2)
  })
  it('reads remote clipped at the end again', async () => {
    fetchMock.mock('http://fakehost/test.txt', readBuffer)
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.allocUnsafe(3)
    expect((await f.read(buf, 3, 3, 6)).bytesRead).toEqual(0) // test writing fully past end of buf
    expect((await f.read(buf, 2, 3, 6)).bytesRead).toEqual(1) // test writing partially past end of buf
  })
  it('length infinity', async () => {
    fetchMock.mock('http://fakehost/test.txt', readBuffer)
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.allocUnsafe(5)
    const { bytesRead } = await f.read(buf, 0, Infinity, 3)
    expect(buf.toString()).toEqual('ting\n')
    expect(bytesRead).toEqual(5)
  })
  it('throws error', async () => {
    fetchMock.mock('http://fakehost/test.txt', 500)
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.alloc(10)
    const res = f.read(buf, 0, 0, 0)
    await expect(res).rejects.toThrow(/Internal Server Error/)
  })
  it('throws error if file missing', async () => {
    fetchMock.mock('http://fakehost/test.txt', 404)
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.alloc(10)
    const res = f.read(buf, 0, 0, 0)
    await expect(res).rejects.toThrow(/HTTP 404/)
  })
  it('throws if response object has no buffer or arrayBuffer', async () => {
    const mockedFetch = fetchMock.sandbox().mock('http://fakehost/test.txt', readFile)
    const f = new RemoteFile('http://fakehost/test.txt', {
      async fetch(url, opts) {
        const res = await mockedFetch(url, opts)
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        res.buffer = undefined // obscure the buffer method to test our arraybuffer parse
        res.arrayBuffer = undefined // also obscure arrayBuffer
        return res
      },
    })
    const b = f.readFile()
    await expect(b).rejects.toThrow(/response object/)
  })

  it('zero read', async () => {
    fetchMock.mock('http://fakehost/test.txt', readBuffer)
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.alloc(10)
    const res = await f.read(buf, 0, 0, 0)
    expect(buf.toString().length).toBe(10)
    expect(buf.toString()[0]).toBe('\0')
    expect(res.bytesRead).toEqual(0)
  })
  it('stat', async () => {
    fetchMock.mock('http://fakehost/test.txt', readBuffer)
    const f = new RemoteFile('http://fakehost/test.txt')
    const stat = await f.stat()
    expect(stat.size).toEqual(8)
  })
  it('auth token', async () => {
    fetchMock.mock('http://fakehost/test.txt', (url: string, args: any) => {
      if (args.headers.Authorization) {
        return {
          status: 200,
          body: 'hello world',
        }
      } else {
        return { status: 403 }
      }
    })
    const f = new RemoteFile('http://fakehost/test.txt', {
      overrides: { headers: { Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l' } },
    })
    const stat = await f.readFile('utf8')
    expect(stat).toBe('hello world')
  })
  it('auth token with range request', async () => {
    fetchMock.mock('http://fakehost/test.txt', (url: string, args: any) => {
      if (args.headers.Authorization && args.headers.range) {
        return {
          status: 206,
          body: 'hello world',
        }
      } else if (!args.headers.Authorization) {
        return { status: 403 }
      } else if (!args.headers.Range) {
        return { status: 400 }
      }
    })
    const f = new RemoteFile('http://fakehost/test.txt', {
      overrides: { headers: { Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l' } },
    })
    const { buffer } = await f.read(Buffer.alloc(5), 0, 5, 0)
    const str = buffer.toString()
    expect(str).toBe('hello')
  })
})
