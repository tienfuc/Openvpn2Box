//
//
var Buffer = require('buffer').Buffer;
var boundary = "-----------------------5566neverdie";
var _ = require('underscore.js');

function make_multipart_data(file_name, file_data, folder_id) {
    var s1 = "--" + boundary + "\r\n";
    var s2 = "Content-Disposition: form-data; name=\"attributes\"\r\n\r\n";
    var o3 = {"name":file_name, "parent":{"id":folder_id}}
    var s3 = JSON.stringify(o3)+"\r\n"
    var s4 = "Content-Disposition: form-data; name=\"file\"; filename=\""+file_name+"\"\r\n";
    var s5 = "Content-Type: text/plain\r\n\r\n";
    var s6  = new Buffer(file_data, 'base64').toString();
    var s7 = "\r\n\r\n--"+ boundary +"--\r\n";
 
    var form_data2 = s1+s2+s3+s1+s4+s5+s6+s7
    
    //console.log(form_data2)

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


function upload_box(response, access_token, ovpns) {
    for(var i = 0; i<3; i++) {
        var file_name = ovpns[i].hostname+"_"+ovpns[i].ip+".txt"
        var data_upload = make_multipart_data(file_name, ovpns[i].ovpn, "5510726241")

         Parse.Cloud.httpRequest({
             method: 'POST',
             url: 'https://upload.box.com/api/2.0/files/content',
             //url: 'http://requestb.in/zl543zzl',
             headers: {
                'Content-Type': 'multipart/form-data; boundary='+boundary,
                'Authorization': 'Bearer ' + access_token
             }, 
             body: data_upload,
         }).then(function(result){
             console.log(result)
         }, function(error) {
             console.log(error)
         });
    }
}

function upload_box2(response, access_token, ovpns) {
    for(var i = 0; i<3; i++) {
        var file_name = ovpns[i].hostname+"_"+ovpns[i].ip+".txt"
        var data_upload = make_multipart_data(file_name, ovpns[i].ovpn, "5510726241")

        Parse.Cloud.httpRequest({
            method: 'POST',
            url: 'https://upload.box.com/api/2.0/files/content',
            //url: 'http://requestb.in/zl543zzl',
            headers: {
                'Content-Type': 'multipart/form-data; boundary='+boundary,
                'Authorization': 'Bearer ' + access_token
            }, 
            body: data_upload,
            success: function(result) {
                console.log(result)
                //response.success(result)
            },
            error: function(error) {
                console.log(error)
                //response.error(error)
            }
        });
    }
}

Parse.Cloud.define("updateOvpns_sa", function(request, response) {
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
                return_data = {"ovpns": result_ovpns.text, "access_token": access_token}
                //console.log(return_data)
                console.log("OK: getTokens()")
                return return_data
            }, function(error) { 
                console.log("ERROR: getTokens()")
            }
        ); 
    }, function(error) {
        console.log(error)
    }).then(function(result){
        //console.log(result.ovpns.slice(0,50))
        //console.log(result.access_token)
        var ovpns = parse_ovpns(result.ovpns)   
        var access_token = result.access_token
        var promise = Parse.Promise.as();
        var success_count = 0

        _.each(ovpns, function(ovpn) {
            //console.log(ovpn)
            var file_name = ovpn.hostname+"_"+ovpn.ip+".txt"
            var data_upload = make_multipart_data(file_name, ovpn.ovpn, "5510726241")

            Parse.Cloud.httpRequest({
                    method: 'POST',
                    //url: 'https://upload.box.com/api/2.0/files/content',
                    url: 'http://requestb.in/zl543zzl',
                    headers: {
                        'Content-Type': 'multipart/form-data; boundary='+boundary,
                        'Authorization': 'Bearer ' + access_token
                    }, 
                    body: data_upload,
                }).then(function(result){
                    //success_count = success+1
                    console.log("in pro")
                    console.log(result)
                }, function(error) {
                    console.log("in pro error")
                    console.log(error)
                });
       })
       //return promise
    }).then(function(count) {
        console.log("count")
        response.success("OK: "+count)
    }, function(error) {
        console.log(error)
        response.error(error)
    });
});

