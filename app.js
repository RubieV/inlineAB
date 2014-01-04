var express = require('express');
var http = require('http');
var path = require('path');
var googleapis = require('googleapis');
var restler = require('restler');
var fs = require('fs');
var url = require('url');


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

// Save reference to Oauth2Client
var OAuth2Client = googleapis.OAuth2Client;




// Route index.html
// app.get('/', function(req, res) {
//   res.sendfile(path.join(__dirname, '/client/index.html'));
// });

app.get('/downloadCustom', function(req, res){

  var urlData = url.parse(req.url,true).query;
  var expID = urlData.expID;
  var variations = urlData.vars;
  var snippetID = urlData.snipID;
  var snippetSite = urlData.snipSite;
  var filePath = __dirname + '/client/js/inlineAB.js';

  fs.readFile(filePath, function(err, inlineABjs){
    var inlineABstring = inlineABjs.toString();
    
    var customizedScript = inlineABstring
    .replace("'PASTE-EXPERIMENT-ID'", "'" + expID + "'")
    .replace("['VARIATION1', 'VARIATION2']", variations)
    .replace("UA-XXXXXXXX-X", snippetID)
    .replace("SNIPPITWEBSITE", snippetSite);
    
    res.setHeader('Content-disposition', 'attachment; filename=inlineAB.js');
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';

    // res.download(customizedScript);
    // res.attachment(customizedScript);
    res.write(customizedScript);
    res.end();
  });
});


/*

        THIS IS A LARGE BLOCK COMMENT.

*/

app.post('/updateExperiment', function(req,res){
  var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectURL);
  var access_token = req.body.token.access_token;

  oauth2Client.credentials = {
    access_token: access_token
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
  var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectURL);
  var access_token = req.body.token.access_token;

  oauth2Client.credentials = {
    access_token: access_token
  };

  googleapis
  .discover('analytics', 'v3')
  .execute(function(err, client) {
    var request = client.analytics.management.experiments.delete({
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
  var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectURL);
  var access_token = req.body.token.access_token;

  oauth2Client.credentials = {
    access_token: access_token
  };

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
        res.send(402);          
      } else {
        console.log("------------------------------------");
        console.log("made new test ", result);
        console.log("------------------------------------");

        res.write(201, result);
      }
    });
  });
});




// Start server
http.createServer(app).listen(app.get('port'), function() {
  console.log(
    'Express server listening on port ' + app.get('port'),
    '\nPress Ctrl+C to shutdown'
  );
});
