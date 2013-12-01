byoFS.js - Bring Your Own Filesystem
====

**byoFS.js** is a javascript library that allows users to connect their own cloud storage. After a user has connected their data storage location, the library provides read/write interface to that location.

# Why use this library?

When you make a webapp, you usually have to also setup a dynamic server to serve user-specific data. That means backend frameworks, databases, caching, security, monitoring, etc. It starts to suck very quickly, and you end up sinking tons of time (and money) into managing your servers when you could have improving your webapp.

byoFS aims to eleminate the need to run a dynamic server when developing webapps. Many users nowadays have some sort of personal data storage (Dropbox, Google Drive, etc.), so why not utilize that storage to keep the user data your webapp needs? That way, yous can just server a static webapp file (cheap and easy).

# How to Use

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

There are only three functions in this library. `byoFS()` sets up the widget, `fs.write()` writes files to the connected datastore, and `fs.read()` reads files from the connected datastore. See the API section for full details.

# User Storage Options

* [Dropbox](https://www.dropbox.com) (working)
* [Google Drive](https://drive.google.com/) (planned)
* [remoteStorage](http://remotestorage.io/) (planned)
* [Box.com](https://box.com/) (planned)
* [SpiderOak](https://example.com/) (planned)
* [AWS S3](https://example.com/) (planned)
* [Rackspace CloudFiles](https://example.com/) (planned)
* [localStorage](https://example.com/) (working, maily used for testing, not recommended for production)s

# API

### byoFS(*appname, selector, callback*)

`appname` is a string that will be prefixed to all files written to the filesystem.

`selector` is a string or DOM element that assigns where the connection widget should be inserted.

`callback` is a function that is called when the user connects a datastore. That datastore object `fs` is passed as the first argument to the callback function.

### fs

`fs` is

### fs.read(*filename, callback*)

`fs.read()` is

### fs.write(*filename, data, callback)

`fs.write()` is

### xhr

`xhr` is the returned object by the read and write callbacks. It is a normal vanilla xhr object. However, if byoFS had a problem decrypting the return of a "200 OK" request, the xhr 200 status code will be updated to an error status code and message.

# Security

*"But why would I send my app's data to a third party?"*

byoFS includes the [Stanford Javascript Crypto Library](https://example.com/), and by default your data is encrypted before it sent to the connected datastore.
