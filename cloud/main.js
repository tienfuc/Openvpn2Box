//
//
var Buffer = require('buffer').Buffer;

function make_multipart_data(file_name, file_data, folder_id) {
    var boundry = "---------------------------5566neverdie";
    var content_type = "multipart/form-data; boundary=" + boundry;

    var s1 = "--" + boundry + "\r\n";
    var b1 = new Buffer(s1, 'utf8');
            
    var s2 = "Content-Disposition: form-data; name=\"attributes\"\r\n\r\n";
    var b2 = new Buffer(s2, 'utf8');
            
    var o3 = {"name":file_name, "parent":{"id":folder_id}}
    var j3 = JSON.stringify(o3)+"\r\n"
    var b3 = new Buffer(j3, 'utf8');

    var s4 = "Content-Disposition: form-data; name=\"file\"; filename=\""+file_name+"\"\r\n";
    var b4 = new Buffer(s4, 'utf8');

    var s5 = "Content-Type: text/plain\r\n\r\n";
    var b5 = new Buffer(s5, 'utf8');
            
    var b6 = new Buffer(file_data, 'utf8');
                    
    var s7 = "\r\n"+ s1 +"\r\n";
    var b7 = new Buffer(s7, 'utf8');
            
    //var form_data= Buffer.concat(b1,b2,b3,b4,b5,b6,b7);
    var form_data2 = s1+s2+j3+s1+s4+s5+"file_data"+s7
    
    console.log(form_data2)

    return form_data2
}

Parse.Cloud.define("updateOvpns", function(request, response) {
     Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'http://www.vpngate.net/api/iphone/',
        //url: 'http://requestb.in/z0xyfsz0',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: request.params
        }).then(function(result) {
            var text_lines = result.text.split("\n")
            var data = ""
            for( var l in text_lines) {
                text_comma_split = text_lines[l].split(",")
                var text_base64 = text_comma_split[14]
                //console.log(text_base64)
                if( text_base64 != undefined ) {
                    data = make_multipart_data("file_name", text_base64, "5510726241")
                    console.log(data)
                }
                if( l > 3 ) { 
                    break
                }
            }

            Parse.Cloud.httpRequest({
                method: 'POST',
                //url: 'https://api.box.com/oauth2/token',
                url: 'http://requestb.in/z0xyfsz0',
                headers: {
                  'Content-Type': 'multipart/form-data; boundary=------------------------a9c359f98950de59'
                },
                body: data
                }).then(function(result) {
                    console.log(result)
                    response.success("OK: httpRequest()");
                }, 
                function (error) {
                    console.log(error)
                    response.error("ERROR: httpRequest()");
            });    

            response.success(result)

            /*
            var BoxOauth2 = Parse.Object.extend("BoxOauth2")
            var boxoauth2 = new BoxOauth2()
            boxoauth2.set("access_token", result.data.access_token)
            boxoauth2.set("refresh_token", result.data.refresh_token)
            boxoauth2.set("client_id", request.params.client_id)
            //boxoauth2.set("client_secret", request.params.client_secret)
            boxoauth2.save()
            console.log(result)
            response.success("OK: httpRequest()");
            */
        }, 
        function (error) {
            console.log(error)
            response.error("ERROR: httpRequest()");
    });    
});

   

//
Parse.Cloud.define("updateTokens", function(request, response) {
    //console.log(request.params)
    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://api.box.com/oauth2/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: request.params
        }).then(function(result) {
            var BoxOauth2 = Parse.Object.extend("BoxOauth2")
            var boxoauth2 = new BoxOauth2()
            boxoauth2.set("access_token", result.data.access_token)
            boxoauth2.set("refresh_token", result.data.refresh_token)
            boxoauth2.set("client_id", request.params.client_id)
            //boxoauth2.set("client_secret", request.params.client_secret)
            boxoauth2.save()
            console.log(result)
            response.success("OK: httpRequest()");
        }, 
        function (error) {
            console.log(error)
            response.error("ERROR: httpRequest()");
    });    
});

//
Parse.Cloud.define("getTokens", function(request, response) {
    var client_id = request.params.client_id
    var model = request.params.model
    if( model == undefined ) {
        model = "BoxOauth2"
    }

    var BoxOauth2 = Parse.Object.extend(model)
    var query = new Parse.Query(BoxOauth2);

    query.descending("createdAt")
    query.equalTo("client_id", client_id)
    query.first({
        success: function(result) {
        console.log(result)
        response.success(result)
      },
      error: function (error) {
        console.log(error)
        response.error(error)
      }
    });
});


// 
Parse.Cloud.job("jobUpdateTokens", function(request, response) {
    var client_id = request.params.client_id
    var client_secret = request.params.client_secret
    var model = request.params.model
    if( model == undefined ) {
        model = "BoxOauth2"
    }

    var BoxOauth2 = Parse.Object.extend(model)

    Parse.Cloud.run('getTokens', { "client_id":client_id, "model":model }, {
        success: function(result) {
            var refresh_token = result.get("refresh_token")
            var access_token = result.get("access_token")
            params = {
                "client_id":client_id, 
                "client_secret":client_secret,
                "refresh_token":refresh_token,
                //"access_token":access_token,
                "grant_type":"refresh_token"
            }
            //console.log(refresh_token)
            //console.log(access_token)
            Parse.Cloud.run("updateTokens", params, {
                success: function(result_updateTokens) {
                    console.log(result_updateTokens)
                    response.success("OK: updateTokens()")
                },
                error: function(error_updateTokens) {
                    console.log(error_updateTokens)
                    response.error("ERROR")
                }
            });
        console.log(result)
        response.success("OK: getTokens()")
      },
        error: function(error) {
            response.error("ERROR: getTokens()")
      }
    });
});

//////
