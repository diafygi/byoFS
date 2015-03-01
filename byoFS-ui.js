"use strict";

//byoFS-ui javascript library, GPLv2, https://github.com/diafygi/byoFS
var byoFS_UI = (function(){
    //insert css styles in <head>
    var byoFS_custom_css = "";
    byoFS_custom_css += ".byoFS-auth{padding:10px;border-radius:10px;background-color:#274257;color:#EEEEEE;font-size:14px;font-family:sans-serif;}";
    byoFS_custom_css += ".byoFS-auth p{}";
    byoFS_custom_css += ".byoFS-auth ul{margin-top:10px;}";
    byoFS_custom_css += ".byoFS-auth li{display:inline-block;margin-left:12px;}";
    byoFS_custom_css += ".byoFS-auth li:nth-child(1){margin-left:0px;}";
    byoFS_custom_css += ".byoFS-auth a{display:block;padding:8px;border-radius:5px;color:#FFFFFF;text-decoration:none;}";
    byoFS_custom_css += "a.byoFS-auth-db{padding-left:31px;background-color:#7EB5D6;background-repeat:no-repeat;background-position:left center;background-image:url('data:image/png;base64,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');}";
    byoFS_custom_css += "a.byoFS-auth-ls{padding-left:31px;background-color:#FCAB52;background-repeat:no-repeat;background-position:left center;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANxSURBVEiJxZdNaFxVFMd/585MqmYaa9M2xqSGlpRIDYKgdiFuGjDdmJ3u1KVIoTtxKxQEl9KFO3ciFhEsIinUjSGgUGMXrdGaIhoqvpmaaTKTmc7Mu/d08ebjzbw7H4VADjzmzXv3nN/9n/fOufeJqrIfZvaFup/gdPxP/q35bO1BfWPPKaIrU9/efrMn+Ojlm6W7S3NPAo8NFW+IfKkDnITd19OesQEwMyigScPokVTfMWFNqWw5QIOEfw/wnpjaJkUSMT2KJYB2iZlXFkAkMcqIJXM06wW6wn/YjbUozYAwBFjQIF7Zmbc/gNGDSXAhx+OnTnvB9dVvqGysoS6KpLjBqdau2enOljd4P3M79yLfhmKHGaxYcTmhnVrd2UImZ0CV8POP2zMWR+WYP9X271sd4LTWcwPBRiXQ+CPdKUS/ItgbK7BbjIKmoT7grW6Cd8Ok4kSqu9OixULrXMYO9wUlYkXPeHv2+z+r3fcSilNqAyfxVLfBmQufQC2KYcr3GZ054QVWPruAy29GisVfngmwDUcCGam3L8TAMnG8fV7IkZqe84K1XIygCtoDnEj19NVbBaBF1vt5qJSSR7WMVoqtA9foFs6i5e1YDSe7llcxqsrSXA6YAnA3VqmeX0zOOA3F2MuV/egK5plZtLgFqrEaTjYPPziaZwA6BSBjT5F+98NIzPp17LWv/R5j49GYYlT3/bpWH3A7PVqrYl58rRHF+MEmhYweisbv/N8B9i0Q0Hsj0B78oNx6k+X4LOblsx0t1Bx7lpGFd1r9XBuKG6WE6CMoFujo11osIONPI+MTZN6/GMlZv0729AuYI9MdvtrVLhU7vGLtWhrd2o9QLsVmZjCTMwmoy29i7/zaAU6TGl6xokG8X4dffkr41SXMyecx82eQ+TOYQ4fRahn7+8+Ev60S3lzB5TfbMZrVRdELFt/29u4bcwsI13wOTTNjWUYP1sEmdjUA7OYtzlKauvJHck2lh2KnqcCI9d1qW7kET8QWCY22OramhFVt9pOeuxkveKSe+csesJcUPQdyqpezC5WwCmFVsXWNb1xC4CdUv+jl60113IKl506EwjlVXRQ4C3hTB/KPiF516HLtgP3h5OU72/3iDgTH7Zf3XspM/Lv7qhG3qMjrCvcEXTZOlye/u70+dKBHBe+l7dsnzEMkv6CzOVeWJAAAAABJRU5ErkJggg==');}";
    byoFS_custom_css += ".byoFS-db{padding:10px;border-radius:10px;color:#444444;background-color:#7EB5D6;font-size:14px;font-family:sans-serif;}";
    byoFS_custom_css += ".byoFS-db p{margin-top:5px;}";
    byoFS_custom_css += ".byoFS-db p:nth-child(1){margin-top:0px;padding:8px 0px 8px 31px;background-repeat:no-repeat;background-position:left center;background-image:url('data:image/png;base64,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');}";
    byoFS_custom_css += ".byoFS-db input{width:212px;border:none;border-radius:5px;padding:4px 6px;}";
    byoFS_custom_css += ".byoFS-db a{display:inline-block;padding:4px 8px;border-radius:5px;color:#FFFFFF;background-color:#274257;text-decoration:none;}";
    byoFS_custom_css += ".byoFS-db-connecting{padding:10px;border-radius:10px;color:#444444;background-color:#7EB5D6;font-size:14px;font-family:sans-serif;}";
    byoFS_custom_css += ".byoFS-db-connected{padding:10px;border-radius:10px;color:#444444;background-color:#7EB5D6;font-size:14px;font-family:sans-serif;}";
    byoFS_custom_css += ".byoFS-ls{padding:10px;border-radius:10px;color:#444444;background-color:#FCAB52;font-size:14px;font-family:sans-serif;}";
    byoFS_custom_css += ".byoFS-ls p{margin-top:5px;}";
    byoFS_custom_css += ".byoFS-ls p:nth-child(1){margin-top:0px;padding:8px 0px 8px 31px;background-repeat:no-repeat;background-position:left center;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANxSURBVEiJxZdNaFxVFMd/585MqmYaa9M2xqSGlpRIDYKgdiFuGjDdmJ3u1KVIoTtxKxQEl9KFO3ciFhEsIinUjSGgUGMXrdGaIhoqvpmaaTKTmc7Mu/d08ebjzbw7H4VADjzmzXv3nN/9n/fOufeJqrIfZvaFup/gdPxP/q35bO1BfWPPKaIrU9/efrMn+Ojlm6W7S3NPAo8NFW+IfKkDnITd19OesQEwMyigScPokVTfMWFNqWw5QIOEfw/wnpjaJkUSMT2KJYB2iZlXFkAkMcqIJXM06wW6wn/YjbUozYAwBFjQIF7Zmbc/gNGDSXAhx+OnTnvB9dVvqGysoS6KpLjBqdau2enOljd4P3M79yLfhmKHGaxYcTmhnVrd2UImZ0CV8POP2zMWR+WYP9X271sd4LTWcwPBRiXQ+CPdKUS/ItgbK7BbjIKmoT7grW6Cd8Ok4kSqu9OixULrXMYO9wUlYkXPeHv2+z+r3fcSilNqAyfxVLfBmQufQC2KYcr3GZ054QVWPruAy29GisVfngmwDUcCGam3L8TAMnG8fV7IkZqe84K1XIygCtoDnEj19NVbBaBF1vt5qJSSR7WMVoqtA9foFs6i5e1YDSe7llcxqsrSXA6YAnA3VqmeX0zOOA3F2MuV/egK5plZtLgFqrEaTjYPPziaZwA6BSBjT5F+98NIzPp17LWv/R5j49GYYlT3/bpWH3A7PVqrYl58rRHF+MEmhYweisbv/N8B9i0Q0Hsj0B78oNx6k+X4LOblsx0t1Bx7lpGFd1r9XBuKG6WE6CMoFujo11osIONPI+MTZN6/GMlZv0729AuYI9MdvtrVLhU7vGLtWhrd2o9QLsVmZjCTMwmoy29i7/zaAU6TGl6xokG8X4dffkr41SXMyecx82eQ+TOYQ4fRahn7+8+Ev60S3lzB5TfbMZrVRdELFt/29u4bcwsI13wOTTNjWUYP1sEmdjUA7OYtzlKauvJHck2lh2KnqcCI9d1qW7kET8QWCY22OramhFVt9pOeuxkveKSe+csesJcUPQdyqpezC5WwCmFVsXWNb1xC4CdUv+jl60113IKl506EwjlVXRQ4C3hTB/KPiF516HLtgP3h5OU72/3iDgTH7Zf3XspM/Lv7qhG3qMjrCvcEXTZOlye/u70+dKBHBe+l7dsnzEMkv6CzOVeWJAAAAABJRU5ErkJggg==');}";
    byoFS_custom_css += ".byoFS-ls input{width:212px;border:none;border-radius:5px;padding:4px 6px;}";
    byoFS_custom_css += ".byoFS-ls a{display:inline-block;padding:4px 8px;border-radius:5px;color:#FFFFFF;background-color:#E44D26;text-decoration:none;}";
    byoFS_custom_css += ".byoFS-ls-connected{padding:10px;border-radius:10px;color:#444444;background-color:#FCAB52;font-size:14px;font-family:sans-serif;}";
    if (!document.getElementById("byoFS-css")){
        var style  = document.createElement("style");
        style.id   = "byoFS-css";
        document.getElementsByTagName('head')[0].appendChild(style);
        document.getElementById("byoFS-css").innerHTML = byoFS_custom_css;
        byoFS_custom_css = null; //free up memory
    }
    //reference html templates
    var templates = {
        auth: '<div class="byoFS-auth"><p>Load from:</p><ul><li><a href="#" class="byoFS-auth-db">Dropbox</a></li><li style="display:none;"><a href="#" class="byoFS-auth-ls">localStorage</a></li></ul></div>',
        db: '<div class="byoFS-db"><p>Dropbox Code:</p><p><input class="byoFS-db-code"></p><p>Decrypt Password:</p><p><input type="password" class="byoFS-db-pass"></p><p><a href="#" class="byoFS-db-submit">Decrypt</a> <a href="#" class="byoFS-reset">Go Back</a></p></div>',
        dbcon: '<div class="byoFS-db-connecting"><p>Verifying...</p></div>',
        dbconnected: '<div class="byoFS-db-connected"><p>Connected!</p></div>',
        ls: '<div class="byoFS-ls"><p>Decrypt Password:</p><p><input type="password" class="byoFS-ls-pass"></p><p><a href="#" class="byoFS-ls-submit">Decrypt</a> <a href="#" class="byoFS-reset">Go Back</a></p></div>',
        lsconnected: '<div class="byoFS-ls-connected"><p>Connected!</p></div>',
    };
    return function(appname, target, callback){
        //insert button html into target
        document.querySelector(target).innerHTML = templates['auth'];

        /////////////
        // DROPBOX //
        /////////////

        //add dropbox click binder to connection button
        document.querySelector(target).querySelector(".byoFS-auth-db").addEventListener("click", function(e){
            e.preventDefault();
            //open dropbox oauth window
            window.open("https://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=wy1ojs3oijr3gpt", "_blank");

            //insert dropbox token/decrypt form and behavior
            document.querySelector(target).innerHTML = templates['db'];
            document.querySelector(target).querySelector(".byoFS-reset").addEventListener("click", function(e){
                e.preventDefault();
                byoFS_UI(appname, target, callback);
            });
            document.querySelector(target).querySelector(".byoFS-db-submit").addEventListener("click", function(e){
                e.preventDefault();
                document.querySelector(target).innerHTML = templates['dbcon'];
                var code = encodeURIComponent(e.target.parentElement.parentElement.querySelector(".byoFS-db-code").value);
                var secret = e.target.parentElement.parentElement.querySelector(".byoFS-db-pass").value;
                document.querySelector(target).innerHTML = templates['dbconnected'];
                callback(byoFS({
                    "remote": "dropbox",
                    "app": appname,
                    "secret": secret,
                    "code": code,
                    "allowPublic": true,
                }));
            });
        });

        //////////////////
        // LOCALSTORAGE //
        //////////////////

        //add localStorage click binder to connection button
        document.querySelector(target).querySelector(".byoFS-auth-ls").addEventListener("click", function(e){
            e.preventDefault();
            //insert dropbox token/decrypt form and behavior
            document.querySelector(target).innerHTML = templates['ls'];
            document.querySelector(target).querySelector(".byoFS-reset").addEventListener("click", function(e){
                e.preventDefault();
                byoFS_UI(appname, target, callback);
            });
            document.querySelector(target).querySelector(".byoFS-ls-submit").addEventListener("click", function(e){
                e.preventDefault();
                var secret = e.target.parentElement.parentElement.querySelector(".byoFS-ls-pass").value;
                document.querySelector(target).innerHTML = templates['lsconnected'];
                if(secret === ""){
                    secret = appname;
                }
                callback(byoFS({
                    "remote": "localStorage",
                    "app": appname,
                    "secret": secret,
                }));
            });
        });
    };
})();
