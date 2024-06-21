import fetchMock from 'fetch-mock'
import { LocalFile, open, fromUrl } from '../src/'

test('fromUrl local', async () => {
  const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', () => {
    /* intentionally blank */
  })
  const ret = fromUrl('http://google.com', { fetch })
  expect(ret.constructor.name).toEqual('RemoteFile')
})
test('open', async () => {
  const fetch = fetchMock.sandbox().mock('http://fakehost/test.txt', () => {
    /* intentionally blank */
  })
  const f = new LocalFile('/var')
  expect(
    open('http://google.com', undefined, undefined, { fetch }).constructor.name,
  ).toEqual('RemoteFile')
  expect(open(undefined, '/var/').constructor.name).toEqual('LocalFile')
  expect(open(undefined, undefined, f).constructor.name).toEqual('LocalFile')
  expect(() => open(undefined, undefined, undefined)).toThrow(/cannot open/)
})
