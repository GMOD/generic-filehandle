import { afterEach, test, expect } from 'vitest'
import fetchMock from 'fetch-mock'
import { RemoteFile } from '../src/'
import { TextDecoder } from 'util'

fetchMock.config.sendAsJson = false

function toString(a: Uint8Array<ArrayBuffer>) {
  return new TextDecoder('utf8').decode(a)
}
afterEach(() => fetchMock.restore())

test('auth token', async () => {
  fetchMock.mock('http://fakehost/test.txt', (url: string, args: any) => {
    return args.headers.Authorization
      ? {
          status: 200,
          body: 'hello world',
        }
      : {
          status: 403,
        }
  })
  const f = new RemoteFile('http://fakehost/test.txt', {
    overrides: {
      headers: {
        Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
      },
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
        body: 'hello',
      }
    } else if (!args.headers.Authorization) {
      return { status: 403 }
    } else if (!args.headers.Range) {
      return { status: 400 }
    }
  })
  const f = new RemoteFile('http://fakehost/test.txt', {
    overrides: {
      headers: {
        Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
      },
    },
  })
  const buffer = await f.read(5, 0)
  expect(toString(buffer)).toBe('hello')
})
