// ==UserScript==
// @name         Waze Forum links
// @namespace    https://github.com/WazeDev/
// @version      0.8
// @description  Add profile and beta links in Waze forum
// @author       WazeDev
// @contributor  crazycaveman
// @match        https://www.waze.com/forum/*
// @exclude      https://www.waze.com/forum/ucp.php*
// @grant        none
// @noframes
// ==/UserScript==

/* eslint-env browser, greasemonkey, jquery*/

(function() {
    'use strict';

    var cl = {
        "e": 1,
        "error": 1,
        "w": 2,
        "warn": 2,
        "i": 3,
        "info": 3,
        "d": 4,
        "debug": 4,
        "l": 0,
        "log": 0
    }

    function log(message, level = 0) {
        switch(level) {
            case 1:
            case "error":
                console.error("WFL: " + message);
                break;
            case 2:
            case "warn":
                console.warn("WFL: " + message);
                break;
            case 3:
            case "info":
                console.info("WFL: " + message);
                break;
            case 4:
            case "debug":
                console.debug("WFL: " + message);
                break;
            default:
                console.log("WFL: " + message);
        }
    }

    function betaLinks() {
        log("Adding beta links",cl.i);
        let links = $("div.content a[href*='/editor']");
        links.each(function() {
            let url = $(this).attr("href")
            if (url.match(/^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor/) === null) {
                return;
            }
            let WMEbURL = url.replace("www.","beta.");
            let WMEbAnchor = ` (<a target="_blank" class="postlink" href="${WMEbURL}">&beta;</a>)`;
            $(this).after(WMEbAnchor);
        });
    }

    function checkBetaUser() {
        let betaUser = false;
        let ifrm = $("<iframe>").attr("id","WUP_frame").hide();
        ifrm.load(function() { // What to do once the iframe has loaded
            log("iframe loaded", cl.d);
            let memberships = $(this).contents().find("form#ucp div.inner:first ul.cplist a.forumtitle");
            memberships.each(function() {
                let group = $(this).text();
                log(group, cl.d);
                if (group === "WME beta testers") {
                    betaUser = true;
                    return false; //Force end of each callback
                }
            });
            log(`isBetaUser: ${betaUser}`,cl.d);
            betaLinks();
            //$(this).remove();
        });
        ifrm.attr("src", "ucp.php?i=groups");
        $("body").append(ifrm);
    }

    function WMEProfiles() {
        log("Adding editor profile links",cl.i);
        let links = $("dl.postprofile dt a[href*='memberlist.php']");
        links.each(function() {
            let username = $(this).text();
            let profileURL = ` (<a target="_blank" href="https://www.waze.com/user/editor/${username}">profile</a>)`;
            $(this).after(profileURL);
        });
    }

    function main() {
        if (!( $ && document.readyState === "complete")) {
            log("Document not ready, waiting",cl.d);
            setTimeout(main,500);
            return;
        }
        console.group("WMEFL");
        log("Loading",cl.i);
        WMEProfiles();
        checkBetaUser();
        log("Done",cl.i);
        console.groupEnd("WMEFL");
    }

    setTimeout(main,500);
})();