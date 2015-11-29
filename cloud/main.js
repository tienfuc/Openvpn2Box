//
//
var Buffer = require('buffer').Buffer;

function make_multipart_data(file_name, file_data, folder_id) {
    var boundry = "-----------------------5566neverdie";
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
            
    //var b6 = new Buffer(file_data, 'utf8');
                    
    var s7 = "\r\n\r\n--"+ boundry +"--\r\n";
    var b7 = new Buffer(s7, 'utf8');
 
    var buffer1 = new Buffer(file_data, 'base64');
    //file_data = "IyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMj"    
    //var form_data= Buffer.concat(b1,b2,b3,b4,b5,b6,b7);
    var form_data2 = s1+s2+j3+s1+s4+s5+buffer1.toString()+s7
    
    console.log(form_data2)

    return form_data2
}

function parse_ovpns(text_raw) {
    var text_lines = text_raw.split("\n")
    var ovpns = []
    //for( var l in text_lines) {
    for(var i=2; i<text_lines.length; i++) {
        text_comma_split = text_lines[i].split(",")
        var text_hostname = text_comma_split[0]
        var text_ip = text_comma_split[1]
        var text_ovpn = text_comma_split[14]
        try {
            if( (text_ovpn.length > 0) && (text_hostname.length > 0) && (text_ip.length > 0) ) {
                ovpns.push({ip:text_ip, hostname:text_hostname, ovpn:text_ovpn})
            }
        } catch(e) {
    
        }
    }
    return ovpns
}

function upload_box(access_token, data) {
     Parse.Cloud.httpRequest({
         method: 'POST',
         url: 'https://upload.box.com/api/2.0/files/content',
         headers: {
             'Content-Type': 'multipart/form-data; boundary=-----------------------5566neverdie',
         'Authorization': 'Bearer ' + access_token
         }, 
         body: data,
     }).then(function(result){
         return result
     }, function(error) {
         return null
     });
}

Parse.Cloud.define("updateOvpns", function(request, response) {
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'http://www.vpngate.net/api/iphone/',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }).then(function(result_ovpns){
         // get new access_token
        var client_id = "8dp9uu7fi3lm8fv43a8r5clkfi0k7due"
        var model = "BoxOauth2"
        return Parse.Cloud.run('getTokens', {"client_id":client_id, "model":model}
            ).then(function(result_tokens) {
                var refresh_token = result_tokens.get("refresh_token")
                var access_token = result_tokens.get("access_token")
                console.log("access_token")
                return_data = {"ovpns": result_ovpns.text, "access_token": access_token}
                //console.log(return_data)
                return return_data
                //response.success("g1122")
            }, function(error) { 
                //response.error("xj")
                console.log("bad11")
            }
        ); 
    }, function(error) {
        console.log("xxok")
        return "bAD"
    }).then(function(result){
        console.log(result.ovpns.slice(0,10))
        console.log(result.access_token)
        var ovpns = parse_ovpns(result.ovpns)   
        for( var i in ovpns ) {
            var file_name = ovpns[i].hostname+"_"+ovpns[i].ip+".txt"
            console.log(ovpns[i])
            console.log(file_name)
            var data_upload = make_multipart_data(file_name, ovpns[i].ovpn, "5510726241")
            upload_box(result.access_token, data_upload)
            if( i > 3 ) {
                break
            }
        }
        response.success("ok")

    }, function(error) {
        response.error("ERROR: o")
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


//input: client_id, model
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
        //console.log(result)
        response.success(result)
      },
      error: function (error) {
        //console.log(error)
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
                    response.error("ERROR: updateTokens")
                }
            });
            console.log(result)
            response.success(result)
      },
        error: function(error) {
            console.log(error)
            response.error(error.message)
      }
    });
});

//////
