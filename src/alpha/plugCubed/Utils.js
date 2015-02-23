var plugCubedUserData;
define(['plugCubed/Class', 'plugCubed/Lang', 'lang/Lang'], function(Class, p3Lang, Lang) {
    var cleanHTMLMessage, developer, sponsor, ambassador, donatorDiamond, donatorPlatinum, donatorGold, donatorSilver, donatorBronze, special, PopoutView, ChatFacade, Database, runLite;

    cleanHTMLMessage = function(input, disallow, extra_allow) {
        if (input == null) return '';
        var allowed, tags, disallowed = [];
        if ($.isArray(disallow)) disallowed = disallow;
        if (!extra_allow || !$.isArray(extra_allow)) extra_allow = [];
        allowed = $(['span', 'div', 'table', 'tr', 'td', 'br', 'br/', 'strong', 'em', 'a'].concat(extra_allow)).not(disallowed).get();
        if (disallow === '*') allowed = [];
        tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        input = input.split('&#8237;').join('&amp;#8237;').split('&#8238;').join('&amp;#8238;');
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

    $.getJSON('https://d1rfegul30378.cloudfront.net/titles.json', /**
     * @param {{developer: Array, sponsor: Array, special: Array, ambassador: Array, donator: {diamond: Array, platinum: Array, gold: Array, silver: Array, bronze: Array}, patreon: {diamond: Array, platinum: Array, gold: Array, silver: Array, bronze: Array}}} data
     */
    function(data) {
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
        httpsifyURL: function(url) {
            if (this.startsWithIgnoreCase(url, 'http://')) {
                return 'https://' + url.substr(7);
            }
            return url;
        },
        getHighestRank: function(uid) {
            if (!uid) uid = API.getUser().id;

            if (this.isPlugCubedDeveloper(uid)) return 'developer';
            if (this.isPlugCubedSponsor(uid)) return 'sponsor';
            if (this.isPlugCubedSpecial(uid)) return 'special';
            if (this.isPlugCubedAmbassador(uid)) return 'ambassador';
            if (this.isPlugCubedDonatorDiamond(uid)) return 'donatorDiamond';
            if (this.isPlugCubedDonatorPlatinum(uid)) return 'donatorPlatinum';
            if (this.isPlugCubedDonatorGold(uid)) return 'donatorGold';
            if (this.isPlugCubedDonatorSilver(uid)) return 'donatorSilver';
            if (this.isPlugCubedDonatorBronze(uid)) return 'donatorBronze';
            return null;
        },
        getHighestRankString: function(uid) {
            var highestRank = this.getHighestRank(uid);
            if (highestRank != null) {
                if (this.isPlugCubedSpecial(uid)) {
                    return p3Lang.i18n('info.specialTitles.special', this.getPlugCubedSpecial(uid).title);
                }
                return p3Lang.i18n('info.specialTitles.' + highestRank);
            }
            return '';
        },
        havePlugCubedRank: function(uid) {
            return this.isPlugCubedDeveloper(uid) || this.isPlugCubedSponsor(uid) || this.isPlugCubedSpecial(uid) || this.isPlugCubedAmbassador(uid) || this.isPlugCubedDonatorDiamond(uid) || this.isPlugCubedDonatorPlatinum(uid) || this.isPlugCubedDonatorGold(uid) || this.isPlugCubedDonatorSilver(uid) || this.isPlugCubedDonatorBronze(uid);
        },
        getAllPlugCubedRanks: function(uid, onlyP3) {
            var ranks = [];

            // plugCubed ranks
            if (this.isPlugCubedDeveloper(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.developer'));
            }
            if (this.isPlugCubedSponsor(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.sponsor'));
            }
            if (this.isPlugCubedSpecial(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.special', this.getPlugCubedSpecial(uid).title));
            }
            if (this.isPlugCubedAmbassador(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.ambassador'));
            }
            if (this.isPlugCubedDonatorDiamond(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorDiamond'));
            }
            if (this.isPlugCubedDonatorPlatinum(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorPlatinum'));
            }
            if (this.isPlugCubedDonatorGold(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorGold'));
            }
            if (this.isPlugCubedDonatorSilver(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorSilver'));
            }
            if (this.isPlugCubedDonatorBronze(uid)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorBronze'));
            }

            // plug.dj ranks
            if (!onlyP3) {
                if (this.hasPermission(uid, 5, true)) {
                    ranks.push(Lang.roles.admin);
                } else if (this.hasPermission(uid, 4, true)) {
                    ranks.push(Lang.roles.leader);
                } else if (this.hasPermission(uid, 3, true)) {
                    ranks.push(Lang.roles.ambassador);
                } else if (this.hasPermission(uid, 2, true)) {
                    ranks.push(Lang.roles.volunteer);
                } else if (this.hasPermission(uid, API.ROLE.HOST)) {
                    ranks.push(Lang.roles.host);
                } else if (this.hasPermission(uid, API.ROLE.COHOST)) {
                    ranks.push(Lang.roles.cohost);
                } else if (this.hasPermission(uid, API.ROLE.MANAGER)) {
                    ranks.push(Lang.roles.manager);
                } else if (this.hasPermission(uid, API.ROLE.BOUNCER)) {
                    ranks.push(Lang.roles.bouncer);
                } else if (this.hasPermission(uid, API.ROLE.DJ)) {
                    ranks.push(Lang.roles.dj);
                }
            }

            return ranks.join(' / ');
        },
        isPlugCubedDeveloper: function(uid) {
            if (!uid) uid = API.getUser().id;
            return developer.indexOf(uid) > -1;
        },
        isPlugCubedSponsor: function(uid) {
            if (!uid) uid = API.getUser().id;
            return sponsor.indexOf(uid) > -1;
        },
        isPlugCubedSpecial: function(uid) {
            if (!uid) uid = API.getUser().id;
            return this.getPlugCubedSpecial(uid) != null;
        },
        isPlugCubedAmbassador: function(uid) {
            if (!uid) uid = API.getUser().id;
            return ambassador.indexOf(uid) > -1;
        },
        isPlugCubedDonatorDiamond: function(uid) {
            if (!uid) uid = API.getUser().id;
            return donatorDiamond.indexOf(uid) > -1;
        },
        isPlugCubedDonatorPlatinum: function(uid) {
            if (!uid) uid = API.getUser().id;
            return donatorPlatinum.indexOf(uid) > -1;
        },
        isPlugCubedDonatorGold: function(uid) {
            if (!uid) uid = API.getUser().id;
            return donatorGold.indexOf(uid) > -1;
        },
        isPlugCubedDonatorSilver: function(uid) {
            if (!uid) uid = API.getUser().id;
            return donatorSilver.indexOf(uid) > -1;
        },
        isPlugCubedDonatorBronze: function(uid) {
            if (!uid) uid = API.getUser().id;
            return donatorBronze.indexOf(uid) > -1;
        },
        getPlugCubedSpecial: function(uid) {
            if (!uid) uid = API.getUser().id;
            return special[uid];
        },
        cleanHTML: function(msg, disallow, extra_allow) {
            return cleanHTMLMessage(msg, disallow, extra_allow);
        },
        cleanTypedString: function(msg) {
            return msg.split("<").join("&lt;").split(">").join("&gt;");
        },
        chatLog: function(type, message, color, fromID, fromName) {
            var $chat, b, $message, $box, $msg, $text, $msgSpan, $from, from;

            if (!message) return;
            if (typeof message !== 'string') message = message.html();

            message = cleanHTMLMessage(message);
            $msgSpan = $('<span>').html(message);

            $chat = !runLite && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages');
            b = $chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - 20;

            $message = $('<div>').addClass(type ? type : 'message');
            $box = $('<div>').addClass('badge-box').data('uid', fromID ? fromID : 'p3');
            $from = $('<div>').addClass('from').append($('<span>').addClass('un'));
            $msg = $('<div>').addClass('msg').append($from);
            $text = $('<span>').addClass('text').append($msgSpan);

            if (type === 'system') {
                $box.append('<i class="icon icon-chat-system"></i>');
            } else {
                $box.append('<i class="icon icon-plugcubed"></i>');
                $msgSpan.css('color', this.toRGB(color && this.isRGB(color) ? color : 'd1d1d1'));
            }

            if (fromID) {
                from = API.getUser(fromID);
                var lastMessageContainer = $('#chat-messages').find('.message').last();
                var lastSender = lastMessageContainer.children('.badge-box').data('uid');

                if (from != null && from.username != null) {
                    if (lastSender == from.id) {
                        lastMessageContainer.find('.text').append('<br>').append($msgSpan);
                        if ($chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - lastMessageContainer.find('.text').height())
                            $chat.scrollTop($chat[0].scrollHeight);
                        return;
                    }

                    $from.find('.un').html(cleanHTMLMessage(from.username));

                    if (this.hasPermission(from.id, API.ROLE.HOST, true)) {
                        $message.addClass('from-admin');
                        $from.addClass('admin').append('<i class="icon icon-chat-admin"></i>');
                    } else if (this.hasPermission(from.id, API.ROLE.BOUNCER, true)) {
                        $message.addClass('from-ambassador');
                        $from.addClass('ambassador').append('<i class="icon icon-chat-ambassador"></i>');
                    } else if (this.hasPermission(from.id, API.ROLE.BOUNCER)) {
                        $from.addClass('staff');
                        if (this.hasPermission(from.id, API.ROLE.HOST))
                            $message.addClass('from-host');
                        if (this.hasPermission(from.id, API.ROLE.COHOST)) {
                            $message.addClass('from-cohost');
                            $from.append('<i class="icon icon-chat-host"></i>');
                        } else if (this.hasPermission(from.id, API.ROLE.MANAGER)) {
                            $message.addClass('from-manager');
                            $from.append('<i class="icon icon-chat-manager"></i>');
                        } else if (this.hasPermission(from.id, API.ROLE.BOUNCER)) {
                            $message.addClass('from-bouncer');
                            $from.append('<i class="icon icon-chat-bouncer"></i>');
                        }
                    } else if (this.hasPermission(from.id, API.ROLE.DJ)) {
                        $message.addClass('from-dj');
                        $from.addClass('dj').append('<i class="icon icon-chat-dj"></i>');
                    } else if (from.id == API.getUser().id) {
                        $message.addClass('from-you');
                        $from.addClass('you');
                    }
                } else if (fromID < 0) {
                    $from.find('.un').html('plug&#179;');
                    if (lastSender == fromID) {
                        lastMessageContainer.find('.text').append('<br>').append($msgSpan);
                        if ($chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - lastMessageContainer.find('.text').height())
                            $chat.scrollTop($chat[0].scrollHeight);
                        return;
                    }
                } else {
                    $from.find('.un').html(fromName ? cleanHTMLMessage(fromName) : 'Unknown');
                }
            } else {
                $from.find('.un').html('plug&#179;');
            }

            $chat.append($message.append($box).append($msg.append($text)));
            if (b) {
                $chat.scrollTop($chat[0].scrollHeight);
            }
        },
        getRoomID: function() {
            return document.location.pathname.split('/')[1];
        },
        getRoomName: function() {
            return $('#room-name').text().trim();
        },
        getUserData: function(uid, key, defaultValue) {
            if (plugCubedUserData[uid] == null || plugCubedUserData[uid][key] == null) {
                return defaultValue;
            }
            return plugCubedUserData[uid][key];
        },
        setUserData: function(uid, key, value) {
            if (plugCubedUserData[uid] == null) {
                plugCubedUserData[uid] = {};
            }
            plugCubedUserData[uid][key] = value;
        },
        getUser: function(data) {
            var method = 'number';
            if (typeof data === 'string') {
                method = 'string';
                data = data.trim();
                if (data.substr(0, 1) === '@')
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
        getLastMessageTime: function(uid) {
            var time = Date.now() - this.getUserData(uid, 'lastChat', this.getUserData(uid, 'joinTime', Date.now()));
            var IgnoreCollection = require('plugCubed/bridges/IgnoreCollection');

            if (IgnoreCollection._byId[uid] === true)
                return p3Lang.i18n('error.ignoredUser');
            return this.getRoundedTimestamp(time, true);
        },
        getUserInfo: function(data) {
            var user = this.getUser(data);
            if (user === null) {
                API.chatLog(p3Lang.i18n('error.userNotFound'));
            } else {
                var rank, status, voted, position, waitlistpos, inbooth, lang, lastMessage, disconnectInfo;

                waitlistpos = API.getWaitListPosition(user.id);
                inbooth = API.getDJ() != null && API.getDJ().id === user.id;
                lang = Lang.languages[user.language];
                lastMessage = this.getLastMessageTime(user.id);
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
                } else if (this.hasPermission(user.id, API.ROLE.DJ)) {
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
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.name') + ' ')).append($('<span>').css('color', '#FFFFFF').text(this.cleanTypedString(user.username)))));
                // Title
                if (title !== '')
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.title') + ' ')).append($('<span>').css('color', '#FFFFFF').html(title))));
                // UserID
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.id') + ' ')).append($('<span>').css('color', '#FFFFFF').text(user.id))));
                // Rank / Time Joined
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.rank') + ' ')).append($('<span>').css('color', '#FFFFFF').text(rank))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.joined') + ' ')).append($('<span>').css('color', '#FFFFFF').text(this.getTimestamp(this.getUserData(user.id, 'joinTime', Date.now()))))));
                // Status / Vote
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.status') + ' ')).append($('<span>').css('color', '#FFFFFF').text(status))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.vote') + ' ')).append($('<span>').css('color', '#FFFFFF').text(voted))));
                // Position
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.position') + ' ')).append($('<span>').css('color', '#FFFFFF').text(position))));
                // Language
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(Lang.languages.label + ' ')).append($('<span>').css('color', '#FFFFFF').text(lang))));
                // Last Message
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastMessage') + ' ')).append($('<span>').css('color', '#FFFFFF').text(lastMessage))));
                // Woot / Meh
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.wootCount') + ' ')).append($('<span>').css('color', '#FFFFFF').text(this.getUserData(user.id, 'wootcount', 0)))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.mehCount') + ' ')).append($('<span>').css('color', '#FFFFFF').text(this.getUserData(user.id, 'mehcount', 0)))));
                // Ratio
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.ratio') + ' ')).append($('<span>').css('color', '#FFFFFF').text((function(a, b) {
                    if (b === 0) return a === 0 ? '0:0' : '1:0';
                    for (var i = 1; i <= b; i++) {
                        var e = i * (a / b);
                        if (e % 1 === 0) return e + ':' + i;
                    }
                })(this.getUserData(user.id, 'wootcount', 0), this.getUserData(user.id, 'mehcount', 0))))));
                // Disconnects
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.disconnects') + ' ')).append($('<span>').css('color', '#FFFFFF').text(disconnectInfo.count))));
                if (disconnectInfo.count > 0) {
                    // Last Position
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastPosition') + ' ')).append($('<span>').css('color', '#FFFFFF').text(disconnectInfo.position < 0 ? 'Wasn\'t in booth nor waitlist' : (disconnectInfo.position === 0 ? 'Was DJing' : 'Was ' + disconnectInfo.position + ' in waitlist')))));
                    // Lase Disconnect Time
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastDisconnect') + ' ')).append($('<span>').css('color', '#FFFFFF').text(this.getTimestamp(disconnectInfo.time)))));
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
            // Should get another sound, until then - use mention sound
            this.playMentionSound();
        },
        playMentionSound: function() {
            if (!runLite && Database.settings.chatSound) {
                (new Audio(require('app/utils/UI').sfx)).play();
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
        getRoundedTimestamp: function(t, milliseconds) {
            if (milliseconds)
                t = Math.floor(t / 1000);

            var units = {
                week: 604800,
                day: 86400,
                hour: 3600,
                minute: 60,
                second: 1
            };

            for (var i in units) {
                if (!units.hasOwnProperty(i)) continue;
                var unit = units[i];
                if (t < unit) continue;
                var numberOfUnit = Math.floor(t / unit);
                return numberOfUnit + ' ' + i + (numberOfUnit > 1 ? 's' : '') + ' ago';
            }

            return 'Unknown';
        },
        formatTime: function(seconds) {
            var hours, minutes;

            minutes = Math.floor(seconds / 60);
            seconds -= minutes * 60;

            if (minutes < 60)
                return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

            hours = Math.floor(minutes / 60);
            minutes -= hours * 60;

            return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        },
        randomRange: function(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },
        isRGB: function(text) {
            return typeof text === 'string' ? /^(#|)(([0-9A-F]{6}$)|([0-9A-F]{3}$))/i.test(text) : false;
        },
        toRGB: function(text) {
            return this.isRGB(text) ? text.substr(0, 1) === '#' ? text : '#' + text : undefined;
        },
        isNumber: function(text) {
            return typeof text === 'string' ? !isNaN(parseInt(text, 10)) && isFinite(text) : false;
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
            return url.indexOf('#') > -1 ? url.substr(0, url.indexOf('#')) : (url.indexOf('?') > -1 ? url.substr(0, url.indexOf('?')) : url);
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
        },
        objectSelector: function(obj, selector, defaultValue) {
            var a = obj;

            var key = selector.split('.');

            for (var i in key) {
                if (!key.hasOwnProperty(i)) continue;
                if (a[key[i]] == null) {
                    return defaultValue;
                }
                a = a[key[i]];
            }

            return a;
        },
        statusREST: function(call) {
            var time;
            $.ajax({
                url: 'https://plug.dj/_/rooms',
                type: 'HEAD',
                cache: false,
                crossDomain: true,
                timeout: 10000,
                beforeSend: function() {
                    time = Date.now();
                },
                complete: function(req) {
                    call(req.status, req.statusText, Date.now() - time);
                }
            });
        },
        statusSocket: function(call) {
            var SockJS = require('sockjs'),
                att = 0,
                time = Date.now(),
                conn;

            function connect() {
                conn = new SockJS('https://shalamar.plug.dj:443/socket');
                conn.onopen = function() {
                    conn.close();
                };
                conn.onclose = function(req) {
                    if (req.code !== 1000) {
                        if (att < 3) setTimeout(connect, 500);
                        if (att === 3) call(req.code, req.reason, Date.now() - time);
                        att++;
                        return;
                    }
                    call(req.code, req.reason, Date.now() - time);
                }
            }

            connect();
        }
    });
    return new handler();
});