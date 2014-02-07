byoFS.js - Bring Your Own Filesystem
====

[**byoFS.js**](https://github.com/diafygi/byoFS/) is a javascript library that allows users to connect their own cloud storage. After a user has connected their data storage location, the library provides read/write functions to that storage location.

## Why use this library?

When you make a webapp, you usually have to also setup a dynamic server to serve user-specific data. That means backend frameworks, databases, caching, security, monitoring, etc. It starts to suck very quickly, and you end up sinking tons of time (and money) into managing your servers when you could have improving your webapp.

byoFS aims to eleminate the need to run a dynamic server when developing webapps. Many users nowadays have some sort of personal data storage (Dropbox, Google Drive, etc.), so why not utilize that storage to keep the user data your webapp needs? That way, yous can just server a static webapp file (cheap and easy).

This type of setup is generally referred to as [unhosted](https://unhosted.org). byoFS is a minimalist implementation of the unhosted philosophy.

## Security and Philosophy

*"But why would I send my app's data to an arbitrary third party?"*

byoFS includes the [Stanford Javascript Crypto Library](https://crypto.stanford.edu/sjcl/), and data is encrypted before it is sent to the connected datastore (i.e. client-side crypto). This allows you to securely store data on the user's choice of third party datastore.

This philosophy of splitting up app vs. datastore also has privacy advantages for the user. It allows neither the app nor the datastore to know the contents user's data. The app server just sees an anonymous request, and the datastore server just sees encrypted files.

Because the app server only sees an anonymous request, it is more difficult to target malicious javascript injections that would compromise the client-side crypto. An attack from a compromised app server would have to indiscriminately broadcast the malicious code, which would have a much higher chance of being discovered.

Attacks from the datastore server is also made difficult because only text files that are not executed are retrieved. However, a browser exploit that caused arbitrary javascript to be executed could compromise the client-side crypto. This is worrisome because the datastore requests are not anonymous (e.g. the datastore knows who the user is).

This library's API is purposefully minimal to keep the code clean and easy to audit. More complex features are generally frowned upon because they add to the amount of risk for accidentally introducing an exploit. Added features should be added as code that sits on top of byoFS.

## How to Use

    <script src="byoFS.min.js"></script>
    <script>
      //insert a widget for "myapp" into "mydiv"
      byoFS("myapp", "#mydiv", function(fs){

        //when a datastore is connected, write "Hello World!" to "myfile"
        fs.write("myfile", "Hello World!", function(pxhr){

          //when the file is written, read the contents back
          fs.read("myfile", function(pxhr){

            //when the contents are returned, print in the console ("Hello World!")
            console.log(pxhr.responseText);

          });

        });

      });
    </script>

There are only three functions in this library. `byoFS()` sets up the widget, `fs.write()` writes files to the connected datastore, and `fs.read()` reads files from the connected datastore. See the API section for full details.

## API

### byoFS(*appname, selector, callback*)

`appname` is a string that will be prefixed to all files written to the filesystem.

`selector` is a string or DOM element that assigns where the connection widget should be inserted.

`callback` is a function that is called when the user connects their datastore. A filesystem object `fs` is passed as the first argument to the callback function.

### fs

`fs` is a filesystem object that has `read()` and `write()` functions.

### fs.read(*filename, callback*)

`fs.read()` is the function that retrieves data from the filesystem based on filename.

`filename` is a string that is the location of the file.

`callback` is a function that is called when the file is retrieved. A pseudo-XMLHttpRequest‎ object `xhr` is passed as the first argument to the callback function.

### fs.write(*filename, data, callback*)

`fs.write()` is the function that retrieves data from the filesystem based on filename.

`filename` is a string that is the location of the file.

`data` is a string that is the contents of the file. NOTE: only strings are currently accepted, so you will need to encode any other filetypes to a string.

`callback` is a function that is called when the file is written. A pseudo-XMLHttpRequest‎ object `pxhr` is passed as the first argument to the callback function.

### pxhr

`pxhr` is the returned object by the read and write callbacks. It is inspired by the XMLHttpRequest‎ object, but only includes two keys.

`pxhr.statusText` contains the same responses as a normal [xhr.statusText](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Properties). However, if byoFS had a problem decrypting the return of a "200 OK" request, the statusText will be updated to an error status code and message.

`pxhr.responseText` contains the contents of the response similar to [xhr.responseText](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Properties). This is always returns a string or null, so if you encode another filetype to a string during `fs.write()`, you will need to decode it.

## User Storage Options

* [Dropbox](https://www.dropbox.com) (working)
* [localStorage](https://example.com/) (working, mainly used for testing, not recommended for production)
* [Google Drive](https://drive.google.com/) (future)
* [remoteStorage](http://remotestorage.io/) (future)
* [Box.com](https://box.com/) (future)
* [SpiderOak](https://spideroak.com/) (future)
* [Nimbus.io](https://nimbus.io/) (future)
* [AWS S3](https://aws.amazon.com/s3/) (future)
* [Rackspace CloudFiles](http://www.rackspace.com/cloud/files/) (future)
* [DreamObjects](http://www.dreamhost.com/cloud/dreamobjects/) (future)

## Examples

**NOTE: github.io does not support https. Please only use these apps as examples, and do not use any real passwords in the apps (since the app code is served over http).**

* [Diary](http://diafygi.github.io/byoFS/examples/diary/) - a simple diary app

## Support

This is an open source project maintained on [github](https://github.com/diafygi/byoFS), so please create an [issue](https://github.com/diafygi/byoFS/issues) or [pull request](https://github.com/diafygi/byoFS/pulls) if you want to contribute. Thanks!

