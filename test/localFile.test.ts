import {LocalFile} from '../src/'

describe('local file tests', () => {
  it('reads file', async () => {
    const f = new LocalFile(require.resolve('./data/test.txt'))
    const b = await f.readFile()
    expect(b.toString()).toEqual('testing\n')
  })
})
