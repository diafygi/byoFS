byoFS.js - Bring Your Own Filesystem
====

**byoFS.js** is a javascript library that allows users to connect their own cloud storage. After a user has connected their data storage location, the library provides read/write interface to that location.

# Why use this library?

When you make a webapp, you usually have to also setup a dynamic server to serve user-specific data. That means backend frameworks, databases, caching, security, monitoring, etc. It starts to suck very quickly, and you end up sinking tons of time (and money) into managing your servers when you could have improving your webapp.

byoFS aims to eleminate the need to run a dynamic server when developing webapps. Many users nowadays have some sort of personal data storage (Dropbox, Google Drive, etc.), so why not utilize that storage to keep the user data your webapp needs? That way, yous can just server a static webapp file (cheap and easy).

# User Storage Options

* [Dropbox](https://www.dropbox.com) (working)
* [Google Drive](https://drive.google.com/) (in progress)
* [remoteStorage](http://remotestorage.io/) (in progress)
* [Box.com](https://box.com/) (in progress)
* [SpiderOak](https://example.com/) (in progress)
* [AWS S3](https://example.com/) (in progress)
* [Rackspace CloudFiles](https://example.com/) (in progress)
* [localStorage](https://example.com/) (working, maily used for testing, not recommended for production)s

# Security

*"But why would I send my app's data to a third party?"*

byoFS includes the [Stanford Javascript Crypto Library](https://example.com/), and by default your data is encrypted before it sent to the connected datastore.

**How to Use**

```javascript
//insert a widget for "myapp" into "mydiv"
byoFS("myapp", "#mydiv", function(fs){

  //when a datastore is connected, write "Hello World!" to "myfile"
  fs.write("myfile", "Hello World!", function(xhr){

    //when the file is written, read the contents back
    fs.read("myfile", function(xhr){

      //when the contents are returned, print in the console ("Hello World!")
      console.log(xhr.contents);

    });

  });

});
```

There are only three functions used: byoFS(), write(), and read(). *byoFS()* sets up the widget, *write()* writes files to the connected datastore, and *read()* reads files from the connected datastore.

# API

## byoFS(*appname, selector, callback[, options]*)

`appname` is a string that will be prefixed to all files written to the filesystem.

`selector` is a string or DOM element that assigns where the connection widget should be inserted.

`callback` is a function that is called when the user connects a datastore. That datastore object `fs` is passed as the first argument to the callback function.

`options` is an object that can override the default setup options. Below are the possible options with their defaults.

> encrypt_data: whether to encrypt the contents of files (default is true)
> hash_filenames: whether to hash the filenames after the appname prefix (default is true)
> chunk_size: size of chunks if the file is bigger than one chunk (default is 5000000 (5MB))

## fs

## fs.read(*filename, callback*)

## fs.write(*filename, data, callback[, options]*)

## xhr

`xhr` is the returned object by the read and write callbacks. It is a normal vanilla xhr object. However, if byoFS had a problem decrypting the return of a "200 OK" request, the xhr 200 status code will be updated to an error status code and message.
