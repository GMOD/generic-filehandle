const nodeFetch = jest.requireActual('cross-fetch')
const fetchMock = require('fetch-mock').sandbox()
Object.assign(fetchMock.config, nodeFetch, {
  fetch: nodeFetch,
})
module.exports = fetchMock
