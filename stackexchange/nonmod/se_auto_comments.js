// ==UserScript==
// @name         SE Mod Action Auto Comments
// @namespace    http://artofcode.co.uk
// @version      0.3.10
// @description  Add auto-comments when taking a unilateral mod action on posts.
// @author       ArtOfCode
// @contributor  Pavlo <http://codereview.stackexchange.com/users/63835/pavlo>
// @match        *://hardwarerecs.stackexchange.com/*
// @grant        none
// ==/UserScript==

$(document).ready(function() {
    
    // This section is only not in "Program", below, because fail-fast.
    
    if(!StackExchange) {
        console.error("SE.MAAC can't run: no StackExchange global");
        return;
    }
    
    // Utility functions: 'library'-type methods for helping those that perform the major tasks.
    
    function loadDialog(html_or_element, type) {
        if(type !== "html" && type !== "element") {
            throw new ValueError("loadDialog: param 'type': value must be either 'html' or 'element'.");
        }
        
        var html;
        if(type === "html") {
            html = html_or_element;
        }
        else if(type === "element") {
            var matches = $(html_or_element);
            if(matches.length == 1) {
                html = matches.html();
            }
            else {
                throw new ValueError("loadDialog: element does not exist, or more than one matching element.");
            }
        }
        
        $("body").loadDialog({
            "lightbox": false,
            "html": html,
            "target": $("body")
        });
    }
    
    function generateDialogContent(title, commentList) {
        var contentString = '<div class="autocomment-dialog popup"><div><h2 style="margin-bottom:12px;">' + title + '</h2>'
                          + '<ul class="action-list">';
        var keys = Object.keys(commentList);
        for(var i = 0; i < keys.length; i++) {
            var commentTitle = keys[i];
            var commentObject = commentList[commentTitle];
            var text = commentObject["text"];
            var value = commentObject["value"];
            contentString += '<li><label><input type="radio" name="autocomment" value="' + value + '" />';
            contentString += '<span class="action-name">   ' + commentTitle + '</span>';
            contentString += '<span class="action-desc">' + text + '</span></label></li>';
        }
        contentString += '</ul>';
        contentString += '<div class="popup-actions"><div style="float:right;">';
        contentString += '<button class="autocomment-submit">Submit</button></div>';
        return contentString;
    }
    
    function closeDialogs(selector) {
        $(selector).fadeOut(350, function() {
            $(this).remove();
        });
    }
    
    function setupContentAndHandlers(data) {
        var keys = Object.keys(data);
        for(var i = 0; i < keys.length; i++) {
            // I'd just access the dataSet by data[i] if I could, but... well, I can't. Have to have the key instead.
            var key = keys[i];
            var dataSet = data[key];
            
            if(dataSet["comments"] && dataSet["dialogTitle"]) {
                dataSet["content"] = generateDialogContent(dataSet["dialogTitle"], dataSet["comments"]);
            }
            else {
                /* Actually throwing an error here would cause more trouble than the semantic improvement is worth *
                 * because it would halt data processing for every data set. Instead, just forget this data set as *
                 * invalid and move on.                                                                            */
                console.warn("setupContentAndHandlers: invalid data set \"data['" + key + "']\" while setting content");
                continue;
            }
            
            if(dataSet["trigger"] && dataSet["action"] && dataSet["content"]) {
                /* Event handlers here are run via $.proxy with a dataSet parameter because if they aren't then    *
                 * we get the wrong dataSet in use. For example, if the data has two top-level objects for 'close' *
                 * and 'delete', then both handlers use the 'delete' data because that's the dataSet when the      *
                 * event is actually called. By using $.proxy, we avoid this by passing the correct dataSet as an  *
                 * argument to the handler function.                                                               */
                $(document).delegate(dataSet["trigger"], "click", $.proxy(function(dataSet, e) {
                    e.preventDefault();
                    var postElement = $(e.target).closest(".answer, .question");
                    var postType = postElement.hasClass("question") ? "question" : "answer";
                    var id = postElement.data((postType == "question" ? "question" : "answer") + "id");
                    loadDialog(dataSet["content"], "html");
                    $(".autocomment-submit").on("click", function() {
                        dataSet["action"](id);
                    });
                }, null, dataSet));
            }
            else {
                // See notes about continuing in the last else block.
                console.warn("setupContentAndHandlers: invalid data set \"data['" + key + "']\" while setting content");
                continue;
            }
        }
    }
    
    // Action functions: methods that do something (process data, create comments/content, etc).
    
    function addComment(postId, commentText) {
        return $.ajax({
            type: 'POST',
            url: '/posts/' + postId + '/comments',
            data: {
                'comment': commentText,
                'fkey': StackExchange.options.user.fkey
            }
        });
    }
    
    function handleDialogResult(postId) {
        var comment = $("input:radio[name='autocomment']:checked").siblings(".action-desc").text();
        if(comment) {
            addComment(postId, comment)
                .done(function(data) {
                    closeDialogs(".autocomment-dialog");
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    alert("Failed to comment: " + jqXHR.responseText);
                });
        }
        else {
            alert("Select a comment to post.");
        }
    }
    
    // Data - extra data needed to provide details for methods to work.

    /* Ooooh boy this is a data structure and a half.                                                                *
     *                                                                                                               *
     * Yeah, now get over that feeling, it's not that hard. This is one object, containing all the data you will     *
     * ever need to construct, call, and handle the dialogs. It works like this:                                     *
     *                                                                                                               *
     * You have top-level objects, which are dialog definitions - each top-level object within the data structure    *
     * represents a dialog that is loaded for a specific action.                                                     *
     *                                                                                                               *
     * You have several informational properties within that object. In no particular order: 'trigger' is the        *
     * jQuery element selector that matches elements for which the dialog will be displayed when they are clicked.   *
     * 'action' is the method that does whatever needs to be done with the dialog's result - gets the selected value *
     * and posts it, usually. Will be passed the post ID. 'dialogTitle' is what will be displayed at the top of the  *
     * dialog, in a <h2>, as a title. Finally, you have 'comments', which is another object of objects.              *
     *                                                                                                               *
     * In the 'comments' object, there should be a set of objects, each representing one comment, and at the same    *
     * time, one item in the resulting dialog. They should be of this format:                                        *
     *                                                                                                               *
     *     'comment title': {                                                                                        *
     *         'value': "a value to be inserted as the HTML <input> element's value attribute",                      *
     *         'text': "a long string, containing the MARKDOWN that represents the comment to be posted"             *
     *     }                                                                                                         *
     *                                                                                                               *
     * Enough documentation for you? It's certainly enough for me.                                                   */
    var dialogData = {
        'close': {
            'trigger': 'a.close-question-link',
            'action': handleDialogResult,
            'dialogTitle': 'Add a closure auto-comment',
            'comments': {
                'technical support': {
                    'value': 'tech-support',
                    'text': "Hi there! I'm closing this as off-topic for the reasons mentioned just below your post in the close "
                          + "reason. This site can't help you with technical support for *existing* hardware, only "
                          + "recommendations for new hardware. If you can rephrase your question to ask for a recommendation, "
                          + "we may be able to reopen it. Thanks!"
                },
                'general advice': {
                    'value': 'gen-advice',
                    'text': "Hi there! I've put this question on hold because as it's currently worded, it seems like it's "
                          + "asking for general advice about hardware, which isn't in our scope. If you can reword this to ask "
                          + "instead for a recommendation of a specific piece of hardware you need, we may be able to reopen "
                          + "it. Thanks!"
                }
            }
        },
        'delete': {
            'trigger': 'a[data-delete-prompt]',
            'action': handleDialogResult,
            'dialogTitle': 'Add a deletion auto-comment',
            'comments': {
                'no synopsis': {
                    'value': 'no-syn',
                    'text': "Hi there! I've deleted this answer because it doesn't quite meet our [quality standards]"
                          + "(http://meta.hardwarerecs.stackexchange.com/q/59/8). Please take a moment to read them. "
                          + "Specifically, this answer is lacking a synopsis of the hardware and a description of how it meets "
                          + "the asker's needs - please post a new answer, including those things. Thanks!"
                },
                'advice/no recommendation': {
                    'value': 'advice-no-rec',
                    'text': "It's great that you've got this advice for us, but please remember that [answers are expected "
                          + "to recommend specific hardware](http://meta.hardwarerecs.stackexchange.com/q/59/8). I've deleted "
                          + "this; please have a read of those guidelines, and post a new answer if you've got a recommendation "
                          + "for us - or comment if you want to give advice. Thanks!"
                }
            },
        }
    };
    
    // "Program" - the bit that actually runs the script.
    
    setupContentAndHandlers(dialogData);
    
});