/**
 * @license Copyright © 2012-2015 The plug³ Team and other contributors
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */
var plugCubed;
if (typeof plugCubed !== 'undefined')
    plugCubed.close();
/**
 Simple JavaScript Inheritance
 By John Resig http://ejohn.org/
 MIT Licensed.

 Modified by Plug DJ, Inc.
 */
define('fefed4/d778d3', [], function() {
    var e, t, n;
    e = false;
    t = /xyz/.test(function() {
        xyz
    }) ? /\b_super\b/ : /.*/;
    n = function() {};
    n.extend = function(n) {
        var r = this.prototype;

        e = true;
        var i = new this;
        e = false;

        for (var s in n) {
            if (!n.hasOwnProperty(s)) continue;
            if (typeof n[s] == "function" && typeof r[s] == "function" && t.test(n[s])) {
                i[s] = function(e, t) {
                    return function() {
                        var n = this._super;
                        this._super = r[e];
                        var i = t.apply(this, arguments);
                        this._super = n;
                        return i;
                    }
                }(s, n[s]);
            } else {
                i[s] = n[s];
            }
        }

        function Class() {
            !e && this.init && this.init.apply(this, arguments)
        }

        Class.prototype = i;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };
    return n;
});
define('fefed4/ae602d/c7c1ce', ['jquery', 'fefed4/d778d3'], function($, Class) {
    return Class.extend({
        triggerHandlers: [],
        trigger: undefined,
        registered: false,
        init: function() {
            var i;
            if (this.triggerHandlers.length > 0)
                this.close();
            this.triggerHandlers = [];
            if (this.trigger == null)
                throw new Error('Missing TriggerHandler trigger!');
            if (typeof this.trigger === 'string') {
                this.triggerHandlers[this.trigger] = this.handler;
            } else if ($.isArray(this.trigger)) {
                for (i in this.trigger) {
                    if (!this.trigger.hasOwnProperty(i)) continue;
                    if (typeof this[this.trigger[i]] === 'function') {
                        this.triggerHandlers[this.trigger[i]] = this[this.trigger[i]];
                    } else {
                        this.triggerHandlers[this.trigger[i]] = this.handler;
                    }
                }
            } else if ($.isPlainObject(this.trigger)) {
                for (i in this.trigger) {
                    if (!this.trigger.hasOwnProperty(i)) continue;
                    this.triggerHandlers[i] = this.trigger[i];
                }
            }
        },
        register: function() {
            var i;
            for (i in this.triggerHandlers) {
                if (!this.triggerHandlers.hasOwnProperty(i)) continue;
                if (typeof this.triggerHandlers[i] === 'function') {
                    API.on(i, this.triggerHandlers[i], this);
                } else if (typeof this[this.triggerHandlers[i]] === 'function') {
                    API.on(i, this[this.triggerHandlers[i]], this);
                }
            }
            this.registered = true;
        },
        close: function() {
            var i;
            for (i in this.triggerHandlers) {
                if (!this.triggerHandlers.hasOwnProperty(i)) continue;
                if (typeof this.triggerHandlers[i] === 'function') {
                    API.off(i, this.triggerHandlers[i], this);
                    delete this.triggerHandlers[i];
                } else if (typeof this[this.triggerHandlers[i]] === 'function') {
                    API.off(i, this[this.triggerHandlers[i]], this);
                    delete this[this.triggerHandlers[i]];
                }
            }
            this.registered = false;
        }
    });
});
define('fefed4/d10ed2', ['jquery', 'fefed4/d778d3'], function($, Class) {
    var language, defaultLanguage, _this, Lang;

    language = {};
    defaultLanguage = {};

    Lang = Class.extend({
        curLang: 'en',
        defaultLoaded: false,
        loaded: false,
        init: function() {
            _this = this;
            $.getJSON('https://d1rfegul30378.cloudfront.net/files/lang.json?_' + Date.now(), function(a) {
                _this.allLangs = a;
            }).done(function() {
                if (_this.allLangs.length === 1) API.chatLog('Error loading language info for plug³');
                _this.loadDefault();
            }).fail(function() {
                API.chatLog('Error loading language info for plug³');
                _this.loadDefault();
            });
        },
        /**
         * Load default language (English) from server.
         */
        loadDefault: function() {
            $.getJSON('https://d1rfegul30378.cloudfront.net/files/langs/lang.en.json?_' + Date.now(), function(languageData) {
                defaultLanguage = languageData;
                _this.defaultLoaded = true;
            }).error(function() {
                setTimeout(function() {
                    _this.loadDefault();
                }, 500);
            });
        },
        /**
         * Load language file from server.
         * @param {Function} [callback] Optional callback that will be called on success and failure.
         */
        load: function(callback) {
            if (!this.defaultLoaded) {
                setTimeout(function() {
                    _this.load(callback);
                }, 500);
                return;
            }
            var lang = API.getUser().language;
            if (!lang || lang === 'en' || this.allLangs.indexOf(lang) < 0) {
                language = {};
                $.extend(true, language, defaultLanguage);
                this.curLang = 'en';
                this.loaded = true;
                if (typeof callback === 'function') callback();
                return;
            }
            $.getJSON('https://d1rfegul30378.cloudfront.net/files/langs/lang.' + lang + '.json?_' + Date.now(), function(languageData) {
                language = {};
                $.extend(true, language, defaultLanguage, languageData);
                _this.curLang = lang;
                _this.loaded = true;
                if (typeof callback === 'function') callback();
            }).error(function() {
                console.log('[plug³] Couldn\'t load language file for ' + lang);
                language = {};
                $.extend(true, language, defaultLanguage);
                _this.curLang = 'en';
                _this.loaded = true;
                if (typeof callback === 'function') callback();
            });
        },
        /**
         * Get string from language file.
         * @param {String} selector Selector key
         * @returns {*} String from language file, if not found returns selector and additional arguments.
         */
        i18n: function(selector) {
            var a = language,
                i;
            if (a == null || selector == null) {
                return '{' + $.makeArray(arguments).join(', ') + '}';
            }
            var key = selector.split('.');
            for (i in key) {
                if (!key.hasOwnProperty(i)) continue;
                if (a[key[i]] == null) {
                    return '{' + $.makeArray(arguments).join(', ') + '}';
                }
                a = a[key[i]];
            }
            if (arguments.length > 1) {
                for (i = 1; i < arguments.length; i++)
                    a = a.split('%' + i).join(arguments[i]);
            }
            return a;
        },
        allLangs: [{
            "file": "en",
            "name": "English"
        }]
    });
    return new Lang();
});
var plugCubedUserData;
define('fefed4/b98817', ['fefed4/d778d3', 'fefed4/d10ed2', 'lang/Lang'], function(Class, p3Lang, Lang) {
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
    runLite = !requirejs.defined('ac791/c8365/bfc1b');

    if (!runLite) {
        PopoutView = require('ac791/b6b41/ada16/d8b38/b6ec5');
        ChatFacade = require('ac791/ef099/fd000');
        Database = require('ac791/e1740/d7ae3');
    } else {
        ChatFacade = {
            uiLanguages: [],
            chatLanguages: []
        };
    }

    $.getJSON('https://d1rfegul30378.cloudfront.net/titles.json',
        /**
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
            var $chat, b, $message, $box, $msg, $text, $msgSpan, $timestamp, $from, from;

            if (!message) return;
            if (typeof message !== 'string') message = message.html();

            message = cleanHTMLMessage(message, undefined, ['ul', 'li']);
            $msgSpan = $('<span>').html(message);

            $chat = !runLite && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages');
            b = $chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - 20;

            $message = $('<div>').addClass(type ? type : 'message');
            $box = $('<div>').addClass('badge-box').data('uid', fromID ? fromID : 'p3');
            $timestamp = $('<span>').addClass('timestamp').text(this.getTimestamp());
            $from = $('<div>').addClass('from').append($('<span>').addClass('un')).append($timestamp);
            $msg = $('<div>').addClass('msg').append($from);
            $text = $('<span>').addClass('text').append($msgSpan);

            if ($('.icon-timestamps-off').length === 0) {
                $timestamp.show();
            }

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
            var IgnoreCollection = require('fefed4/e89711/defb48');

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
                if (inbooth) voted = p3Lang.i18n('vote.djing');

                var title = this.getAllPlugCubedRanks(user.id, true),
                    message = $('<table>').css({
                        width: '100%',
                        color: '#CC00CC',
                        'font-size': '1.02em'
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
                    color: '#CC00CC'
                }),
                users = API.getUsers();
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
                (new Audio(require('ac791/cb61a/bd08e').sfx)).play();
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
            var att = 0,
                time = Date.now(),
                conn;

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
    return new handler();
});
define('fefed4/adb763', ['jquery', 'fefed4/d778d3', 'fefed4/b98817'], function($, Class, p3Utils) {
    var PopoutView, obj, styles = {},
        imports = [];

    if (!p3Utils.runLite) {
        PopoutView = require('ac791/b6b41/ada16/d8b38/b6ec5');
    }

    function update() {
        var a = '',
            i;
        for (i in imports) {
            if (imports.hasOwnProperty(i))
                a += '@import url("' + imports[i] + '");\n';
        }
        for (i in styles) {
            if (styles.hasOwnProperty(i))
                a += styles[i] + '\n';
        }
        obj.text(a);
        if (PopoutView && PopoutView._window)
            $(PopoutView._window.document).find('#plugCubedStyles').text(a);
    }

    var a = Class.extend({
        init: function() {
            obj = $('<style type="text/css">');
            $('body').prepend(obj);
        },
        getList: function() {
            for (var key in styles) {
                if (!styles.hasOwnProperty(key)) continue;
                console.log(key, styles[key]);
            }
        },
        get: function(key) {
            return styles[key];
        },
        addImport: function(url) {
            if (imports.indexOf(url) > -1) return;
            imports.push(url);
            update();
        },
        clearImports: function() {
            if (imports.length == 0) return;
            imports = [];
            update();
        },
        set: function(key, style) {
            styles[key] = style;
            update();
        },
        has: function(key) {
            return styles[key] != null;
        },
        unset: function(key) {
            if (typeof key === 'string') {
                key = [key];
            }

            var doUpdate = false;

            for (var i in key) {
                if (key.hasOwnProperty(i) && this.has(key[i])) {
                    delete styles[key[i]];
                    doUpdate = true;
                }
            }

            if (doUpdate)
                update();
        },
        destroy: function() {
            styles = {};
            obj.remove();
        }
    });
    return new a();
});
define('fefed4/e89711/eb40f3', ['fefed4/b98817'], function(p3Utils) {
    if (!p3Utils.runLite)
        return require('ac791/c8365/e8518');
    return {
        _events: {
            'chat:receive': [],
            'chat:delete': []
        },
        trigger: function() {},
        on: function(key) {
            this._events[key] = [];
        },
        off: function() {}
    };
});
/**
 Modified version of plug.dj's VolumeView
 VolumeView copyright (C) 2014 by Plug DJ, Inc.
 */
define('fefed4/e89711/e8abf7', ['jquery', 'fefed4/d10ed2', 'fefed4/b98817', 'fefed4/e89711/eb40f3'], function($, p3Lang, p3Utils, _$context) {
    if (p3Utils.runLite) return null;
    var original = require('ac791/b6b41/ada16/a73fc/a294f'),
        _PlaybackModel;

    return original.extend({
        initialize: function(PlaybackModel) {
            _PlaybackModel = PlaybackModel;
            this._super();
        },
        render: function() {
            this._super();
            this.$('.button').mouseover(function() {
                if (typeof plugCubed !== 'undefined') {
                    if (_PlaybackModel.get('mutedOnce')) {
                        _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), $(this), true);
                    } else if (_PlaybackModel.get('muted')) {
                        _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), $(this), true);
                    }
                }
            }).mouseout(function() {
                if (typeof plugCubed !== 'undefined')
                    _$context.trigger('tooltip:hide');
            });
            this.onChange();
            return this;
        },
        remove: function() {
            this._super();
            var volume = new original();
            $('#now-playing-bar').append(volume.$el);
            volume.render();
        },
        onClick: function() {
            if (typeof plugCubed !== 'undefined') {
                _$context.trigger('tooltip:hide');
                if (_PlaybackModel.get('muted')) {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), this.$('.button'), true);
                } else if (!_PlaybackModel.get('mutedOnce')) {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), this.$('.button'), true);
                } else {
                    _$context.trigger('tooltip:hide');
                }
            }

            if (_PlaybackModel.get('mutedOnce')) {
                _PlaybackModel.set('volume', _PlaybackModel.get('lastVolume'));
            } else if (_PlaybackModel.get('muted')) {
                _PlaybackModel.onVolumeChange();
                this.onChange();
            } else if (_PlaybackModel.get('volume') > 0) {
                _PlaybackModel.set({
                    lastVolume: _PlaybackModel.get('volume'),
                    volume: 0
                });
            }
        },
        onChange: function() {
            var currentVolume = _PlaybackModel.get('volume');
            this.$span.text(currentVolume + '%');
            this.$circle.css('left', parseInt(this.$hit.css('left')) + this.max * (currentVolume / 100) - this.$circle.width() / 2);
            if (currentVolume > 60 && !this.$icon.hasClass('icon-volume-on')) {
                this.$icon.removeClass().addClass('icon icon-volume-on');
            } else if (currentVolume > 0 && !this.$icon.hasClass('icon-volume-half')) {
                this.$icon.removeClass().addClass('icon icon-volume-half');
            } else if (currentVolume === 0) {
                if (_PlaybackModel.get('mutedOnce')) {
                    if (!this.$icon.hasClass('icon-volume-off-once')) {
                        this.$icon.removeClass().addClass('icon icon-volume-off-once');
                    }
                } else if (!this.$icon.hasClass('icon-volume-off')) {
                    this.$icon.removeClass().addClass('icon icon-volume-off');
                }
            }
        }
    });
});
define('fefed4/e89711/a1b9a0', ['fefed4/d778d3', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/e89711/e8abf7'], function(Class, p3Utils, p3Lang, VolumeView) {
    var handler, that;

    if (p3Utils.runLite) {
        handler = Class.extend({
            init: function() {
                API.on(API.ADVANCE, this.djAdvance, this);
                this.set('lastVolume', this.get('volume'));
            },
            close: function() {
                API.off(API.ADVANCE, this.djAdvance, this);
            },
            djAdvance: function() {
                if (this.get('mutedOnce'))
                    this.unmute();
            },
            get: function(key) {
                switch (key) {
                    case 'volume':
                        return API.getVolume();
                    case 'muted':
                        return this.get('volume') === 0;
                    default:
                        break;
                }
                return this[key];
            },
            set: function(key, value) {
                switch (key) {
                    case 'volume':
                        API.setVolume(value);
                        return;
                    case 'muted':
                        this.set('volume', value ? 0 : this.get('lastVolume'));
                        return;
                    default:
                        break;
                }
                this[key] = value;
            },
            mute: function() {
                this.set('lastVolume', API.getVolume());
                API.setVolume(0);
            },
            muteOnce: function() {
                this.set('mutedOnce', true);
                this.set('lastVolume', API.getVolume());
                API.setVolume(0);
            },
            unmute: function() {
                API.setVolume(this.get('lastVolume'));
            }
        });
    } else {
        var PlaybackModel = require('ac791/ad0b5/be2fa'),
            volume;

        function onMediaChange() {
            if (PlaybackModel.get('mutedOnce') === true)
                PlaybackModel.set('volume', PlaybackModel.get('lastVolume'));
        }

        handler = Class.extend({
            init: function() {
                that = this;
                PlaybackModel.off('change:volume', PlaybackModel.onVolumeChange);
                PlaybackModel.onVolumeChange = function() {
                    if (typeof plugCubed === 'undefined')
                        this.set('muted', this.get('volume') == 0);
                    else {
                        if (this.get('mutedOnce') == null)
                            this.set('mutedOnce', false);

                        if (this.get('volume') === 0) {
                            if (!this.get('muted'))
                                this.set('muted', true);
                            else if (!this.get('mutedOnce'))
                                this.set('mutedOnce', true);
                            else {
                                this.set('mutedOnce', false);
                                this.set('muted', false);
                            }
                        } else {
                            this.set('mutedOnce', false);
                            this.set('muted', false);
                        }
                    }
                };
                PlaybackModel.on('change:volume', PlaybackModel.onVolumeChange);

                PlaybackModel.on('change:media', onMediaChange);
                PlaybackModel._events['change:media'].unshift(PlaybackModel._events['change:media'].pop());

                setTimeout(function() {
                    $('#volume').remove();
                    volume = new VolumeView(that);
                    $('#now-playing-bar').append(volume.$el);
                    volume.render();
                }, 1);
            },
            onVolumeChange: function() {
                PlaybackModel.onVolumeChange();
            },
            get: function(key) {
                return PlaybackModel.get(key);
            },
            set: function(key, value) {
                PlaybackModel.set(key, value);
            },
            mute: function() {
                while (!PlaybackModel.get('muted') || PlaybackModel.get('mutedOnce'))
                    volume.onClick();
            },
            muteOnce: function() {
                while (!PlaybackModel.get('mutedOnce'))
                    volume.onClick();
            },
            unmute: function() {
                while (PlaybackModel.get('muted'))
                    volume.onClick();
            },
            close: function() {}
        });
    }

    return new handler();
});
define('fefed4/c04848', ['fefed4/d778d3', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/adb763', 'fefed4/e89711/a1b9a0'], function(Class, p3Utils, p3Lang, Styles, PlaybackModel) {
    var names = [],
        curVersion;

    // Misc
    names.push('version');
    // Features
    names.push('autowoot', 'autojoin', 'autorespond', 'awaymsg', 'notify', 'customColors', 'moderation', 'notifySongLength', 'useRoomSettings', 'chatImages', 'twitchEmotes', 'songTitle');
    // Registers
    names.push('registeredSongs', 'alertson', 'colors');

    curVersion = 3;

    function upgradeVersion(save) {
        switch (save.version) {
            case void 0:
            case 1:
                // Inline Images => Chat Images
                if (save.inlineimages != null)
                    save.chatImages = save.inlineimages;

                // Moderation
                if (save.moderation == null)
                    save.moderation = {};
                if (save.afkTimers != null)
                    save.moderation.afkTimers = save.afkTimers;
                break;
            case 2:
                // Curate => Grab
                if (save.colors != null)
                    save.colors = {};
                if (save.colors.curate != null)
                    save.colors.grab = save.colors.curate;
                break;
            default:
                break;
        }
        console.log('[plug³] Updated save', save.version, '=>', curVersion);
        save.version = curVersion;
        return save;
    }

    var controller = Class.extend({
        recent: false,
        awaymsg: '',
        autowoot: false,
        autojoin: false,
        autorespond: false,
        notify: 0,
        customColors: false,
        chatImages: true,
        twitchEmotes: true,
        songTitle: false,
        registeredSongs: [],
        alertson: [],
        etaTimer: true,
        moderation: {
            afkTimers: false,
            showDeletedMessages: false
        },
        notifySongLength: 10,
        useRoomSettings: {},
        colorInfo: {
            ranks: {
                you: {
                    title: 'ranks.you',
                    color: 'FFDD6F'
                },
                regular: {
                    title: 'ranks.regular',
                    color: 'B0B0B0'
                },
                residentdj: {
                    title: 'ranks.residentdj',
                    color: 'AC76FF'
                },
                bouncer: {
                    title: 'ranks.bouncer',
                    color: 'AC76FF'
                },
                manager: {
                    title: 'ranks.manager',
                    color: 'AC76FF'
                },
                cohost: {
                    title: 'ranks.cohost',
                    color: 'AC76FF'
                },
                host: {
                    title: 'ranks.host',
                    color: 'AC76FF'
                },
                ambassador: {
                    title: 'ranks.ambassador',
                    color: '89BE6C'
                },
                admin: {
                    title: 'ranks.admin',
                    color: '42A5DC'
                }
            },
            notifications: {
                join: {
                    title: 'notify.join',
                    color: '3366FF'
                },
                leave: {
                    title: 'notify.leave',
                    color: '3366FF'
                },
                grab: {
                    title: 'notify.grab',
                    color: '00FF00'
                },
                meh: {
                    title: 'notify.meh',
                    color: 'FF0000'
                },
                stats: {
                    title: 'notify.stats',
                    color: '66FFFF'
                },
                updates: {
                    title: 'notify.updates',
                    color: 'FFFF00'
                },
                songLength: {
                    title: 'notify.notification.songLength',
                    color: '66FFFF'
                }
            }
        },
        colors: {
            you: 'FFDD6F',
            regular: 'B0B0B0',
            residentdj: 'AC76FF',
            bouncer: 'AC76FF',
            manager: 'AC76FF',
            cohost: 'AC76FF',
            host: 'AC76FF',
            ambassador: '89BE6C',
            admin: '42A5DC',
            join: '3366FF',
            leave: '3366FF',
            grab: '00FF00',
            stats: '66FFFF',
            updates: 'FFFF00',
            songLength: '66FFFF'
        },
        load: function() {
            try {
                var save = JSON.parse(localStorage.getItem('plugCubed')) || {};

                // Upgrade if needed
                if (save.version == null || save.version !== curVersion) {
                    save = upgradeVersion(save);
                    this.save();
                }

                // Get the settings
                for (var i in names) {
                    if (!names.hasOwnProperty(i)) continue;
                    if (save[names[i]] != null && typeof this[names[i]] == typeof save[names[i]]) {
                        if ($.isPlainObject(this[names[i]])) {
                            for (var j in this[names[i]]) {
                                if (!this[names[i]].hasOwnProperty(j)) continue;
                                if (save[names[i]][j] != null) {
                                    this[names[i]][j] = save[names[i]][j];
                                }
                            }
                        } else {
                            this[names[i]] = save[names[i]];
                        }
                    }
                }

                if (this.autowoot) {
                    (function() {
                        var dj = API.getDJ();
                        if (dj == null || dj.id === API.getUser().id) return;
                        $('#woot').click();
                    })();
                }

                if (this.autojoin) {
                    (function() {
                        var dj = API.getDJ();
                        if (dj == null || dj.id === API.getUser().id || API.getWaitListPosition() > -1) return;
                        $('#dj-button').click();
                    })();
                }

                /*
                 // Update styles if AFK timers are enabled
                 if (this.moderation.afkTimers && (p3Utils.isPlugCubedDeveloper() || p3Utils.hasPermission(undefined, API.ROLE.BOUNCER))) {
                 Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                 }
                 */

                if (this.twitchEmotes) {
                    require('fefed4/ae602d/d6faeb').loadTwitchEmotes();
                }

                if (this.registeredSongs.length > 0 && API.getMedia() != null && this.registeredSongs.indexOf(API.getMedia().id) > -1) {
                    if (!p3Utils.runLite) {
                        PlaybackModel.muteOnce();
                    }
                    API.chatLog(p3Lang.i18n('automuted', API.getMedia().title));
                }

                if (this.etaTimer) {
                    Styles.set('etaTimer', '#your-next-media .song { top: 8px!important; }');
                }
            } catch (e) {
                console.error('[plug³] Error loading settings', e);
                p3Utils.chatLog('system', 'Error loading settings');
            }
        },
        save: function() {
            var settings = {};
            for (var i in names) {
                if (names.hasOwnProperty(i))
                    settings[names[i]] = this[names[i]];
            }
            settings.version = curVersion;
            localStorage.setItem('plugCubed', JSON.stringify(settings));
        }
    });
    return new controller();
});
define('fefed4/a7bf09/e750d4', [], function() {
    return {
        USER_JOIN: 1,
        USER_LEAVE: 2,
        USER_GRAB: 4,
        SONG_STATS: 8,
        SONG_UPDATE: 16,
        SONG_HISTORY: 32,
        SONG_LENGTH: 64,
        USER_MEH: 128,
        SONG_UNAVAILABLE: 256
    };
});
define('fefed4/fa84ce/d32431', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var history = [],
        handler = TriggerHandler.extend({
            trigger: {
                advance: 'onDjAdvance',
                modSkip: 'onSkip',
                userSkip: 'onSkip',
                voteSkip: 'onSkip'
            },
            register: function() {
                this.getHistory();
                this._super();
            },
            isInHistory: function(cid) {
                var info = {
                    pos: -1,
                    inHistory: false,
                    skipped: false,
                    length: history.length
                };
                for (var i in history) {
                    if (!history.hasOwnProperty(i)) continue;
                    var a = history[i];
                    if (a.cid == cid && (~~i + 1) < history.length) {
                        info.pos = ~~i + 2;
                        info.inHistory = true;
                        if (!a.wasSkipped) {
                            return info;
                        }
                    }
                }
                info.skipped = info.pos > -1;
                return info;
            },
            onHistoryCheck: function(cid) {
                if ((!API.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper()) || (Settings.notify & enumNotifications.SONG_HISTORY) !== enumNotifications.SONG_HISTORY) return;
                var historyData = this.isInHistory(cid);
                if (historyData.inHistory) {
                    if (!historyData.skipped) {
                        p3Utils.playMentionSound();
                        setTimeout(p3Utils.playMentionSound, 50);
                        p3Utils.chatLog('system', p3Lang.i18n('notify.message.history', historyData.pos, historyData.length) + '<br><span onclick="if (API.getMedia().cid === \'' + cid + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', undefined, -1);
                    } else {
                        p3Utils.chatLog('system', p3Lang.i18n('notify.message.historySkipped', historyData.pos, historyData.length), undefined, -1);
                    }
                }
            },
            onDjAdvance: function(data) {
                if (data.media == null) return;
                this.onHistoryCheck(data.media.cid);
                var obj = {
                    id: data.media.cid,
                    author: data.media.author,
                    title: data.media.title,
                    wasSkipped: false,
                    user: {
                        id: data.dj.id,
                        username: data.dj.username
                    }
                };
                if (history.unshift(obj) > 50)
                    history.splice(50, history.length - 50);
            },
            onSkip: function() {
                history[1].wasSkipped = true;
            },
            getHistory: function() {
                history = [];
                var data = API.getHistory();
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    var a = data[i],
                        obj = {
                            cid: a.media.cid,
                            author: a.media.author,
                            title: a.media.title,
                            wasSkipped: false,
                            dj: {
                                id: a['user'].id.toString(),
                                username: a['user'].username
                            }
                        };
                    history.push(obj);
                }
            }
        });
    return new handler();
});
define('fefed4/fa84ce/dd814f', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_LENGTH) === enumNotifications.SONG_LENGTH && data.media.duration > Settings.notifySongLength * 60) {
                p3Utils.playMentionSound();
                setTimeout(p3Utils.playMentionSound, 50);
                p3Utils.chatLog('system', p3Lang.i18n('notify.message.songLength', Settings.notifySongLength) + '<br><span onclick="if (API.getMedia().id === \'' + data.id + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', Settings.colors.songLength || Settings.colorInfo.notifications.songLength.color, -1);
            }
        }
    });
    return new handler();
});
define('fefed4/fa84ce/bb4b92', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_STATS) === enumNotifications.SONG_STATS)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.stats', data.lastPlay.score.positive, data.lastPlay.score.negative, data.lastPlay.score.grabs), Settings.colors.stats || Settings.colorInfo.notifications.stats.color, -1);
        }
    });
    return new handler();
});
define('fefed4/fa84ce/a0e082', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_UPDATE) === enumNotifications.SONG_UPDATE)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.updates', p3Utils.cleanTypedString(data.media.title), p3Utils.cleanTypedString(data.media.author), p3Utils.cleanTypedString(data.dj.username)), Settings.colors.updates || Settings.colorInfo.notifications.updates.color, -1);
        }
    });
    return new handler();
});
define('fefed4/fa84ce/bfcacf', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.GRAB_UPDATE,
        handler: function(data) {
            var media = API.getMedia();
            if ((Settings.notify & enumNotifications.USER_GRAB) === enumNotifications.USER_GRAB)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.grab', media.author, media.title), Settings.colors.grab || Settings.colorInfo.notifications.grab.color, data.user.id);
        }
    });
    return new handler();
});
define('fefed4/fa84ce/b26fb3', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var lastJoin = {},
        handler = TriggerHandler.extend({
            trigger: API.USER_JOIN,
            handler: function(data) {
                if ((Settings.notify & enumNotifications.USER_JOIN) === enumNotifications.USER_JOIN && (lastJoin[data.id] == null || lastJoin[data.id] < Date.now() - 5e3)) {
                    // TODO: Add check if friend
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.join'), Settings.colors.join || Settings.colorInfo.notifications.join.color, data.id, data.username);
                }

                lastJoin[data.id] = Date.now();

                if (p3Utils.getUserData(data.id, 'joinTime', 0) === 0)
                    p3Utils.setUserData(data.id, 'joinTime', Date.now());
            }
        });
    return new handler();
});
define('fefed4/fa84ce/c5a2d7', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var lastLeave = {},
        handler = TriggerHandler.extend({
            trigger: API.USER_LEAVE,
            handler: function(data) {
                var disconnects = p3Utils.getUserData(data.id, 'disconnects', {
                    count: 0
                });
                if ((Settings.notify & enumNotifications.USER_LEAVE) === enumNotifications.USER_LEAVE && (disconnects.time == null || Date.now() - disconnects.time < 1000) && (lastLeave[data.id] == null || lastLeave[data.id] < Date.now() - 5e3)) {
                    // TODO: Add check if friend
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.leave'), Settings.colors.leave || Settings.colorInfo.notifications.leave.color, data.id, data.username);
                }
                lastLeave[data.id] = Date.now();
            }
        });
    return new handler();
});
define('fefed4/fa84ce/fb90a9', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.VOTE_UPDATE,
        handler: function(data) {
            if (data.vote < 0 && (Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.meh'), Settings.colors.meh || Settings.colorInfo.notifications.meh.color, data.user.id);
        }
    });
    return new handler();
});
define('fefed4/fa84ce/dfee25', ['jquery', 'fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/a7bf09/e750d4'], function($, TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE) {
                var url;
                if (data.media.format === 1) {
                    url = 'https://gdata.youtube.com/feeds/api/videos/' + data.media.cid + '?v=2&alt=jsonc';
                } else if (data.media.format === 2) {
                    url = 'https://api.soundcloud.com/tracks/' + data.media.cid + '/?client_id=apigee';
                }
                $.ajax({
                    url: url,
                    dataType: 'json',
                    crossDomain: true,
                    success: function(response) {
                        var final;
                        if (data.media.format === 1) {
                            if (response.data.accessControl.embed === 'denied') {
                                final = 'notify.message.songEmbed';
                            }
                        } else if (data.media.format === 2) {
                            if (response.streamable === false) {
                                final = 'notify.message.songStreamable';
                            }
                        }
                        if (typeof final !== 'undefined') {
                            p3Utils.playMentionSound();
                            setTimeout(p3Utils.playMentionSound, 50);
                            p3Utils.chatLog('system', p3Lang.i18n(final) + '<br><span onclick="if (API.getMedia().cid === \'' + data.media.cid + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', undefined, -1);
                        }
                    },
                    error: function(response) {
                        var final;
                        if (data.media.format === 1) {
                            if (response.status === 403 && response.responseJSON.error.message === 'Private video') {
                                final = 'notify.message.songPrivate';
                            } else if (response.status === 404 && response.responseJSON.error.message === 'Video not found') {
                                final = 'notify.message.songNotFound';
                            }
                        } else if (data.media.format === 2) {
                            if (response.status === 403) {
                                final = 'notify.message.songPrivate'; //TODO: Run a second check just in case it's the API acting up.
                            } else if (response.status === 404 && response.responseJSON.errors[0].error_message === '404 - Not Found') {
                                final = 'notify.message.songNotFound';
                            }
                        }
                        if (typeof final !== 'undefined') {
                            p3Utils.playMentionSound();
                            setTimeout(p3Utils.playMentionSound, 50);
                            p3Utils.chatLog('system', p3Lang.i18n(final) + '<br><span onclick="if (API.getMedia().cid === \'' + data.media.cid + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>', undefined, -1);
                        }
                    }
                });
            }
        }
    });
    return new handler();
});
define('fefed4/e750d4', ['fefed4/d778d3', 'fefed4/fa84ce/d32431', 'fefed4/fa84ce/dd814f', 'fefed4/fa84ce/bb4b92', 'fefed4/fa84ce/a0e082', 'fefed4/fa84ce/bfcacf', 'fefed4/fa84ce/b26fb3', 'fefed4/fa84ce/c5a2d7', 'fefed4/fa84ce/fb90a9', 'fefed4/fa84ce/d32431', 'fefed4/fa84ce/dfee25'], function() {
    var modules, Class, handler;

    modules = $.makeArray(arguments);
    Class = modules.shift();

    handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && !modules[i].registered)
                    modules[i].register();
            }
        },
        unregister: function() {
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i].registered)
                    modules[i].close();
            }
        }
    });

    return new handler();
});
define('fefed4/fa8684', [], function() {
    return {
        major: 4,
        minor: 0,
        patch: 4,
        prerelease: "",
        build: 6,
        minified: false,
        /**
         * @this {version}
         */
        toString: function() {
            return this.major + '.' + this.minor + '.' + this.patch + (this.prerelease != null && this.prerelease !== '' ? '-' + this.prerelease : '') + (this.minified ? '_min' : '') + ' (Build ' + this.build + ')';
        }
    }
});
define('fefed4/fb5799', ['jquery', 'fefed4/d778d3', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/adb763', 'fefed4/c04848', 'fefed4/e89711/eb40f3', 'lang/Lang'], function($, Class, p3Utils, p3Lang, Styles, Settings, Context, Lang) {
    var RoomModel, handler, showMessage, oriLang, langKeys, ranks, that;

    /**
     * @property {{ background: String, chat: { admin: String, ambassador: String, bouncer: String, cohost: String, residentdj: String, host: String, manager: String }, footer: String, header: String }} colors
     * @property {{ font: Array, import: Array, rule: Array }} css
     * @property {{ background: String, booth: String, icons: { admin: String, ambassador: String, bouncer: String, cohost: String, residentdj: String, host: String, manager: String }, playback: String }} images
     * @property {{ plugCubed: Object, plugDJ: Object }} text
     * @property {{ allowAutorespond: Boolean, allowAutojoin: Boolean, allowAutowoot: Boolean }} rules
     * @property {String|undefined} roomscript
     */
    var roomSettings;

    showMessage = false;
    oriLang = $.extend(true, {}, Lang);
    langKeys = $.map(oriLang, function(v, i) {
        if (typeof v === 'string') {
            return i;
        } else {
            return $.map(v, function(v2, i2) {
                return i + '.' + i2;
            });
        }
    });
    ranks = ['admin', 'ambassador', 'bouncer', 'cohost', 'residentdj', 'leader', 'host', 'manager', 'volunteer'];

    if (!p3Utils.runLite)
        RoomModel = require('ac791/ad0b5/d32ee');

    function getPlugDJLang(key, original) {
        if (!key) return '';
        var parts = key.split('.'),
            last = parts.pop(),
            partsLen = parts.length,
            cur = original ? oriLang : Lang;
        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];
            if (cur[part] != null) {
                cur = cur[part];
            } else {
                return '';
            }
            if (cur[last] != null) {
                return cur[last];
            }
        }
        return '';
    }

    function setPlugDJLang(key, value) {
        if (!key || !value) return;
        var parts = key.split('.'),
            last = parts.pop(),
            partsLen = parts.length,
            cur = Lang;
        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];
            if (cur[part] != null)
                cur = cur[part];
            else return;
        }
        if (cur[last] != null)
            cur[last] = value;
    }

    function parseDescription(description) {
        if (description.indexOf('@p3=') > -1) {
            description = description.substr(description.indexOf('@p3=') + 4);
            if (description.indexOf('\n') > -1)
                description = description.substr(0, description.indexOf('\n'));
            $.getJSON(description + '?_' + Date.now(), function(settings) {
                roomSettings = settings;
                showMessage = true;
                that.execute();
            }).fail(function() {
                API.chatLog('Error loading Room Settings', true);
            });
            that.haveRoomSettings = true;
        }
    }

    handler = Class.extend({
        rules: {
            allowAutowoot: true,
            allowAutorespond: true,
            allowAutojoin: true
        },
        haveRoomSettings: false,
        chatColors: {},
        chatIcons: {},
        init: function() {
            that = this;
            if (!p3Utils.runLite) {
                Context.on('room:joining', this.clear, this);
                Context.on('room:joined', this.update, this);
            }
        },
        update: function() {
            if (!p3Utils.runLite) {
                parseDescription(p3Utils.cleanHTML(RoomModel.get('description')));
            } else {
                $.getJSON('/_/rooms/state', function(msg) {
                    if (msg.status == 'ok') {
                        parseDescription(msg.data[0].meta.description);
                    } else {
                        API.chatLog('Error loading Room Description', true);
                    }
                });
            }
        },
        execute: function() {
            var i, a, loadEverything;
            loadEverything = Settings.useRoomSettings[document.location.pathname.split('/')[1]] != null ? Settings.useRoomSettings[document.location.pathname.split('/')[1]] : true;

            this.clear();

            if (roomSettings != null) {
                if (loadEverything) {
                    // colors
                    if (roomSettings.colors != null) {
                        // colors.background
                        if (roomSettings.colors.background != null && typeof roomSettings.colors.background === 'string' && p3Utils.isRGB(roomSettings.colors.background))
                            Styles.set('room-settings-background-color', 'body { background-color: ' + p3Utils.toRGB(roomSettings.colors.background) + '!important; }');

                        // colors.chat
                        if (roomSettings.colors.chat != null) {
                            a = {};
                            for (i in roomSettings.colors.chat) {
                                if (!roomSettings.colors.chat.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.colors.chat[i] === 'string' && p3Utils.isRGB(roomSettings.colors.chat[i]))
                                    a[i] = p3Utils.toRGB(roomSettings.colors.chat[i]);
                            }
                            this.chatColors = a;
                        }

                        // colors.header
                        if (roomSettings.colors.header != null && typeof roomSettings.colors.header === 'string' && p3Utils.isRGB(roomSettings.colors.header))
                            Styles.set('room-settings-header', '#header { background-color: ' + p3Utils.toRGB(roomSettings.colors.header) + '!important; }');

                        // colors.footer
                        if (roomSettings.colors.footer != null && typeof roomSettings.colors.footer === 'string' && p3Utils.isRGB(roomSettings.colors.footer))
                            Styles.set('room-settings-footer', '.app-header { background-color: ' + p3Utils.toRGB(roomSettings.colors.footer) + '!important; }');
                    }

                    // css
                    if (roomSettings.css != null) {
                        // css.font
                        if (roomSettings.css.font != null && $.isArray(roomSettings.css.font)) {
                            var roomFonts = [];
                            for (i in roomSettings.css.font) {
                                if (!roomSettings.css.font.hasOwnProperty(i)) continue;
                                var font = roomSettings.css.font[i];
                                if (font.name != null && font.url != null) {
                                    font.toString = function() {
                                        var sources = [];
                                        if (typeof this.url === 'string')
                                            sources.push('url("' + this.url + '")');
                                        else {
                                            for (var j in this.url) {
                                                if (!this.url.hasOwnProperty(j)) continue;
                                                if (['woff', 'woff2', 'opentype', 'svg', 'svgz', 'embedded-opentype', 'truetype'].indexOf(j) > -1)
                                                    sources.push('url("' + this.url[j] + '") format("' + j + '")')
                                            }
                                        }
                                        return '@font-face { font-family: "' + this.name + '"; src: ' + sources.join(',') + '; }';
                                    };
                                    roomFonts.push(font.toString());
                                }
                            }
                            Styles.set('room-settings-fonts', roomFonts.join('\n'));
                        }
                        // css.import
                        if (roomSettings.css.import != null && $.isArray(roomSettings.css.import)) {
                            for (i in roomSettings.css.import) {
                                if (roomSettings.css.import.hasOwnProperty(i) && typeof roomSettings.css.import[i] === 'string')
                                    Styles.addImport(roomSettings.css.import[i]);
                            }
                        }
                        // css.setting
                        if (roomSettings.css.rule != null) {
                            var roomCSSRules = [];
                            for (i in roomSettings.css.rule) {
                                if (!roomSettings.css.rule.hasOwnProperty(i)) continue;
                                var rule = [];
                                for (var j in roomSettings.css.rule[i]) {
                                    if (!roomSettings.css.rule[i].hasOwnProperty(j)) continue;
                                    rule.push(j + ':' + roomSettings.css.rule[i][j]);
                                }
                                roomCSSRules.push(i + ' {' + rule.join(';') + '}');
                            }
                            Styles.set('room-settings-rules', roomCSSRules.join('\n'));
                        }
                    }

                    // images
                    if (roomSettings.images != null) {
                        // images.background
                        if (roomSettings.images.background)
                            Styles.set('room-settings-background-image', '.room-background { background-image: url("' + p3Utils.proxifyImage(roomSettings.images.background) + '")!important; }');

                        // images.playback
                        var playbackBackground = $('#playback').find('.background img');
                        if (playbackBackground.data('_o') == null)
                            playbackBackground.data('_o', playbackBackground.attr('src'));

                        if (roomSettings.images.playback != null) {
                            if (!p3Utils.runLite && typeof roomSettings.images.playback === 'string' && roomSettings.images.playback.indexOf('http') === 0) {
                                var roomLoader = require('ac791/b6b41/ada16/d0421');
                                var playbackFrame = new Image;
                                playbackFrame.onload = function() {
                                    playbackBackground.attr('src', this.src);
                                    roomLoader.frameHeight = this.height - 10;
                                    roomLoader.frameWidth = this.width - 18;
                                    roomLoader.onVideoResize(require('ac791/cb61a/c4337').getSize());
                                };
                                playbackFrame.src = p3Utils.proxifyImage(roomSettings.images.playback);
                            } else if (roomSettings.images.playback === false) {
                                playbackBackground.hide();
                            }
                        }

                        // images.booth
                        if (roomSettings.images.booth != null && typeof roomSettings.images.booth === 'string')
                            $('#dj-booth').append($('<div id="p3-dj-booth">').css('background-image', 'url("' + p3Utils.proxifyImage(roomSettings.images.booth) + '")'));

                        // images.icons
                        if (roomSettings.images.icons != null) {
                            a = {};
                            for (i in roomSettings.images.icons) {
                                if (!roomSettings.images.icons.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.images.icons[i] === 'string')
                                    a[i] = p3Utils.proxifyImage(roomSettings.images.icons[i]);
                            }
                            this.chatIcons = a;
                        }
                    }

                    // text
                    if (roomSettings.text != null) {
                        // text.plugCubed
                        if (roomSettings.text.plugCubed != null) {

                        }

                        // text.plugDJ
                        if (roomSettings.text.plugDJ != null) {
                            for (i in roomSettings.text.plugDJ) {
                                if (!roomSettings.text.plugDJ.hasOwnProperty(i)) continue;
                                var value = roomSettings.text.plugDJ[i];
                                if (i && value && typeof value == 'string')
                                    setPlugDJLang(i, roomSettings.text.plugDJ[i]);
                            }
                        }
                    }
                }

                // rules
                if (roomSettings.rules != null) {
                    this.rules.allowAutowoot = roomSettings.rules.allowAutowoot == null || roomSettings.rules.allowAutowoot === 'true' || roomSettings.rules.allowAutowoot === true;
                    this.rules.allowAutojoin = roomSettings.rules.allowAutojoin == null || roomSettings.rules.allowAutojoin === 'true' || roomSettings.rules.allowAutojoin === true;
                    this.rules.allowAutorespond = roomSettings.rules.allowAutorespond == null || roomSettings.rules.allowAutorespond === 'true' || roomSettings.rules.allowAutorespond === true;
                } else {
                    this.rules.allowAutowoot = true;
                    this.rules.allowAutojoin = true;
                    this.rules.allowAutorespond = true;
                }

                // roomscript
                if (roomSettings.roomscript != null) {
                    // TODO: Make this
                }

                // Update autorespond
                if (Settings.autorespond) {
                    if (this.rules.allowAutorespond) {
                        $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                    } else {
                        $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                    }
                }

                if (showMessage) {
                    p3Utils.chatLog(undefined, (typeof roomSettings.author === 'string' ? p3Lang.i18n('roomSpecificSettings.infoHeaderCredits', p3Utils.cleanHTML(roomSettings.author, '*')) : p3Lang.i18n('roomSpecificSettings.infoHeader')) + '<br>' + p3Lang.i18n('roomSpecificSettings.infoDisable'), p3Utils.logColors.infoMessage2, -1);
                    showMessage = false;
                }

                require('fefed4/ac13ee').update();

                // Redraw menu
                require('fefed4/e46194/cfcd5d').createMenu();
            }
        },
        clear: function() {
            this.chatColors = {};
            this.chatIcons = {};

            for (var i in langKeys) {
                if (!langKeys.hasOwnProperty(i)) continue;
                var key = langKeys[i];
                setPlugDJLang(key, getPlugDJLang(key, true));
            }

            $('#p3-dj-booth').remove();

            Styles.unset(['room-settings-background-color', 'room-settings-background-image', 'room-settings-booth', 'room-settings-fonts', 'room-settings-rules', 'room-settings-maingui']);
            Styles.clearImports();

            var playbackBackground = $('#playback').find('.background img');
            if (playbackBackground.data('_o') == null)
                playbackBackground.data('_o', playbackBackground.attr('src'));
            playbackBackground.attr('src', playbackBackground.data('_o'));
            playbackBackground.show();
            if (!p3Utils.runLite) {
                var roomLoader = require('ac791/b6b41/ada16/d0421');
                roomLoader.frameHeight = playbackBackground.height() - 10;
                roomLoader.frameWidth = playbackBackground.width() - 18;
                roomLoader.onVideoResize(require('ac791/cb61a/c4337').getSize());
            }
        },
        close: function() {
            if (!p3Utils.runLite) {
                Context.off('room:joining', this.clear, this);
                Context.off('room:joined', this.update, this);
            }

            this.clear();
        }
    });
    return new handler();
});
define('fefed4/af7c51', ['jquery', 'fefed4/d778d3'], function($, Class) {
    return Class.extend({
        init: function(min, max, val, callback) {
            this.min = min ? min : 0;
            this.max = max ? max : 100;
            this.value = val ? val : this.min;
            this.cb = callback;

            this.startBind = $.proxy(this.onStart, this);
            this.moveBind = $.proxy(this.onUpdate, this);
            this.stopBind = $.proxy(this.onStop, this);
            this.clickBind = $.proxy(this.onClick, this);

            this.$slider = $('<div class="p3slider"><div class="line"></div><div class="circle"></div><div class="hit"></div></div>');
            this.$line = this.$slider.find('.line');
            this.$hit = this.$slider.find('.hit');
            this.$circle = this.$slider.find('.circle');

            this.$hit.mousedown(this.startBind);

            this._max = this.$hit.width() - this.$circle.width();
            this.onChange();

            return this;
        },
        onStart: function(event) {
            this._min = this.$hit.offset().left;
            this._max = this.$hit.width() - this.$circle.width();
            $(document).on('mouseup', this.stopBind).on('mousemove', this.moveBind);
            return this.onUpdate(event);
        },
        onUpdate: function(event) {
            this.value = Math.max(this.min, Math.min(this.max, ~~((this.max - this.min) * ((event.pageX - this._min) / this._max)) + this.min));
            this.onChange();
            event.preventDefault();
            event.stopPropagation();
            return false;
        },
        onStop: function(event) {
            $(document).off('mouseup', this.stopBind).off('mousemove', this.moveBind);
            event.preventDefault();
            event.stopPropagation();
            return false;
        },
        onChange: function() {
            this.$circle.css('left', parseInt(this.$hit.css('left')) + this.$line.width() * ((this.value - this.min) / (this.max - this.min)) - this.$circle.width() / 2);
            if (typeof this.cb === 'function') this.cb(this.value);
        }
    });
});
define('fefed4/ac13ee', ['jquery', 'fefed4/d778d3', 'fefed4/fb5799', 'fefed4/adb763', 'fefed4/c04848', 'fefed4/b98817'], function($, Class, RoomSettings, Styles, Settings, p3Utils) {
    var handler = Class.extend({
        update: function() {
            var useRoomSettings = Settings.useRoomSettings[document.location.pathname.split('/')[1]];
            useRoomSettings = !!(useRoomSettings == null || useRoomSettings === true);

            Styles.unset(['CCC-text-admin', 'CCC-text-ambassador', 'CCC-text-host', 'CCC-text-cohost', 'CCC-text-manager', 'CCC-text-bouncer', 'CCC-text-residentdj', 'CCC-text-regular', 'CCC-text-you', 'CCC-image-admin', 'CCC-image-ambassador', 'CCC-image-host', 'CCC-image-cohost', 'CCC-image-manager', 'CCC-image-bouncer', 'CCC-image-residentdj']);

            if ((useRoomSettings && RoomSettings.chatColors.admin) || Settings.colors.admin !== Settings.colorInfo.ranks.admin.color) {
                Styles.set('CCC-text-admin', ['#user-panel:not(.is-none) .user > .icon-chat-admin + .name', '#user-lists .user > .icon-chat-admin + .name', '.from-admin .un { color:' + p3Utils.toRGB(Settings.colors.admin !== Settings.colorInfo.ranks.admin.color ? Settings.colors.admin : RoomSettings.chatColors.admin) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.ambassador) || Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color) {
                Styles.set('CCC-text-ambassador', ['#user-panel:not(.is-none) .user > .icon-chat-ambassador + .name', '#user-lists .user > .icon-chat-ambassador + .name', '.from-ambassador .un { color:' + p3Utils.toRGB(Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color ? Settings.colors.ambassador : RoomSettings.chatColors.ambassador) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.host) || Settings.colors.host !== Settings.colorInfo.ranks.host.color) {
                Styles.set('CCC-text-host', ['#user-panel:not(.is-none) .user > .icon-chat-host + .name', '#user-lists .user > .icon-chat-host + .name', '.from-host .un { color:' + p3Utils.toRGB(Settings.colors.host !== Settings.colorInfo.ranks.host.color ? Settings.colors.host : RoomSettings.chatColors.host) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.cohost) || Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color) {
                Styles.set('CCC-text-cohost', ['#user-panel:not(.is-none) .user > .icon-chat-cohost + .name', '#user-lists .user > .icon-chat-cohost + .name', '.from-cohost .un', '.cohost .icon-chat-host { color:' + p3Utils.toRGB(Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color ? Settings.colors.cohost : RoomSettings.chatColors.cohost) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.manager) || Settings.colors.manager !== Settings.colorInfo.ranks.manager.color) {
                Styles.set('CCC-text-manager', ['#user-panel:not(.is-none) .user > .icon-chat-manager + .name', '#user-lists .user > .icon-chat-manager + .name', '.from-manager .un { color:' + p3Utils.toRGB(Settings.colors.manager !== Settings.colorInfo.ranks.manager.color ? Settings.colors.manager : RoomSettings.chatColors.manager) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.bouncer) || Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color) {
                Styles.set('CCC-text-bouncer', ['#user-panel:not(.is-none) .user > .icon-chat-bouncer + .name', '#user-lists .user > .icon-chat-bouncer + .name', '.from-bouncer .un { color:' + p3Utils.toRGB(Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color ? Settings.colors.bouncer : RoomSettings.chatColors.bouncer) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.residentdj) || Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color) {
                Styles.set('CCC-text-residentdj', ['#user-panel:not(.is-none) .user > .icon-chat-dj + .name', '#user-lists .user > .icon-chat-dj + .name', '.from-dj .un { color:' + p3Utils.toRGB(Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color ? Settings.colors.residentdj : RoomSettings.chatColors.residentdj) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RoomSettings.chatColors.regular) || Settings.colors.regular !== Settings.colorInfo.ranks.regular.color) {
                Styles.set('CCC-text-regular', ['#user-panel:not(.is-none) .user > .name:first-child', '#user-lists .user > .name:first-child', '.un { color:' + p3Utils.toRGB(Settings.colors.regular !== Settings.colorInfo.ranks.regular.color ? Settings.colors.regular : RoomSettings.chatColors.regular) + '!important; }'].join(",\n"));
            }
            if (Settings.colors.you !== Settings.colorInfo.ranks.you.color) {
                Styles.set('CCC-text-you', ['#user-lists .list .user.is-you .name', '.from-you .un { color:' + p3Utils.toRGB(Settings.colors.you) + '!important; }'].join(",\n"));
            }
            if (useRoomSettings) {
                if (RoomSettings.chatIcons.admin)
                    Styles.set('CCC-image-admin', ['.icon-chat-admin { background-image: url("' + RoomSettings.chatIcons.admin + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.ambassador)
                    Styles.set('CCC-image-ambassador', ['.icon-chat-ambassador { background-image: url("' + RoomSettings.chatIcons.ambassador + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.host)
                    Styles.set('CCC-image-host', ['.icon-chat-host { background-image: url("' + RoomSettings.chatIcons.host + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.cohost)
                    Styles.set('CCC-image-cohost', ['.icon-chat-cohost, .cohost .icon-chat-host { background-image: url("' + RoomSettings.chatIcons.cohost + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.manager)
                    Styles.set('CCC-image-manager', ['.icon-chat-manager { background-image: url("' + RoomSettings.chatIcons.manager + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.bouncer)
                    Styles.set('CCC-image-bouncer', ['.icon-chat-bouncer { background-image: url("' + RoomSettings.chatIcons.bouncer + '"); background-position: 0 0; }'].join(",\n"));
                if (RoomSettings.chatIcons.residentdj)
                    Styles.set('CCC-image-residentdj', ['.icon-chat-dj { background-image: url("' + RoomSettings.chatIcons.residentdj + '"); background-position: 0 0; }'].join(",\n"));
            }
        }
    });

    return new handler();
});
define('fefed4/e46194/ac13ee', ['jquery', 'fefed4/d778d3', 'fefed4/d10ed2', 'fefed4/ac13ee', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/e89711/eb40f3'], function($, Class, p3Lang, CCC, Settings, p3Utils, _$context) {
    function GUIInput(id, text, defaultColor) {
        if (!Settings.colors[id])
            Settings.colors[id] = defaultColor;
        return $('<div class="item">').addClass('p3-s-cc-' + id).append($('<span>').text(text)).append($('<span>').addClass('default').css('display', Settings.colors[id] === defaultColor ? 'none' : 'block').mouseover(function() {
            _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.reset'), $(this), false);
        }).mouseout(function() {
            _$context.trigger('tooltip:hide');
        }).click(function() {
            $(this).parent().find('input').val(defaultColor);
            $(this).parent().find('.example').css('background-color', p3Utils.toRGB(defaultColor));
            $(this).css('display', 'none');
            Settings.colors[id] = defaultColor;
            Settings.save();
            CCC.update();
        })).append($('<span>').addClass('example').css('background-color', p3Utils.toRGB(Settings.colors[id]))).append($('<input>').val(Settings.colors[id]).keyup(function() {
            if (p3Utils.isRGB($(this).val())) {
                $(this).parent().find('.example').css('background-color', p3Utils.toRGB($(this).val()));
                Settings.colors[id] = $(this).val();
                Settings.save();
                CCC.update();
            }
            $(this).parent().find('.default').css('display', $(this).val() === defaultColor ? 'none' : 'block');
        }));
    }

    var div, a = Class.extend({
        render: function() {
            var i, $settings = $('#p3-settings');
            if (div != null) {
                if (div.css('left') === '-500px') {
                    div.animate({
                        left: $settings.width() + 1
                    });
                    return;
                }
                div.animate({
                    left: -500
                });
                return;
            }
            var container = $('<div class="container">').append($('<div class="section">').text('User Ranks'));
            for (i in Settings.colorInfo.ranks) {
                if (Settings.colorInfo.ranks.hasOwnProperty(i))
                    container.append(GUIInput(i, p3Lang.i18n(Settings.colorInfo.ranks[i].title), Settings.colorInfo.ranks[i].color));
            }
            container.append($('<div class="spacer">').append($('<div class="divider">'))).append($('<div class="section">').text(p3Lang.i18n('notify.header')));
            for (i in Settings.colorInfo.notifications) {
                if (Settings.colorInfo.notifications.hasOwnProperty(i))
                    container.append(GUIInput(i, p3Lang.i18n(Settings.colorInfo.notifications[i].title), Settings.colorInfo.notifications[i].color));
            }
            div = $('<div id="p3-settings-custom-colors" style="left: -500px;">').append($('<div class="header">').append($('<div class="back">').append($('<i class="icon icon-arrow-left"></i>')).click(function() {
                if (div != null) div.animate({
                    left: -500
                });
            })).append($('<div class="title">').append($('<span>').text(p3Lang.i18n('menu.customchatcolors'))))).append(container).animate({
                left: $settings.width() + 1
            });
            $('#p3-settings-wrapper').append(div);
        },
        hide: function() {
            if (div != null) div.animate({
                left: -500
            });
        }
    });
    return new a();
});
define('fefed4/e46194/c55cd8', ['jquery', 'underscore', 'fefed4/d778d3'], function($, _, Class) {
    var ControlPanelClass, JQueryElementClass;

    var PanelClass, ButtonClass, InputClass;

    var $controlPanelDiv, $topBarDiv, $menuDiv, $currentDiv, $closeDiv, scrollPane, shownHeight, tabs = {},
        _this, _onResize, _onTabClick;

    JQueryElementClass = Class.extend({
        getJQueryElement: function() {
            console.error('Missing getJQueryElement');
            return null;
        }
    });

    ButtonClass = JQueryElementClass.extend({
        init: function(label, submit) {
            var that = this;
            this.$div = $('<div>').addClass('button').text(label);
            if (submit)
                this.$div.addClass('submit');
            this.$div.click(function() {
                that.onClick();
            });
            return this;
        },
        changeLabel: function(label) {
            this.$div.text(label);
            return this;
        },
        changeSubmit: function(submit) {
            this.$div.removeClass('submit');
            if (submit)
                this.$div.addClass('submit');
            return this;
        },
        onClick: function() {
            console.error('Missing onClick');
        },
        getJQueryElement: function() {
            return this.$div;
        }
    });

    InputClass = JQueryElementClass.extend({
        init: function(type, label, placeholder) {
            this.$div = $('<div>').addClass('input-group');
            if (label)
                this.$label = $('<div>').addClass('label').text(label);
            this.$input = $('<input>').attr({
                type: type,
                placeholder: placeholder
            });

            if (label)
                this.$div.append(this.$label);
            this.$div.append(this.$input);
        },
        changeLabel: function(label) {
            this.$div.text(label);
            return this;
        },
        changeSubmit: function(submit) {
            this.$div.removeClass('submit');
            if (submit)
                this.$div.addClass('submit');
            return this;
        },
        change: function(onChangeFunc) {
            if (typeof onChangeFunc == 'function')
                this.$div.change(onChangeFunc);
            return this;
        },
        getJQueryElement: function() {
            return this.$div;
        }
    });

    PanelClass = Class.extend({
        init: function(name) {
            this._content = [];
            this.name = name;
        },
        addContent: function(content) {
            if (content instanceof $) {
                this._content.push(content);
            }
        },
        print: function() {
            for (var i in this._content) {
                if (!this._content.hasOwnProperty(i)) continue;
                var $content = this._content[i];
                if ($content instanceof JQueryElementClass)
                    $content = $content.getJQueryElement();
                scrollPane.getContentPane().append($content);
            }
        }
    });

    ControlPanelClass = Class.extend({
        init: function() {
            _this = this;
            _onResize = _.bind(this.onResize, this);
            _onTabClick = _.bind(this.onTabClick, this);

            $(window).resize(_onResize);

            this.shown = false;
        },
        close: function() {
            $(window).off('resize', _onResize);
            if ($controlPanelDiv != null)
                $controlPanelDiv.remove();
        },
        createControlPanel: function(onlyRecreate) {
            if ($controlPanelDiv != null) {
                $controlPanelDiv.remove();
            } else if (onlyRecreate) return;
            $controlPanelDiv = $('<div>').attr('id', 'p3-control-panel');

            $menuDiv = $('<div>').attr('id', 'p3-control-panel-menu');

            for (var i in tabs) {
                if (tabs.hasOwnProperty(i)) {
                    $menuDiv.append($('<div>').addClass('p3-control-panel-menu-tab tab-' + i).data('id', i).text(i).click(_onTabClick));
                }
            }

            $topBarDiv = $('<div>').attr('id', 'p3-control-panel-top').append($('<span>').text('Control Panel'));

            $controlPanelDiv.append($topBarDiv).append($menuDiv);

            $currentDiv = $('<div>').attr('id', 'p3-control-panel-current');

            $controlPanelDiv.append($currentDiv);

            $closeDiv = $('<div>').attr('id', 'p3-control-panel-close').append('<i class="icon icon-arrow-down"></i>').click(function() {
                _this.toggleControlPanel(false);
            });

            $controlPanelDiv.append($closeDiv);

            $('body').append($controlPanelDiv);
            this.onResize();
        },
        /**
         * Create an input field
         * @param {string} type Type of input field
         * @param {undefined|string} [label]
         * @param {undefined|string} [placeholder] Placeholder
         * @returns {*|jQuery}
         */
        inputField: function(type, label, placeholder) {
            return new InputClass(type, label, placeholder);
        },
        /**
         * @callback onButtonClick
         * @param {object}
         */
        /**
         * Create a button
         * @param {string} label
         * @param {boolean} submit
         * @param {onButtonClick} onClick
         * @returns {*|jQuery}
         */
        button: function(label, submit, onClick) {
            var newButton = new ButtonClass(label, submit);
            if (typeof onClick === 'function')
                newButton.onClick = onClick;
            return newButton;
        },
        onResize: function() {
            if ($controlPanelDiv == null) return;
            var $panel = $('#playlist-panel'),
                shownHeight = $(window).height() - 150;

            $controlPanelDiv.css({
                width: $panel.width(),
                height: this.shown ? shownHeight : 0,
                'z-index': 50
            });

            $currentDiv.css({
                width: $panel.width() - 256 - 20,
                height: this.shown ? shownHeight - $topBarDiv.height() - 20 : 0
            });

            if (this.shown && scrollPane) {
                scrollPane.reinitialise();
            }
        },
        toggleControlPanel: function(shown) {
            if ($controlPanelDiv == null) {
                if (shown != null && !shown) return;
                this.createControlPanel();
            }
            this.shown = shown != null ? shown : !this.shown;
            shownHeight = $(window).height() - 150;
            $controlPanelDiv.animate({
                height: this.shown ? shownHeight : 0
            }, {
                duration: 350,
                easing: 'easeInOutExpo',
                complete: function() {
                    if (!_this.shown) {
                        $controlPanelDiv.detach();
                        $controlPanelDiv = null;
                        scrollPane.destroy();
                        scrollPane = null;
                    }
                }
            });
        },
        onTabClick: function(e) {
            this.openTab($(e.currentTarget).data('id'));
        },
        openTab: function(id) {
            this.toggleControlPanel(true);
            var tab = tabs[id];
            if (tab == null || !(tab instanceof PanelClass)) return;

            $menuDiv.find('.current').removeClass('current');
            $('.p3-control-panel-menu-tab.tab-' + id).addClass('current');

            if (scrollPane == null) {
                $currentDiv.jScrollPane({
                    showArrows: true
                });
                scrollPane = $currentDiv.data('jsp');
            }

            scrollPane.getContentPane().html('');
            tab.print();

            this.onResize();
        },
        /**
         * Add a new tab, if it doesn't already exists
         * @param {string} name Name of tab
         * @returns {PanelClass}
         */
        addPanel: function(name) {
            name = name.trim();
            if (tabs[name] != null) return null;
            tabs[name] = new PanelClass(name);
            this.createControlPanel(true);
            return tabs[name];
        },
        /**
         * Remove a tab, if tab exists
         * @param {PanelClass} panel Name of tab
         * @returns {Boolean}
         */
        removePanel: function(panel) {
            if (!(panel instanceof PanelClass) || tabs[panel.name] == null) return false;
            delete tabs[panel.name];
            this.createControlPanel(true);
            return true;
        }
    });
    return new ControlPanelClass();
});
define('fefed4/ae602d/d6faeb', ['jquery', 'fefed4/d778d3', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/c04848', 'fefed4/e89711/eb40f3'], function($, Class, p3Utils, p3Lang, Settings, _$context) {
    var PopoutView, twitchEmoteTemplate = '',
        twitchEmotes = [];

    if (!p3Utils.runLite)
        PopoutView = require('ac791/b6b41/ada16/d8b38/b6ec5');

    $("#chat-messages").on('mouseover', '.twitch-emote', function() {
        _$context.trigger('tooltip:show', $(this).data('emote'), $(this), true);
    }).on('mouseout', '.twitch-emote', function() {
        _$context.trigger('tooltip:hide');
    });

    function convertImageLinks(text, $message) {
        if (Settings.chatImages) {
            if (text.toLowerCase().indexOf('nsfw') < 0) {
                var temp = $('<div/>');
                temp.html(text).find('a').each(function() {
                    var url = $(this).attr('href'),
                        path, imageURL = null,
                        $video, identifier;

                    // Prevent plug.dj exploits
                    if (p3Utils.startsWithIgnoreCase(url, ['http://plug.dj', 'https://plug.dj'])) {
                        return;

                        // Normal image links
                    } else if (p3Utils.endsWithIgnoreCase(url, ['.gif', '.jpg', '.jpeg', '.png']) || p3Utils.endsWithIgnoreCase(p3Utils.getBaseURL(url), ['.gif', '.jpg', '.jpeg', '.png'])) {
                        imageURL = p3Utils.proxifyImage(url);

                        // gfycat links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://gfycat.com/', 'https://gfycat.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0) {
                                identifier = 'video-' + p3Utils.getRandomString(8);

                                $video = $('<video autoplay loop muted="muted">').addClass(identifier).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');

                                $(this).html('').append($video);

                                $video.on('load', function() {
                                    var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'),
                                        height = this.height;
                                    if (this.width > $chat.find('.message').width())
                                        height *= this.width / $chat.find('.message').width();
                                    $chat.scrollTop($chat[0].scrollHeight + height);
                                });

                                $.getJSON('https://gfycat.com/cajax/get/' + path, function(videoData) {
                                    $video = $message.find('.' + identifier);

                                    if (videoData.error) {
                                        console.log('error', videoData);
                                        $video.html(videoData.error);
                                        return;
                                    }

                                    var webmUrl, mp4Url, imgUrl;

                                    webmUrl = p3Utils.httpsifyURL(videoData['gfyItem']['webmUrl']);
                                    mp4Url = p3Utils.httpsifyURL(videoData['gfyItem']['mp4Url']);
                                    imgUrl = p3Utils.httpsifyURL(videoData['gfyItem']['gifUrl']);

                                    $video.append($('<source>').attr('type', 'video/webm').attr('src', webmUrl));
                                    $video.append($('<source>').attr('type', 'video/mp4').attr('src', mp4Url));
                                    $video.append($('<img>').attr('src', imgUrl));
                                });
                            }
                        }

                        // Lightshot links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://prntscr.com/', 'https://prntscr.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0)
                                imageURL = 'https://api.plugCubed.net/redirect/prntscr/' + path;
                        }

                        // Imgur links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://imgur.com/gallery/', 'https://imgur.com/gallery/', 'http://imgur.com/', 'https://imgur.com/'])) {
                        path = url.split('/');
                        if (path.length > 4) {
                            path = path[4];
                            if (path.trim().length !== 0) {
                                identifier = 'video-' + p3Utils.getRandomString(8);

                                $video = $('<video autoplay loop muted="muted">').addClass(identifier).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');

                                $(this).html('').append($video);

                                $video.on('load', function() {
                                    var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'),
                                        height = this.height;
                                    if (this.width > $chat.find('.message').width())
                                        height *= this.width / $chat.find('.message').width();
                                    $chat.scrollTop($chat[0].scrollHeight + height);
                                });

                                $.getJSON('https://api.plugcubed.net/redirect/imgurraw/' + path, function(imgurData) {
                                    $video = $message.find('.' + identifier);

                                    if (imgurData.error) {
                                        console.log('error', imgurData);
                                        $video.html(imgurData.error);
                                        return;
                                    }

                                    if (imgurData['webm'] != null)
                                        $video.append($('<source>').attr('type', 'video/webm').attr('src', p3Utils.httpsifyURL(imgurData['webm'])));

                                    if (imgurData['webm'] != null)
                                        $video.append($('<source>').attr('type', 'video/mp4').attr('src', p3Utils.httpsifyURL(imgurData['mp4'])));

                                    $video.attr('poster', p3Utils.httpsifyURL(imgurData['link']));
                                    $video.append($('<img>').attr('src', p3Utils.httpsifyURL(imgurData['link'])));
                                });
                            }
                        }

                        // Gyazo links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://gyazo.com/', 'https://gyazo.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0)
                                imageURL = 'https://i.gyazo.com/' + path + '.png';
                        }
                    } else {
                        // DeviantArt links
                        var daTests = [/http:\/\/[a-z\-\.]+\.deviantart.com\/art\/[0-9a-zA-Z:\-]+/, /http:\/\/[a-z\-\.]+\.deviantart.com\/[0-9a-zA-Z:\-]+#\/[0-9a-zA-Z:\-]+/, /http:\/\/fav.me\/[0-9a-zA-Z]+/, /http:\/\/sta.sh\/[0-9a-zA-Z]+/];
                        for (var i in daTests) {
                            if (daTests.hasOwnProperty(i) && daTests[i].test(url)) {
                                imageURL = 'https://api.plugCubed.net/redirect/da/' + url;
                                break;
                            }
                        }
                    }

                    // If supported image link
                    if (imageURL !== null) {
                        var image = $('<img>').attr('src', imageURL).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');
                        $(this).html(image);
                        image.on('load', function() {
                            var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'),
                                height = this.height;
                            if (this.width > $chat.find('.message').width())
                                height *= this.width / $chat.find('.message').width();
                            $chat.scrollTop($chat[0].scrollHeight + height);
                        });
                    }
                });
                text = temp.html();
            }
        }
        return text;
    }

    function convertEmotes(text) {
        if (Settings.twitchEmotes) {
            var nbspStart = p3Utils.startsWithIgnoreCase(text, '&nbsp;');
            text = ' ' + (nbspStart ? text.replace('&nbsp;', '') : text) + ' ';
            for (var i in twitchEmotes) {
                if (!twitchEmotes.hasOwnProperty(i)) continue;
                var twitchEmote = twitchEmotes[i];
                if (text.indexOf(' ' + twitchEmote.emote + ' ') > -1 || text.indexOf(':' + twitchEmote.emote + ':') > -1) {
                    var temp = $('<div>'),
                        image = $('<img>').addClass('twitch-emote').attr('src', twitchEmoteTemplate.split('{image_id}').join(twitchEmote.image_id)).data('emote', $('<span>').html(twitchEmote.emote).text());
                    image.on('load', function() {
                        var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'),
                            height = this.height;
                        if (this.width > $chat.find('.message').width())
                            height *= this.width / $chat.find('.message').width();
                        $chat.scrollTop($chat[0].scrollHeight + height);
                    });
                    temp.append(image);
                    text = text.split(' ' + twitchEmote.emote + ' ').join(' ' + temp.html() + ' ');
                    text = text.split(':' + twitchEmote.emote + ':').join(temp.html());
                }
            }
            return (nbspStart ? '&nbsp;' : '') + text.substr(1, text.length - 2);
        }
        return text;
    }

    function onChatReceived(data) {
        if (!data.uid) return;

        if (data.uid == API.getUser().id) {
            var latestInputs = p3Utils.getUserData(-1, 'latestInputs', []);
            latestInputs.push(data.message);
            if (latestInputs.length > 10) {
                latestInputs.splice(0, 1);
            }
            p3Utils.setUserData(-1, 'latestInputs', latestInputs);
            p3Utils.setUserData(-1, 'tmpInput', null);
        }

        p3Utils.setUserData(data.uid, 'lastChat', Date.now());

        if (p3Utils.hasPermission(undefined, API.ROLE.DJ) && (function(_) {
                return p3Utils.isPlugCubedDeveloper(_) || p3Utils.isPlugCubedSponsor(_) || p3Utils.isPlugCubedAmbassador(_);
            })(API.getUser().id)) {
            data.deletable = true;
        }

        data.un = p3Utils.cleanHTML(data.un, '*');
        data.message = p3Utils.cleanHTML(data.message, ['div', 'table', 'tr', 'td']);
    }

    function onChatReceivedLate(data) {
        if (!data.uid) return;

        var $this = $('.msg.cid-' + data.cid).closest('.cm'),
            $icon;

        var previousMessages = '',
            innerHTML = $this.find('.text').html();
        if (innerHTML != null && innerHTML.indexOf('<br>') > -1) {
            previousMessages = innerHTML.substr(0, innerHTML.lastIndexOf('<br>') + 4);
        }

        var msgClass = $this.attr('class');

        msgClass += ' fromID-' + data.uid;

        if (p3Utils.havePlugCubedRank(data.uid)) {
            msgClass += ' is-p3' + p3Utils.getHighestRank(data.uid);
        }

        msgClass += ' from';
        if (p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
            msgClass += '-';
            if (p3Utils.hasPermission(data.uid, API.ROLE.HOST, true)) {
                msgClass += 'admin';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER, true)) {
                msgClass += 'ambassador';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.HOST)) {
                msgClass += 'host';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.COHOST)) {
                msgClass += 'cohost';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.MANAGER)) {
                msgClass += 'manager';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER)) {
                msgClass += 'bouncer';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
                msgClass += 'dj';
            }
        }

        if (data.uid == API.getUser().id) {
            msgClass += ' from-you';
        }

        data.message = convertImageLinks(data.message, $this);
        data.message = convertEmotes(data.message);

        if (p3Utils.havePlugCubedRank(data.uid) || p3Utils.hasPermission(data.uid, API.ROLE.DJ)) {
            $icon = $this.find('.from .icon');
            var specialIconInfo = p3Utils.getPlugCubedSpecial(data.uid);
            if ($icon.length === 0) {
                $icon = $('<i>').addClass('icon').css({
                    width: '16px',
                    height: '16px'
                }).prependTo($this.find('.from'));
            }

            if ($icon.hasClass('icon-chat-subscriber') && API.getUser(data.uid).role === 0 && !API.getUser(data.uid).gRole > 0) {
                $icon.removeClass('icon-chat-subscriber');
            }

            $icon.mouseover(function() {
                _$context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(data.uid)).text(), $(this), true);
            }).mouseout(function() {
                _$context.trigger('tooltip:hide');
            });

            if (specialIconInfo != null) {
                $icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/files/images/icons.p3special.' + specialIconInfo.icon + '.png")');
            }
        }

        $this.attr('class', msgClass);
        $this.find('.text').html(previousMessages + p3Utils.cleanHTML(data.message, ['div', 'table', 'tr', 'td'], ['img', 'video', 'source']));

        $this.data('translated', false);
        $this.dblclick(function(e) {
            if (!e.ctrlKey) return;
            if ($this.data('translated')) {
                $this.find('.text').html(convertEmotes(convertImageLinks(data.message)));
                $this.data('translated', false);
            } else {
                $this.find('.text').html('<em>Translating...</em>');
                $.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Ftranslate.google.com%2Ftranslate_a%2Ft%3Fclient%3Dp3%26sl%3Dauto%26tl%3D' + API.getUser().language + '%26ie%3DUTF-8%26oe%3DUTF-8%26q%3D' + encodeURIComponent(encodeURIComponent(data.message.replace('&nbsp;', ' '))) + '%22&format=json', function(a) {
                    if (a.error) {
                        $this.find('.text').html(convertEmotes(convertImageLinks(data.message)));
                        $this.data('translated', false);
                    } else {
                        $this.find('.text').html(convertEmotes(convertImageLinks(p3Utils.objectSelector(a, 'query.results.json.sentences.trans', data.message))));
                        $this.data('translated', true);
                    }
                }, 'json');
            }
            e.stopPropagation();
        });
    }

    function onChatDelete(cid) {
        if ((!p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper()) || !Settings.moderation.showDeletedMessages)
            return;

        var $messages = $('.text.cid-' + cid);

        if ($messages.length > 0) {
            $messages.each(function() {
                $(this).removeClass('cid-' + cid).closest('.cm').removeClass('deletable').css('opacity', 0.3).off('mouseenter').off('mouseleave');
            });
        }
    }

    function onInputKeyUp(e) {
        if (e.keyCode == 38) {
            onInputMove(true, $(this));
        } else if (e.keyCode == 40) {
            onInputMove(false, $(this));
        }
    }

    function onInputMove(up, $this) {
        var latestInputs = p3Utils.getUserData(-1, 'latestInputs', []);
        if (latestInputs.length === 0) return;

        var curPos = p3Utils.getUserData(-1, 'curInputPos', 0);
        var tmpInput = p3Utils.getUserData(-1, 'tmpInput', null);

        if ((tmpInput == null && up) || curPos === 0) {
            tmpInput = $this.val();
        } else if (tmpInput == null) {
            return;
        }

        curPos = Math.max(0, Math.min(curPos + (up ? 1 : -1), latestInputs.length));

        p3Utils.setUserData(-1, 'curInputPos', curPos);
        p3Utils.setUserData(-1, 'tmpInput', tmpInput);

        $this.val(curPos === 0 ? tmpInput : latestInputs[latestInputs.length - curPos]);
    }

    var handler = Class.extend({
        loadTwitchEmotes: function() {
            $.getJSON('https://api.plugcubed.net/twitchemotes', function(data) {
                twitchEmoteTemplate = data['template']['small'];

                twitchEmotes = [];
                for (var i in data['emotes']) {
                    if (!data['emotes'].hasOwnProperty(i)) continue;
                    twitchEmotes.push({
                        emote: i,
                        image_id: data['emotes'][i].image_id
                    });
                }

                console.log('[plug³]', twitchEmotes.length + ' Twitch.TV emoticons loaded!');
            });
        },
        unloadTwitchEmotes: function() {
            twitchEmotes = [];
        },
        register: function() {
            _$context.on('chat:receive', onChatReceived);
            _$context._events['chat:receive'].unshift(_$context._events['chat:receive'].pop());
            _$context.on('chat:receive', onChatReceivedLate);

            _$context.on('chat:delete', onChatDelete);
            _$context._events['chat:delete'].unshift(_$context._events['chat:delete'].pop());

            $('#chat-input-field').on('keyup', onInputKeyUp);
        },
        close: function() {
            _$context.off('chat:receive', onChatReceived);
            _$context.off('chat:receive', onChatReceivedLate);
            _$context.off('chat:delete', onChatDelete);

            $('#chat-input-field').off('keyup', onInputKeyUp);
        }
    });
    return new handler();
});
define('fefed4/ae602d/ce9902', ['jquery', 'fefed4/d778d3', 'fefed4/adb763', 'fefed4/d10ed2'], function($, Class, Styles, p3Lang) {
    var fullScreen = false,
        fullScreenButton;

    function fullScreenResizer() {
        if (fullScreen) {
            Styles.unset('Fullscreen');
            var $appRightHeight = $('.app-right').height(),
                $djButtonHeight = $('#dj-button').height(),
                $voteHeight = $('#vote').height(),
                $docWidth = $(document).width(),
                $chatWidth = $('#chat').width();

            Styles.set('Fullscreen',
                '.app-right { height: ' + ($appRightHeight - $voteHeight - $djButtonHeight) + 'px!important; } ' +
                '#chat-messages { height: ' + ($('#chat-messages').height() - $voteHeight - $djButtonHeight) + 'px!important; } ' +
                '#dj-button { right: 0px!important; top: ' + ($appRightHeight - $voteHeight - 7) + 'px!important; width: 345px!important; left: initial!important; } ' +
                '#vote { right: 0px!important; top: ' + ($appRightHeight - 7) + 'px!important; width: 345px!important; left: initial!important; } ' +
                '#vote .crowd-response { width: 33.33%!important; margin-right: 0px!important; }' +
                '#woot, #woot .bottom, #meh, #meh .bottom, #dj-button, #dj-button .left { border-radius: 0px 0px 0px 0px } ' +
                '#playback-container { height: ' + ($(document).height() - $('.app-header').height() - $('#footer').height()) + 'px!important; width: ' + ($docWidth - $chatWidth) + 'px!important; left: -9px!important; } ' +
                '#playback-controls { left: ' + ($docWidth - $chatWidth - $('#playback-controls').width()) / 2 + 'px!important; } ' +
                '#playback { left: 9px!important; z-index: 6; } ');
        }
    }

    var handler = Class.extend({
        create: function() {
            fullScreenButton = $('<div>').addClass('button p3-fullscreen').append($('<div>').addClass('box').text('Enlarge')).css('background-color', 'rgba(28,31,37,.7)');

            $('#playback-controls').append(fullScreenButton)
                .find('.button').width('25%')
                .parent().find('.button .box .icon').hide();

            fullScreenButton.click($.proxy(this.onClick, this));
            var delayedRun;
            $(window).resize(function() {
                clearTimeout(delayedRun);
                var delayedRun = setTimeout(fullScreenResizer, 100);
            });
        },
        onClick: function() {
            this.toggleFullScreen();
        },
        toggleFullScreen: function() {
            fullScreen = !fullScreen;
            if (fullScreen) {
                fullScreenButton.find('.box').text(p3Lang.i18n('fullscreen.shrink'));
                fullScreenResizer();
            } else {
                fullScreenButton.find('.box').text(p3Lang.i18n('fullscreen.enlarge'));
                Styles.unset('Fullscreen');
            }
        },
        close: function() {
            fullScreenButton.remove();
            $('#playback-controls').find('.button').removeAttr('style')
                .parent().find('.button .box .icon').show();
            $(window).off('resize', fullScreenResizer);
            Styles.unset('Fullscreen');
        }
    });
    return new handler();
});
define('fefed4/e46194/cfcd5d', ['jquery', 'fefed4/d778d3', 'fefed4/fa8684', 'fefed4/a7bf09/e750d4', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/adb763', 'fefed4/fb5799', 'fefed4/af7c51', 'fefed4/e46194/ac13ee', 'fefed4/e46194/c55cd8', 'fefed4/e89711/eb40f3', 'fefed4/ae602d/d6faeb', 'fefed4/ae602d/ce9902', 'lang/Lang'], function($, Class, Version, enumNotifications, Settings, p3Utils, p3Lang, Styles, RoomSettings, Slider, dialogColors, dialogControlPanel, Context, ChatHandler, FullscreenHandler, Lang) {
    var $wrapper, $menuDiv, Database, PlaybackModel, menuClass, _this, menuButton, streamButton, clearChatButton, _onClick;

    menuButton = $('<div id="plugcubed"><div class="cube-wrap"><div class="cube"><i class="icon icon-plugcubed"></i><i class="icon icon-plugcubed other"></i></div></div></div>');
    streamButton = $('<div>').addClass('chat-header-button p3-s-stream').data('key', 'stream');
    clearChatButton = $('<div>').addClass('chat-header-button p3-s-clear').data('key', 'clear');

    if (!p3Utils.runLite) {
        Database = require('ac791/e1740/d7ae3');
        PlaybackModel = require('ac791/ad0b5/be2fa');
    }

    function GUIButton(setting, id, text) {
        return $('<div>').addClass('item p3-s-' + id + (setting ? ' selected' : '')).append($('<i>').addClass('icon icon-check-blue')).append($('<span>').text(text)).data('key', id).click(_onClick);
    }

    menuClass = Class.extend({
        init: function() {
            _this = this;
            _onClick = $.proxy(this.onClick, this);

            this.shown = false;

            $('#app-menu').after(menuButton);
            menuButton.click(function() {
                _this.toggleMenu();
                dialogControlPanel.toggleControlPanel(false);
            });
            $('#room-bar').css('left', 108).find('.favorite').css('right', 55);
            $('#plugcubed .cube-wrap .cube').bind('webkitAnimationEnd mozAnimationEnd msAnimationEnd animationEnd', function() {
                $("#plugcubed .cube-wrap .cube").removeClass('spin');
            });
            $('#plugcubed').mouseenter(function() {
                $('#plugcubed .cube-wrap .cube').addClass('spin');
            });

            if (!p3Utils.runLite) {
                $('#chat-header').append(streamButton.click($.proxy(this.onClick, this)).mouseover(function() {
                    Context.trigger('tooltip:show', p3Lang.i18n('tooltip.stream'), $(this), true);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                })).append(clearChatButton.click($.proxy(this.onClick, this)).mouseover(function() {
                    Context.trigger('tooltip:show', p3Lang.i18n('tooltip.clear'), $(this), true);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                }));
                this.onRoomJoin();

                Context.on('room:joined', this.onRoomJoin, this);
            }

            FullscreenHandler.create();
        },
        onRoomJoin: function() {
            this.setEnabled('stream', Database.settings.streamDisabled);
        },
        close: function() {
            menuButton.remove();
            if ($wrapper != null)
                $wrapper.remove();
            $('#room-bar').css('left', 54).find('.favorite').css('right', 0);
            if (!p3Utils.runLite) {
                streamButton.remove();
                clearChatButton.remove();

                Context.off('room:joined', this.onRoomJoin, this);
            }
            dialogControlPanel.close();
            FullscreenHandler.close();
        },
        /**
         * Set whether a menu setting is enabled
         * @param {String} id Menu setting ID
         * @param {Boolean} value Is this menu setting enabled?
         */
        setEnabled: function(id, value) {
            var elem = $('.p3-s-' + id).removeClass('selected');
            if (value) elem.addClass('selected');
        },
        /**
         * Handle click event
         * @param {Event} e The click event
         */
        onClick: function(e) {
            var a = $(e.currentTarget).data('key');
            switch (a) {
                case 'woot':
                    Settings.autowoot = !Settings.autowoot;
                    this.setEnabled('woot', Settings.autowoot);
                    if (Settings.autowoot) {
                        (function() {
                            var dj = API.getDJ();
                            if (dj === null || dj.id === API.getUser().id) return;
                            $('#woot').click();
                        })();
                    }
                    break;
                case 'join':
                    Settings.autojoin = !Settings.autojoin;
                    this.setEnabled('join', Settings.autojoin);
                    if (Settings.autojoin) {
                        (function() {
                            var dj = API.getDJ();
                            if (dj != null && dj.id == API.getUser().id || API.getWaitListPosition() > -1) return;
                            $('#dj-button').click();
                        })();
                    }
                    break;
                case 'chatimages':
                    Settings.chatImages = !Settings.chatImages;
                    this.setEnabled('chatimages', Settings.chatImages);
                    break;
                case 'twitchemotes':
                    Settings.twitchEmotes = !Settings.twitchEmotes;
                    if (Settings.twitchEmotes) {
                        ChatHandler.loadTwitchEmotes();
                    } else {
                        ChatHandler.unloadTwitchEmotes();
                    }
                    this.setEnabled('twitchemotes', Settings.twitchEmotes);
                    break;
                case 'colors':
                    dialogColors.render();
                    break;
                case 'controlpanel':
                    dialogControlPanel.toggleControlPanel(true);
                    this.toggleMenu(false);
                    break;
                case 'autorespond':
                    Settings.autorespond = !Settings.autorespond;
                    this.setEnabled('autorespond', Settings.autorespond);
                    if (Settings.autorespond) {
                        if (Settings.awaymsg.trim() === "") Settings.awaymsg = p3Lang.i18n('autorespond.default');
                        $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                    } else {
                        $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                    }
                    break;
                case 'notify-join':
                case 'notify-leave':
                case 'notify-grab':
                case 'notify-meh':
                case 'notify-stats':
                case 'notify-updates':
                case 'notify-history':
                case 'notify-songLength':
                case 'notify-unavailable':
                    var elem = $('.p3-s-' + a);
                    if (!elem.data('perm') || (API.hasPermission(undefined, elem.data('perm')) || p3Utils.isPlugCubedDeveloper())) {
                        var bit = elem.data('bit');
                        Settings.notify += (Settings.notify & bit) === bit ? -bit : bit;
                        this.setEnabled(a, (Settings.notify & bit) === bit);
                    }
                    break;
                case 'stream':
                    Database.settings.streamDisabled = !Database.settings.streamDisabled;
                    Context.trigger('change:streamDisabled');
                    this.setEnabled('stream', Database.settings.streamDisabled);
                    return;
                case 'clear':
                    Context.trigger('ChatFacadeEvent:clear');
                    return;
                case 'roomsettings':
                    var b = Settings.useRoomSettings[window.location.pathname.split('/')[1]];
                    b = !(b == null || b === true);
                    Settings.useRoomSettings[window.location.pathname.split('/')[1]] = b;
                    RoomSettings.execute(b);
                    this.setEnabled('roomsettings', b);
                    break;
                case 'afktimers':
                    Settings.moderation.afkTimers = !Settings.moderation.afkTimers;
                    this.setEnabled('afktimers', Settings.moderation.afkTimers);
                    if (Settings.moderation.afkTimers) {
                        //Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                    } else {
                        //Styles.unset('waitListMove');
                        $('#waitlist').find('.user .afkTimer').remove();
                    }
                    break;
                case 'etatimer':
                    Settings.etaTimer = !Settings.etaTimer;
                    this.setEnabled('etatimer', Settings.etaTimer);
                    if (Settings.etaTimer) {
                        Styles.set('etaTimer', '#your-next-media .song { top: 8px!important; }');
                    } else {
                        Styles.unset('etaTimer');
                        var $djButton = $('#dj-button').find('span'),
                            waitListPos = API.getWaitListPosition();

                        if (waitListPos < 0) {
                            $djButton.html(API.getWaitList().length < 50 ? Lang.dj.waitJoin : Lang.dj.waitFull);
                            break;
                        }

                        $djButton.html(Lang.dj.waitLeave);
                    }
                    break;
                case 'language':
                    console.log('Language click');
                    break;
                default:
                    API.chatLog(p3Lang.i18n('error.unknownMenuKey', a));
                    return;
            }
            Settings.save();
        },
        /**
         * Create the menu.
         * If the menu already exist, recreates it.
         */
        createMenu: function() {
            if ($menuDiv != null)
                $menuDiv.remove();
            $menuDiv = $('<div>').css('left', this.shown ? 0 : -500).attr('id', 'p3-settings');
            var header = $('<div>').addClass('header'),
                container = $('<div>').addClass('container');

            // Header
            header.append($('<div>').addClass('back').append($('<i>').addClass('icon icon-arrow-left')).click(function() {
                _this.toggleMenu(false);
            }));
            header.append($('<div>').addClass('title').append($('<i>').addClass('icon icon-settings-white')).append($('<span>plug&#179;</span>')).append($('<span>').addClass('version').text(Version)));

            // Features
            container.append($('<div>').addClass('section').text('Features'));
            if (RoomSettings.rules.allowAutowoot !== false)
                container.append(GUIButton(Settings.autowoot, 'woot', p3Lang.i18n('menu.autowoot')));

            if (RoomSettings.rules.allowAutojoin !== false)
                container.append(GUIButton(Settings.autojoin, 'join', p3Lang.i18n('menu.autojoin')));

            if (RoomSettings.rules.allowAutorespond !== false) {
                container.append(GUIButton(Settings.autorespond, 'autorespond', p3Lang.i18n('menu.autorespond')));
                container.append($('<div class="item">').addClass('p3-s-autorespond-input').append($('<input>').val(Settings.awaymsg === '' ? p3Lang.i18n('autorespond.default') : Settings.awaymsg).keyup(function() {
                    $(this).val($(this).val().split('@').join(''));
                    Settings.awaymsg = $(this).val().trim();
                    Settings.save();
                })).mouseover(function() {
                    if (!p3Utils.runLite) {
                        Context.trigger('tooltip:show', p3Lang.i18n('tooltip.afk'), $(this), false);
                    }
                }).mouseout(function() {
                    if (!p3Utils.runLite) {
                        Context.trigger('tooltip:hide');
                    }
                }));
            }

            if (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                container.append(GUIButton(Settings.moderation.afkTimers, 'afktimers', p3Lang.i18n('menu.afktimers')));
            }

            if (RoomSettings.haveRoomSettings) {
                container.append(GUIButton(Settings.useRoomSettings[window.location.pathname.split('/')[1]] != null ? Settings.useRoomSettings[window.location.pathname.split('/')[1]] : true, 'roomsettings', p3Lang.i18n('menu.roomsettings')));
            }

            container.append(GUIButton(Settings.etaTimer, 'etatimer', p3Lang.i18n('menu.etatimer')));
            container.append(GUIButton(Settings.chatImages, 'chatimages', p3Lang.i18n('menu.chatimages')));
            container.append(GUIButton(Settings.twitchEmotes, 'twitchemotes', p3Lang.i18n('menu.twitchemotes')));
            container.append(GUIButton(false, 'colors', p3Lang.i18n('menu.customchatcolors') + '...'));

            if (p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) {
                container.append(GUIButton(false, 'controlpanel', p3Lang.i18n('menu.controlpanel') + '...'));
            }

            // Divider
            container.append($('<div class="spacer">').append($('<div class="divider">')));

            // Notification
            container.append($('<div class="section">' + p3Lang.i18n('notify.header') + '</div>'));

            container.append(GUIButton((Settings.notify & enumNotifications.USER_JOIN) === enumNotifications.USER_JOIN, 'notify-join', p3Lang.i18n('notify.join')).data('bit', enumNotifications.USER_JOIN));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_LEAVE) === enumNotifications.USER_LEAVE, 'notify-leave', p3Lang.i18n('notify.leave')).data('bit', enumNotifications.USER_LEAVE));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_GRAB) === enumNotifications.USER_GRAB, 'notify-grab', p3Lang.i18n('notify.grab')).data('bit', enumNotifications.USER_GRAB));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH, 'notify-meh', p3Lang.i18n('notify.meh')).data('bit', enumNotifications.USER_MEH));
            container.append(GUIButton((Settings.notify & enumNotifications.SONG_STATS) === enumNotifications.SONG_STATS, 'notify-stats', p3Lang.i18n('notify.stats')).data('bit', enumNotifications.SONG_STATS));
            container.append(GUIButton((Settings.notify & enumNotifications.SONG_UPDATE) === enumNotifications.SONG_UPDATE, 'notify-updates', p3Lang.i18n('notify.updates')).data('bit', enumNotifications.SONG_UPDATE));

            if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
                var songLengthSlider = new Slider(5, 30, Settings.notifySongLength, function(v) {
                    Settings.notifySongLength = v;
                    Settings.save();
                    $('.p3-s-notify-songLength').find('span').text(p3Lang.i18n('notify.songLength', v))
                });
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_HISTORY) === enumNotifications.SONG_HISTORY, 'notify-history', p3Lang.i18n('notify.history')).data('bit', enumNotifications.SONG_HISTORY).data('perm', API.ROLE.BOUNCER));
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE, 'notify-unavailable', p3Lang.i18n('notify.songUnavailable')).data('bit', enumNotifications.SONG_UNAVAILABLE).data('perm', API.ROLE.BOUNCER));
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_LENGTH) === enumNotifications.SONG_LENGTH, 'notify-songLength', p3Lang.i18n('notify.songLength', Settings.notifySongLength)).data('bit', enumNotifications.SONG_LENGTH).data('perm', API.ROLE.BOUNCER));
                container.append(songLengthSlider.$slider.css('left', 40));
            }

            $wrapper = $('<div>').attr('id', 'p3-settings-wrapper');

            $('body').append($wrapper.append($menuDiv.append(header).append(container)));
            if (songLengthSlider != null) songLengthSlider.onChange();
        },
        /**
         * Toggle the visibility of the menu
         * @param {Boolean} [shown] Force it to be shown or hidden.
         */
        toggleMenu: function(shown) {
            if ($menuDiv == null) {
                this.createMenu();
            }
            this.shown = shown == null ? !this.shown : shown;
            if (!this.shown)
                dialogColors.hide();
            $menuDiv.animate({
                left: this.shown ? 0 : -500
            }, {
                complete: function() {
                    if (!_this.shown) {
                        $menuDiv.detach();
                        $menuDiv = undefined;
                    }
                }
            });
        }
    });
    return new menuClass();
});
define('fefed4/e46194/b7935c', ['jquery', 'fefed4/d778d3', 'fefed4/d10ed2', 'fefed4/b98817'], function($, Class, p3Lang, p3Utils) {
    var userCommands = [
            ['/badges (commands.variables.on/commands.variables.off)', 'commands.descriptions.badges'],
            ['/join', 'commands.descriptions.join'],
            ['/leave', 'commands.descriptions.leave'],
            ['/whoami', 'commands.descriptions.whoami'],
            ['/mute', 'commands.descriptions.mute'],
            ['/automute', 'commands.descriptions.automute'],
            ['/unmute', 'commands.descriptions.unmute'],
            ['/nextsong', 'commands.descriptions.nextsong'],
            ['/refresh', 'commands.descriptions.refresh'],
            ['/status', 'commands.descriptions.status'],
            ['/alertson (commands.variables.word)', 'commands.descriptions.alertson'],
            ['/alertsoff', 'commands.descriptions.alertsoff'],
            ['/grab', 'commands.descriptions.grab'],
            ['/getpos', 'commands.descriptions.getpos'],
            ['/version', 'commands.descriptions.version'],
            ['/commands', 'commands.descriptions.commands'],
            ['/link', 'commands.descriptions.link'],
            ['/volume (commands.variables.number/+/-)']
        ],
        modCommands = [
            ['/whois (commands.variables.username)', 'commands.descriptions.whois', API.ROLE.BOUNCER],
            ['/skip', 'commands.descriptions.skip', API.ROLE.BOUNCER],
            ['/ban (commands.variables.username)', 'commands.descriptions.ban', API.ROLE.BOUNCER],
            ['/lockskip', 'commands.descriptions.lockskip', API.ROLE.MANAGER],
            ['/lock', 'commands.descriptions.lock', API.ROLE.MANAGER],
            ['/unlock', 'commands.descriptions.unlock', API.ROLE.MANAGER],
            ['/add (commands.variables.username)', 'commands.descriptions.add', API.ROLE.BOUNCER],
            ['/remove (commands.variables.username)', 'commands.descriptions.remove', API.ROLE.BOUNCER],
            ['/whois all', 'commands.descriptions.whois', API.ROLE.AMBASSADOR],
            ['/banall', 'commands.descriptions.banall', API.ROLE.AMBASSADOR]
        ],
        a = Class.extend({
            userCommands: function() {
                var response = '<strong style="position:relative;left: 20%;">=== ' + p3Lang.i18n('commands.userCommands') + ' ===</strong><br><ul class="p3-commands">';
                for (var i in userCommands) {
                    if (!userCommands.hasOwnProperty(i)) continue;
                    var command = userCommands[i][0];
                    if (command.split('(').length > 1 && command.split(')').length > 1) {
                        var argumentTranslationParts = command.split('(')[1].split(')')[0].split('/');

                        command = command.split('(')[0] + '<em>';

                        for (var j in argumentTranslationParts) {
                            if (!argumentTranslationParts.hasOwnProperty(j)) continue;
                            if (argumentTranslationParts[j] == '+' || argumentTranslationParts[j] == '-') {
                                command += argumentTranslationParts[j];
                            } else {
                                command += p3Lang.i18n(argumentTranslationParts[j]);
                            }
                        }

                        command += '</em>';
                    }
                    response += '<li class="userCommands">' + command + '<br><em>' + p3Lang.i18n(userCommands[i][1]) + '</em></li>';
                }
                response += '</ul>';
                return response;
            },
            modCommands: function() {
                var response = '<br><strong style="position:relative;left: 20%;">=== ' + p3Lang.i18n('commands.modCommands') + ' ===</strong><br><ul class="p3-commands">';
                for (var i in modCommands) {
                    if (!modCommands.hasOwnProperty(i)) continue;
                    if (API.hasPermission(undefined, modCommands[i][2])) {
                        var command = modCommands[i][0];
                        if (command.split('(').length > 1) {
                            var argumentTranslationParts = command.split('(')[1].split(')')[0].split('/');

                            command = command.split('(')[0] + '<em>';

                            for (var j in argumentTranslationParts) {
                                if (!argumentTranslationParts.hasOwnProperty(j)) continue;
                                if (argumentTranslationParts[j] == '+' || argumentTranslationParts[j] == '-') {
                                    command += argumentTranslationParts[j];
                                } else {
                                    command += p3Lang.i18n(argumentTranslationParts[j]);
                                }
                            }

                            command += '</em>';
                        }
                        response += '<li class="modCommands">' + command + '<br><em>' + p3Lang.i18n(modCommands[i][1]) + '</em></li>';
                    }
                }
                response += '</ul>';
                return response;
            },
            print: function() {
                var content = '<strong style="font-size:1.4em;position:relative;left: 20%">' + p3Lang.i18n('commands.header') + '</strong><br>';
                content += this.userCommands();
                if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                    content += this.modCommands();
                }
                p3Utils.chatLog(undefined, content, undefined, -1);
            }
        });
    return new a();
});
define('fefed4/ae602d/feae9c', ['fefed4/ae602d/c7c1ce', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/e46194/b7935c', 'fefed4/c04848', 'fefed4/fa8684', 'fefed4/adb763', 'fefed4/e89711/eb40f3', 'fefed4/e89711/a1b9a0'], function(TriggerHandler, p3Utils, p3Lang, dialogCommands, Settings, Version, StyleManager, Context, PlaybackModel) {
    var commandHandler;
    commandHandler = TriggerHandler.extend({
        trigger: API.CHAT_COMMAND,
        handler: function(value) {
            var i, args = value.split(' '),
                command = args.shift().substr(1);
            if (p3Utils.hasPermission(undefined, 2, true) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) {
                if (p3Utils.equalsIgnoreCase(command, 'whois')) {
                    if (args.length > 0 && p3Utils.equalsIgnoreCase(args[0], 'all')) {
                        p3Utils.getAllUsers();
                    } else {
                        p3Utils.getUserInfo(args.join(' '));
                    }
                    return;
                }
                if (API.hasPermission(undefined, API.ROLE.MANAGER)) {
                    if (p3Utils.equalsIgnoreCase(command, 'banall')) {
                        var me = API.getUser(),
                            users = API.getUsers();
                        for (i in users) {
                            if (users.hasOwnProperty(i) && users[i].id !== me.id)
                                API.moderateBanUser(users[i].id, 0, API.BAN.PERMA);
                        }
                        return;
                    }
                }
            }
            if (API.hasPermission(undefined, API.ROLE.MANAGER)) {
                if (p3Utils.equalsIgnoreCase(command, 'lock')) {
                    API.moderateLockWaitList(true, false);
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'unlock')) {
                    API.moderateLockWaitList(false, false);
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'lockskip')) {
                    var userID = API.getDJ().id;
                    API.once(API.ADVANCE, function() {
                        API.once(API.WAIT_LIST_UPDATE, function() {
                            API.moderateMoveDJ(userID, 1);
                        });
                        API.moderateAddDJ(userID);
                    });
                    API.moderateForceSkip();
                    return;
                }
            }
            if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                if (p3Utils.equalsIgnoreCase(command, 'skip')) {
                    if (API.getDJ() == null) return;
                    if (value.length > 5)
                        API.sendChat('@' + API.getDJ().username + ' - Reason for skip: ' + value.substr(5).trim());
                    API.moderateForceSkip();
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'whois')) {
                    p3Utils.getUserInfo(args.join(' '));
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'add')) {
                    this.moderation(args.join(' '), 'adddj');
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'remove')) {
                    this.moderation(args.join(' '), 'removedj');
                    return;
                }
            }
            if (p3Utils.equalsIgnoreCase(command, 'commands')) {
                dialogCommands.print();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'badges')) {
                StyleManager.unset('hide-badges');
                if (args.length > 0 && p3Utils.equalsIgnoreCase(args[0], p3Lang.i18n('commands.variables.off'))) {
                    // TODO: Add setting for this
                    StyleManager.set('hide-badges', '#chat .msg { padding: 5px 8px 6px 8px; } #chat-messages .badge-box { display: none; }');
                }
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'join')) {
                API.djJoin();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'leave')) {
                API.djLeave();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'whoami')) {
                p3Utils.getUserInfo(API.getUser().id);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'refresh')) {
                $('#refresh-button').click();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'volume')) {
                if (args.length > 0) {
                    if (p3Utils.isNumber(args[0])) {
                        API.setVolume(~~args[0]);
                    } else if (args[0] == '+') {
                        API.setVolume(API.getVolume() + 1);
                    } else if (args[0] == '-') {
                        API.setVolume(API.getVolume() - 1);
                    }
                }
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'version')) {
                API.chatLog(p3Lang.i18n('running', Version));
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'mute')) {
                if (API.getVolume() === 0) return;
                PlaybackModel.mute();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'unmute')) {
                if (API.getVolume() > 0) return;
                PlaybackModel.unmute();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'muteonce')) {
                if (API.getVolume() === 0) return;
                PlaybackModel.muteOnce();
                return;
            }
            // Worst hidden easter egg ever, but you can test this fullscreen feature so....
            // please test it now you found the command xD
            if (p3Utils.equalsIgnoreCase(command, 'easteregg')) {
                (function() {
                    var $docWidth = $(document).width(),
                        $docHeight = $(document).height(),
                        $chat = $('#chat'),
                        $playbackControls = $('#playback-controls');

                    $('#playback-container')
                        .width($docWidth - $chat.width())
                        .height($docHeight - $('.app-header').height() - $('#footer').height());

                    $playbackControls.css('left', ($docWidth - $chat.width() - $playbackControls.width()) / 2 + 'px');

                    $('#playback').css({
                        left: 9,
                        'z-index': 6
                    });
                })();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'link')) {
                API.sendChat('plugCubed : http://plugcubed.net');
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'status')) {
                p3Utils.statusREST(function(status, text, time) {
                    p3Utils.chatLog(undefined, p3Lang.i18n('commands.responses.status.rest', status, text, time), status == 200 ? '00FF00' : 'FF0000', -1);
                });
                p3Utils.statusSocket(function(status, text, time) {
                    p3Utils.chatLog(undefined, p3Lang.i18n('commands.responses.status.socket', status, text, time), status == 1000 ? '00FF00' : 'FF0000', -1);
                });
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'nextsong')) {
                var nextSong = API.getNextMedia();
                if (nextSong == null) {
                    return API.chatLog(p3Lang.i18n('error.noNextSong'));
                }
                nextSong = nextSong.media;
                var p3history = require('fefed4/fa84ce/d32431');
                var historyInfo = p3history.isInHistory(nextSong.id);
                API.chatLog(p3Lang.i18n('commands.responses.nextsong', nextSong.title, nextSong.author));
                if (historyInfo.pos > -1 && !historyInfo.skipped) {
                    API.chatLog(p3Lang.i18n('commands.responses.isHistory', historyInfo.pos, historyInfo.length));
                }
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'automute')) {
                var media = API.getMedia();
                if (media == null) return;
                if (Settings.registeredSongs.indexOf(media.id) < 0) {
                    Settings.registeredSongs.push(media.id);
                    PlaybackModel.muteOnce();
                    API.chatLog(p3Lang.i18n('commands.responses.automute.registered', media.title));
                } else {
                    Settings.registeredSongs.splice(Settings.registeredSongs.indexOf(media.id), 1);
                    PlaybackModel.unmute();
                    API.chatLog(p3Lang.i18n('commands.responses.automute.unregistered', media.title));
                }
                Settings.save();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'getpos')) {
                var lookup = p3Utils.getUser(value.substr(8)),
                    user = lookup === null ? API.getUser() : lookup,
                    spot = API.getWaitListPosition(user.id);
                if (API.getDJ().id === user.id) {
                    API.chatLog(p3Lang.i18n('info.userDjing', user.id === API.getUser().id ? p3Lang.i18n('ranks.you') : p3Utils.cleanTypedString(user.username)));
                } else if (spot === 0) {
                    API.chatLog(p3Lang.i18n('info.userNextDJ', user.id === API.getUser().id ? p3Lang.i18n('ranks.you') : p3Utils.cleanTypedString(user.username)));
                } else if (spot > 0) {
                    API.chatLog(p3Lang.i18n('info.inWaitlist', spot + 1, API.getWaitList().length));
                } else {
                    API.chatLog(p3Lang.i18n('info.notInList'));
                }
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'grab')) {
                if (p3Utils.runLite) {
                    return API.chatLog(p3Lang.i18n('error.noLiteSupport'));
                }
                $.getJSON('https://plug.dj/_/playlists', function(response) {
                    if (response.status !== 'ok') {
                        API.chatLog(p3Lang.i18n('error.errorGettingPlaylistInfo'));
                        return;
                    }
                    var playlists = response.data;
                    if (playlists.length < 1) {
                        API.chatLog(p3Lang.i18n('error.noPlaylistsFound'));
                        return;
                    }
                    for (var i in playlists) {
                        if (!playlists.hasOwnProperty(i)) continue;
                        var playlist = playlists[i];
                        if (playlist.active) {
                            if (playlist.count < 200) {
                                var historyID = require('ac791/ad0b5/be2fa').get('historyID');
                                var MGE = require('ac791/cbb6f/e70d6');
                                Context.dispatch(new MGE(MGE.GRAB, playlist.id, historyID));
                            } else {
                                API.chatLog(p3Lang.i18n('error.yourActivePlaylistIsFull'));
                            }
                            return;
                        }
                    }
                    API.chatLog(p3Lang.i18n('error.noPlaylistsFound'));
                }).fail(function() {
                    API.chatLog(p3Lang.i18n('error.errorGettingPlaylistInfo'));
                });
                return;
            }
            if (p3Utils.startsWithIgnoreCase(value, '/alertson ') && !p3Utils.equalsIgnoreCaseTrim(value, '/alertson')) {
                Settings.alertson = value.substr(10).split(' ');
                Settings.save();
                API.chatLog(p3Lang.i18n('commands.responses.alertson', Settings.alertson.join(', ')));
                return;
            }
            if (p3Utils.equalsIgnoreCaseTrim(value, '/alertson') || p3Utils.startsWithIgnoreCase(value, '/alertsoff')) {
                Settings.alertson = [];
                Settings.save();
                API.chatLog(p3Lang.i18n('commands.responses.alertsoff'));
                return;
            }
        }
    });
    return new commandHandler();
});
define('fefed4/ae602d/cc15ad', ['jquery', 'fefed4/d778d3', 'fefed4/d10ed2', 'fefed4/c04848', 'fefed4/a7bf09/e750d4'], function($, Class, p3Lang, Settings, enumNotifications) {
    var dialogTarget, dialogObserver;
    var handler = Class.extend({
        register: function() {
            dialogTarget = document.querySelector('#dialog-container');
            dialogObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes[0] !== undefined) {
                        if (mutation.addedNodes[0].attributes[0].nodeValue === 'dialog-restricted-media') {
                            if ((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE) {
                                $('#dialog-restricted-media .dialog-frame .icon').click();
                            }
                        }
                    }
                });
            });
            dialogObserver.observe(dialogTarget, {
                childList: true
            });
        },
        close: function() {
            dialogObserver.disconnect();
        }
    });
    return new handler();
});
define('fefed4/ee81bd/aa27dc', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817'], function(TriggerHandler, Settings, p3Utils) {
    var handler = TriggerHandler.extend({
        trigger: 'chat',
        handler: function(data) {
            for (var i in Settings.alertson) {
                if (!Settings.alertson.hasOwnProperty(i)) continue;
                if (data.message.indexOf(Settings.alertson[i]) > -1) {
                    p3Utils.playChatSound();
                    return;
                }
            }
        }
    });

    return new handler();
});
define('fefed4/ee81bd/a69144', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/fb5799', 'fefed4/d10ed2', 'fefed4/b98817', 'fefed4/e46194/cfcd5d'], function(TriggerHandler, Settings, RoomSettings, p3Lang, p3Utils, Menu) {
    var join, handler;

    join = function() {
        var dj = API.getDJ();
        if ((dj !== null && dj.id == API.getUser().id) || API.getWaitListPosition() > -1 || API.getWaitList().length == 50) return;
        $('#dj-button').click();
    };

    handler = TriggerHandler.extend({
        lastPosition: API.getWaitListPosition(),
        trigger: {
            advance: 'onDjAdvance',
            waitListUpdate: 'onWaitListUpdate',
            chat: 'onChat'
        },
        onDjAdvance: function(data) {
            this.lastDJ = data.lastPlay.dj != null ? data.lastPlay.dj.id : null;
            if (!Settings.autojoin || !RoomSettings.rules.allowAutojoin) return;
            join();
        },
        onWaitListUpdate: function() {
            var oldPosition = this.lastPosition;
            this.lastPosition = API.getWaitListPosition();
            // If autojoin is not enabled, don't try to disable
            if (!Settings.autojoin) return;
            // If user is DJing, don't try to disable
            var dj = API.getDJ();
            if (dj !== null && dj.id === API.getUser().id) return;
            // If user is in waitlist, don't try to disable
            if (this.lastPosition > -1) return;
            // If waitlist is full, don't try to disable
            if (API.getWaitList().length == 50) return;
            // If user was last DJ (DJ Cycle Disabled)
            if (this.lastDJ == API.getUser().id) return;
            // If the user was in the waitlist but is no longer, disable autojoin
            if (oldPosition > -1) {
                // Disable
                Settings.autojoin = false;
                Menu.setEnabled('join', Settings.autojoin);
            }
        },
        onChat: function(data) {
            if (!(RoomSettings.rules.allowAutojoin !== false && Settings.autojoin))
                return;

            var a, b;
            a = data.type == 'mention' && API.hasPermission(data.fromID, API.ROLE.BOUNCER);
            b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.fromID));
            if (a || b) {
                if (data.message.indexOf('!joindisable') > -1) {
                    Settings.autojoin = false;
                    Menu.setEnabled('join', Settings.autojoin);
                    Settings.save();
                    API.sendChat(p3Lang.i18n('autojoin.commandDisable', '@' + data.un));
                }
            }
        }
    });

    return new handler();
});
define('fefed4/ee81bd/dd1b68', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/d10ed2', 'fefed4/e89711/a1b9a0'], function(TriggerHandler, Settings, p3Lang, PlaybackModel) {
    var handler = TriggerHandler.extend({
        trigger: 'advance',
        handler: function(data) {
            if (data && data.media && Settings.registeredSongs.indexOf(data.media.id) > -1) {
                setTimeout(function() {
                    PlaybackModel.muteOnce();
                }, 800);
                API.chatLog(p3Lang.i18n('commands.responses.automute.automuted', data.media.title));
            }
        }
    });
    return new handler();
});
define('fefed4/ee81bd/c4c476', ['fefed4/ae602d/c7c1ce', 'fefed4/d10ed2', 'fefed4/c04848', 'fefed4/fb5799', 'fefed4/b98817', 'fefed4/e89711/a1b9a0', 'fefed4/e46194/cfcd5d', 'lang/Lang'], function(TriggerHandler, p3Lang, Settings, RoomSettings, p3Utils, PlaybackModel, Menu, Lang) {
    var handler = TriggerHandler.extend({
        trigger: 'chat',
        handler: function(data) {
            if (!(RoomSettings.rules.allowAutorespond !== false && Settings.autorespond))
                return;

            var that = this;

            var a = data.type == 'mention' && API.hasPermission(data.fromID, API.ROLE.BOUNCER),
                b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.fromID));
            if (a || b) {
                if (data.message.indexOf('!afkdisable') > -1) {
                    Settings.autorespond = false;
                    Menu.setEnabled('autorespond', Settings.autorespond);
                    Settings.save();
                    API.sendChat(p3Lang.i18n('autorespond.commandDisable', '@' + data.un));
                    $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                    if (this.timeoutId != null)
                        clearTimeout(this.timeoutId);
                    return;
                }
            }

            if (data.type == 'mention') {
                if (Settings.autorespond && !Settings.recent) {
                    Settings.recent = true;
                    $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.nextIn', p3Utils.getTimestamp(Date.now() + 18E4)));
                    this.timeoutId = setTimeout(function() {
                        $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.next'));
                        Settings.recent = false;
                        Settings.save();
                        that.timeoutId = null;
                    }, 18E4);
                    API.sendChat('[AFK] @' + data.un + ' ' + Settings.awaymsg.split('@').join(''));
                }
            }
        },
        close: function() {
            this._super();
            if (Settings.autorespond) {
                $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
            }
        }
    });

    return new handler();
});
define('fefed4/ee81bd/f7f761', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/fb5799', 'fefed4/b98817'], function(TriggerHandler, Settings, RoomSettings, p3Utils) {
    var woot, handler;

    woot = function() {
        var dj = API.getDJ();
        if (dj === null || dj.id === API.getUser().id) return;
        $('#woot').click();
    };

    handler = TriggerHandler.extend({
        trigger: 'advance',
        handler: function(data) {
            if (!data.media || !Settings.autowoot || !RoomSettings.rules.allowAutowoot) return;
            setTimeout(function() {
                woot();
            }, p3Utils.randomRange(1, 10) * 1000);
        }
    });

    return new handler();
});
define('fefed4/ee81bd/f2d32d', ['jquery', 'fefed4/d778d3', 'fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817'], function($, Class, TriggerHandler, Settings, p3Utils) {
    var WatcherClass = Class.extend({
        init: function() {
            this.current = {
                waitList: [],
                dj: -1
            };
            this.last = {
                waitList: [],
                dj: -1
            };
            this.state = 0;
        },
        setWaitList: function(waitList) {
            this.current.waitList = [];
            for (var i in waitList) {
                if (!waitList.hasOwnProperty(i)) continue;
                this.current.waitList.push(waitList[i].id);
            }
            this.incrementState();
        },
        setDJ: function(dj) {
            this.current.dj = dj ? dj.id : -1;
            this.incrementState();
        },
        incrementState: function() {
            this.state++;
            if (this.state > 1) {
                this.last = this.current;
                this.current = {
                    waitList: [],
                    dj: -1
                };
                this.state = 0;
            }
        }
    });

    var watcher = new WatcherClass();

    var handler = TriggerHandler.extend({
        trigger: {
            userJoin: 'onUserJoin',
            userLeave: 'onUserLeave',
            voteUpdate: 'onVoteUpdate',
            advance: 'onDjAdvance',
            waitListUpdate: 'onWaitListUpdate'
        },
        onUserJoin: function(data) {
            if (p3Utils.getUserData(data.id, 'joinTime', 0) === 0)
                p3Utils.setUserData(data.id, 'joinTime', Date.now());
        },
        onUserLeave: function(data) {
            var disconnects = p3Utils.getUserData(data.id, 'disconnects', {
                count: 0
            });
            disconnects.count++;
            disconnects.position = watcher.last.dj === data.id ? 0 : (watcher.last.waitList.indexOf(data.id) < 0 ? -1 : watcher.last.waitList.indexOf(data.id) + 1);
            disconnects.time = Date.now();
            p3Utils.setUserData(data.id, 'disconnects', disconnects);
            this.onVoteUpdate({
                user: {
                    id: data.id
                },
                vote: 0
            });
        },
        onVoteUpdate: function(data) {
            if (!data || !data.user) return;
            var curVote, wootCount, mehCount;

            curVote = p3Utils.getUserData(data.user.id, 'curVote', 0);
            wootCount = p3Utils.getUserData(data.user.id, 'wootcount', 0) - (curVote === 1 ? 1 : 0) + (data.vote === 1 ? 1 : 0);
            mehCount = p3Utils.getUserData(data.user.id, 'mehcount', 0) - (curVote === -1 ? 1 : 0) + (data.vote === -1 ? 1 : 0);

            p3Utils.setUserData(data.user.id, 'wootcount', wootCount);
            p3Utils.setUserData(data.user.id, 'mehcount', mehCount);
            p3Utils.setUserData(data.user.id, 'curVote', data.vote);
        },
        onDjAdvance: function(data) {
            if (data.media != null) {
                watcher.setDJ(data.dj);
            }
            var users = API.getUsers();
            for (var i in users) {
                if (users.hasOwnProperty(i))
                    p3Utils.setUserData(users[i].id, 'curVote', 0);
            }
        },
        onWaitListUpdate: function(data) {
            watcher.setWaitList(data);
        }
    });

    return new handler();
});
define('fefed4/ee81bd/f5ae92', ['fefed4/ae602d/c7c1ce', 'fefed4/c04848', 'fefed4/b98817'], function(TriggerHandler, Settings, p3Utils) {
    var Database, PlaybackModel;

    if (!p3Utils.runLite) {
        Database = require('ac791/e1740/d7ae3');
        PlaybackModel = require('ac791/ad0b5/be2fa');
    }

    var handler = TriggerHandler.extend({
        trigger: 'advance',
        register: function() {
            this._super();
            this.title = '';
            this.titleClean = '';
            this.titlePrefix = '';
            if (!p3Utils.runLite)
                PlaybackModel.on('change:streamDisabled change:volume change:muted', this.onStreamChange, this);
            this.onStreamChange();
        },
        close: function() {
            this._super();
            if (this.intervalID)
                clearInterval(this.intervalID);
            document.title = p3Utils.getRoomName();
            if (!p3Utils.runLite)
                PlaybackModel.off('change:streamDisabled change:volume change:muted', this.onStreamChange, this);
        },
        handler: function(data) {
            if (Settings.songTitle && data.media && data.media.title) {
                this.titlePrefix = (API.getVolume() > 0 && (p3Utils.runLite || (!p3Utils.runLite && !Database.settings.streamDisabled)) ? '▶' : '❚❚') + ' ';

                if (this.titleClean === data.media.author + ' - ' + data.media.title + ' :: ' + p3Utils.getRoomName() + ' :: ') return;

                if (this.intervalID)
                    clearInterval(this.intervalID);
                this.titleClean = data.media.author + ' - ' + data.media.title + ' :: ' + p3Utils.getRoomName() + ' :: ';
                this.title = (this.titlePrefix + this.titleClean).split(' ').join(' ');
                document.title = this.title;
                var _this = this;
                this.intervalID = setInterval(function() {
                    _this.onIntervalTick();
                }, 300);
                return;
            }
            if (this.intervalID)
                clearInterval(this.intervalID);
            document.title = p3Utils.getRoomName();
        },
        onIntervalTick: function() {
            var title = this.title.substr(this.titlePrefix.length);
            title = title.substr(1) + title.substr(0, 1);
            this.title = this.titlePrefix + title;
            document.title = this.title;
        },
        onStreamChange: function() {
            this.handler({
                media: API.getMedia()
            });
        }
    });

    return new handler();
});
define('fefed4/e5606a', ['fefed4/d778d3', 'fefed4/ee81bd/aa27dc', 'fefed4/ee81bd/a69144', 'fefed4/ee81bd/dd1b68', 'fefed4/ee81bd/c4c476', 'fefed4/ee81bd/f7f761', 'fefed4/ee81bd/f2d32d', 'fefed4/ee81bd/f5ae92'], function() {
    var modules, Class, handler;

    modules = $.makeArray(arguments);
    Class = modules.shift();

    handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && !modules[i].registered)
                    modules[i].register();
            }
        },
        unregister: function() {
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i].registered)
                    modules[i].close();
            }
        }
    });

    return new handler();
});
define('fefed4/ae602d/a161b6', ['jquery', 'fefed4/d778d3'], function($, Class) {
    return Class.extend({
        // Time between each tick (in milliseconds)
        tickTime: 1E3,
        closed: false,
        init: function() {
            this.proxy = $.proxy(this.handler, this);
            this.proxy();
        },
        handler: function() {
            this.tick();
            if (!this.closed) {
                this.timeoutID = setTimeout(this.proxy, this.tickTime);
            }
        }, // The function that is called on each tick
        tick: function() {},
        close: function() {
            clearTimeout(this.timeoutID);
            this.closed = true;
        }
    });
});
define('fefed4/e89711/defb48', ['fefed4/b98817'], function(p3Utils) {
    if (!p3Utils.runLite)
        return require('ac791/e48bd/b649f');
    return {
        _byId: {}
    };
});
define('fefed4/ea510e/e54b0c', ['jquery', 'fefed4/ae602d/a161b6', 'fefed4/e89711/defb48', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2'], function($, TickerHandler, IgnoreCollection, Settings, p3Utils, p3Lang) {
    var handler;

    handler = TickerHandler.extend({
        tickTime: 1E3,
        tick: function() {
            if (Settings.moderation.afkTimers && (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER)) && $('#waitlist-button').hasClass('selected')) {
                var a = API.getWaitList(),
                    b = $('#waitlist').find('.user');
                for (var c = 0; c < a.length; c++) {
                    var d, e, f;

                    d = Date.now() - p3Utils.getUserData(a[c].id, 'lastChat', p3Utils.getUserData(a[c].id, 'joinTime', Date.now()));
                    e = IgnoreCollection._byId[a[c].id] === true ? p3Lang.i18n('error.ignoredUser') : p3Utils.getTimestamp(d, d < 36E5 ? 'mm:ss' : 'hh:mm:ss');
                    f = $(b[c]).find('.afkTimer');

                    if (f.length < 1) {
                        f = $('<div>').addClass('afkTimer');
                        $(b[c]).find('.meta').append(f);
                    }

                    f.text(e);
                }
            }
        },
        close: function() {
            this._super();
            $('#waitlist').find('.user .afkTimer').remove();
        }
    });

    return handler;
});
define('fefed4/ea510e/e67376', ['jquery', 'fefed4/ae602d/a161b6', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'lang/Lang'], function($, TickerHandler, Settings, p3Utils, p3Lang, Lang) {
    var handler;

    try {
        handler = TickerHandler.extend({
            tickTime: 1E3,
            init: function() {
                this.myID = API.getUser().id;
                this.$span = null;
                $('#your-next-media').find('span:first').removeClass('song').addClass('song');
                this._super();
            },
            createElement: function() {
                this.$span = $('<span class="eta dark-label">').css({
                    'font-size': '14px',
                    top: '28px'
                });
                $('#your-next-media').append(this.$span);
            },
            tick: function() {
                if (Settings.etaTimer) {
                    if (this.$span == null) {
                        this.createElement();
                    }

                    if (API.getDJ() == null) {
                        this.$span.text(p3Lang.i18n('eta.boothAvailable'));
                        return;
                    }

                    if (API.getHistory() == null)
                        return;

                    var isDJ, waitListPos, timePerSong, history, time, $djButton;

                    isDJ = API.getDJ() != null && API.getDJ().id == this.myID;
                    waitListPos = API.getWaitListPosition();
                    timePerSong = 0;
                    history = API.getHistory();
                    $djButton = $('#dj-button').find('span');

                    for (var i in history) {
                        if (history.hasOwnProperty(i))
                            timePerSong += history[i].info == null || history[i].info.duration === 0 ? 240 : history[i].info.duration;
                    }

                    timePerSong = Math.round(timePerSong / history.length);

                    if (isDJ) {
                        this.$span.text(p3Lang.i18n('eta.alreadyDJ'));
                        return;
                    }

                    if (waitListPos < 0) {
                        time = p3Utils.formatTime(API.getWaitList().length * timePerSong + API.getTimeRemaining());
                        this.$span.text(p3Lang.i18n('eta.joinTime', time));
                        $djButton.html((API.getWaitList().length < 50 ? Lang.dj.waitJoin : Lang.dj.waitFull) + '<br><small class="dark-label">' + time + '</small>');
                        return;
                    }

                    time = p3Utils.formatTime(waitListPos * timePerSong + API.getTimeRemaining());
                    this.$span.text(p3Lang.i18n('eta.waitListTime', waitListPos + 1, API.getWaitList().length, time), 10);
                    $djButton.html(Lang.dj.waitLeave + '<br><small class="dark-label">' + (waitListPos + 1) + '/' + API.getWaitList().length + ' (' + time + ')</small>');
                } else if (this.$span != null) {
                    this.$span.remove();
                    this.$span = null;
                }
            },
            close: function() {
                if (this.$span != null) {
                    this.$span.remove();
                    this.$span = null;
                }
                this._super();
                $('#your-next-media').find('.song').removeClass('song');
            }
        });
    } catch (e) {
        console.log('Error while creating ETATimer');
        console.log(e);
    }

    return handler;
});
define('fefed4/ea510e/e09063', ['fefed4/ae602d/a161b6', 'fefed4/e89711/eb40f3'], function(TickerHandler, _$context) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var a = _$context._events['chat:receive'].concat(API._events[API.CHAT]),
                c = function() {
                    API.chatLog('plug³ does not support one or more of the other scripts that are currently running because of potential dangerous behaviour');
                    plugCubed.close();
                };
            for (var b in a) {
                if (!a.hasOwnProperty(b)) continue;
                var script = a[b].callback.toString();
                if ((function(words) {
                        for (var i in words) {
                            if (words.hasOwnProperty(i) && script.indexOf(words[i]) > -1)
                                return true;
                        }
                        return false;
                    })(['API.djLeave', 'API.djJoin', 'API.moderateLockWaitList', 'API.moderateForceSkip', '.getScript('])) {
                    c();
                    return;
                }
            }
            if (typeof startWooting === 'function' && startWooting.toString().indexOf('API.sendChat(') > -1)
                c();
        }
    });
});
define('fefed4/ea510e/ae69e8', ['jquery', 'fefed4/ae602d/a161b6'], function($, TickerHandler) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var $ytFrame = $('#yt-frame');
            var a, b = true,
                c = true,
                d;

            a = $ytFrame.height() == null || $ytFrame.height() > 230;
            if ($ytFrame.width() != null) {
                b = $ytFrame.width() > 412;
                c = $ytFrame[0].offsetLeft + $ytFrame[0].offsetWidth >= 0 && $ytFrame[0].offsetTop + $ytFrame[0].offsetHeight >= 0 && $ytFrame[0].offsetLeft < window.innerWidth && $ytFrame[0].offsetTop < window.innerHeight;
            }
            d = $ytFrame.length === 0 || parseFloat($ytFrame.css('opacity')) === 1;

            if (a && b && c && d) {
                return;
            }

            API.chatLog('plug³ does not support hiding video or scripts supporting hiding the video player');
            plugCubed.close();
        }
    });
});
define('fefed4/eb517d', ['fefed4/d778d3', 'fefed4/ea510e/e54b0c', 'fefed4/ea510e/e67376', 'fefed4/ea510e/e09063', 'fefed4/ea510e/ae69e8'], function() {
    var modules, Class, instances;

    modules = $.makeArray(arguments);
    Class = modules.shift();
    instances = [];

    var handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (!modules.hasOwnProperty(i)) continue;
                instances[i] = new modules[i]();
            }
        },
        unregister: function() {
            for (var i in instances) {
                if (!instances.hasOwnProperty(i)) continue;
                instances[i].close();
            }
        }
    });

    return new handler();
});
define('fefed4/e46194/edd537/c163e7', ['fefed4/d778d3', 'fefed4/e46194/c55cd8', 'fefed4/adb763', 'fefed4/fb5799'], function(Class, ControlPanel, Styles, RoomSettings) {
    var handler, $contentDiv, $formDiv, $localFileInput, $clearButton, panel;

    handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Background');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room background.'));

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');

            if (window.File && window.FileReader && window.FileList && window.Blob) {
                $localFileInput = ControlPanel.inputField('file', undefined, 'Local file').change(function(e) {
                    var files = e.target.files;

                    for (var i = 0, f; f = files[i]; i++) {
                        // Only process image files.
                        if (!f.type.match('image.*')) {
                            continue;
                        }

                        var reader = new FileReader();

                        // Closure to capture the file information.
                        reader.onload = function(e) {
                            Styles.set('room-settings-background-image', '.room-background { background-image: url(' + e.target.result + ')!important; }');
                        };

                        // Read in the image file as a data URL.
                        reader.readAsDataURL(f);

                        $clearButton.changeSubmit(true);

                        return;
                    }
                    $clearButton.changeSubmit(false);
                });

                $clearButton = ControlPanel.button('Clear', false, function() {
                    RoomSettings.execute();
                    $clearButton.changeSubmit(false);
                });

                $formDiv.append($localFileInput.getJQueryElement()).append($clearButton.getJQueryElement());
            } else {
                $formDiv.append('Sorry, your browser does not support this');
            }

            panel.addContent($formDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $formDiv = $localFileInput = panel = null;
        }
    });

    return new handler();
});
define('fefed4/e46194/edd537/e750d4', ['fefed4/d778d3', 'fefed4/e46194/c55cd8'], function(Class, ControlPanel) {
    var handler, $contentDiv, panel;

    handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Notifications');

            $contentDiv = $('<div>').append($('<p>').text('Control which notifications you want and how you want them.'));

            panel.addContent($contentDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);
        }
    });

    return new handler();
});
define('fefed4/e46194/edd537/cde915', ['fefed4/d778d3', 'fefed4/e46194/edd537/c163e7', 'fefed4/e46194/edd537/e750d4'], function() {
    var modules, Class, handler;

    modules = $.makeArray(arguments);
    Class = modules.shift();

    handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && !modules[i].registered)
                    modules[i].register();
            }
        },
        unregister: function() {
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i].registered)
                    modules[i].close();
            }
        }
    });

    return new handler();
});
define('fefed4/b33003/a512e8', ['jquery', 'fefed4/d10ed2', 'fefed4/b98817', 'fefed4/e89711/eb40f3'], function($, p3Lang, p3Utils, _$context) {
    if (p3Utils.runLite) return null;

    var RoomUserListRow = require('ac791/b6b41/ada16/cfd01/be031');

    return RoomUserListRow.extend({
        vote: function() {
            if (this.model.get('grab') || this.model.get('vote') !== 0) {
                if (!this.$icon) {
                    this.$icon = $('<i>').addClass('icon');
                    this.$el.append(this.$icon);
                }
                if (this.model.get('grab')) {
                    this.$icon.removeClass().addClass('icon icon-grab');
                } else if (this.model.get('vote') == 1) {
                    this.$icon.removeClass().addClass('icon icon-woot');
                } else {
                    this.$icon.removeClass().addClass('icon icon-meh');
                }
            } else if (this.$icon) {
                this.$icon.remove();
                this.$icon = undefined;
            }

            var id = this.model.get('id'),
                $voteIcon = this.$el.find('.icon-woot,.icon-meh,.icon-grab');

            if (p3Utils.havePlugCubedRank(id) || p3Utils.hasPermission(id, API.ROLE.DJ)) {
                var $icon = this.$el.find('.icon:not(.icon-woot,.icon-meh,.icon-grab)'),
                    specialIconInfo = p3Utils.getPlugCubedSpecial(id);

                if ($icon.length < 1) {
                    $icon = $('<i>').addClass('icon');
                    this.$el.append($icon);
                }

                if (p3Utils.havePlugCubedRank(id)) {
                    $icon.addClass('icon-is-p3' + p3Utils.getHighestRank(id));
                }

                $icon.mouseover(function() {
                    _$context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(id)).text(), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                });

                if (specialIconInfo != null) {
                    $icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/files/images/icons.p3special.' + specialIconInfo.icon + '.png")');
                }
            }

            if ($voteIcon.length > 0) {
                $voteIcon.mouseover(function() {
                    _$context.trigger('tooltip:show', $('<span>').html(p3Lang.i18n('vote.' + ($voteIcon.hasClass('icon-grab') ? 'grab' : ($voteIcon.hasClass('icon-woot') ? 'woot' : 'meh')))).text(), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                });
            }
        }
    });
});
define('fefed4/ae602d/bd98b2', ['fefed4/d778d3'], function(Class) {
    return Class.extend({
        init: function() {
            this.overridden = false;
        },
        doOverride: function() {},
        doRevert: function() {},
        override: function() {
            if (this.overridden) return;
            this.doOverride();
            this.overridden = true;
        },
        revert: function() {
            if (!this.overridden) return;
            this.doRevert();
            this.overridden = false;
        }
    })
});
define('fefed4/f308ed/a606ef', ['jquery', 'fefed4/ae602d/bd98b2', 'fefed4/b98817'], function($, OverrideHandler, p3Utils) {
    if (p3Utils.runLite) return null;

    var UserRolloverView = require('ac791/b6b41/cfd01/d46e7');

    var handler = OverrideHandler.extend({
        doOverride: function() {
            if (typeof UserRolloverView._showSimple !== 'function')
                UserRolloverView._showSimple = UserRolloverView.showSimple;

            if (typeof UserRolloverView._clear !== 'function')
                UserRolloverView._clear = UserRolloverView.clear;

            UserRolloverView.showSimple = function(a, b) {
                this._showSimple(a, b);
                var specialIconInfo = p3Utils.getPlugCubedSpecial(a.id);

                if (this.$p3Role == null) {
                    this.$p3Role = $('<span>').addClass('p3Role');
                    this.$meta.append(this.$p3Role);
                }

                if (p3Utils.havePlugCubedRank(a.id)) {
                    this.$meta.addClass('has-p3Role is-p3' + p3Utils.getHighestRank(a.id));
                    if (specialIconInfo != null) {
                        this.$p3Role.text($('<span>').html(specialIconInfo.title).text()).css({
                            'background-image': 'url("https://d1rfegul30378.cloudfront.net/files/images/icons.p3special.' + specialIconInfo.icon + '.png")'
                        });
                    } else {
                        this.$p3Role.text($('<span>').html(p3Utils.getHighestRankString(a.id)).text());
                    }
                }
            };

            UserRolloverView.clear = function() {
                this._clear();
                this.$meta.removeClass('has-p3Role is-p3developer is-p3sponsor is-p3special is-p3ambassador is-p3donatorDiamond is-p3donatorPlatinum is-p3donatorGold is-p3donatorSilver is-p3donatorBronze');
            };
        },
        doRevert: function() {
            if (typeof UserRolloverView._showSimple === 'function')
                UserRolloverView.showSimple = UserRolloverView._showSimple;

            if (typeof UserRolloverView._clear === 'function')
                UserRolloverView.clear = UserRolloverView._clear;
        }
    });
    return new handler();
});
define('fefed4/f308ed/f15f40', ['jquery', 'fefed4/ae602d/bd98b2', 'fefed4/b98817'], function($, OverrideHandler, p3Utils) {
    if (p3Utils.runLite) return null;

    var WaitListRow, WaitListRowPrototype, originalFunction;

    WaitListRow = require('ac791/b6b41/ada16/cfd01/b1eb3');
    WaitListRowPrototype = WaitListRow.prototype;
    originalFunction = WaitListRowPrototype.onRole;

    var handler = OverrideHandler.extend({
        doOverride: function() {
            WaitListRowPrototype.onRole = function() {
                originalFunction.apply(this);
                if (this.model.get('role') == 4) {
                    this.$('.name i').removeClass().addClass('icon icon-chat-cohost');
                }
            };
        },
        doRevert: function() {
            WaitListRowPrototype.onRole = originalFunction;
        }
    });

    return new handler();
});
define('fefed4/b33003', ['fefed4/d778d3', 'fefed4/f308ed/a606ef', 'fefed4/f308ed/f15f40'], function() {
    var modules, Class, handler;

    modules = $.makeArray(arguments);
    Class = modules.shift();

    handler = Class.extend({
        override: function() {
            this.revert();
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i] != null)
                    modules[i].override();
            }
        },
        revert: function() {
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i] != null)
                    modules[i].revert();
            }
        }
    });

    return new handler();
});
define('fefed4/a00ba7', ['module', 'fefed4/d778d3', 'fefed4/e750d4', 'fefed4/fa8684', 'fefed4/adb763', 'fefed4/c04848', 'fefed4/b98817', 'fefed4/d10ed2', 'fefed4/fb5799', 'fefed4/e46194/cfcd5d', 'fefed4/ac13ee', 'fefed4/ae602d/d6faeb', 'fefed4/ae602d/feae9c', 'fefed4/ae602d/cc15ad', 'fefed4/e5606a', 'fefed4/eb517d', 'fefed4/e46194/edd537/cde915', 'fefed4/b33003/a512e8', 'fefed4/b33003'], function(module, Class, Notifications, Version, Styles, Settings, p3Utils, p3Lang, RoomSettings, Menu, CustomChatColors, ChatHandler, CommandHandler, DialogHandler, Features, Tickers, Panels, p3RoomUserListRow, Overrides) {
    var Loader, loaded = false;

    var RoomUserListView;

    function __init() {
        p3Utils.chatLog(undefined, p3Lang.i18n('running', Version) + '</span><br><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('commandsHelp'), Settings.colors.infoMessage1, -1, 'plug&#179;');
        if (p3Utils.runLite) {
            p3Utils.chatLog(undefined, p3Lang.i18n('runningLite') + '</span><br><span class="chat-text" style="color:#FFFFFF">' + p3Lang.i18n('runningLiteInfo'), Settings.colors.warningMessage, -1, 'plug&#179;');
        }

        $('head').append('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="https://d1rfegul30378.cloudfront.net/files/plugCubed.css" />');

        var users = API.getUsers();
        for (var i in users) {
            if (users.hasOwnProperty(i) && p3Utils.getUserData(users[i].id, 'joinTime', -1) < 0)
                p3Utils.setUserData(users[i].id, 'joinTime', Date.now());
        }

        if (!p3Utils.runLite) {
            RoomUserListView = require('ac791/b6b41/ada16/cfd01/efa4f');
            RoomUserListView.prototype.RowClass = p3RoomUserListRow;
            Overrides.override();
        }

        initBody();

        Features.register();
        Notifications.register();
        Tickers.register();
        CommandHandler.register();
        ChatHandler.register();

        RoomSettings.update();

        Settings.load();

        Panels.register();
        DialogHandler.register();

        loaded = true;
    }

    function initBody() {
        var rank = 'regular';
        if (p3Utils.hasPermission(undefined, API.ROLE.HOST, true)) {
            rank = 'admin';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER, true)) {
            rank = 'ambassador';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.HOST)) {
            rank = 'host';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.COHOST)) {
            rank = 'cohost';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.MANAGER)) {
            rank = 'manager';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER)) {
            rank = 'bouncer';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.DJ)) {
            rank = 'residentdj';
        }
        $('body').addClass('rank-' + rank).addClass('id-' + API.getUser().id);
    }

    Loader = Class.extend({
        init: function() {
            if (loaded) return;

            // Define UserData in case it's not already defined (reloaded p3 without refresh)
            if (typeof plugCubedUserData === 'undefined') {
                //noinspection JSUndeclaredVariable
                plugCubedUserData = {};
            }

            // Load language and begin script after language loaded
            p3Lang.load($.proxy(__init, this));
        },
        close: function() {
            if (!loaded) return;

            Menu.close();
            RoomSettings.close();
            Features.unregister();
            Notifications.unregister();
            Tickers.unregister();
            Panels.unregister();
            Styles.destroy();
            ChatHandler.close();
            CommandHandler.close();
            DialogHandler.close();

            if (!p3Utils.runLite) {
                RoomUserListView.prototype.RowClass = require('ac791/b6b41/ada16/cfd01/be031');
                Overrides.revert();
            }

            var mainClass = module.id.split('/')[0],
                modules = require.s.contexts._.defined;
            for (var i in modules) {
                if (!modules.hasOwnProperty(i)) continue;
                if (p3Utils.startsWith(i, mainClass))
                    requirejs.undef(i);
            }

            $('#plugcubed-css,#p3-settings-wrapper').remove();

            delete plugCubed;
        }
    });
    return Loader;
});
require(['fefed4/a00ba7'], function(Loader) {
    plugCubed = new Loader();
});