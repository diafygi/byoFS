"use strict";

//byoFS javascript library, GPLv2, https://github.com/diafygi/byoFS
(function(context){


    /***********************************
     ***********************************
     *** Encoding/Decoding Functions ***
     ***********************************
     ***********************************/

    //convert a string to ArrayBuffer
    function str2bytes(str, encoding){
        //manual utf-8 override
        if(encoding === "utf-8"){
            var buf = new ArrayBuffer(str.length);
            var bytes = new Uint8Array(buf);
        }
        //default encoding is utf-16 in javascript
        else{
            var buf = new ArrayBuffer(str.length * 2);
            var bytes = new Uint16Array(buf);
        }
        for(var i = 0; i < str.length; i++){
            bytes[i] = str.charCodeAt(i);
        }
        return bytes.buffer;
    }

    //convert an ArrayBuffer to a string
    function bytes2str(buf, encoding){
        //manual utf-8 override
        if(encoding === "utf-8"){
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }
        //default encoding is utf-16 in javascript
        else{
            return String.fromCharCode.apply(null, new Uint16Array(buf));
        }
    }

    //convert an ArrayBuffer to a hex string
    function bytes2hex(buf){
        var str = "";
        var bytes = new Uint16Array(buf);
        for(var i = 0; i < bytes.length; i++){
            var hex = bytes[i].toString(16);
            str += hex.length >= 4 ? hex : new Array(4 - hex.length + 1).join("0") + hex;
        }
        return str;
    }


    /**************
     **************
     *** PBKDF2 ***
     **************
     **************/

    //Key derivation function using PBKDF2
    function pbkdf2(secret, salt){

        //generate a PBKDF2 key from the secret
        return context.crypto.subtle.importKey(
            "raw",
            str2bytes(secret),
            {
                "name": "PBKDF2",
            },
            false,
            ["deriveKey"])
        .then(function(pbkdf2key){

            //derive a AES-GCM key from the PBKDF2 key
            return context.crypto.subtle.deriveKey(
            {
                "name": "PBKDF2",
                "salt": str2bytes(salt),
                "iterations": 100000,
                //Can't do SHA-256 :(
                //https://bugzilla.mozilla.org/show_bug.cgi?id=1021607#c5
                "hash": {
                    "name": "SHA-1",
                },
            },
            pbkdf2key,
            {
                "name": "AES-GCM",
                "length": 256,
            },
            false,
            ["encrypt", "decrypt"]);
        });
    }

    /***********************
     ***********************
     *** byoFS Functions ***
     ***********************
     ***********************/

    //initialization function that sets the app namespace and settings
    var byoFS = function(settings){
        //default settings
        var defaults = {
            "app": "byoFS",           //app namespace
            "remote": "localStorage", //(localStorage|dropbox)
            "allowPublic": false,     //whether files can be made public or not

            //These don't have defaults
            //"secret": "...", //required, the passphrase used for PBKDF2
            //"code": "...",   //optional, for dropbox (OAuth code from their dialog)
        };
        var remotes = {}

        //use default settings if not set
        settings = settings || {};
        for(var k in defaults){
            if(settings[k] === undefined){
                settings[k] = defaults[k];
            }
        }

        //only support localStorage and Dropbox as remotes
        if(["dropbox", "localStorage"].indexOf(settings.remote) === -1){
            throw Error("The only valid remotes are localStorage and dropbox.");
        }

        //raise error if trying to allow public access for local storage
        if(settings.remote === "localStorage" && settings.allowPublic){
            throw Error("localStorage is local and can't save public files.");
        }

        //raise error if no code in Dropbox
        if(["dropbox"].indexOf(settings.remote) !== -1
          && settings.code === undefined && settings.token === undefined){
            throw Error(settings.remote + " requires a 'code' or 'token' field.");
        }

        /********************
         ********************
         *** localStorage ***
         ********************
         ********************/

        remotes.localStorage = {

            //read a file from localStorage
            "read": function(remoteFilename){
                var data = context.localStorage[remoteFilename];
                if(data === undefined){
                    return {
                        "status": 404,
                        "responseText": "File not found in localStorage",
                    };
                }
                else{
                    return {
                        "status": 200,
                        "responseText": str2bytes(context.localStorage[remoteFilename]),
                    };
                }
            },

            //write a file to localStorage
            "write": function(remoteFilename, data){

                //delete the file
                if(data === null){
                    if(context.localStorage[remoteFilename] !== undefined){
                        localStorage.removeItem(remoteFilename);
                    }
                    return {
                        "status": 200,
                        "responseText": "Successfully deleted file",
                    };
                }

                //save new or update existing file
                else{
                    localStorage.setItem(remoteFilename, bytes2str(data));
                    return {
                        "status": 200,
                        "responseText": "Successfully wrote file",
                    };
                }
            },
        }

        /***************
         ***************
         *** Dropbox ***
         ***************
         ***************/

        //NOTE: This is an unhosted library, and the secret for this app is
        //understood to be public so there are no server-side requirements.
        var dropbox_client_id = "wy1ojs3oijr3gpt";
        var dropbox_client_secret = "jorqnsz6kd25ieo";

        //convert an oauth code to an access_token
        function _dropbox_auth(){
            return new Promise(function(resolve, reject){

                //access_token not set yet
                if(settings.token === undefined){

                    //build OAuth token request body
                    var params = "code=" + encodeURIComponent(settings.code);
                    params += "&grant_type=authorization_code";
                    params += "&client_id=" + dropbox_client_id;
                    params += "&client_secret=" + dropbox_client_secret;

                    //take submitted code and get a oauth token
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", "https://api.dropbox.com/1/oauth2/token");
                    xhr.onreadystatechange = function(){
                        if(xhr.readyState === 4){
                            if(xhr.status === 200){
                                settings.token = JSON.parse(xhr.responseText)['access_token'];
                                resolve();
                            }
                            else{
                                var err = Error();
                                err.xhr = xhr;
                                reject(err);
                            }
                        }
                    };
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
                    xhr.send(params);
                }

                //access_token is set
                else{
                    resolve();
                }
            });
        }

        remotes.dropbox = {

            //read a file from Dropbox
            "read": function(remoteFilename){

                //get an auth token if not is set yet
                return _dropbox_auth()

                //request the file
                .then(function(){
                    return new Promise(function(resolve, reject){
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", "https://api-content.dropbox.com/1/files/sandbox/" +
                            encodeURIComponent(remoteFilename) + ".byofs");
                        xhr.responseType = "arraybuffer";
                        xhr.onreadystatechange = function(){
                            if(xhr.readyState === 4){
                                if(xhr.status === 200){
                                    resolve({
                                        "status": 200,
                                        "responseText": xhr.response,
                                        "xhr": xhr,
                                    });
                                }
                                else{
                                    var err = Error();
                                    err.xhr = xhr;
                                    reject(err);
                                }
                            }
                        };
                        xhr.setRequestHeader("Authorization", "Bearer " + settings.token);
                        xhr.send();
                    });
                })
            },

            //write a file to Dropbox
            "write": function(remoteFilename, data, isPublic){

                //get an auth token if not is set yet
                return _dropbox_auth()

                //write or delete the file
                .then(function(){

                    //delete the file
                    if(data === null){
                        return new Promise(function(resolve, reject){
                            var xhr = new XMLHttpRequest();
                            xhr.open("POST", "https://api.dropbox.com/1/fileops/delete?root=sandbox&path=" +
                                encodeURIComponent(remoteFilename) + ".byofs");
                            xhr.onreadystatechange = function(){
                                if(xhr.readyState === 4){
                                    if(xhr.status === 200){
                                        resolve(xhr);
                                    }
                                    else{
                                        var err = Error();
                                        err.xhr = xhr;
                                        reject(err);
                                    }
                                }
                            };
                            xhr.setRequestHeader("Authorization", "Bearer " + settings.token);
                            xhr.send();
                        });
                    }

                    //upload the file (overwriting old file if it existed)
                    else{
                        return new Promise(function(resolve, reject){
                            var xhr = new XMLHttpRequest();
                            xhr.open("POST", "https://api-content.dropbox.com/1/files_put/sandbox/" +
                                encodeURIComponent(remoteFilename) + ".byofs");
                            xhr.onreadystatechange = function(){
                                if(xhr.readyState === 4){
                                    if(xhr.status === 200){
                                        resolve(xhr);
                                    }
                                    else{
                                        var err = Error();
                                        err.xhr = xhr;
                                        reject(err);
                                    }
                                }
                            };
                            xhr.setRequestHeader("Authorization", "Bearer " + settings.token);
                            xhr.send(data);
                        })

                        //make the file public if requested
                        .then(function(response){
                            if(isPublic && settings.allowPublic){
                                return new Promise(function(resolve, reject){
                                    var xhr = new XMLHttpRequest();
                                    xhr.open("POST", "https://api.dropbox.com/1/shares/sandbox/" +
                                        encodeURIComponent(remoteFilename) + ".byofs?short_url=false");
                                    xhr.onreadystatechange = function(){
                                        if(xhr.readyState === 4){
                                            if(xhr.status === 200){
                                                var url = JSON.parse(xhr.responseText)['url'];
                                                url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com");
                                                resolve({
                                                    "status": 200,
                                                    "responseText": url,
                                                    "xhr": xhr,
                                                });
                                            }
                                            else{
                                                var err = Error();
                                                err.xhr = xhr;
                                                reject(err);
                                            }
                                        }
                                    };
                                    xhr.setRequestHeader("Authorization", "Bearer " + settings.token);
                                    xhr.send();
                                });
                            }
                            else{
                                return response;
                            }
                        });
                    }
                });
            },
        }

        /*********************************
         *********************************
         *** Generic Filesystem Object ***
         *********************************
         *********************************/

        //return the filesystem object
        return {

            //generic read function
            "read": function(meta, callback){

                //derive a key if it hasn't been derived yet
                new Promise(function(resolve, reject){
                    if(settings.key === undefined){
                        resolve(pbkdf2(settings.secret, settings.app));
                    }
                    else{
                        resolve(settings.key);
                    }
                })

                //set the derived key in the settings
                .then(function(key){
                    settings.key = key;
                })

                //accept string filenames as file metadata
                .then(function(){
                    if(typeof(meta) === "string"){
                        meta = {"name": meta}
                    }
                })

                //hash the filename to get the stored location
                .then(function(){
                    var bytes = str2bytes(meta['name']);
                    return context.crypto.subtle.digest({"name": "SHA-256"}, bytes);
                })

                //convert the hash to the stored filename
                .then(function(hashed){
                    return settings.app + "-" + bytes2hex(hashed);
                })

                //retrieve the remote file
                .then(function(remoteFilename){
                    return remotes[settings.remote].read(remoteFilename);
                })

                //handle the encrypted file retrieval
                .then(function(xhr){
                    if(xhr.status === 200){
                        return xhr.responseText;
                    }
                    else{
                        var err = Error();
                        err.xhr = xhr;
                        throw err;
                    }
                })

                //decrypt the file
                .then(function(downloaded){

                    //skip decrypting if a public file
                    if(meta.pub === true && settings.allowPublic){
                        return bytes2str(downloaded, meta.encoding);
                    }

                    //convert string to Uint16Array
                    var bytes = new Uint16Array(downloaded);

                    //only have one version so far
                    if(bytes[0] !== 1){
                        throw Error("Unknown file format version");
                    }

                    //read the iv, aad, and encrypted chunks
                    //
                    // format = <2 bytes> version (Version 1 is 0x0001)
                    //          <16 bytes> AES-GCM initialization vector
                    //          <16 bytes> AES-GCM additional authentication data
                    //          <N bytes> AES-GCM encrypted data
                    //
                    var iv = bytes.subarray(1, 9);
                    var aad = bytes.subarray(9, 17);
                    var encrypted = bytes.subarray(17);

                    //decrypt the file
                    return context.crypto.subtle.decrypt({
                        "name": "AES-GCM",
                        "iv": iv,
                        "additionalData": aad,
                        "tagLength": 128,
                    }, settings.key, encrypted)
                    .then(function(decrypted){
                        return bytes2str(decrypted, meta.encoding);
                    });
                })

                //handle decrypted file
                .then(function(decryptedStr){
                    callback({
                        "status": 200,
                        "responseText": decryptedStr,
                    });
                })

                //handle any errors
                .catch(function(err){
                    //return the xhr error
                    if(err.xhr !== undefined){
                        callback(err.xhr);
                    }
                    //handle generic exceptions
                    else{
                        callback({
                            "status": 500,
                            "responseText": err.message,
                            "error": err,
                        });
                    }
                });
            },

            //generic write function
            "write": function(meta, data, callback){

                //parse write permissions and options
                new Promise(function(resolve, reject){

                    //accept string filenames as file metadata
                    if(typeof(meta) === "string"){
                        meta = {"name": meta}
                    }

                    //if the file is public, make sure that's allowed
                    if(data !== null && meta.pub === true && !settings.allowPublic){
                        throw Error("This filesystem was created to not allow public files.");
                    }
                    else{
                        resolve();
                    }
                })

                //derive a key if it hasn't been derived yet
                .then(function(){
                    if(settings.key === undefined){
                        return pbkdf2(settings.secret, settings.app);
                    }
                    else{
                        return settings.key;
                    }
                })

                //set the derived key in the settings
                .then(function(key){
                    settings.key = key;
                })

                //hash the filename for the stored location
                .then(function(){
                    var bytes = str2bytes(meta['name']);
                    return context.crypto.subtle.digest({"name": "SHA-256"}, bytes);
                })

                //convert the hash to the stored filename
                .then(function(hashed){
                    return settings.app + "-" + bytes2hex(hashed);
                })

                //encrypt the data
                .then(function(remoteFilename){
                    //skip encrypting if just deleting the file
                    if(data === null){
                        return {
                            "remoteFilename": remoteFilename,
                            "upload": null,
                        };
                    }

                    //skip encrypting if the file is public
                    else if(meta.pub === true && settings.allowPublic){
                        return {
                            "remoteFilename": remoteFilename,
                            "upload": str2bytes(data, meta.encoding),
                        };
                    }

                    //generate a new iv and aad
                    var iv = context.crypto.getRandomValues(new Uint16Array(8));
                    var aad = context.crypto.getRandomValues(new Uint16Array(8));

                    //encrypt the file
                    return context.crypto.subtle.encrypt({
                        "name": "AES-GCM",
                        "iv": iv,
                        "additionalData": aad,
                        "tagLength": 128,
                    }, settings.key, str2bytes(data, meta.encoding))
                    .then(function(buf){
                        //concat the version, iv, aad, and ciphertext into one file
                        //
                        // format = <2 bytes> version (Version 1 is 0x0001)
                        //          <16 bytes> AES-GCM initialization vector
                        //          <16 bytes> AES-GCM additional authentication data
                        //          <N bytes> AES-GCM encrypted data
                        //
                        var encrypted = new Uint16Array(buf);
                        var version = new Uint16Array([1]);
                        var bytes = new Uint16Array(encrypted.length + 1 + 8 + 8);
                        bytes.set(version, 0);
                        bytes.set(iv, 1);
                        bytes.set(aad, 9);
                        bytes.set(encrypted, 17);

                        return {
                            "remoteFilename": remoteFilename,
                            "upload": bytes.buffer,
                        };
                    });
                })

                //write the encrypted data to the remote
                .then(function(file){
                    return remotes[settings.remote].write(file.remoteFilename,
                        file.upload, meta.pub === true);
                })

                //the callback is the write response (both success or error)
                .then(function(xhr){
                    callback(xhr);
                })

                //handle any errors
                .catch(function(err){
                    //return the xhr error
                    if(err.xhr !== undefined){
                        callback(err.xhr);
                    }
                    //handle generic exceptions
                    else{
                        callback({
                            "status": 500,
                            "responseText": err.message,
                            "error": err,
                        });
                    }
                });
            }
        };
    };

    context.byoFS = byoFS;
})(this);
