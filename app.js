var express = require('express');
var http = require('http');
var path = require('path');
var googleapis = require('googleapis');
var restler = require('restler');
var fs = require('fs');


var redirect = process.env.REDIRECT_URL || 'http://inlineAB.azurewebsites.net';
var clientId = process.env.CLIENT_ID || '1111111111111111';
var clientSecret = process.env.CLIENT_SECRET || 'joeyEatsDeadPeopleClientSecret';
var browserAPIKey = process.env.B_API_KEY || 'pOisOniVyBrowserKey';
var serverAPIKey = process.env.S_API_KEY || 'clientAPIKEYGAVINLOVESSHAWARMSAS';
var redirectURL = process.env.REDIRECT_URL || 'mygodbeckylookatherbuttitissobig';

var accountId = '46140385'; // used to generate propertyId
var webPropertyId = 'UA-46140385-1'; // used with accountId to generate profileId
var profileId = '79670733'; // used for querying

// Create server
var app = express();

// Configure server
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());

// Mount statics
app.use(express.static(path.join(__dirname, '/client')));
app.use(express.bodyParser());

//make OAuth Client
var OAuth2Client = googleapis.OAuth2Client;
var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectURL);

// Route index.html
app.get('/', function(req, res) {
  res.sendfile(path.join(__dirname, '/client/index.html'));
});

app.post('/downloadCustom', function(req, res){
  console.log("Got a request to download custom script. Req is", req);

  var request = req;
  var response = res;
  var filePath = __dirname + '/client/js/inlineAB.js';
  var filename = path.basename(filePath);

  response.setHeader('Content-disposition', 'attachment; filename=inlineab.js');
  response.setHeader('Content-type', 'text/plain');
  // response.attachment('inline.js');

  fs.readFile(filePath, 'utf8', function(err, file){
    // console.log("Here is our file:", file);

    var variationsText = "";
    
    for (var i = 0; i < request.body.variations.length; i++) {
      variationsText += "'" + request.body.variations[i].name + "',";
    }
    
    variationsText = "[" + variationsText.slice(0, variationsText.length - 1) + "];";
    
    file.replace("'PASTE-EXPERIMENT-ID'", "'" + request.body.experimentID + "'");
    file.replace("['VARIATION1', 'VARIATION2']", variationsText);
    file.replace("/* CONTENT EXPERIMENT SCRIPT */", request.body.snippet);

    // console.log("Here is our customized file:", file);
    console.log('returning file');
    response.end(file);
  });

});

/*


        THIS IS A LARGE BLOCK COMMENT.


*/

app.post('/tokenized', function(req,res){

  var oAuthToken = req.body.token;

  oauth2Client.credentials = {
    access_token: oAuthToken
  };

  console.log(req.body.token)
  console.log('serverAPI ', serverAPIKey)
  console.log('browserAPI ', browserAPIKey)

  console.log('posting to tokenized! ');
  var postURL = '/analytics/v3/management/accounts/'+accountId+'/webproperties/'+webPropertyId+'/profiles/'+profileId+'/experiments?fields=accountId&key='+ serverAPIKey;
  var body = {       
        "name": "firstAPICreatedExperiment",
        "status": "READY_TO_RUN",
        "objectiveMetric":"ga:bounces",
        "variations": [
          { "name": "very javascript!", "url":"http://www.inlineAB.azurewebsites.net", "status":"ACTIVE" },
          { "name": "so html!", "url":"http://www.inlineAB.azurewebsites.net", "status":"ACTIVE" }
         ]
       };

  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer "+ oAuthToken
  };


  googleapis
  .discover('analytics', 'v3')
  .execute(function(err, client) {
    var request = client.analytics.management.experiments.insert({
        accountId : accountId,
        webPropertyId : webPropertyId,
        profileId : profileId
        }, body)
    .withApiKey(serverAPIKey)
    .withAuthClient(oauth2Client)
    request.execute(function(err,result){
      if (err){
        console.log(err);
        res.send(402, 'Success! Successfully up the wire');          
      } else {
        console.log(result);
        res.send(200);
      }
    });
  });
});

app.post('/updateExperiment', function(req,res){

  console.log(req.body);

  var oAuthToken = req.body.token;

  oauth2Client.credentials = {
    access_token: oAuthToken
  };

  googleapis
  .discover('analytics', 'v3')
  .execute(function(err, client) {
    var request = client.analytics.management.experiments.update({
        accountId : req.body.accountId,
        webPropertyId : req.body.webPropertyId,
        profileId : req.body.profileId,
        experimentId : req.body.experimentId
        }, req.body.body)
    .withApiKey(serverAPIKey)
    .withAuthClient(oauth2Client)
    request.execute(function(err,result){
      if (err){
        console.log(err);
        res.send(402);          
      } else {
        console.log(result);
        res.send(200);
      }
    });
  });
});



app.post('/deleteExperiment', function(req,res){


  var oAuthToken = req.body.token;

  oauth2Client.credentials = {
    access_token: oAuthToken
  };

  googleapis
  .discover('analytics', 'v3')
  .execute(function(err, client) {
    var request = client.analytics.management.experiments.update({
        accountId : req.body.accountId,
        webPropertyId : req.body.webPropertyId,
        profileId : req.body.profileId,
        experimentId : req.body.experimentId
        })
    .withApiKey(serverAPIKey)
    .withAuthClient(oauth2Client)
    request.execute(function(err,result){
      if (err){
        console.log(err);
        res.send(402);          
      } else {
        console.log(result);
        res.send(200);
      }
    });
  });
});



app.post('/createExperiment', function(req,res){
  var oAuthToken = req.body.access_token;

  console.log('token: ', req.body.access_token);
  console.log('otherROken: ', serverAPIKey);
  console.log('body: ', req.body.body);
  console.log('everything,' req.body);

  oauth2Client.credentials = {
    access_token: oAuthToken
  };

  console.log('oauth obj', oauth2Client)
  console.log('token', oAuthToken)

  googleapis
  .discover('analytics', 'v3')
  .execute(function(err, client) {
    var request = client.analytics.management.experiments.insert({
        accountId : req.body.accountId,
        webPropertyId : req.body.webPropertyId,
        profileId : req.body.profileId
        }, req.body.body)
    .withApiKey(serverAPIKey)
    .withAuthClient(oauth2Client)
    request.execute(function(err,result){
      if (err){
        console.log(err);
        res.send(405);          
      } else {
        console.log(result);
        res.send(200);
      }
    });
  });
});



// app.post('/createGoal', function)


// var insertExperiment = function(accountId,webPropertyId,profileId,body){
//   googleapis
//   .discover('analytics', 'v3')
//   .execute(function(err, client) {
//     var request = client.analytics.management.experiments.insert({
//         accountId : accountId,
//         webPropertyId : webPropertyId,
//         profileId : profileId,
//         resource : body
//         })
//     .withApiKey(browserAPIKey)
//     .withAuthClient(oauth2Client)
//     request.execute(function(err,result){
//       if (err){
//         console.log(err);
//         res.send(402);          
//       } else {
//         console.log(result);
//         res.send(200);
//       }
//     });
//   });
// }

// var createGoal = function(){
//   //TODO: make one google analytics object at the start and save it for all calls?
//   googleapis
//   .discover('analytics', 'v3')
//   .execute(function(err, client){

//   })
// }



























\





  //TODO: remove if unneeded.



// Start server
http.createServer(app).listen(app.get('port'), function() {
  console.log(
    'Express server listening on port ' + app.get('port'),
    '\nPress Ctrl+C to shutdown'
  );
});
