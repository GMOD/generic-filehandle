const nodeFetch = jest.requireActual('cross-fetch')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fetchMock = require('fetch-mock').sandbox()
Object.assign(fetchMock.config, nodeFetch, {
  fetch: nodeFetch,
})
module.exports = fetchMock
