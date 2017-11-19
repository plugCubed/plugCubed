define(['plugCubed/Class', 'plugCubed/Lang', 'plugCubed/ModuleLoader'], function(Class, p3Lang) {
    var cleanHTMLMessage, Database, developer, sponsor, ambassador, donatorDiamond, donatorPlatinum, donatorGold, donatorSilver, donatorBronze, special, Lang, PlugUI, PopoutView, html2text, Settings;

    if (typeof window.plugCubedUserData === 'undefined') {
        window.plugCubedUserData = {};
    }
    var plugcubedUserData = window.plugCubedUserData;

    cleanHTMLMessage = function(input, disallow, extraAllow) {
        if (input == null) return '';
        var allowed, tags;
        var disallowed = [];

        if (_.isArray(disallow)) {
            disallowed = disallow;
        }
        if (!extraAllow || !_.isArray(extraAllow)) {
            extraAllow = [];
        }
        allowed = $(['blockquote', 'code', 'span', 'div', 'table', 'tr', 'td', 'br', 'br/', 'strong', 'em', 'a'].concat(extraAllow)).not(disallowed).get();
        if (disallow === '*') {
            allowed = [];
        }
        tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        input = input.split('&#8237;').join('&amp;#8237;').split('&#8238;').join('&amp;#8238;');

        return input.replace(tags, function(a, b) {
            return allowed.indexOf(b.toLowerCase()) > -1 ? a : '';
        });
    };
    Database = window.plugCubedModules.database;
    Lang = window.plugCubedModules.Lang;
    PopoutView = window.plugCubedModules.PopoutView;
    developer = sponsor = ambassador = donatorDiamond = donatorPlatinum = donatorGold = donatorSilver = donatorBronze = [];
    special = {};

    PlugUI = window.plugCubedModules.plugUrls;

    $.getJSON('https://plugcubed.net/scripts/titles.json',

        /**
         * @param {{developer: Array, sponsor: Array, special: Array, ambassador: Array, donator: {diamond: Array, platinum: Array, gold: Array, silver: Array, bronze: Array}, patreon: {diamond: Array, platinum: Array, gold: Array, silver: Array, bronze: Array}}} data Object of User ID's for plug³ ranks.
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

    html2text = function(html) {
        if (!html) return '';

        var doc;

        // use DOMParser for html
        try {
            var parser = new DOMParser();

            doc = parser.parseFromString(html, 'text/html');
        } catch (ex) { /* noop */ }

        // fallback to document.implementation
        if (!doc) {
            try {
                doc = document.implementation.createHTMLDocument('');
                if (/<\/?(html|head|body)[>]*>/gi.test(html)) {
                    doc.documentElement.innerHTML = html;
                } else {
                    doc.body.innerHTML = html;
                }
            } catch (ex2) { /* noop */ }
        }

        if (doc) return doc.body.textContent || doc.body.text || doc.body.innerText;

        // fallback to old method (warnings on mixed content)
        return $('<div/>').html(html).text();
    };

    var Handler = Class.extend({
        proxifyImage: function(url) {
            if (!this.startsWithIgnoreCase(url, 'https://api.plugCubed.net/proxy/')) {
                return 'https://api.plugCubed.net/proxy/' + url;
            }

            return url;
        },
        escapeRegex: function(text) {
            return text.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
        },
        getHighestRank: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

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
        closePlugMenus: function() {
            return $('#playlist-button .icon-arrow-down,#history-button .icon-arrow-up,#footer-user.showing .back').click();

        },
        generateEmoteHash: function() {
            var i, emoteHash, allEmotes, firstChar, emoji;

            Settings = require('plugCubed/Settings');
            emoteHash = window.plugCubed.emotes.emoteHash = {};
            allEmotes = $.extend({}, (Settings.emotes.twitchEmotes ? window.plugCubed.emotes.twitchEmotes : {}), (Settings.emotes.twitchSubEmotes ? window.plugCubed.emotes.twitchSubEmotes : {}), (Settings.emotes.tastyEmotes ? window.plugCubed.emotes.tastyEmotes : []), (Settings.emotes.bttvEmotes ? window.plugCubed.emotes.bttvEmotes : {}), (Settings.emotes.ffzEmotes ? window.plugCubed.emotes.ffzEmotes : {}));

            if (typeof allEmotes === 'object' && allEmotes === null) return {};

            for (i in allEmotes) {
                if (!allEmotes.hasOwnProperty(i)) continue;

                emoji = allEmotes[i];
                firstChar = emoji.emote.charAt(0).toLowerCase();
                if (!emoteHash[firstChar]) {
                    emoteHash[firstChar] = [];
                    emoteHash[firstChar].longest = 0;
                }
                emoteHash[firstChar].push(emoji.emote.toLowerCase());
                if (emoji.emote.length > emoteHash[firstChar].longest) {
                    emoteHash[firstChar].longest = emoji.emote.length;
                }
            }

        },
        merge: function(caseSensitive, key) {
            var arr, args, argsLength, hash, i, j;

            args = arguments;
            argsLength = args.length;
            if (typeof caseSensitive !== 'boolean' && typeof caseSensitive === 'string') {
                key = caseSensitive;
                caseSensitive = true;
            }
            if (typeof key !== 'string') {
                throw new TypeError('Second argument needs to be a key string');
            }

            hash = {};
            arr = [];
            for (i = 2; i < argsLength; i++) {
                var argArr = args[i];

                if (!(Array.isArray(argArr) && argArr.length > 0)) continue;

                var argArrLength = argArr.length;

                for (j = 0; j < argArrLength; j++) {
                    var argArrItem = argArr[j];
                    var argArrKey = argArrItem[key];

                    if (!caseSensitive && argArrKey) {
                        argArrKey = argArrKey.toLowerCase();
                    }

                    if (argArrKey != null && hash[argArrKey] !== true) {
                        arr.push(argArrItem);
                        hash[argArrKey] = true;
                    }
                }
            }

            return arr;
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
                if (this.hasPermission(uid, window.plugCubedModules.GROLE.ADMIN, true)) {
                    ranks.push(Lang.roles.admin);
                } else if (this.hasPermission(uid, API.ROLE.COHOST, true)) {
                    ranks.push(Lang.roles.leader);
                } else if (this.hasPermission(uid, window.plugCubedModules.GROLE.AMBASSADOR, true)) {
                    ranks.push(Lang.roles.ambassador);
                } else if (this.hasPermission(uid, window.plugCubedModules.GROLE.SITEMOD, true)) {
                    ranks.push(Lang.roles.sitemod);
                } else if (this.hasPermission(uid, API.ROLE.BOUNCER, true)) {
                    ranks.push(Lang.roles.volunteer);
                } else if (this.hasPermission(uid, window.plugCubedModules.GROLE.PLOT, true)) {
                    ranks.push(Lang.roles.plot);
                } else if (this.hasPermission(uid, window.plugCubedModules.GROLE.PROMOTER, true)) {
                    ranks.push(Lang.roles.promoter);
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
        is24Hours: function() {
            return $('.icon-timestamps-24').length === 1;
        },
        isPlugCubedDeveloper: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return developer.indexOf(uid) > -1;
        },
        isPlugCubedSponsor: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return sponsor.indexOf(uid) > -1;
        },
        isPlugCubedSpecial: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return this.getPlugCubedSpecial(uid) != null;
        },
        isPlugCubedAmbassador: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return ambassador.indexOf(uid) > -1;
        },
        isPlugCubedDonatorDiamond: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return donatorDiamond.indexOf(uid) > -1;
        },
        isPlugCubedDonatorPlatinum: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return donatorPlatinum.indexOf(uid) > -1;
        },
        isPlugCubedDonatorGold: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return donatorGold.indexOf(uid) > -1;
        },
        isPlugCubedDonatorSilver: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return donatorSilver.indexOf(uid) > -1;
        },
        isPlugCubedDonatorBronze: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return donatorBronze.indexOf(uid) > -1;
        },
        getPlugCubedSpecial: function(uid) {
            if (!uid) {
                uid = API.getUser().id;
            }

            return special[uid];
        },
        html2text: function(html) {
            return html2text(html);
        },
        cleanHTML: function(msg, disallow, extraAllow) {
            return cleanHTMLMessage(msg, disallow, extraAllow);
        },
        cleanTypedString: function(msg) {
            return msg.split('<').join('&lt;').split('>').join('&gt;');
        },
        repeatString: function(str, count) {
            count = +count;

            if (!_.isFinite(count) || count < 0) throw new RangeError("Count can't be less than zero");

            count = Math.floor(count);

            if (str.length === 0 || count === 0) {
                return '';
            }

            return new Array(count + 1).join(str);
        },
        chatLog: function(type, message, color, fromID, fromName) {
            var $chat, b, $message, $box, $msg, $text, $msgSpan, $timestamp, $from, fromUser, chat, lastMessage, lastMessageData;

            chat = window.plugCubedModules.chat;

            if (!message) return;
            if (typeof message !== 'string') {
                message = message.html();
            }

            message = cleanHTMLMessage(message, undefined, ['ul', 'li']);
            $msgSpan = $('<span>').html(message);
            $chat = PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages');
            b = $chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - 20;

            $message = $('<div>').addClass('message');
            if (require('plugCubed/Settings').badges) {
                $box = $('<div>').addClass('badge-box').data('uid', fromID ? fromID : 'p3').data('type', type);
            } else {
                $box = $('<div style="display: inline !important;">').addClass('badge-box').data('uid', fromID ? fromID : 'p3').data('type', type);
            }
            $timestamp = $('<span>').addClass('timestamp').text(this.getTimestamp());
            $from = $('<div>').addClass('from').append($('<span>').addClass('un')).append($timestamp);
            $msg = $('<div>').addClass('msg').append($from);
            $text = $('<span>').addClass('text').append($msgSpan);

            chat.lastText = chat.lastID = chat.lastType = chat.lastTime = null;

            if ($('.icon-timestamps-off').length === 0) {
                $timestamp.show();
            }
            $msgSpan.css('color', this.toRGB(color && this.isRGB(color) ? color : 'd1d1d1'));
            $box.append('<i class="icon icon-plugcubed"></i>');
            $box.click(function() {
                $(this).parent().remove();
            }).mouseover(function() {
                $(this).find('.icon').removeClass().addClass('icon icon-x-grey').css({
                    cursor: 'pointer'
                });
            }).mouseout(function() {
                $(this).find('.icon').removeClass().addClass('icon icon-plugcubed').css({
                    cursor: 'default'
                });
            });

            if (fromID) {
                fromUser = API.getUser(fromID);
                var lastMessageContainer = $('#chat-messages').find('.message').last();
                var lastSender = lastMessageContainer.children('.badge-box').data('uid');
                var lastType = lastMessageContainer.children('.badge-box').data('type');

                if (fromUser != null && fromUser.username != null) {
                    if (lastSender === fromUser.id) {
                        lastMessage = lastMessageContainer.find('.text');
                        lastMessageData = lastMessageContainer.data('lastMessageData') || {};

                        if (lastMessage.text().indexOf('Stats:') > -1) {
                            $chat.append($message.append($box).append($msg.append($text)));
                        } else if (lastMessageData[fromUser.id] && lastMessageData[fromUser.id].count) {
                            lastMessage.html($msgSpan.append(' (' + ++lastMessageData[fromUser.id].count + 'x)'));
                        } else {
                            lastMessageData[fromUser.id] = {
                                count: 1
                            };
                        }

                        if ($chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - lastMessageContainer.find('.text').height()) {
                            $chat.scrollTop($chat[0].scrollHeight);
                        }

                        lastMessageContainer.data({
                            lastMessageData: lastMessageData
                        });

                        return;
                    }
                    if (fromName && fromName.indexOf('(friend)') !== -1) {
                        $from.find('.un').html(cleanHTMLMessage(fromName));
                    } else {
                        $from.find('.un').html(cleanHTMLMessage(fromUser.username));
                    }

                    if (this.hasPermission(fromUser.id, window.plugCubedModules.GROLE.ADMIN, true)) {
                        $message.addClass('from-admin');
                        $from.addClass('admin').append('<i class="icon icon-chat-admin"></i>');
                    } else if (this.hasPermission(fromUser.id, window.plugCubedModules.GROLE.AMBASSADOR, true)) {
                        $message.addClass('from-ambassador');
                        $from.addClass('ambassador').append('<i class="icon icon-chat-ambassador"></i>');
                    } else if (this.hasPermission(fromUser.id, window.plugCubedModules.GROLE.SITEMOD, true)) {
                        $message.addClass('from-sitemod');
                        $from.addClass('sitemod').append('<i class="icon icon-chat-sitemod"></i>');
                    } else if (this.hasPermission(fromUser.id, window.plugCubedModules.PLOT, true)) {
                        $message.addClass('from-plot');
                        $from.addClass('plot').append('<i class="icon icon-chat-plot"></i>');
                    } else if (this.hasPermission(fromUser.id, window.plugCubedModules.GROLE.PROMOTER, true)) {
                        $message.addClass('from-promoter');
                        $from.addClass('plot').append('<i class="icon icon-chat-promoter"></i>');
                    } else if (this.hasPermission(fromUser.id, API.ROLE.BOUNCER)) {
                        $from.addClass('staff');
                        if (this.hasPermission(fromUser.id, API.ROLE.HOST)) {
                            $message.addClass('from-host');
                            $from.append('<i class="icon icon-chat-host"></i>');

                        } else if (this.hasPermission(fromUser.id, API.ROLE.COHOST)) {
                            $message.addClass('from-cohost');
                            $from.append('<i class="icon icon-chat-cohost"></i>');
                        } else if (this.hasPermission(fromUser.id, API.ROLE.MANAGER)) {
                            $message.addClass('from-manager');
                            $from.append('<i class="icon icon-chat-manager"></i>');
                        } else if (this.hasPermission(fromUser.id, API.ROLE.BOUNCER)) {
                            $message.addClass('from-bouncer');
                            $from.append('<i class="icon icon-chat-bouncer"></i>');
                        }
                    } else if (this.hasPermission(fromUser.id, API.ROLE.DJ)) {
                        $message.addClass('from-dj');
                        $from.addClass('dj').append('<i class="icon icon-chat-dj"></i>');
                    } else if (fromUser.id === API.getUser().id) {
                        $message.addClass('from-you');
                        $from.addClass('you');
                    }
                } else if (fromID < 0) {
                    $from.find('.un').html('plug&#179;');
                    if (lastSender === fromID && type === lastType) {
                        lastMessage = lastMessageContainer.find('.text');
                        lastMessageData = lastMessageContainer.data('lastMessageData') || {};

                        if (lastMessage.text().indexOf('Stats:') > -1) {
                            $chat.append($message.append($box).append($msg.append($text)));
                        } else if (lastMessageData[fromID]) {
                            lastMessage.html($msgSpan.append(' (' + ++lastMessageData[fromUser.id].count + 'x)'));
                        } else {
                            lastMessageData[fromID] = {
                                count: 1
                            };
                        }

                        if ($chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - lastMessageContainer.find('.text').height()) {
                            $chat.scrollTop($chat[0].scrollHeight);
                        }

                        lastMessageContainer.data({
                            lastMessageData: lastMessageData
                        });

                        return;
                    }
                } else {
                    $from.find('.un').html((fromName ? cleanHTMLMessage(fromName) : 'Unknown'));
                }
            } else {
                $from.find('.un').html((fromName ? cleanHTMLMessage(fromName) : 'plug&#179;'));
            }

            $chat.append($message.append($box).append($msg.append($text)));
            if (b) {
                $chat.scrollTop($chat[0].scrollHeight);
            }
        },
        getRoomID: function() {
            var defaultID = document.location.pathname.split('/')[1];

            return this.objectSelector(window.plugCubedModules, 'room.attributes.slug', defaultID).trim();
        },
        getRoomName: function() {
            var $roomName = $('#room-name').text().trim();

            return this.objectSelector(window.plugCubedModules, 'room.attributes.name', $roomName).trim();
        },
        getUserData: function(uid, key, defaultValue) {
            if (plugcubedUserData[uid] == null || plugcubedUserData[uid][key] == null) {
                return defaultValue;
            }

            return plugcubedUserData[uid][key];
        },
        setUserData: function(uid, key, value) {
            if (plugcubedUserData[uid] == null) {
                plugcubedUserData[uid] = {};
            }
            plugcubedUserData[uid][key] = value;
        },
        getUser: function(data) {
            var method = 'number';

            if (typeof data === 'string') {
                method = 'string';
                data = data.trim();
                if (data.substr(0, 1) === '@') {
                    data = data.substr(1);
                }
            }

            var users = API.getUsers();

            for (var i = 0; i < users.length; i++) {
                if (!users[i]) continue;
                if (method === 'string') {
                    if (this.equalsIgnoreCase(users[i].username, data) || this.equalsIgnoreCaseTrim(users[i].id.toString(), data)) {
                        return users[i];
                    }
                    continue;
                }
                if (method === 'number') {
                    if (users[i].id === data) {
                        return users[i];
                    }
                }
            }

            return null;
        },
        getLastMessageTime: function(uid) {
            var time = Date.now() - this.getUserData(uid, 'lastChat', this.getUserData(uid, 'joinTime', Date.now()));
            var IgnoreCollection = window.plugCubedModules.ignoreCollection;

            if (IgnoreCollection._byId[uid] === true) {
                return p3Lang.i18n('error.ignoredUser');
            }

            return this.getRoundedTimestamp(time, true);
        },
        getUserInfo: function(data) {
            var user = this.getUser(data);

            if (user === null) {
                this.chatLog(undefined, p3Lang.i18n('error.userNotFound'));
            } else {
                var rank, status, voted, position, waitlistpos, inbooth, lang, lastMessage, disconnectInfo;

                waitlistpos = API.getWaitListPosition(user.id);
                inbooth = API.getDJ() != null && API.getDJ().id === user.id;
                lang = Lang.languages[user.language];
                lastMessage = this.getLastMessageTime(user.id);
                disconnectInfo = this.getUserData(user.id, 'disconnects', {
                    count: 0
                });

                if (this.hasPermission(user.id, window.plugCubedModules.GROLE.ADMIN, true)) {
                    rank = Lang.roles.admin;
                } else if (this.hasPermission(user.id, API.ROLE.COHOST, true)) {
                    rank = Lang.roles.leader;
                } else if (this.hasPermission(user.id, window.plugCubedModules.GROLE.AMBASSADOR, true)) {
                    rank = Lang.roles.ambassador;
                } else if (this.hasPermission(user.id, window.plugCubedModules.GROLE.SITEMOD, true)) {
                    rank = Lang.roles.sitemod;
                } else if (this.hasPermission(user.id, API.ROLE.BOUNCER, true)) {
                    rank = Lang.roles.volunteer;
                } else if (this.hasPermission(user.id, window.plugCubedModules.GROLE.PLOT, true)) {
                    rank = Lang.roles.plot;
                } else if (this.hasPermission(user.id, window.plugCubedModules.GROLE.PROMOTER, true)) {
                    rank = Lang.roles.promoter;
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

                status = Lang.userStatus.online;

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
                if (inbooth) {
                    voted = p3Lang.i18n('vote.djing');
                }

                var title = this.getAllPlugCubedRanks(user.id, true);
                var message = $('<table>').css({
                    width: '100%',
                    color: '#CC00CC',
                    'font-size': '1.02em'
                });

                // Username
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.name') + ' ')).append($('<span>').css('color', '#FFFFFF').text(this.cleanTypedString(user.username)))));

                // Title
                if (title !== '') {
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.title') + ' ')).append($('<span>').css('color', '#FFFFFF').html(title))));
                }

                // UserID
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.id') + ' ')).append($('<span>').css('color', '#FFFFFF').text(user.id))));

                // Profile
                if (user.level > 5 && typeof user.slug === 'string' && user.slug.length > 0) {
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text('Slug ')).append($('<span>').css('color', '#FFFFFF').text(user.slug))));
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.profile') + ' ')).append($('<span>').css('color', '#FFFFFF').html($('<a>').attr('href', 'https://plug.dj/@/' + user.slug).text('https://plug.dj/@/' + user.slug)))));
                }

                // joined
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text('Joined ')).append($('<span>').css('color', '#FFFFFF').text(user.joined))));

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
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastPosition') + ' ')).append($('<span>').css('color', '#FFFFFF').text(disconnectInfo.position < 0 ? "Wasn't in booth nor waitlist" : (disconnectInfo.position === 0 ? 'Was DJing' : 'Was ' + disconnectInfo.position + ' in waitlist')))));

                    // Last Disconnect Time
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastDisconnect') + ' ')).append($('<span>').css('color', '#FFFFFF').text(this.getTimestamp(disconnectInfo.time)))));
                }

                this.chatLog(undefined, $('<div>').append(message).html());
            }
        },
        hasPermission: function(uid, permission, hasGRole) {
            var user = API.getUser(uid);

            if (user && user.id) {
                return hasGRole ? user.gRole >= permission : user.role >= permission || user.gRole >= permission;
            }

            return false;
        },
        getAllUsers: function() {
            var table = $('<table>').css({
                width: '100%',
                color: '#CC00CC'
            });
            var users = API.getUsers();

            for (var i = 0; i < users.length; i++) {
                var user = users[i];

                table.append($('<tr>').append($('<td>').append(user.username)).append($('<td>').append(user.id)));
            }
            this.chatLog(undefined, $('<div>').append(table).html());
        },
        playChatSound: function() {

            // Should get another sound, until then - use mention sound
            this.playMentionSound();
        },
        playMentionSound: function(playCount) {
            if (!playCount) playCount = 2;

            var count = 0;

            if (Database.settings.chatSound) {
                var mentionSound = new Audio(PlugUI.sfx);

                mentionSound.addEventListener('ended', function() {
                    count++;
                    if (playCount === count) return mentionSound.pause();
                    mentionSound.currentTime = 0;
                    mentionSound.play();

                });
                mentionSound.play();
            }
        },
        getTimestamp: function(t, format) {
            var time, hours, minutes, seconds;
            var postfix = '';

            if (!format) {
                format = 'hh:mm';
            }

            time = t ? new Date(t) : new Date();

            hours = time.getHours();
            minutes = time.getMinutes();
            seconds = time.getSeconds();

            if (!this.is24Hours()) {
                if (hours < 12) {
                    postfix = 'am';
                } else {
                    postfix = 'pm';
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
            if (milliseconds) {
                t = Math.floor(t / 1000);
            }

            var units = {
                year: 31536000,
                month: 2592000,
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

            if (minutes < 60) {
                return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            }

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
                } else if (_.isArray(b)) {
                    for (var c = 0; c < b.length; c++) {
                        if (!b[c]) continue;
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
                    return a.indexOf(b, a.length - b.length) !== -1;
                } else if (_.isArray(b)) {
                    for (var c = 0; c < b.length; c++) {
                        if (!b[c]) continue;
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
                } else if (_.isArray(b)) {
                    for (var c = 0; c < b.length; c++) {
                        if (!b[c]) continue;
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
                } else if (_.isArray(b)) {
                    for (var c = 0; c < b.length; c++) {
                        if (!b[c]) continue;
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
            var i;
            var ret = [];

            for (i = 0; i < length; i++) {
                ret.push(chars.substr(Math.floor(Math.random() * chars.length), 1));
            }

            return ret.join('');
        },
        getRank: function(user) {
            user = API.getUser(user);
            if (user.gRole) {
                return user.gRole === window.plugCubedModules.GROLE.ADMIN ? 'admin' : user.gRole === API.ROLE.COHOST ? 'leader' : user.gRole === window.plugCubedModules.GROLE.AMBASSADOR ? 'ambassador' : user.gRole === window.plugCubedModules.GROLE.SITEMOD ? 'sitemod' : user.gRole === API.ROLE.BOUNCER ? 'volunteer' : user.gRole === window.plugCubedModules.GROLE.PLOT ? 'plot' : user.grole === window.plugCubedModules.GROLE.PROMOTER ? 'promoter' : 'none';
            }

            return ['regular', 'dj', 'bouncer', 'manager', 'cohost', 'host'][(user.role > 999 ? user.role / 1000 : user.role) || 0];
        },
        logColors: {
            userCommands: '66FFFF',
            modCommands: 'FF0000',
            infoMessage1: 'FFFF00',
            infoMessage2: '66FFFF'
        },
        objectSelector: function(obj, selector, defaultValue) {
            var a = obj;

            if (typeof a === 'object' && a == null) return defaultValue;

            var key = selector.split('.');

            for (var i = 0; i < key.length; i++) {
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
        getOrdinal: function(num) {
            var suffixes = ['th', 'st', 'nd', 'rd'];
            var remainder = num % 100;

            return num + (suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0]);

        },
        statusSocket: function(call) {
            var att = 0;
            var time = Date.now();
            var conn;

            function connect() {
                conn = new WebSocket('wss://godj.plug.dj:443/socket');
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
                };
            }
            connect();
        }
    });

    return new Handler();
});
