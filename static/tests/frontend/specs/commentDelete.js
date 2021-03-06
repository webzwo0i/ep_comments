describe("ep_comments_page - Comment Delete", function(){
  //create a new pad with comment before each test run
  beforeEach(function(cb){
    helper.newPad(function() {
      helper.waitFor(function(){
        return (createComment !== false);
      }).done(function(){
        createComment(function() {
          // ensure we can delete a comment
          cb();
        });
      });
    });
    this.timeout(60000);
  });
  it("Ensures a comment can be deleted", function(done) {

    // Skip if Edge
    if (document.documentMode || /Safari/.test(navigator.userAgent) || /Edge/.test(navigator.userAgent)) {
// console.log("skipping");
//      done();
    }

    deleteComment(function(){
      var chrome$ = helper.padChrome$;
      var outer$ = helper.padOuter$;
      var commentId = getCommentId();
      helper.waitFor(function(){
        return !chrome$(".sidebar-comment").is(":visible");
      }).done(function(){
        expect(chrome$(".sidebar-comment").is(":visible")).to.be(false);
        done();
      });
    });
  });

});

function createComment(callback) {
  // Skip if Safari
  if (document.documentMode || /Safari/.test(navigator.userAgent)) {
    callback();
  }

  var inner$ = helper.padInner$;
  var outer$ = helper.padOuter$;
  var chrome$ = helper.padChrome$;

  // get the first text element out of the inner iframe
  var $firstTextElement = inner$("div").first();

  // simulate key presses to delete content
  $firstTextElement.sendkeys('{selectall}'); // select all
  $firstTextElement.sendkeys('{del}'); // clear the first line
  $firstTextElement.sendkeys('This content will receive a comment'); // insert text

  // get the comment button and click it
  $firstTextElement.sendkeys('{selectall}'); // needs to select content to add comment to
  var $commentButton = chrome$(".addComment");
  $commentButton.click();

  // fill the comment form and submit it
  var $commentField = chrome$("textarea.comment-content");
  $commentField.val("My comment");
  var $hasSuggestion = outer$(".suggestion-checkbox");
  $hasSuggestion.click();
  var $suggestionField = outer$("textarea.to-value");
  $suggestionField.val("Change to this suggestion");
  var $submittButton = chrome$(".comment-buttons input[type=submit]");
  $submittButton.click();

  // wait until comment is created and comment id is set
  helper.waitFor(function() {
    try{
      return getCommentId() !== null;
    }catch(e){
      console.log("error", e);
    }
  })
  .done(callback);
}

function deleteComment(callback){
  var chrome$ = helper.padChrome$;
  var outer$ = helper.padOuter$;

  //click on the settings button to make settings visible
  var $deleteButton = outer$(".comment-delete");
  $deleteButton.click();

  helper.waitFor(function() {
    return chrome$(".sidebar-comment").is(":visible") === false;
  })
  .done(callback);
}

function getCommentId() {
  var inner$ = helper.padInner$;
  helper.waitFor(function(){
    var inner$ = helper.padInner$;
    return inner$;
  }).done(function(){
    var comment = inner$(".comment").first();
    var cls = comment.attr('class');
    var classCommentId = /(?:^| )(c-[A-Za-z0-9]*)/.exec(cls);
    var commentId = (classCommentId) ? classCommentId[1] : null;

    return commentId;
  });
}
