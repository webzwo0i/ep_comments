var appUrl = 'http://localhost:9001';
var apiVersion = 1;

var supertest = require('ep_etherpad-lite/node_modules/supertest'),
           fs = require('fs'),
         path = require('path'),
      //      io = require('socket.io-client'),
      request = require('request'),
          api = supertest(appUrl),
 randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

// Loads the APIKEY.txt content into a string, and returns it.
var getApiKey = function() {
  var etherpad_root = '/../../../ep_etherpad-lite/../..';
  var filePath = path.join(__dirname, etherpad_root + '/APIKEY.txt');
  var apiKey = fs.readFileSync(filePath,  {encoding: 'utf-8'});
  return apiKey.replace(/\n$/, "");
}

var apiKey = getApiKey();

// Functions to validate API responses:
var codeToBe = function(expectedCode, res) {
  if(res.body.code !== expectedCode){
    throw new Error("Code should be " + expectedCode + ", was " + res.body.code);
  }
}

var codeToBe0 = function(res) { codeToBe(0, res) }
var codeToBe1 = function(res) { codeToBe(1, res) }
var codeToBe4 = function(res) { codeToBe(4, res) }

// App end point to create a comment via API
var commentsEndPointFor = function(pad) {
  return '/p/'+pad+'/comments';
}

// App end point to create a comment reply via API
var commentRepliesEndPointFor = function(pad) {
  return '/p/'+pad+'/commentReplies';
}

// Creates a pad and returns the pad id. Calls the callback when finished.
var createPad = function(done) {
  pad = randomString(5);

  api.get('/api/'+apiVersion+'/createPad?apikey='+apiKey+"&padID="+pad)
  .end(function(err, res){
    if(err || (res.body.code !== 0)) done(new Error("Unable to create new Pad"));
  })

  done(null, pad);

  return pad;
}

// Creates a comment and calls the callback when finished.
var createComment = function(pad, commentData, done ) {
  var commentId;
  commentData = commentData || {};
  var timestamp = commentData["timestamp"];

  var url = appUrl + commentsEndPointFor(pad);
  request.post(url,
    { form: {
        'apikey': apiKey,
        'name': 'John Doe',
        'text': 'This is a comment',
        'timestamp': timestamp,
    } },
    function(error, res, body) {
      if(error) {
        throw error;
      }
      else if(res.statusCode != 200) {
        throw new Error("Failed on calling API. Status code: " + res.statusCode);
      }
      else {
        json = JSON.parse(body);
        commentId = json.commentId;
        done(null, commentId);
      }
    }
  );
}

// Creates a comment reply and calls the callback when finished.
var createCommentReply = function(pad, comment, replyData, done) {
  var replyId;
  var timestamp = replyData["timestamp"];
  var url = appUrl + commentRepliesEndPointFor(pad);
  request.post(url,
    { form: {
        'apikey': apiKey,
        'commentId': comment,
        'name': 'John Doe',
        'text': 'This is a reply',
        'timestamp': timestamp,
    } },
    function(error, res, body) {
      if(error) {
        throw error;
      }
      else if(res.statusCode != 200) {
        throw new Error("Failed on calling API. Status code: " + res.statusCode);
      }
      else {
        json = JSON.parse(body);
        replyId = json.replyId;
        done(null, replyId);
      }
    }
  );
}

/* ********** Available functions/values: ********** */

exports.appUrl = appUrl;
exports.apiKey = apiKey;
exports.createPad = createPad;
exports.createComment = createComment;
exports.createCommentReply = createCommentReply;
exports.codeToBe0 = codeToBe0;
exports.codeToBe1 = codeToBe1;
exports.codeToBe4 = codeToBe4;
exports.commentsEndPointFor = commentsEndPointFor;
exports.commentRepliesEndPointFor = commentRepliesEndPointFor;
