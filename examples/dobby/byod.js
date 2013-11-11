//BYOD LIBRARY JAVASCRIPT, GPLv2
var BYOD = (function(){
    templates = {
        auth: '<div class="byod-auth"><p>Load from:</p><ul><li><a href="#" class="byod-auth-db">Dropbox</a></li><li><a href="#" class="byod-auth-ls">localStorage</a></li></ul></div>',
        db: '<div class="byod-db"><p>Dropbox Code:</p><p><input class="byod-db-code"></p><p>Decrypt Password:</p><p><input type="password" class="byod-db-pass"></p><p><a href="#" class="byod-db-submit">Decrypt</a> <a href="#" class="byod-reset">Go Back</a></p></div>',
        dbcon: '<div class="byod-db-connecting"><p>Verifying...</p></div>',
        dbconnected: '<div class="byod-db-connected"><p>Connected!</p></div>',
        ls: '<div class="byod-ls"><p>Decrypt Password:</p><p><input type="password" class="byod-ls-pass"></p><p><a href="#" class="byod-ls-submit">Decrypt</a> <a href="#" class="byod-reset">Go Back</a></p></div>',
        lsconnected: '<div class="byod-ls-connected"><p>Connected!</p></div>',
    };

    return {
        //insert the BYOD connection button and behavior
        setWidget: function(target, callback){
            console.log(['hehe', target, $(target)]);
            //insert button html into target
            $(target).html(templates['auth']);

            /////////////
            // DROPBOX //
            /////////////

            //add dropbox click binder to connection button
            $(target).find(".byod-auth-db").one("click", function(e){
                e.preventDefault();
                
                //open dropbox oauth window
                window.open("https://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=9xzbrduyt7rznbw", "_blank");

                //insert dropbox token/decrypt form and behavior
                $(target).html(templates['db']);
                
                $(target).find(".byod-reset").one("click", function(e){
                    e.preventDefault();
                    BYOD.setWidget(target, callback);
                });
                
                $(target).find(".byod-db-submit").one("click", function(e){
                    e.preventDefault();

                    $(target).html(templates['dbcon']);

                    //take submitted code and get a oauth token
                    $.ajax({
                        type: "POST",
                        url: "https://api.dropbox.com/1/oauth2/token",
                        data: {
                            "code": $(e.target).parents(".byod-db").find(".byod-db-code").val(),
                            "grant_type": "authorization_code",
                            "client_id": "9xzbrduyt7rznbw", //"byod" drobox app
                            "client_secret": "g7jnj93mqluqazh",
                        },
                        dataType: "json",
                        success: function(data){

                            //set profile get/post functions
                            var token = data['access_token'];
                            var pass = $(e.target).parents(".byod-db").find(".byod-db-pass").val();
                            
                            var profile = {
                                get: function(name, callback){
                                    name = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(name));
                                    $.ajax({
                                        type: "GET",
                                        url: "https://api-content.dropbox.com/1/files/sandbox/" + name + ".txt",
                                        dataType: "text",
                                        success: function(data){
                                            data = sjcl.decrypt(pass, $.parseJSON(data));
                                            callback(data);
                                        },
                                        error: function(xhr) {
                                            if(xhr.status == 404){
                                                callback(null);
                                            }
                                            else{
                                                console.log("errorget");
                                                console.log(xhr);
                                            }
                                        },
                                        beforeSend: function(xhr) {
                                           xhr.setRequestHeader("Authorization", "Bearer " + token);
                                        },
                                    });
                                },
                                post: function(name, data, callback){
                                    name = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(name));
                                    //null data means delete
                                    if(data === null){
                                        $.ajax({
                                            type: "POST",
                                            url: "https://api.dropbox.com/1/fileops/delete",
                                            data: {
                                                root: "sandbox",
                                                path: name + ".txt",
                                            },
                                            dataType: "json",
                                            success: function(data){
                                                callback(true);
                                            },
                                            error: function(xhr) {
                                                if(xhr.status == 404){
                                                    callback(null);
                                                }
                                                else{
                                                    console.log("errordel");
                                                    console.log(xhr);
                                                }
                                            },
                                            beforeSend: function(xhr) {
                                               xhr.setRequestHeader("Authorization", "Bearer " + token);
                                            },
                                        });
                                    }
                                    //not-null data means new file or update existing file
                                    else{
                                        data = JSON.stringify(sjcl.encrypt(pass, data));
                                        $.ajax({
                                            type: "POST",
                                            url: "https://api-content.dropbox.com/1/files_put/sandbox/" + name + ".txt",
                                            data: data,
                                            contentType: "text/plain",
                                            dataType: "json",
                                            success: function(data){
                                                callback(true);
                                            },
                                            error: function(xhr) {
                                                console.log("errorpost");
                                                console.log(xhr);
                                            },
                                            beforeSend: function(xhr) {
                                               xhr.setRequestHeader("Authorization", "Bearer " + token);
                                            },
                                        });
                                    }
                                },
                            };
                            //mark widget as connected before callback
                            $(target).html(templates['dbconnected']);
                            
                            callback(profile);
                        },
                        error: function(xhr) {
                            if(xhr.status == 400){
                                alert("Something went wrong :( Did you copy your code correctly?");
                                BYOD.setWidget(target, callback);
                            }
                            else{
                                console.log("errortoken");
                                console.log(xhr);
                            }
                        },
                    });
                });
            });

            //////////////////
            // LOCALSTORAGE //
            //////////////////

            //add localStorage click binder to connection button
            $(target).find(".byod-auth-ls").one("click", function(e){
                e.preventDefault();

                //insert dropbox token/decrypt form and behavior
                $(target).html(templates['ls']);
                $(target).find(".byod-reset").one("click", function(e){
                    e.preventDefault();
                    BYOD.setWidget(target, callback);
                });

                $(target).find(".byod-ls-submit").one("click", function(e) {
                    e.preventDefault();

                    //set profile get/post functions
                    var pass = $(e.target).parents(".byod-ls").find(".byod-ls-pass").val();
                    var profile = {
                        get: function(name, callback){
                            name = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash("byod-"+name));

                            if (localStorage[name])
                                data = sjcl.decrypt(pass, localStorage[name]);
                            else
                                data = null;

                            callback(data);
                        },
                        post: function(name, data, callback){
                            name = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash("byod-"+name));

                            //null data means delete
                            if (data === null) {
                                if (localStorage[name] !== undefined)
                                    localStorage.removeItem(name);
                                callback(true);
                            }
                            //not-null data means new file or update existing file
                            else {
                                localStorage.setItem(name, sjcl.encrypt(pass, data));
                                callback(true);
                            }
                        },
                    };

                    //mark widget as connected before callback
                    $(target).html(templates['lsconnected']);
                    callback(profile);
                });
            });
        },
    };
})();