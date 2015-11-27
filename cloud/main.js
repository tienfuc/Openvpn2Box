//
Parse.Cloud.define("updateOvpns", function(request, response) {
     Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'http://www.vpngate.net/api/iphone/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: request.params
        }).then(function(result) {
            console.log(result)
            var split_text = result.text.split("\\n")
            console.log(split_text[0])
            console.log(split_text[1])

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
