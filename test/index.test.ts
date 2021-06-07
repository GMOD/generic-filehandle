/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fetchMock from 'fetch-mock'
import { LocalFile, open, fromUrl } from '../src/'
import { open as browserOpen } from '../src/browser'

describe('test util functions', () => {
  it('fromUrl', async () => {
    const ret = fromUrl('file:///var/')
    expect(ret.constructor.name).toEqual('RemoteFileWithFileUrl')
  })
  it('fromUrl local', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', () => {
      /* intentionally blank */
    })
    const ret = fromUrl('http://google.com', { fetch })
    expect(ret.constructor.name).toEqual('RemoteFileWithFileUrl')
  })
  it('open', async () => {
    const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', () => {
      /* intentionally blank */
    })
    const f = new LocalFile('/var')
    expect(
      open('http://google.com', undefined, undefined, { fetch }).constructor.name,
    ).toEqual('RemoteFileWithFileUrl')
    expect(
      browserOpen('http://google.com', undefined, undefined, { fetch }).constructor.name,
    ).toEqual('RemoteFile')
    expect(open(undefined, '/var/').constructor.name).toEqual('LocalFile')
    expect(open(undefined, undefined, f).constructor.name).toEqual('LocalFile')
    expect(() => open(undefined, undefined, undefined)).toThrow(/cannot open/)
  })
})
