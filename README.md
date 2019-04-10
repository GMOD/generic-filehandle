# generic-filehandle


[![Build Status](https://travis-ci.com/cmdcolin/node-filehandle.svg?branch=master)](https://travis-ci.com/cmdcolin/node-filehandle)
[![codecov](https://codecov.io/gh/cmdcolin/node-filehandle/branch/master/graph/badge.svg)](https://codecov.io/gh/cmdcolin/node-filehandle)

Implements the concept of a filehandle that can be used to access local or remote files

## Usage

    import {LocalFile,RemoteFile} from 'generic-filehandle'

    // operate on a local file path
    const local = new LocalFile('/some/file/path/file.txt')

    // operate on a remote file path
    const remote = new RemoteFile('http://somesite.com/file.txt')

    // read slice of file, works on remote files with range request, pre-allocate buffer
    const buf = Buffer.alloc(10)
    const bytesRead = await remote.read(buf, 0, 10, 10)
    console.log(buf.toString())

    // readFile, returns buffer
    const buf = remote.readFile()

## References


Node 10 implements a FileHandle class similar to this that is promisified. This is similar and adds the concept of remote file handle support

See https://nodejs.org/api/fs.html#fs_class_filehandle