Parse.Cloud.define("updateOvpns_", function(request, response) {
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
                return_data = {"ovpns": result_ovpns.text, "access_token": access_token}
                //console.log(return_data)
                console.log("OK: getTokens()")
                return return_data
            }, function(error) { 
                console.log("ERROR: getTokens()")
            }
        ); 
    }, function(error) {
        console.log(error)
    }).then(function(result){
        //console.log(result.ovpns.slice(0,50))
        //console.log(result.access_token)
        var ovpns = parse_ovpns(result.ovpns)   
        var access_token = result.access_token
        //var promise = Parse.Promise.as();
        var success_count = 0
        var promises = []
        //ovpns = ovpns.slice(0,2)

        _.each(ovpns, function(ovpn) {
            //console.log(ovpn)
            var file_name = ovpn.hostname+"_"+ovpn.ip+".txt"
            var data_upload = make_multipart_data(file_name, ovpn.ovpn, "5510726241")

            promises.push( 
                Parse.Cloud.httpRequest({
                     method: 'POST',
                     url: 'https://upload.box.com/api/2.0/files/content',
                     //url: 'http://requestb.in/zl543zzl',
                     headers: {
                        'Content-Type': 'multipart/form-data; boundary='+boundary,
                        'Authorization': 'Bearer ' + access_token
                     }, 
                     body: data_upload,
                 }).then(function(result){
                     success_count = success_count+1
                 }, function(error) {
                     var status = error.status
                     //var r = {status:error.data.status, code:error.data.code}
                     return status
                 })
            )
       })
       return Parse.Promise.when(promises)
    }).then(function() {
        console.log(result)
        response.success(success_count)
    }, function(error) {
        console.log(error)
        response.error(error)
    });
});
Parse.Cloud.define("updateOvpns_pa", function(request, response) {
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
                return_data = {"ovpns": result_ovpns.text, "access_token": access_token}
                //console.log(return_data)
                console.log("OK: getTokens()")
                return return_data
            }, function(error) { 
                console.log("ERROR: getTokens()")
            }
        ); 
    }, function(error) {
        console.log(error)
    }).then(function(result){
        //console.log(result.ovpns.slice(0,50))
        //console.log(result.access_token)
        var ovpns = parse_ovpns(result.ovpns)   
        var access_token = result.access_token
        //var promise = Parse.Promise.as();
        var success_count = 0
        var promises = []
        //ovpns = ovpns.slice(0,2)

        _.each(ovpns, function(ovpn) {
            //console.log(ovpn)
            var file_name = ovpn.hostname+"_"+ovpn.ip+".txt"
            var data_upload = make_multipart_data(file_name, ovpn.ovpn, "5510726241")

            promises.push( 
                Parse.Cloud.httpRequest({
                     method: 'POST',
                     //url: 'https://upload.box.com/api/2.0/files/content',
                     url: 'http://requestb.in/zl543zzl',
                     headers: {
                        'Content-Type': 'multipart/form-data; boundary='+boundary,
                        'Authorization': 'Bearer ' + access_token
                     }, 
                     body: data_upload,
                 }).then(function(result){
                     success_count = success_count+1
                 }, function(error) {
                     var status = error.status
                     //var r = {status:error.data.status, code:error.data.code}
                     return status
                 })
            )
       })
       return Parse.Promise.when(promises)
    }).then(function() {
        console.log(result)
        response.success(success_count)
    }, function(error) {
        console.log(error)
        response.error(error)
    });
});
                //return upload_box(response, access_token, ovpn)
                //return upload_box(response, access_token, ovpns)
        /*
        for( var i in ovpns ) {
            var file_name = ovpns[i].hostname+"_"+ovpns[i].ip+".txt"
            var data_upload = make_multipart_data(file_name, ovpns[i].ovpn, "5510726241")
            return upload_box(response, result.access_token, data_upload)
            if( i > 3 ) {
                break
            }
        }*/

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
