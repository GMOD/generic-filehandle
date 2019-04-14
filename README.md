# generic-filehandle


[![NPM version](https://img.shields.io/npm/v/generic-filehandle.svg?style=flat-square)](https://npmjs.org/package/generic-filehandle)
[![Build Status](https://travis-ci.com/GMOD/generic-filehandle.svg?branch=master)](https://travis-ci.com/GMOD/generic-filehandle)
[![codecov](https://codecov.io/gh/GMOD/generic-filehandle/branch/master/graph/badge.svg)](https://codecov.io/gh/GMOD/generic-filehandle)

Implements the concept of a filehandle that can be used to access local files, remote urls, or blob objects

## Usage

    import {LocalFile,RemoteFile,BlobFile} from 'generic-filehandle'

    // operate on a local file path
    const local = new LocalFile('/some/file/path/file.txt')

    // operate on a remote file path
    const remote = new RemoteFile('http://somesite.com/file.txt')

    // operate on blob objects
    const blobfile = new BlobFile(new Blob([some_existing_buffer], { type: "text/plain" }))

    // read slice of file, works on remote files with range request, pre-allocate buffer
    const buf = Buffer.alloc(10)
    const bytesRead = await remote.read(buf, 0, 10, 10)
    console.log(buf.toString())

    // readFile, returns buffer
    const buf = remote.readFile()

## API

### async read(buf:Buffer, offset: number=0, length: number, position: number=0, opts?: Options): Promise<number>

* buf - a pre-allocated buffer that can contain length bytes
* offset - an offset into the buffer to write into
* length - a length of data to read
* position - the byte offset in the file to read from
* opts - a Options object

Returns a promise containing bytesRead, and the results in the argument `buf`

### async readFile(opts?: Options): Promise<Buffer | string>

Returns a promise to a buffer or string for the whole file

### async stat() : Promise<{size: number}>

Returns a promise to a object containing at a minimum the size of the file

### Options

The Options object for `read` and `readFile` can contain abort signal or other customizations. By default these are used

* signal - an AbortSignal that is passed to remote file fetch() API or other file readers
* headers - extra HTTP headers to pass to remote file fetch() API
* overrides - extra parameters to pass to the remote file fetch() API

The Options object for `readFile` can also contain an entry `encoding`. The
default is no encoding, in which case the file contents are returned as a
buffer. Currently, the only encoding that is consistent is "utf8", and
specifying that will cause the file contents to be returned as a string. Also,
passing the string "utf8" instead of an Options object is valid for `readFile`
as well.

## References


Node 10 implements a FileHandle class similar to this that is promisified. This is similar and adds the concept of remote file handle support

See https://nodejs.org/api/fs.html#fs_class_filehandle
