var plugCubedUserData;
define(['plugCubed/Class', 'plugCubed/Lang', 'lang/Lang'], function(Class, p3Lang, Lang) {
    var cleanHTMLMessage, developer, sponsor, ambassador, donatorDiamond, donatorPlatinum, donatorGold, donatorSilver, donatorBronze, special, PopoutView, ChatFacade, Database, runLite;

    cleanHTMLMessage = function(input, disallow, extra_allow) {
        var allowed, tags, disallowed = [];
        if ($.isArray(disallow)) disallowed = disallow;
        if (!extra_allow || !$.isArray(extra_allow)) extra_allow = [];
        allowed = $(['span', 'div', 'table', 'tr', 'td', 'br', 'br/', 'strong', 'em', 'a'].concat(extra_allow)).not(disallowed).get();
        if (disallow === '*') allowed = [];
        tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        return input.replace(tags, function(a, b) {
            return allowed.indexOf(b.toLowerCase()) > -1 ? a : '';
        });
    };
    developer = sponsor = ambassador = donatorDiamond = donatorPlatinum = donatorGold = donatorSilver = donatorBronze = [];
    special = {};
    runLite = !requirejs.defined('app/base/Class');

    if (!runLite) {
        PopoutView = require('app/views/room/popout/PopoutView');
        ChatFacade = require('app/facades/ChatFacade');
        Database = require('app/store/Database');
    } else {
        ChatFacade = {
            uiLanguages: [],
            chatLanguages: []
        };
    }

    $.getJSON('https://d1rfegul30378.cloudfront.net/titles.json', function(data) {
        developer = data.developer ? data.developer : [];
        sponsor = data.sponsor ? data.sponsor : [];
        special = data.special ? data.special : {};
        ambassador = data.ambassador ? data.ambassador : [];
        if (data.donator) {
            donatorDiamond = data.donator.diamond ? data.donator.diamond : [];
            donatorPlatinum = data.donator.platinum ? data.donator.platinum : [];
            donatorGold = data.donator.gold ? data.donator.gold : [];
            donatorSilver = data.donator.silver ? data.donator.silver : [];
            donatorBronze = data.donator.bronze ? data.donator.bronze : [];
        }
    });

    var handler = Class.extend({
        runLite: runLite,
        proxifyImage: function(url) {
            if (this.startsWithIgnoreCase(url, 'http://')) {
                return 'https://api.plugCubed.net/proxy/' + url;
            }
            return url;
        },
        getHighestRank: function(userID) {
            if (this.isPlugCubedDeveloper(userID)) return 'developer';
            if (this.isPlugCubedSponsor(userID)) return 'sponsor';
            if (this.isPlugCubedSpecial(userID)) return 'special';
            if (this.isPlugCubedAmbassador(userID)) return 'ambassador';
            if (this.isPlugCubedDonatorDiamond(userID)) return 'donatorDiamond';
            if (this.isPlugCubedDonatorPlatinum(userID)) return 'donatorPlatinum';
            if (this.isPlugCubedDonatorGold(userID)) return 'donatorGold';
            if (this.isPlugCubedDonatorSilver(userID)) return 'donatorSilver';
            if (this.isPlugCubedDonatorBronze(userID)) return 'donatorBronze';
            return undefined;
        },
        havePlugCubedRank: function(userID) {
            return this.isPlugCubedDeveloper(userID) || this.isPlugCubedSponsor(userID) || this.isPlugCubedSpecial(userID) || this.isPlugCubedAmbassador(userID) || this.isPlugCubedDonatorDiamond(userID) || this.isPlugCubedDonatorPlatinum(userID) || this.isPlugCubedDonatorGold(userID) || this.isPlugCubedDonatorSilver(userID) || this.isPlugCubedDonatorBronze(userID);
        },
        getAllPlugCubedRanks: function(userID, onlyP3) {
            var ranks = [];

            // plugCubed ranks
            if (this.isPlugCubedDeveloper(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.developer'));
            }
            if (this.isPlugCubedSponsor(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.sponsor'));
            }
            if (this.isPlugCubedSpecial(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.special', this.getPlugCubedSpecial(userID).title));
            }
            if (this.isPlugCubedAmbassador(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.ambassador'));
            }
            if (this.isPlugCubedDonatorDiamond(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorDiamond'));
            }
            if (this.isPlugCubedDonatorPlatinum(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorPlatinum'));
            }
            if (this.isPlugCubedDonatorGold(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorGold'));
            }
            if (this.isPlugCubedDonatorSilver(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorSilver'));
            }
            if (this.isPlugCubedDonatorBronze(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorBronze'));
            }

            // plug.dj ranks
            if (!onlyP3) {
                if (this.hasPermission(userID, 5, true)) {
                    ranks.push(Lang.roles.admin);
                } else if (this.hasPermission(userID, 4, true)) {
                    ranks.push(Lang.roles.leader);
                } else if (this.hasPermission(userID, 3, true)) {
                    ranks.push(Lang.roles.ambassador);
                } else if (this.hasPermission(userID, 2, true)) {
                    ranks.push(Lang.roles.volunteer);
                } else if (this.hasPermission(userID, API.ROLE.HOST)) {
                    ranks.push(Lang.roles.host);
                } else if (this.hasPermission(userID, API.ROLE.COHOST)) {
                    ranks.push(Lang.roles.cohost);
                } else if (this.hasPermission(userID, API.ROLE.MANAGER)) {
                    ranks.push(Lang.roles.manager);
                } else if (this.hasPermission(userID, API.ROLE.BOUNCER)) {
                    ranks.push(Lang.roles.bouncer);
                } else if (this.hasPermission(userID, API.ROLE.RESIDENTDJ)) {
                    ranks.push(Lang.roles.dj);
                }
            }

            return ranks.join(' / ');
        },
        isPlugCubedDeveloper: function(userID) {
            if (!userID) userID = API.getUser().id;
            return developer.indexOf(userID) > -1;
        },
        isPlugCubedSponsor: function(userID) {
            if (!userID) userID = API.getUser().id;
            return sponsor.indexOf(userID) > -1;
        },
        isPlugCubedSpecial: function(userID) {
            if (!userID) userID = API.getUser().id;
            return this.getPlugCubedSpecial(userID) !== undefined;
        },
        isPlugCubedAmbassador: function(userID) {
            if (!userID) userID = API.getUser().id;
            return ambassador.indexOf(userID) > -1;
        },
        isPlugCubedDonatorDiamond: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorDiamond.indexOf(userID) > -1;
        },
        isPlugCubedDonatorPlatinum: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorPlatinum.indexOf(userID) > -1;
        },
        isPlugCubedDonatorGold: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorGold.indexOf(userID) > -1;
        },
        isPlugCubedDonatorSilver: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorSilver.indexOf(userID) > -1;
        },
        isPlugCubedDonatorBronze: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorBronze.indexOf(userID) > -1;
        },
        getPlugCubedSpecial: function(userID) {
            if (!userID) userID = API.getUser().id;
            return special[userID];
        },
        cleanHTML: function(msg, disallow, extra_allow) {
            return cleanHTMLMessage(msg, disallow, extra_allow);
        },
        cleanTypedString: function(msg) {
            return msg.split("<").join("&lt;").split(">").join("&gt;");
        },
        chatLog: function(type, message, color) {
            var $chat, b, $message, $text;
            if (!message) return;
            if (typeof message !== 'string') message = message.html();

            message = cleanHTMLMessage(message);
            $chat = !runLite && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages');
            b = $chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - 20;
            $message = $('<div>').addClass(type ? type : 'update');
            $text = $('<span>').addClass('text').html(message);

            if (type === 'system') {
                $message.append('<i class="icon icon-chat-system"></i>');
            } else {
                $text.css('color', this.toRGB(color && this.isRGB(color) ? color : 'd1d1d1'));
            }
            $chat.append($message.append($text));
            b && $chat.scrollTop($chat[0].scrollHeight);
        },
        getRoomID: function() {
            return document.location.pathname.split('/')[1];
        },
        getRoomname: function() {
            return $('#room-name').text().trim();
        },
        getUserData: function(userID, key, defaultValue) {
            if (plugCubedUserData[userID] === undefined || plugCubedUserData[userID][key] === undefined) {
                return defaultValue;
            }
            return plugCubedUserData[userID][key];
        },
        setUserData: function(userID, key, value) {
            if (plugCubedUserData[userID] === undefined) {
                plugCubedUserData[userID] = {};
            }
            plugCubedUserData[userID][key] = value;
        },
        getUser: function(data) {
            var method = 'number';
            if (typeof data === 'string') {
                method = 'string';
                data = data.trim();
                if (data.substr(0,1) === '@')
                    data = data.substr(1);
            }

            var users = API.getUsers();
            for (var i in users) {
                if (!users.hasOwnProperty(i)) continue;
                if (method === 'string') {
                    if (this.equalsIgnoreCase(users[i].username, data) || this.equalsIgnoreCaseTrim(users[i].id.toString(), data))
                        return users[i];
                    continue;
                }
                if (method === 'number') {
                    if (users[i].id === data)
                        return users[i];
                }
            }
            return null;
        },
        getUserInfo: function(data) {
            var user = this.getUser(data);
            if (user === null) {
                API.chatLog(p3Lang.i18n('error.userNotFound'));
            } else {
                var rank, status, voted, position, voteTotal, waitlistpos, inbooth, lang, disconnectInfo;

                voteTotal = this.getUserData(user.id, 'wootcount', 0) + this.getUserData(user.id, 'mehcount', 0);
                waitlistpos = API.getWaitListPosition(user.id);
                inbooth = API.getDJ().id === user.id;
                lang = Lang.languages[user.language];
                disconnectInfo = this.getUserData(user.id, 'disconnects', {
                    count: 0
                });

                if (this.hasPermission(user.id, 5, true)) {
                    rank = Lang.roles.admin;
                } else if (this.hasPermission(user.id, 4, true)) {
                    rank = Lang.roles.leader;
                } else if (this.hasPermission(user.id, 3, true)) {
                    rank = Lang.roles.ambassador;
                } else if (this.hasPermission(user.id, 2, true)) {
                    rank = Lang.roles.volunteer;
                } else if (this.hasPermission(user.id, API.ROLE.HOST)) {
                    rank = Lang.roles.host;
                } else if (this.hasPermission(user.id, API.ROLE.COHOST)) {
                    rank = Lang.roles.cohost;
                } else if (this.hasPermission(user.id, API.ROLE.MANAGER)) {
                    rank = Lang.roles.manager;
                } else if (this.hasPermission(user.id, API.ROLE.BOUNCER)) {
                    rank = Lang.roles.bouncer;
                } else if (this.hasPermission(user.id, API.ROLE.RESIDENTDJ)) {
                    rank = Lang.roles.dj;
                } else {
                    rank = Lang.roles.none;
                }

                if (inbooth) {
                    position = p3Lang.i18n('info.djing');
                } else if (waitlistpos > -1) {
                    position = p3Lang.i18n('info.inWaitlist', waitlistpos + 1, API.getWaitList().length);
                } else {
                    position = p3Lang.i18n('info.notInList');
                }

                switch (user.status) {
                    default:
                        status = Lang.userStatus.available;
                        break;
                    case API.STATUS.AFK:
                        status = Lang.userStatus.away;
                        break;
                    case API.STATUS.WORKING:
                        status = Lang.userStatus.working;
                        break;
                    case API.STATUS.GAMING:
                        status = Lang.userStatus.gaming;
                        break;
                }

                switch (user.vote) {
                    case -1:
                        voted = p3Lang.i18n('vote.meh');
                        break;
                    default:
                        voted = p3Lang.i18n('vote.undecided');
                        break;
                    case 1:
                        voted = p3Lang.i18n('vote.woot');
                        break;
                }
                if (inbooth) voted = p3Lang.i18n('vote.djing');

                var title = this.getAllPlugCubedRanks(user.id, true), message = $('<table>').css({
                    width: '100%',
                    color: '#CC00CC'
                });

                // Username
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.name'))).append($('<span>').css('color', '#FFFFFF').text(this.cleanTypedString(user.username)))));
                // Title
                if (title !== '')
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.title'))).append($('<span>').css('color', '#FFFFFF').text(title))));
                // UserID
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.id'))).append($('<span>').css('color', '#FFFFFF').text(user.id))));
                // Rank / Time Joined
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.rank'))).append($('<span>').css('color', '#FFFFFF').text(rank))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.joined'))).append($('<span>').css('color', '#FFFFFF').text(this.getTimestamp(this.getUserData(user.id, 'joinTime', Date.now()))))));
                // Status / Vote
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.status'))).append($('<span>').css('color', '#FFFFFF').text(status))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.vote'))).append($('<span>').css('color', '#FFFFFF').text(voted))));
                // Position
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.position'))).append($('<span>').css('color', '#FFFFFF').text(position))));
                // Points / Fans
                message.append($('<tr>').append($('<td>').append('XP').append($('<span>').css('color', '#FFFFFF').text(user.xp))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.fans'))).append($('<span>').css('color', '#FFFFFF').text(user.fans))));
                // Woot / Meh
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.wootCount'))).append($('<span>').css('color', '#FFFFFF').text(this.getUserData(user.id, 'wootcount', 0)))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.mehCount'))).append($('<span>').css('color', '#FFFFFF').text(this.getUserData(user.id, 'mehcount', 0)))));
                // Ratio
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.ratio'))).append($('<span>').css('color', '#FFFFFF').text((function(a, b) {
                    if (b === 0) return a === 0 ? '0:0' : '1:0';
                    for (var i = 1; i <= b; i++) {
                        var e = i * (a / b);
                        if (e % 1 === 0) return e + ':' + i;
                    }
                })(this.getUserData(user.id, 'wootcount', 0), this.getUserData(user.id, 'mehcount', 0))))));
                // Disconnects
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.disconnects'))).append($('<span>').css('color', '#FFFFFF').text(disconnectInfo.count))));
                if (disconnectInfo.count > 0) {
                    // Last Position
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastPosition'))).append($('<span>').css('color', '#FFFFFF').text(disconnectInfo.position < -1 ? 'Wasn\'t in booth nor waitlist' : (disconnectInfo.position < 0 ? 'Was DJing' : 'Was ' + (disconnectInfo.position + 1) + ' in waitlist')))));
                    // Lase Disconnect Time
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastDisconnect'))).append($('<span>').css('color', '#FFFFFF').text(this.getTimestamp(disconnectInfo.time)))));
                }

                this.chatLog(undefined, $('<div>').append(message).html());
            }
        },
        hasPermission: function(uid, permission, global) {
            var user = API.getUser(uid);
            if (user && user.id) {
                var role = global ? user.gRole : user.role + (user.gRole > 0 ? 5 + user.gRole : 0);
                return role >= permission;
            }
            return false;
        },
        getAllUsers: function() {
            var table = $('<table>').css({
                width: '100%',
                color: '#CC00CC',
                position: 'relative',
                left: '-25px'
            }), users = API.getUsers();
            for (var i in users) {
                if (users.hasOwnProperty(i)) {
                    var user = users[i];
                    table.append($('<tr>').append($('<td>').append(user.username)).append($('<td>').append(user.id)));
                }
            }
            this.chatLog(undefined, $('<div>').append(table).html());
        },
        playChatSound: function() {
            if (runLite || Database.settings.chatSound) {
                document.getElementById('chat-sound').playChatSound();
            }
        },
        playMentionSound: function() {
            if (runLite || Database.settings.chatSound) {
                document.getElementById('chat-sound').playMentionSound();
            }
        },
        getTimestamp: function(t, format) {
            var time, hours, minutes, seconds, postfix = '';
            if (!format) format = 'hh:mm';

            time = t ? new Date(t) : new Date();

            hours = time.getHours();
            minutes = time.getMinutes();
            seconds = time.getSeconds();

            if ($('.icon-timestamps-12').length === 1) {
                if (hours < 12) {
                    postfix = ' AM';
                } else {
                    postfix = ' PM';
                    hours -= 12;
                }
                if (hours === 0) {
                    hours = 12;
                }
            }

            hours = (hours < 10 ? '0' : '') + hours;
            minutes = (minutes < 10 ? '0' : '') + minutes;
            seconds = (seconds < 10 ? '0' : '') + seconds;

            return format.split('hh').join(hours).split('mm').join(minutes).split('ss').join(seconds) + postfix;
        },
        randomRange: function(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },
        isRGB: function(a) {
            return typeof a === 'string' ? /^(#|)(([0-9A-F]{6}$)|([0-9A-F]{3}$))/i.test(a) : false;
        },
        toRGB: function(a) {
            return this.isRGB(a) ? a.substr(0, 1) === '#' ? a : '#' + a : undefined;
        },
        isNumber: function(a) {
            return typeof a === 'string' ? !isNaN(parseInt(a, 10)) && isFinite(a) : false;
        },
        equalsIgnoreCase: function(a, b) {
            return typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : false;
        },
        equalsIgnoreCaseTrim: function(a, b) {
            return typeof a === 'string' && typeof b === 'string' ? a.trim().toLowerCase() === b.trim().toLowerCase() : false;
        },
        startsWith: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return a.indexOf(b) === 0;
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && this.startsWith(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        endsWith: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return a.lastIndexOf(b) === a.length - b.length;
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && this.endsWith(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        startsWithIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return this.startsWith(a.toLowerCase(), b.toLowerCase());
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && this.startsWithIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        endsWithIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return this.endsWith(a.toLowerCase(), b.toLowerCase());
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && this.endsWithIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        getBaseURL: function(url) {
            return url.indexOf('?') < 0 ? url : url.substr(0, url.indexOf('?'));
        },
        getRandomString: function(length) {
            var chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
            var i, ret = [];
            for (i = 0; i < length; i++) {
                ret.push(chars.substr(Math.floor(Math.random() * chars.length), 1));
            }
            return ret.join('');
        },
        logColors: {
            userCommands: '66FFFF',
            modCommands: 'FF0000',
            infoMessage1: 'FFFF00',
            infoMessage2: '66FFFF'
        }
    });
    return new handler();
});