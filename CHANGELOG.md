# [2.1.0](https://github.com/GMOD/generic-filehandle/compare/v2.0.3...v2.1.0) (2021-03-10)



- Refetch with cache:'reload' header on CORS error to bypass Chrome cache pollution

## [2.0.3](https://github.com/GMOD/generic-filehandle/compare/v2.0.2...v2.0.3) (2020-06-05)

- Fix ability to supply things like Authorization token to the constructor

example syntax

```
const f = new RemoteFile("http://yourwebsite/file.bam", {
  overrides: {
    headers: {
      Authorization: "Basic YWxhZGRpbjpvcGVuc2VzYW1l",
    },
  },
});
```

## [2.0.2](https://github.com/GMOD/generic-filehandle/compare/v2.0.1...v2.0.2) (2020-04-07)

- Upgrade dependencies

## [2.0.1](https://github.com/GMOD/generic-filehandle/compare/v2.0.0...v2.0.1) (2019-10-25)

- Fix the typescript typings for stat and some other things

# [2.0.0](https://github.com/GMOD/generic-filehandle/compare/v1.0.9...v2.0.0) (2019-06-05)

- Update to use Node.js return type e.g. {buffer,bytesRead} instead of just bytesRead

## [1.0.9](https://github.com/GMOD/generic-filehandle/compare/v1.0.8...v1.0.9) (2019-05-01)

- Add ability to read a fetch response's Body().buffer() instead of Body.arrayBuffer() that is normally returned
- Fix issue with using un-polyfilled fetch

## [1.0.8](https://github.com/GMOD/generic-filehandle/compare/v1.0.7...v1.0.8) (2019-04-17)

- Properly added typescript type declaration files to the distribution

## [1.0.7](https://github.com/GMOD/generic-filehandle/compare/v1.0.6...v1.0.7) (2019-04-16)

- Remove polyfill of fetch, now uses "globalThis" fetch or supply opts.fetch to the constructor of RemoteFile (@rbuels, pull #8)
- Translates file:// URL to LocalFile in the implementation (@rbuels, pull #7)
- Allow adding fetch overrides to the constructor of RemoteFile
- Make LocalFile lazily evaluate opening the file until usage

## [1.0.6](https://github.com/GMOD/generic-filehandle/compare/v1.0.5...v1.0.6) (2019-04-15)

- Added documentation about the Options object
- Added encoding option to the Options for readFile which can return text if specified as utf8 or you can also directly call filehandle.readFile('utf8')

## [1.0.5](https://github.com/cmdcolin/generic-filehandle/compare/v1.0.4...v1.0.5) (2019-04-12)

- Added BlobFile class, implementation (thanks @garrettjstevens!)

## [1.0.4](https://github.com/cmdcolin/node-filehandle/compare/v1.0.2...v1.0.4) (2019-04-11)

- Add @types/node for typescript

## [1.0.3](https://github.com/cmdcolin/node-filehandle/compare/v1.0.2...v1.0.3) (2019-04-11)

- Downgrade quick-lru for node 6

## [1.0.2](https://github.com/cmdcolin/node-filehandle/compare/v1.0.1...v1.0.2) (2019-04-10)

- Fix usage of fetch headers
- Add overrides parameter to options

## 1.0.1 (2019-04-10)

- Fix some typescript definitions

## 1.0.0

- Initial implementation of a filehandle object with local and remote support
