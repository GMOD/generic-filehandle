const fetchMock = require('fetch-mock')
import {LocalFile,RemoteFile} from '../src/'


const readBufferArgs = (args) => {
  console.log(args)
  const f = new LocalFile(require.resolve(args.replace('http://fakehost/')))
  return 'testing\n'
}
describe('local file tests', () => {
  afterEach(() => fetchMock.restore())

  it('reads file', async () => {
    fetchMock.mock('http://fakehost/test.txt', readBufferArgs)
    const f = new RemoteFile('http://fakehost/test.txt')
    const b = await f.readFile()
    expect(b.toString()).toEqual('testing\n')
  })
  it('reads local file', async () => {
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.allocUnsafe(3)
    const bytesRead = await f.read(buf, 0, 3, 0)
    expect(buf.toString()).toEqual('tes')
    expect(bytesRead).toEqual(3)
  })
  it('reads local file clipped at the end', async () => {
    fetchMock.mock('http://fakehost/test.txt', 200)
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.allocUnsafe(3)
    const bytesRead = await f.read(buf, 0, 3, 6)
    expect(buf.slice(0,bytesRead).toString()).toEqual('g\n')
    expect(bytesRead).toEqual(2)
  })
})
