/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fetchMock from 'fetch-mock'
import { open, fromUrl } from '../src/'
import { LocalFile, fromUrl as serverFromUrl, open as serverOpen } from '../src/server'

describe('test util functions', () => {
  it('fromUrl', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', () => {
      /* intentionally blank */
    })
    const ret = fromUrl('http://google.com', { fetch })
    expect(ret.constructor.name).toEqual('RemoteFile')
  })
  it('server fromUrl', async () => {
    const ret = serverFromUrl('file:///var/')
    expect(ret.constructor.name).toEqual('RemoteFileWithFileUrl')
  })
  it('open', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', () => {
      /* intentionally blank */
    })
    expect(
      open('http://google.com', undefined, undefined, { fetch }).constructor.name,
    ).toEqual('RemoteFile')
    expect(
      open('http://google.com', undefined, undefined, { fetch }).constructor.name,
    ).toEqual('RemoteFile')
    expect(() => open(undefined, '/var/', undefined)).toThrow(/cannot open from a path/)
    expect(() => open(undefined, undefined, undefined)).toThrow(/cannot open/)
  })
  it('server open', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', () => {
      /* intentionally blank */
    })
    const f = new LocalFile('/var')
    expect(
      serverOpen('http://google.com', undefined, undefined, { fetch }).constructor.name,
    ).toEqual('RemoteFileWithFileUrl')
    expect(
      serverOpen('http://google.com', undefined, undefined, { fetch }).constructor.name,
    ).toEqual('RemoteFileWithFileUrl')
    expect(serverOpen(undefined, '/var/').constructor.name).toEqual('LocalFile')
    expect(serverOpen(undefined, undefined, f).constructor.name).toEqual('LocalFile')
    expect(() => serverOpen(undefined, undefined, undefined)).toThrow(/cannot open/)
  })
})
