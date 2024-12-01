import { afterEach, test, expect } from 'vitest'
import fetchMock from 'fetch-mock'
import { LocalFile, RemoteFile } from '../src/'
import { TextDecoder } from 'util'

import rangeParser from 'range-parser'
fetchMock.config.sendAsJson = false

function toString(a: Uint8Array<ArrayBuffer>) {
  return new TextDecoder('utf8').decode(a)
}

const getFile = (url: string) =>
  new LocalFile(require.resolve(url.replace('http://fakehost/', './data/')))

// fakes server responses from local file object with fetchMock
const readBuffer = async (url: string, args: any) => {
  const file = getFile(url)
  const range = rangeParser(10000, args.headers.range)
  const { start, end } = range[0]
  const len = end - start
  const buf = await file.read(len, start)
  const stat = await file.stat()
  return {
    status: 206,
    body: buf,
    headers: {
      'Content-Range': `${start}-${end}/${stat.size}`,
    },
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

afterEach(() => fetchMock.restore())

test('reads file', async () => {
  const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', readFile)
  const f = new RemoteFile('http://fakehost/test.txt', { fetch })
  const b = await f.readFile()
  expect(toString(b)).toEqual('testing\n')
})
test('reads file with response buffer method disabled', async () => {
  const mockedFetch = fetchMock
    .sandbox()
    .mock('http://fakehost/test.txt', readFile)
  const f = new RemoteFile('http://fakehost/test.txt', {
    async fetch(url, opts) {
      const res = await mockedFetch(url, opts)
      // @ts-ignore
      res.buffer = 0 // obscure the buffer method to test our arraybuffer parse
      return res
    },
  })
  const b = await f.readFile()
  expect(toString(b)).toEqual('testing\n')
})
test('reads file with encoding', async () => {
  fetchMock.mock('http://fakehost/test.txt', readFile)
  const f = new RemoteFile('http://fakehost/test.txt')
  const fileText = await f.readFile('utf8')
  expect(fileText).toEqual('testing\n')
  const fileText2 = await f.readFile({ encoding: 'utf8' })
  expect(fileText2).toEqual('testing\n')
  // @ts-expect-error
  await expect(f.readFile('fakeEncoding')).rejects.toThrow(
    /unsupported encoding/,
  )
})
test('reads remote partially', async () => {
  fetchMock.mock('http://fakehost/test.txt', readBuffer)
  const f = new RemoteFile('http://fakehost/test.txt')
  const buf = await f.read(3, 0)
  expect(toString(buf)).toEqual('tes')
})
test('reads remote clipped at the end', async () => {
  fetchMock.mock('http://fakehost/test.txt', readBuffer)
  const f = new RemoteFile('http://fakehost/test.txt')
  const buf = await f.read(3, 6)
  expect(toString(buf).replace('\0', '')).toEqual('g\n')
})

test('throws error', async () => {
  fetchMock.mock('http://fakehost/test.txt', 500)
  const f = new RemoteFile('http://fakehost/test.txt')
  const res = f.read(0, 0)
  await expect(res).rejects.toThrow(/HTTP 500/)
})
test('throws error if file missing', async () => {
  fetchMock.mock('http://fakehost/test.txt', 404)
  const f = new RemoteFile('http://fakehost/test.txt')
  const res = f.read(0, 0)
  await expect(res).rejects.toThrow(/HTTP 404/)
})

test('zero read', async () => {
  fetchMock.mock('http://fakehost/test.txt', readBuffer)
  const f = new RemoteFile('http://fakehost/test.txt')
  const buf = toString(await f.read(0, 0))
  expect(buf).toBe('')
})

test('stat', async () => {
  fetchMock.mock('http://fakehost/test.txt', readBuffer)
  const f = new RemoteFile('http://fakehost/test.txt')
  const stat = await f.stat()
  expect(stat.size).toEqual(8)
})
test('auth token', async () => {
  fetchMock.mock('http://fakehost/test.txt', (url: string, args: any) => {
    return args.headers.Authorization
      ? {
          status: 200,
          body: 'hello world',
        }
      : { status: 403 }
  })
  const f = new RemoteFile('http://fakehost/test.txt', {
    overrides: {
      headers: { Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l' },
    },
  })
  const stat = await f.readFile('utf8')
  expect(stat).toBe('hello world')
})
test('auth token with range request', async () => {
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
    overrides: {
      headers: { Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l' },
    },
  })
  const buffer = await f.read(5, 0)
  expect(toString(buffer)).toBe('hello')
})
