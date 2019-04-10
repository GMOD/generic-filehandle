const fetchMock = require('fetch-mock')
import {LocalFile,RemoteFile} from '../src/'
const parseRange = require('range-parser');
fetchMock.config.sendAsJson = false




const readBufferArgs = async (url, args) => {
  const f = new LocalFile(require.resolve(url.replace('http://fakehost/','./data/')))
  if(args.headers) {
    var range = parseRange(10000, args.headers.range)
    const { start, end } = range[0]
    const len = end-start
    let buf = Buffer.alloc(len)
    const bytesRead = await f.read(buf, 0, len, start)
    buf = buf.slice(0, bytesRead)
    return {
      status: 206,
      body: buf
    }
  } else {
    const ret = await f.readFile()
    return {
      status: 200,
      body: ret
    }
  }
}


describe('remote file tests', () => {
  beforeEach(() => fetchMock.mock('http://fakehost/test.txt', readBufferArgs))
  afterEach(() => fetchMock.restore())

  it('reads file', async () => {
    const f = new RemoteFile('http://fakehost/test.txt')
    const b = await f.readFile()
    expect(b.toString()).toEqual('testing\n')
  })
  it('reads remote partially', async () => {
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.allocUnsafe(3)
    console.log('herhehre',buf)
    const bytesRead = await f.read(buf, 0, 3, 0)
    console.log('herhehre',bytesRead)
    expect(buf.toString()).toEqual('tes')
    expect(bytesRead).toEqual(3)
  })
  it('reads remote clipped at the end', async () => {
    const f = new RemoteFile('http://fakehost/test.txt')
    const buf = Buffer.allocUnsafe(3)
    const bytesRead = await f.read(buf, 0, 3, 6)
    expect(buf.slice(0,bytesRead).toString()).toEqual('g\n')
    expect(bytesRead).toEqual(2)
  })
})
