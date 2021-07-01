// ==UserScript==
// @name            Waze Forum links
// @namespace       https://github.com/WazeDev/
// @version         2021.06.14.01
// @description     Add profile and beta links in Waze forum
// @author          WazeDev
// @contributor     crazycaveman
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// @include         https://www.waze.com/forum/
// @include         /^https:\/\/.*\.waze\.com\/forum.*/
// @include         /^https:\/\/.*\.waze\.com\/forum\/(?!ucp\.php(?!\?i=(pm|166))).*/
// @grant           none
// @noframes
// ==/UserScript==

/* global $ */

(function () {
    'use strict';

    var settings = {};
    const settingsKey = 'WFL_settings';
    const cl = {
        e: 1,
        error: 1,
        w: 2,
        warn: 2,
        i: 3,
        info: 3,
        d: 4,
        debug: 4,
        l: 0,
        log: 0,
    };

    function log(message, level = 0) {
        switch (level) {
        case 1:
        case 'error':
            console.error('WFL: ', message);
            break;
        case 2:
        case 'warn':
            console.warn('WFL: ', message);
            break;
        case 3:
        case 'info':
            console.info('WFL: ', message);
            break;
        case 4:
        case 'debug':
            console.debug('WFL: ', message);
            break;
        default:
            console.log('WFL: ', message);
        }
    }

    function saveSettings() {
        if (!localStorage) {
            return;
        }
        localStorage.setItem(settingsKey, JSON.stringify(settings));
    }

    function loadSettings() {
        let defaults = {
            beta: { value: false, updated: 0 },
        };
        if (!localStorage) {
            return;
        }
        if (Object.prototype.hasOwnProperty.call(localStorage, settingsKey)) {
            settings = JSON.parse(localStorage.getItem(settingsKey));
        } else {
            settings = defaults;
        }
        Object.keys(defaults).forEach((prop) => {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)
            && !Object.prototype.hasOwnProperty.call(settings, prop)) {
                settings[prop] = defaults[prop];
            }
        });
    }

    function betaLinks() {
        log('Adding beta links', cl.i);
        let links = $("div.page-body a[href*='/editor']").filter(function(i, elem) {
            return $(this).attr('href').match(/^https:\/\/(www\.)?waze\.com\/(?!user\/)(.{2,6}\/)?editor/);
        });
        links.each((i, elem) => {
            let url = $(elem).attr('href');
            let WMEbURL = url.replace(/(www\.)?waze\.com/, 'beta.waze.com');
            let WMEbAnchor = ` (<a target="_blank" class="postlink" href="${WMEbURL}">&beta;</a>)`;
            $(elem).after(WMEbAnchor);
        });
    }

    function checkBetaUser() {
        let betaUser = false;
        let d = new Date();
        if (settings.beta.value) {
            log('Beta status stored', cl.d);
            betaLinks();
        } else if (parseInt(settings.beta.updated, 10) + 7
                < parseInt(d.getFullYear() + (`0${d.getMonth()}`).slice(-2) + (`0${d.getDate()}`).slice(-2), 10)) {
            let ifrm = $('<iframe>').attr('id', 'WUP_frame').hide();
            ifrm.load((event) => { // What to do once the iframe has loaded
                log('iframe loaded', cl.d);
                let memberships = $(event.currentTarget).contents().find('form#ucp section:first ul.cplist a.forumtitle').text();
                betaUser = memberships.indexOf('WME beta testers') >= 0;
                log(`isBetaUser: ${betaUser}`, cl.d);
                betaUser && betaLinks();
                settings.beta = {
                    value: betaUser,
                    updated: d.getFullYear() + (`0${d.getMonth()}`).slice(-2) + (`0${d.getDate()}`).slice(-2),
                };
                //$(this).remove(); //Remove frame
                saveSettings();
            });
            ifrm.attr('src', 'ucp.php?i=groups');
            $('body').append(ifrm);
        }
    }

    function WMEProfiles() {
        log('Adding editor profile links', cl.i);
        let links = $("div.author a[href*='memberlist.php'], dl.postprofile dt a[href*='memberlist.php']"); //Post authors
        if (links.length === 0) {
            links = $("li.row a[href*='memberlist.php']"); //Topic lists
        }
        if (links.length === 0) {
            links = $("table.table1 tbody a[href*='memberlist.php']"); //Group member lists
        }
        if (links.length === 0) {
            links = $('div.memberlist-title'); //Single user forum profile
        }
        links.each((i, elem) => {
            let username = $(elem).text();
            let profileURL = ` (<a target="_blank" href="https://www.waze.com/user/editor/${username}">P</a>)`;
            $(elem).after(profileURL);
        });
    }

    function haveNotifications() {
       const numNotifications = $('#control_bar_handler > div.header-waze-wrapper > wz-header > wz-header-user-panel > wz-user-box > wz-menu-item:nth-child(4) > a > strong').text();

        if (parseInt(numNotifications) > 0) {
            $('#control_bar_handler > div.header-waze-wrapper > wz-header > wz-header-user-panel').prepend(
                `<span id='WFL-Notifications'><a href='https://www.waze.com/forum/ucp.php?i=ucp_notifications' style='text-decoration:none;color:black;'>${numNotifications}</a></span>`
            );
            $('#WFL-Notifications').css({
                'float': 'left',
                'margin-right': '80px',
                'padding': '0px 10px',
                'border': '2px solid black',
                'border-radius': '50%',
                'background-color': '#40ff00',
                'font-size': '18px'
            });
        }
    }

    function SDGNewForumFixes() {
        // Re-enable memberlist button in dropdown
        const $MemberList =
            `<wz-menu-item >
                <a class="no-blue-link" href="./memberlist.php" title="Members" role="menuitem">
                    <i class="icon fa-group fa-fw"></i><span>Members</span>
                </a>
            </wz-menu-item>`;
        $('#control_bar_handler > div.header-waze-wrapper > wz-header > wz-header-user-panel > wz-user-box > wz-menu-item:nth-child(6)').after($MemberList);
        $("#control_bar_handler > div.header-waze-wrapper > wz-header > wz-header-user-panel > wz-user-box > wz-menu-item:nth-child(7) > a").click(function() {
            window.location = './memberlist.php';
        });

        // Change My Posts link to display topics (same as View Your Posts in old forum)
        $('#control_bar_handler > div.header-waze-wrapper > wz-header > wz-header-user-panel > wz-user-box > wz-menu-item:nth-child(5) > a').attr('href', 'https://www.waze.com/forum/search.php?author_id=16831039&sr=topics');

        // Copy forum path to bottom of page
        //let topicLink = $('#control_bar_handler > div.wrap').clone();
        // $('#page-body > div.d-flex.justify-space-between.mb-5').before(topicLink);

        // Move 'New' icon to front of text in notification page
        $("#ucp > section > div.notifications-list > ul.cplist.two-columns > li > div.ml-6 > a > div > wz-badge").each(function() {
            $(this).parent().prepend(this);
        });

        // Move link to PM a user to the top left of the user page
        let $newli = $('#page-body > main > aside > ul > li:nth-child(2)').clone();
        $($newli.children()[0]).prop('href', $('#viewprofile > section:nth-child(1) > div:nth-child(14) > div > div:nth-child(2) > span:nth-child(2) > a').prop('href'));
        $($newli.find('i')[0]).removeClass('w-icon w-icon-error ').addClass('w-icon w-icon-inbox');
        $($newli.find('span')[0]).text('Send PM');
        $($newli.find('span')[0]).css('padding-left', '5px');
        $('#page-body > main > aside > ul').prepend($newli);
    }

    function main(tries = 1) {
        if (tries >= 15) {
            log('Giving up on loading', cl.w);
            return;
        } else if (!($ && document.readyState === 'complete')) {
            log('Document not ready, waiting', cl.d);
            setTimeout(main, 100, tries + 1);
            return;
        }
        console.group('WMEFL');
        log('Loading', cl.i);
        loadSettings();
        WMEProfiles();
        checkBetaUser();
        haveNotifications();
        SDGNewForumFixes();
        log('Done', cl.i);
        console.groupEnd('WMEFL');
    }

    main();
}());
