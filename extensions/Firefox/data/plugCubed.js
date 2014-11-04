/**
 * @license Copyright (C) 2012-2014 Thomas "TAT" Andresen and other contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var plugCubed, plugCubedUserData;
String.prototype.equalsIgnoreCase = function(a) {
    return typeof a !== 'string' ? false : this.toLowerCase() === a.toLowerCase();
};
String.prototype.startsWith = function(a) {
    return typeof a !== 'string' || a.length > this.length ? false : this.indexOf(a) === 0;
};
String.prototype.endsWith = function(a) {
    return typeof a !== 'string' || a.length > this.length ? false : this.indexOf(a) === this.length - a.length;
};
String.prototype.startsWithIgnoreCase = function(a) {
    return typeof a !== 'string' || a.length > this.length ? false : this.toLowerCase().startsWith(a.toLowerCase());
};
String.prototype.endsWithIgnoreCase = function(a) {
    return typeof a !== 'string' || a.length > this.length ? false : this.toLowerCase().endsWith(a.toLowerCase());
};
String.prototype.isNumber = function() {
    return !isNaN(parseInt(this, 10)) && isFinite(this);
};
String.prototype.isRGB = function() {
    return /^(#|)(([0-9A-F]{6}$)|([0-9A-F]{3}$))/i.test(this.substr(0, 1) === '#' ? this : '#' + this);
};
String.prototype.toRGB = function() {
    return this.isRGB() ? (this.substr(0, 1) === '#' ? this : '#' + this) : undefined;
};
Math.randomRange = function(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
};
if (plugCubed !== undefined) plugCubed.close();

(function() {
    if (!requirejs.defined('d7854/eba2c/c9281'))
        return API.chatLog('This version of plug&#179; is not compatible with this version of plug.dj', true), false;

    define('f82fae/b93191', ['jquery', 'underscore', 'd7854/eba2c/c9281', 'd7854/eba2c/ecd43', 'd7854/e3be6/cb9f4', 'd7854/adb4d/a9871', 'd7854/cfea4/d9b4d', 'd7854/e75cd/de4b9', 'd7854/cacde/c9f64', 'd7854/cacde/ad59c', 'd7854/cfea4/ec193', 'lang/Lang', 'd7854/f5687/de727/dec05', 'f82fae/a07c86', 'd7854/f5687/de727/e1632/e6ffb', 'd7854/f5687/de727/e1632/f4e74', 'f82fae/f36e0e', 'f82fae/f1da31', 'f82fae/ac606c', 'd7854/bb9dc/c7936', 'd7854/cfea4/ce6d9', 'f82fae/d67453/c8e8fc', 'f82fae/a8c196', 'f82fae/abd868', 'f82fae/d67453/a1ab3a', 'd7854/f5687/de727/f87d1/da7b6', 'd7854/f5687/e1632/da2b0'], function($, _, Class, Context, Chat, Utils, Room, MGE, Socket, SocketListner, TUM, Lang, Audience, Styles, RoomUserListView, RoomUserListRow, _RoomUserListRow, p3Lang, p3Utils, Database, PlaybackModel, dialogCommands, Slider, VolumeView, dialogColors, PopoutView, UserRolloverView) {
        function getUserData(a, b, c) {
            if (plugCubedUserData[a] === undefined || plugCubedUserData[a][b] === undefined)
                return c;
            return plugCubedUserData[a][b];
        }

        function setUserData(a, b, c) {
            if (plugCubedUserData[a] === undefined)
                plugCubedUserData[a] = {};
            plugCubedUserData[a][b] = c;
        }

        /**
         * @param {RoomSettings} settings
         */
        function runRoomSettings(settings) {
            if (settings !== undefined) {
                haveRoomSettings = true;
                roomChatColors = {};
                roomChatIcons = {};
                roomRules = {};
                $('#p3-dj-booth').remove();

                Styles.unset(['rss-background-color', 'rss-background-image', 'rss-booth', 'rss-fonts', 'rss-imports', 'rss-rules', 'rss-maingui']);

                // colors
                if (settings.colors !== undefined) {
                    // colors.background
                    if (settings.colors.background !== undefined && typeof settings.colors.background === 'string' && settings.colors.background.isRGB())
                        Styles.set('rss-background-color', 'body { background-color: ' + settings.colors.background.toRGB() + '!important; }');

                    // colors.chat
                    if (settings.colors.chat !== undefined) {
                        var b = {};
                        for (var i in settings.colors.chat) {
                            if (!settings.colors.chat.hasOwnProperty(i)) continue;
                            if (['admin', 'ambassador', 'bouncer', 'cohost', 'residentdj', 'leader', 'host', 'manager', 'volunteer'].indexOf(i) > -1 && typeof settings.colors.chat[i] === 'string' && settings.colors.chat[i].isRGB())
                                b[i] = settings.colors.chat[i].substr(0, 1) === '#' ? settings.colors.chat[i].substr(1) : settings.colors.chat[i];
                        }
                        roomChatColors = b;
                    }

                    // colors.header
                    if (settings.colors.header !== undefined && typeof settings.colors.header === 'string' && settings.colors.header.isRGB())
                        Styles.set('rss-header', '#header { background-color: ' + settings.colors.header.toRGB() + '!important; }');

                    // colors.footer
                    if (settings.colors.footer !== undefined && typeof settings.colors.footer === 'string' && settings.colors.footer.isRGB())
                        Styles.set('rss-footer', '#footer { background-color: ' + settings.colors.footer.toRGB() + '!important; }');
                }

                // css
                if (settings.css !== undefined) {
                    // css.font
                    if (settings.css.font !== undefined && $.isArray(settings.css.font)) {
                        var roomFonts = [];
                        for (var i in settings.css.font) {
                            if (!settings.css.font.hasOwnProperty(i)) continue;
                            var font = settings.css.font[i];
                            if (font.name !== undefined && font.url !== undefined) {
                                font.toString = function() {
                                    var sources = [];
                                    if (typeof this.url === 'string')
                                        sources.push('url("' + this.url + '")');
                                    else {
                                        for (var j in this.url) {
                                            if (!this.url.hasOwnProperty(j)) continue;
                                            if (['woff', 'opentype', 'svg', 'embedded-opentype', 'truetype'])
                                                sources.push('url("' + this.url[j] + '") format("' + j + '")')
                                        }
                                    }
                                    return '@font-face { font-family: "' + this.name + '"; src: ' + sources.join(',') + '; }';
                                };
                                roomFonts.push(font.toString());
                            }
                        }
                        Styles.set('rss-fonts', roomFonts.join('\n'));
                    }
                    // css.import
                    if (settings.css.import !== undefined && $.isArray(settings.css.import)) {
                        var roomImports = [];
                        for (var i in settings.css.import) {
                            if (!settings.css.import.hasOwnProperty(i)) continue;
                            if (typeof settings.css.import[i] === 'string')
                                roomImports.push('@import url("' + settings.css.import[i] + '")');
                        }
                        Styles.set('rss-imports', roomImports.join('\n'));
                    }
                    // css.setting
                    if (settings.css.rule !== undefined) {
                        var roomCSSRules = [];
                        for (var i in settings.css.rule) {
                            if (!settings.css.rule.hasOwnProperty(i)) continue;
                            var rule = [];
                            for (var j in settings.css.rule[i]) {
                                if (!settings.css.rule[i].hasOwnProperty(j)) continue;
                                rule.push(j + ':' + settings.css.rule[i][j]);
                            }
                            roomCSSRules.push(i + ' {' + rule.join(';') + '}');
                        }
                        Styles.set('rss-rules', roomCSSRules.join('\n'));
                    }
                }

                // images
                if (settings.images !== undefined) {
                    // images.background
                    if (settings.images.background)
                        Styles.set('rss-background-image', '.room-background { background-image: url("' + settings.images.background + '")!important; }');

                    // images.playback
                    if ($('#playback .background img').data('_o') === undefined)
                        $('#playback .background img').data('_o', $('#playback .background img').attr('src'));
                    $('#playback .background img').attr('src', settings.images.playback && typeof settings.images.playback === 'string' ? loadImage(settings.images.playback) : $('#playback .background img').data('_o'));

                    // images.booth
                    if (settings.images.booth !== undefined && typeof settings.images.booth === 'string')
                        $('#dj-booth').append($('<div id="p3-dj-booth">').css('background-image', 'url("' + loadImage(settings.images.booth) + '")'));
                    roomChatIcons = settings.images.icons ? settings.images.icons : {};
                }

                // rules
                if (settings.rules !== undefined) {
                    // rules.allowAutowoot
                    if (settings.rules.allowAutowoot !== undefined)
                        roomRules.allowAutowoot = settings.rules.allowAutowoot === 'true' || settings.rules.allowAutowoot === true;

                    // rules.allowAutojoin
                    if (settings.rules.allowAutojoin !== undefined)
                        roomRules.allowAutojoin = settings.rules.allowAutojoin === 'true' || settings.rules.allowAutojoin === true;

                    // rules.allowAutorespond
                    if (settings.rules.allowAutorespond !== undefined)
                        roomRules.allowAutorespond = settings.rules.allowAutorespond === 'true' || settings.rules.allowAutorespond === true;
                }
                /*
                // text
                if (settings.text !== undefined) {
                    // text.plugCubed
                    if (settings.text.plugCubed !== undefined) {

                    }

                    // text.plugDJ
                    if (settings.text.plugDJ !== undefined) {

                    }
                }
                */
                plugCubed.updateCustomColors();

                // Update menu
                if (menuDiv !== undefined) {
                    menuDiv.remove();
                    menuDiv = undefined;
                }

                // Update autorespond
                if (plugCubed.settings.autorespond && roomRules.allowAutorespond) {
                    $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                    if (API.getUser().status <= 0)
                        API.setStatus(API.STATUS.AFK);
                } else {
                    $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                    API.setStatus(API.STATUS.AVAILABLE);
                }
            }
        }

        function loadRoomSettings() {
            var a = Room.get('description'),
                b = plugCubed.settings.useRoomSettings[window.location.pathname.split('/')[1]];

            if (a === null) return;
            b = !!(b === undefined || b === true);

            if (a.indexOf('@p3=') > -1) {
                a = a.substr(a.indexOf('@p3=') + 4);
                if (a.indexOf(' ') > -1)
                    a.substr(0, a.indexOf(' '));
                if (a.indexOf('\n') > -1)
                    a.substr(0, a.indexOf('\n'));
                if (b) {
                    $.getJSON(a + '?_' + Date.now(), function(settings) {
                        p3Utils.chatLog(undefined, p3Lang.i18n('roomSpecificSettings.infoHeader') + '</span><br /><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('roomSpecificSettings.infoDisable'), plugCubed.colors.infoMessage2);
                        runRoomSettings(settings);
                    }).fail(function() {
                        API.chatLog('Error loading Room Settings', true);
                    });
                }
                haveRoomSettings = true;
            }
        }

        function getUser(data) {
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
                    if (users[i].username.equalsIgnoreCase(data) || users[i].id.toString().equalsIgnoreCase(data))
                        return users[i];
                    continue;
                }
                if (method === 'number') {
                    if (users[i].id === data)
                        return users[i];
                }
            }
            return null;
        }

        function loadImage(url) {
            if (url.toLowerCase().indexOf('http://') === 0) {
                return 'https://api.plugCubed.net/proxy/' + url;
            }
            return url;
        }

        function getUserInfo(data) {
            /** @type {plugUserObject} */
            var user = getUser(data);
            if (user === null) API.chatLog(p3Lang.i18n('error.userNotFound'));
            else {
                var rank,
                    status,
                    voted,
                    position,
                    xp = user.xp,
                    voteTotal = getUserData(user.id, 'wootcount', 0) + getUserData(user.id, 'mehcount', 0),
                    waitlistpos = API.getWaitListPosition(user.id),
                    inbooth = API.getDJ().id === user.id,
                    lang = Lang.languages[user.language],
                    disconnectInfo = getUserData(user.id, 'disconnects', {
                        count: 0
                    });

                if (API.hasPermission(user.id, API.ROLE.ADMIN)) rank = p3Lang.i18n('ranks.admin');
                else if (API.hasPermission(user.id, API.ROLE.AMBASSADOR)) rank = p3Lang.i18n('ranks.ambassador');
                else if (API.hasPermission(user.id, API.ROLE.HOST)) rank = p3Lang.i18n('ranks.host');
                else if (API.hasPermission(user.id, API.ROLE.COHOST)) rank = p3Lang.i18n('ranks.cohost');
                else if (API.hasPermission(user.id, API.ROLE.MANAGER)) rank = p3Lang.i18n('ranks.manager');
                else if (API.hasPermission(user.id, API.ROLE.BOUNCER)) rank = p3Lang.i18n('ranks.bouncer');
                else if (API.hasPermission(user.id, API.ROLE.DJ)) rank = p3Lang.i18n('ranks.residentdj');
                else rank = p3Lang.i18n('ranks.regular');

                if (inbooth)
                    position = p3Lang.i18n('info.djing');
                else if (waitlistpos > -1)
                    position = p3Lang.i18n('info.inWaitlist', waitlistpos + 1, API.getWaitList().length);
                else
                    position = p3Lang.i18n('info.notInList');

                switch (user.status) {
                    default: status = p3Lang.i18n('status.available');
                    break;
                    case API.STATUS.AFK:
                        status = p3Lang.i18n('status.afk');
                        break;
                    case API.STATUS.WORKING:
                        status = p3Lang.i18n('status.working');
                        break;
                    case API.STATUS.GAMING:
                        status = p3Lang.i18n('status.gaming');
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

                var title = p3Utils.getAllPlugCubedRanks(user.id);

                p3Utils.chatLog(undefined, '<table style="width:100%;color:#CC00CC"><tr><td colspan="2"><strong>' + p3Lang.i18n('info.name') + '</strong>: <span style="color:#FFFFFF">' + Utils.cleanTypedString(user.username) + '</span></td></tr>' +
                    (title !== '' ? '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.title') + '</strong>: <span style="color:#FFFFFF">' + title + '</span></td></tr>' : '') +
                    '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.id') + '</strong>: <span style="color:#FFFFFF">' + user.id + '</span></td></tr>' +
                    '<tr><td><strong> ' + p3Lang.i18n('info.rank') + '</strong>: <span style="color:#FFFFFF">' + rank + '</span></td><td><strong>' + p3Lang.i18n('info.joined') + '</strong>: <span style="color:#FFFFFF">' + plugCubed.getTimestamp(getUserData(user.id, 'joinTime', Date.now())) + '</span></td></tr>' +
                    '<tr><td><strong>' + p3Lang.i18n('info.status') + '</strong>: <span style="color:#FFFFFF">' + status + '</span></td><td><strong> ' + p3Lang.i18n('info.vote') + '</strong>: <span style="color:#FFFFFF">' + voted + '</span></td></tr>' +
                    '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.position') + '</strong>: <span style="color:#FFFFFF">' + position + '</span></td></tr>' +
                    '<tr><td><strong>XP</strong>: <span style="color:#FFFFFF">' + xp + '</span></td><td><strong> ' + p3Lang.i18n('info.fans') + '</strong>: <span style="color:#FFFFFF">' + user.fans + '</span></td></tr>' +
                    '<tr><td><strong>' + p3Lang.i18n('info.wootCount') + '</strong>: <span style="color:#FFFFFF">' + getUserData(user.id, 'wootcount', 0) + '</span></td><td><strong>' + p3Lang.i18n('info.mehCount') + '</strong>: <span style="color:#FFFFFF">' + getUserData(user.id, 'mehcount', 0) + '</span></td></tr>' +
                    '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.ratio') + '</strong>: <span style="color:#FFFFFF">' + (function(a, b) {
                        if (b === 0) return a === 0 ? '0:0' : '1:0';
                        for (var i = 1; i <= b; i++) {
                            var e = i * (a / b);
                            if (e % 1 === 0) return e + ':' + i;
                        }
                    })(getUserData(user.id, 'wootcount', 0), getUserData(user.id, 'mehcount', 0)) + '</span></td></tr>' +
                    '<tr><td><strong>' + p3Lang.i18n('info.disconnects') + '</strong>: <span style="color:#FFFFFF">' + disconnectInfo.count + '</td></tr>' +
                    (disconnectInfo.count > 0 ?
                        '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.lastDisconnect') + '</strong></td></tr>' +
                        '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.lastPosition') + '</strong>: <span style="color:#FFFFFF">' + (disconnectInfo.position < -1 ? 'Wasn\'t in booth nor waitlist' : (disconnectInfo.position < 0 ? 'Was DJing' : 'Was ' + (disconnectInfo.position + 1) + ' in waitlist')) + '</span></td></tr>' +
                        '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.lastDisconnect') + '</strong>: <span style="color:#FFFFFF">' + plugCubed.getTimestamp(disconnectInfo.time) + '</span></td></tr>' :
                        ''
                    ) + '</table>');
            }
        }

        function getAllUsers() {
            var table = $('<table style="width:100%;color:#CC00CC"/>'),
                users = API.getUsers();
            for (var i in users) {
                if (!users.hasOwnProperty(i)) continue;
                table.append($('<tr/>').append($('<td/>').append(users[i].username)).append($('<td/>').append(users[i].id)));
            }
            p3Utils.chatLog(undefined, $('<div/>').append(table).html());
        }

        function playChatSound() {
            document.getElementById('chat-sound').playChatSound();
        }

        function playMentionSound() {
            document.getElementById('chat-sound').playMentionSound();
        }

        function woot() {
            if (plugCubed.settings.autowoot && typeof roomRules.allowAutowoot !== 'undefined' && roomRules.allowAutowoot === false) return;
            var dj = API.getDJ();
            if (dj === null || dj.id === API.getUser().id) return;
            $('#woot').click();
        }

        function join() {
            if (plugCubed.settings.autojoin && typeof roomRules.allowAutojoin !== 'undefined' && roomRules.allowAutojoin === false) return;
            var dj = API.getDJ();
            if (dj === null || dj.id === API.getUser().id) return;
            if (API.getWaitListPosition() > -1) return;
            $('#dj-button').click();
        }

        function afkTimerTick() {
            if (plugCubed.settings.afkTimers && (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER)) && $('#waitlist-button').hasClass('selected')) {
                var a = API.getWaitList(),
                    b = $('#waitlist .user');
                for (var c = 0; c < a.length; c++) {
                    var d = Date.now() - getUserData(a[c].id, 'lastChat', getUserData(a[c].id, 'joinTime', Date.now()));
                    if ($(b[c]).find('.afkTimer').length < 1)
                        $(b[c]).find('.meta').append($('<div>').addClass('afkTimer').text(plugCubed.getTimestamp(d, d < 36E5 ? 'mm:ss' : 'hh:mm:ss')));
                    else
                        $(b[c]).find('.afkTimer').text(plugCubed.getTimestamp(d, d < 36E5 ? 'mm:ss' : 'hh:mm:ss'));
                }
            }
        }

        function antiVideoHidingTick() {
            var a = $('#yt-frame').height() === null || $('#yt-frame').height() > 230,
                b = $('#yt-frame').width() === null || $('#yt-frame').width() > 412,
                c = $('#plug-btn-hidevideo,#hideVideoButton').length === 0;
            if (a && b && c) return;
            API.chatLog('plugCubed does not support hiding video', true);
            plugCubed.close();
        }

        function antiDangerousScripts() {
            function c() {
                API.chatLog('plugCubed does not support one or more of the other scripts that are currently running because of potential dangerous behaviour', true);
                return plugCubed.close();
            }
            [{
                m: Context,
                e: 'chat:receive'
            }, {
                m: API,
                e: API.CHAT
            }].forEach(function(obj) {
                var events = obj.m._events[obj.e];
                for (var b in events) {
                    if (!events.hasOwnProperty(b)) continue;
                    var script = events[b].callback.toString();
                    if ((function(words) {
                        for (var i in words) {
                            if (!words.hasOwnProperty(i)) continue;
                            if (script.indexOf(words[i]) > -1) {
                                console.log('Found', words[i], 'in', script);
                                return true;
                            }
                        }
                        return false;
                    })(['API.djLeave', 'API.djJoin', 'API.moderateLockWaitList', 'API.moderateForceSkip', '.getScript(']))
                        obj.m.off(obj.e, events[b].callback);
                }
                if (typeof startWooting === 'function' && startWooting.toString().indexOf('API.sendChat(') > -1)
                    return c();
            });
        }

        function onChatReceived(data) {
            if (!data.uid) return;

            data.type += ' from-' + data.uid;

            if (p3Utils.havePlugCubedRank(data.uid))
                data.type += ' is-p3' + p3Utils.getHighestRank(data.uid);

            data.type += ' from';
            if (API.hasPermission(data.uid, API.ROLE.DJ) || data.uid == API.getUser().id) {
                data.type += '-';

                if (API.hasPermission(data.uid, API.ROLE.ADMIN)) {
                    data.type += 'admin';
                } else if (API.hasPermission(data.uid, API.ROLE.AMBASSADOR)) {
                    data.type += 'ambassador';
                } else if (API.hasPermission(data.uid, API.ROLE.HOST)) {
                    data.type += 'host';
                } else if (API.hasPermission(data.uid, API.ROLE.COHOST)) {
                    data.type += 'cohost';
                } else if (API.hasPermission(data.uid, API.ROLE.MANAGER)) {
                    data.type += 'manager';
                } else if (API.hasPermission(data.uid, API.ROLE.BOUNCER)) {
                    data.type += 'bouncer';
                } else if (API.hasPermission(data.uid, API.ROLE.DJ)) {
                    data.type += 'residentdj';
                } else if (data.uid == API.getUser().id) {
                    data.type += 'you';
                }
            }

            if (data.type.split(' ')[0] === 'mention') {
                data.type += ' is-';
                if (API.hasPermission(data.uid, API.ROLE.ADMIN)) data.type += 'admin';
                else if (API.hasPermission(data.uid, API.ROLE.VOLUNTEER)) data.type += 'ambassador';
                else if (API.hasPermission(data.uid, API.ROLE.BOUNCER)) data.type += 'staff';
                else if (API.hasPermission(data.uid, API.ROLE.DJ)) data.type += 'dj';
                else if (data.uid == API.getUser().id) data.type += 'you';
                data.message = data.message.split('@' + API.getUser().username).join('<span class="name">@' + API.getUser().username + '</span>');
            }

            if (plugCubed.settings.chatimages) {
                if (data.message.toLowerCase().indexOf('nsfw') < 0 && (/\.(gif|jpg|jpeg|png)/i).test(data.message)) {
                    var temp = $('<div/>');
                    temp.html(data.message).find('a').each(function() {
                        var url = $(this).html();
                        if ((/\.(gif|jpg|jpeg|png)$/i).test(url) && url.toLowerCase().indexOf('https://plug.dj/') !== 0) {
                            var image = $('<img/>').attr('src', loadImage(url)).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');
                            $(this).html(image);
                            image.on('load', function() {
                                var $chat = PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'),
                                    height = this.height;
                                if (this.width > $chat.find('.message').width())
                                    height *= this.width / $chat.find('.message').width();
                                $chat.scrollTop($chat[0].scrollHeight + height);
                            });
                        }
                    });
                    data.message = temp.html();
                }
            }
        }

        function onChatReceivedLate(data) {
            if (!data.uid) return;

            var $this = $('#chat').find('div[data-cid="' + data.cid + '"]');

            if (data.type.split(' ')[0] === 'pm') {
                var icon = $this.find('.icon');
                if (icon.length === 0)
                    icon = $('<i>').addClass('icon').css({
                        width: '16px',
                        height: '16px'
                    }).appendTo($this);
                if ($('.icon-chat-sound-on').length > 0)
                    playChatSound();
            } else if (p3Utils.havePlugCubedRank(data.uid)) {
                var icon = $this.find('.icon'),
                    specialIconInfo = p3Utils.getPlugCubedSpecial(data.uid);
                if (icon.length === 0)
                    icon = $('<i>').addClass('icon').css({
                        width: '16px',
                        height: '16px'
                    }).appendTo($this);

                icon.mouseover(function() {
                    Context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(data.uid)).text(), $(this), true);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                });

                if (specialIconInfo !== undefined)
                    icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/files/images/icons.p3special.' + specialIconInfo.icon + '.png")');
            }
        }

        function onMediaChange() {
            if (PlaybackModel.get('mutedOnce') === true)
                PlaybackModel.set('volume', PlaybackModel.get('lastVolume'));
        }

        function __init() {
            afkTimerInterval = setInterval(afkTimerTick, 1E3);
            antiVideoHidingTimerInterval = setInterval(antiVideoHidingTick, 1E4);
            antiDangerousScriptsTimerInterval = setInterval(antiDangerousScripts, 1E4);

            this.colors = {
                userCommands: '66FFFF',
                modCommands: 'FF0000',
                infoMessage1: 'FFFF00',
                infoMessage2: '66FFFF',
                warningMessage: 'DB182E'
            };
            this.defaultAwayMsg = p3Lang.i18n('autorespond.default');

            setTimeout(function() {
                p3history = [];
                var data = API.getHistory();
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    var a = data[i],
                        obj = {
                            id: a.media.id,
                            author: a.media.author,
                            title: a.media.title,
                            wasSkipped: false,
                            dj: {
                                id: a['user'].id.toString(),
                                username: a['user'].username
                            }
                        };
                    p3history.push(obj);
                }
            }, 1);

            if (typeof UserRolloverView._showSimple !== 'function')
                UserRolloverView._showSimple = UserRolloverView.showSimple;
            UserRolloverView.showSimple = function(a, b) {
                this._showSimple(a, b);
                var specialIconInfo = p3Utils.getPlugCubedSpecial(a.id);

                if (this.$p3Role) {
                    this.$p3Role.remove();
                    this.$meta.removeClass('p3special');
                    this.$roleIcon.css('background-image', '');
                }

                if (p3Utils.havePlugCubedRank(a.id)) {
                    if (p3Utils.havePlugCubedRank(a.id, true)) {
                        this.$roleIcon.addClass('icon-is-p3' + p3Utils.getHighestRank(a.id));
                        this.$role.text($('<span>').html(p3Utils.getAllPlugCubedRanks(a.id, true)).text());
                    }
                }

                if (specialIconInfo !== undefined) {
                    this.$p3Role = $('<span>').addClass('specialRole').text($('<span>').html(p3Utils.getAllPlugCubedRanks(a.id)).text());
                    this.$meta.append(this.$p3Role).addClass('p3special');
                    this.$roleIcon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/files/images/icons.p3special.' + specialIconInfo.icon + '.png")');
                }
            };

            this.customColorsStyle = $('<style type="text/css" />');
            $('head').append(this.customColorsStyle);
            p3Utils.chatLog(undefined, p3Lang.i18n('running', version) + '</span><br /><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('commandsHelp'), this.colors.infoMessage1);
            API.chatLog('There can/will be bugs in this version of plugCubed', true);

            $('body').prepend('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="https://d1rfegul30378.cloudfront.net/files/plugCubed.css?_' + Date.now() + '" />');
            $('#app-menu').after(menuButton);
            $('#room-bar .favorite').css('right', 55);
            menuButton.click(this.proxy.onMenuClick);
            $('#room-bar').css('left', 108);

            PlaybackModel.off('change:volume', PlaybackModel.onVolumeChange);
            /** @this = {PlaybackModel} */
            PlaybackModel.onVolumeChange = function() {
                if (typeof plugCubed === 'undefined')
                    this.set('muted', this.get('volume') == 0);
                else {
                    if (this.get('mutedOnce') === undefined)
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

            $('#volume').remove();
            volume = new VolumeView();
            $('#now-playing-bar').append(volume.$el);
            volume.render();

            this.loadSettings();
            this.initAPIListeners();
            this.initBody();
            var users = API.getUsers();
            for (var i in users) {
                if (!users.hasOwnProperty(i)) continue;
                if (getUserData(users[i].id, 'joinTime', -1) < 0)
                    setUserData(users[i].id, 'joinTime', Date.now());
            }

            $('#chat-header').append(
                $('<div>').addClass('chat-header-button p3-s-stream').data('key', 'stream').click(this.proxy.onMenuButtonClick).mouseover(function() {
                    Context.trigger('tooltip:show', p3Lang.i18n('tooltip.stream'), $(this), true);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                })
            ).append(
                $('<div>').addClass('chat-header-button p3-s-clear').data('key', 'clear').click(this.proxy.onMenuButtonClick).mouseover(function() {
                    Context.trigger('tooltip:show', p3Lang.i18n('tooltip.clear'), $(this), true);
                }).mouseout(function() {
                    Context.trigger('tooltip:hide');
                })
            );
            this.setEnabled('stream', Database.settings.streamDisabled);

            PlaybackModel.on('change:media', onMediaChange);
            PlaybackModel._events['change:media'].unshift(PlaybackModel._events['change:media'].pop());
            Context.on('chat:receive', onChatReceived);
            Context._events['chat:receive'].unshift(Context._events['chat:receive'].pop());
            Context.on('chat:receive', onChatReceivedLate);

            RoomUserListView.prototype.RowClass = _RoomUserListRow

            TUM._canModChat = TUM.canModChat;
            TUM.canModChat = function(a) {
                if (plugCubed !== undefined) {
                    if (API.getUser().permission > API.ROLE.DJ && (function(_) {
                        return p3Utils.isPlugCubedDeveloper(_) || p3Utils.isPlugCubedSponsor(_) || p3Utils.isPlugCubedAmbassador(_);
                    })(API.getUser().id))
                        return true;
                }
                return this._canModChat(a);
            };

            this.Socket();
            this.loaded = true;
            loadRoomSettings();

            $('#footer-links').append($('<div />').addClass('footer').addClass('plugcubed-footer').css('top', 12).html(p3Lang.i18n('running', version) + p3Lang.i18n('footer.seperator')).append($('<span />').addClass('plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.unknown')))));
        }

        function GUIButton(setting, id, text) {
            return $('<div class="item">').addClass('p3-s-' + id + (setting ? ' selected' : '')).append(
                $('<i class="icon icon-check-blue"></i>')
            ).append(
                $('<span>').text(text)
            ).data('key', id).click(plugCubed.proxy.onMenuButtonClick);
        }

        function GUIInput(setting, id, text) {
            return $('<div class="item">').addClass('p3-s-' + id + (setting ? ' selected' : '')).append(
                $('<i class="icon icon-check-blue"></i>')
            ).append(
                $('<span>').text(text)
            ).data('key', id).click(plugCubed.proxy.onMenuButtonClick);
        }

        var afkTimerInterval,
            antiVideoHidingTimerInterval,
            antiDangerousScriptsTimerInterval,
            version = {
                major: 3,
                minor: 0,
                patch: 9,
                prerelease: "",
                build: 705,
                minified: false,
                /**
                 * @this {version}
                 */
                toString: function() {
                    return this.major + '.' + this.minor + '.' + this.patch + (this.prerelease !== undefined && this.prerelease !== '' ? '-' + this.prerelease : '') + (this.minified ? '_min' : '') + ' (Build ' + this.build + ')';
                }
            },
            p3history = [],
            haveRoomSettings = false,
            socketReconnecting = false,
            roomChatColors = {},
            roomChatIcons = {},
            roomCSSRules = [],
            roomRules = {},
            menuButton = $('<div id="plugcubed" style="z-index:90000"><i class="icon icon-plugcubed"></i></div>'),
            menuDiv,
            volume,
            socket,
            lastPMReceiver,
            customChatColorDiv;

        return Class.extend({
            /**
             * @this {plugCubedModel}
             */
            init: function() {
                if (typeof plugCubedUserData === 'undefined') plugCubedUserData = {};
                //if (localStorage.getItem('plugCubedLang') === null || localStorage.getItem('plugCubedLang') === '@@@') return;
                this.proxy = {
                    onChatCommand: $.proxy(this.onChatCommand, this),
                    onMenuButtonClick: $.proxy(this.onMenuButtonClick, this),
                    onDjAdvance: $.proxy(this.onDjAdvance, this),
                    onVoteUpdate: $.proxy(this.onVoteUpdate, this),
                    onGrab: $.proxy(this.onGrab, this),
                    onUserJoin: $.proxy(this.onUserJoin, this),
                    onUserLeave: $.proxy(this.onUserLeave, this),
                    onChat: $.proxy(this.onChat, this),
                    onSkip: $.proxy(this.onSkip, this),
                    onMenuClick: $.proxy(this.onMenuClick, this)
                };
                // Load language and begin script after language loaded
                p3Lang.load(localStorage.getItem('plugCubedLang'), $.proxy(__init, this));
            },
            /**
             * @this {plugCubedModel}
             */
            close: function() {
                if (this.loaded === undefined || this.loaded === false) return;
                UserRolloverView.showSimple = UserRolloverView._showSimple;
                TUM.canModChat = TUM._canModChat;
                clearInterval(afkTimerInterval);
                clearInterval(antiVideoHidingTimerInterval);
                clearInterval(antiDangerousScriptsTimerInterval);
                runRoomSettings({});
                $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                API.setStatus(API.STATUS.AVAILABLE);
                API.off(API.CHAT_COMMAND, this.proxy.onChatCommand);
                API.off(API.ADVANCE, this.proxy.onDjAdvance);
                API.off(API.VOTE_UPDATE, this.proxy.onVoteUpdate);
                API.off(API.GRAB_UPDATE, this.proxy.onGrab);
                API.off(API.USER_JOIN, this.proxy.onUserJoin);
                API.off(API.USER_LEAVE, this.proxy.onUserLeave);
                API.off(API.CHAT, this.proxy.onChat);
                API.off(API.USER_SKIP, this.proxy.onSkip);
                API.off(API.MOD_SKIP, this.proxy.onSkip);
                Context.off('chat:receive', onChatReceived);
                Context.off('chat:receive', onChatReceivedLate);
                volume.remove();

                $('#plugcubed-css,#font-awesome,#plugcubed-js-extra,#side-right,#side-left,#notify-dialog,.plugcubed-footer,#plugcubed,#p3-settings,#p3-settings-custom-colors,.p3-s-stream,.p3-s-clear,#waitlist .user .afkTimer').remove();
                $('#room-bar').css('left', 54);
                $('#room-bar .favorite').css('right', 0);
                if (this.customColorsStyle)
                    this.customColorsStyle.remove();
                if (socket) {
                    socket.onclose = function() {
                        console.log('[plug³ Socket Server]', 'Closed');
                    };
                    socket.close();
                }
                RoomUserListView.prototype.RowClass = RoomUserListRow;
                requirejs.undef('f82fae/b93191');
                requirejs.undef('f82fae/d67453/f3deea');
                requirejs.undef('f82fae/d67453/f9a3ae');
                requirejs.undef('f82fae/d67453/a1ab3a');
                requirejs.undef('f82fae/d67453/c8e8fc');
                requirejs.undef('f82fae/f1da31');
                requirejs.undef('f82fae/d48e02');
                requirejs.undef('f82fae/ac606c');
                requirejs.undef('f82fae/a8c196');
                requirejs.undef('f82fae/e78de6');
                requirejs.undef('f82fae/f36e0e');
                requirejs.undef('f82fae/abd868');
                Styles.destroy();
                requirejs.undef('f82fae/a07c86');
                this.loaded = false;
                delete plugCubed;
            },
            /**
             * @this {plugCubedModel}
             */
            Socket: function() {
                if (socket !== undefined && socket.readyState === SockJS.OPEN) return;
                socket = new SockJS('https://socket.plugcubed.net/_');
                socket.tries = 0;
                console.log('[plug³ Socket Server]', socketReconnecting ? 'Reconnecting' : 'Connecting');
                /**
                 * @this {SockJS}
                 */
                socket.onopen = function() {
                    this.tries = 0;
                    console.log('[plug³ Socket Server]', socketReconnecting ? 'Reconnected' : 'Connected');
                    var userData = API.getUser();
                    this.send(JSON.stringify({
                        type: 'userdata',
                        id: userData.id,
                        username: userData.username,
                        room: Room.get('id'),
                        version: version.toString()
                    }));
                    $('.plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.online')));
                }
                /**
                 * @this {SockJS}
                 */
                socket.onmessage = function(msg) {
                    var obj = JSON.parse(msg.data),
                        type = obj.type,
                        data = obj.data;
                    if (type === 'chat') {
                        if (!data.cid || $('.chat-id-' + data.cid).length > 0)
                            return;
                        Chat.receive(data);
                        return API.trigger(API.CHAT, data);
                    }
                    if (type === 'pm') {
                        Chat.receive(data);
                        return API.trigger(API.CHAT, data);
                    }
                    if (type === 'pmUserNotFound') {
                        var user = API.getUser(data.id);
                        if (!user)
                            user = {
                                username: 'Receiver'
                            };
                        return API.chatLog('[p3 Socket] ' + user.username + ' not found', true);
                    }
                    if (type === 'rave') {
                        if (p3Utils.isPlugCubedDeveloper(data.id) || p3Utils.isPlugCubedSponsor(data.id) || API.hasPermission(data.id, API.ROLE.COHOST)) {
                            clearTimeout(Audience.strobeTimeoutID);
                            if (data.value === 0)
                                return Audience.onStrobeChange(null, 0), true;
                            if (data.value === 1)
                                return Audience.onStrobeChange(null, 2), p3Utils.chatLog(undefined, p3Lang.i18n('strobe', API.getUser(data.id).username)), true;
                            if (data.value === 2)
                                return Audience.onStrobeChange(null, 1), p3Utils.chatLog(undefined, p3Lang.i18n('lightsOut', API.getUser(data.id).username)), true;
                        }
                    }
                    if (type === 'broadcast') {
                        if (!p3Utils.isPlugCubedDeveloper(data.id) && !p3Utils.isPlugCubedSponsor(data.id)) return;
                        return p3Utils.chatLog('system', '<strong>Broadcast from a ' + p3Lang.i18n('info.specialTitles.' + (p3Utils.isPlugCubedDeveloper(data.id) ? 'developer' : 'sponsor')) + '</strong><br /><span style="color:#FFFFFF;font-weight:400">' + data.message + '</span>');
                    }
                }
                /**
                 * @this {SockJS}
                 */
                socket.onclose = function() {
                    console.log('[plug³ Socket Server]', 'Closed');
                    this.tries++;
                    socketReconnecting = true;

                    var delay;
                    if (this.tries < 5) delay = 5;
                    else if (this.tries < 30) delay = 30;
                    else if (this.tries < 60) delay = 60;
                    else return;

                    setTimeout(function() {
                        plugCubed.Socket();
                    }, delay * 1E3);
                    $('.plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.offline')));
                }
            },
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
                    curate: {
                        title: 'notify.curate',
                        color: '00FF00'
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
                        title: 'notify.songLength',
                        color: '66FFFF'
                    }
                }
            },
            settings: {
                recent: false,
                awaymsg: '',
                autowoot: false,
                autojoin: false,
                autorespond: false,
                notify: 0,
                customColors: false,
                chatimages: false,
                avatarAnimations: true,
                registeredSongs: [],
                alertson: [],
                afkTimers: false,
                notifySongLength: 10,
                useRoomSettings: {},
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
                    curate: '00FF00',
                    stats: '66FFFF',
                    updates: 'FFFF00',
                    songLength: '66FFFF'
                }
            },
            /**
             * @this {plugCubedModel}
             */
            loadSettings: function() {
                try {
                    var save = JSON.parse(localStorage.getItem('plugCubed'));
                    for (var i in this.settings) {
                        if (!this.settings.hasOwnProperty(i)) continue;
                        if (save[i] !== undefined) this.settings[i] = save[i];
                    }
                    this.settings.recent = false;
                    if (this.settings.autowoot) woot();
                    if (this.settings.autojoin) join();
                    this.updateCustomColors();
                    if (this.settings.afkTimers && (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER))) Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                    if (this.settings.notify > 127) this.settings.notify = 0;
                    if (this.settings.registeredSongs.length > 0 && this.settings.registeredSongs.indexOf(API.getMedia().id) > -1) {
                        while (!PlaybackModel.get('mutedOnce'))
                            volume.onClick();
                        API.chatLog(p3Lang.i18n('automuted', API.getMedia().title));
                    } else this.settings.autoMuted = false;
                } catch (e) {}
            },
            /**
             * @this {plugCubedModel}
             */
            saveSettings: function() {
                localStorage.setItem('plugCubed', JSON.stringify(this.settings));
            },
            /**
             * @this {plugCubedModel}
             */
            updateCustomColors: function() {
                var a = [],
                    b = this.settings.useRoomSettings[window.location.pathname.split('/')[1]];
                b = b === undefined || b === true ? true : false;
                if ((b && roomChatColors.regular) || this.settings.colors.regular !== this.colorInfo.ranks.regular.color)
                    a.push('#user-panel:not(.is-none) .user > .name:first-child,', '#user-lists .user > .name:first-child,', '.message.from > .from,', '.emote.from > .from,', '.mention.from > .from { color:#' + (this.settings.colors.regular !== this.colorInfo.ranks.regular.color ? this.settings.colors.regular : roomChatColors.regular) + '!important; }');
                if ((b && roomChatColors.residentdj) || this.settings.colors.residentdj !== this.colorInfo.ranks.residentdj.color)
                    a.push('#user-panel:not(.is-none) .user > .icon-chat-dj + .name,', '#user-lists .user > .icon-chat-dj + .name,', '.message.from-residentdj > .from,', '.emote.from-residentdj > .from,', '.mention.from-residentdj > .from { color:#' + (this.settings.colors.residentdj !== this.colorInfo.ranks.residentdj.color ? this.settings.colors.residentdj : roomChatColors.residentdj) + '!important; }');
                if ((b && roomChatColors.bouncer) || this.settings.colors.bouncer !== this.colorInfo.ranks.bouncer.color)
                    a.push('#user-panel:not(.is-none) .user > .icon-chat-bouncer + .name,', '#user-lists .user > .icon-chat-bouncer + .name,', '.message.from-bouncer > .from,', '.emote.from-bouncer > .from,', '.mention.from-bouncer > .from { color:#' + (this.settings.colors.bouncer !== this.colorInfo.ranks.bouncer.color ? this.settings.colors.bouncer : roomChatColors.bouncer) + '!important; }');
                if ((b && roomChatColors.manager) || this.settings.colors.manager !== this.colorInfo.ranks.manager.color)
                    a.push('#user-panel:not(.is-none) .user > .icon-chat-manager + .name,', '#user-lists .user > .icon-chat-manager + .name,', '.message.from-manager > .from,', '.emote.from-manager > .from,', '.mention.from-manager > .from { color:#' + (this.settings.colors.manager !== this.colorInfo.ranks.manager.color ? this.settings.colors.manager : roomChatColors.manager) + '!important; }');
                if ((b && roomChatColors.cohost) || this.settings.colors.cohost !== this.colorInfo.ranks.cohost.color)
                    a.push('#user-panel:not(.is-none) .user > .icon-chat-cohost + .name,', '#user-lists .user > .icon-chat-cohost + .name,', '.message.from-cohost > .from,', '.emote.from-cohost > .from,', '.mention.from-cohost > .from { color:#' + (this.settings.colors.cohost !== this.colorInfo.ranks.cohost.color ? this.settings.colors.cohost : roomChatColors.cohost) + '!important; }');
                if ((b && roomChatColors.host) || this.settings.colors.host !== this.colorInfo.ranks.host.color)
                    a.push('#user-panel:not(.is-none) .user > .icon-chat-host + .name,', '#user-lists .user > .icon-chat-host + .name,', '.message.from-host > .from,', '.emote.from-host > .from,', '.mention.from-host > .from { color:#' + (this.settings.colors.host !== this.colorInfo.ranks.host.color ? this.settings.colors.host : roomChatColors.host) + '!important; }');
                if ((b && roomChatColors.ambassador) || this.settings.colors.ambassador !== this.colorInfo.ranks.ambassador.color)
                    a.push('#user-panel:not(.is-none) .user > .icon-chat-ambassador + .name,', '#user-lists .user > .icon-chat-ambassador + .name,', '.message.from-ambassador > .from,', '.emote.from-ambassador > .from,', '.mention.from-ambassador > .from { color:#' + (this.settings.colors.ambassador !== this.colorInfo.ranks.ambassador.color ? this.settings.colors.ambassador : roomChatColors.ambassador) + '!important; }');
                if ((b && roomChatColors.admin) || this.settings.colors.admin !== this.colorInfo.ranks.admin.color)
                    a.push('#user-panel:not(.is-none) .user > .icon-chat-admin + .name,', '#user-lists .user > .icon-chat-admin + .name,', '.message.from-admin > .from,', '.emote.from-admin > .from,', '.mention.from-admin > .from { color:#' + (this.settings.colors.admin !== this.colorInfo.ranks.admin.color ? this.settings.colors.admin : roomChatColors.admin) + '!important; }');
                if ((b && roomChatColors.you) || this.settings.colors.you !== this.colorInfo.ranks.you.color)
                    a.push('.message.from-you > .from,', '.emote.from-you > .from,', '.mention.from-you > .from { color:#' + (this.settings.colors.you !== this.colorInfo.ranks.you.color ? this.settings.colors.you : roomChatColors.you) + '!important; }');
                if (b) {
                    if (roomChatIcons.admin)
                        a.push('.icon-chat-admin,', '.message.from-admin > .icon,', '.emote.from-admin > .icon,', '.mention.from-admin > .icon { background-image: url("' + loadImage(roomChatIcons.admin) + '"); background-position: 0 0; }');
                    if (roomChatIcons.ambassador)
                        a.push('.icon-chat-ambassador,', '.message.from-ambassador > .icon,', '.emote.from-ambassador > .icon,', '.mention.from-ambassador > .icon { background-image: url("' + loadImage(roomChatIcons.ambassador) + '"); background-position: 0 0; }');
                    if (roomChatIcons.bouncer)
                        a.push('.icon-chat-bouncer,', '.message.from-bouncer > .icon,', '.emote.from-bouncer > .icon,', '.mention.from-bouncer > .icon { background-image: url("' + loadImage(roomChatIcons.bouncer) + '"); background-position: 0 0; }');
                    if (roomChatIcons.cohost)
                        a.push('.icon-chat-cohost,', '.message.from-cohost > .icon,', '.emote.from-cohost > .icon,', '.mention.from-cohost > .icon { background-image: url("' + loadImage(roomChatIcons.cohost) + '"); background-position: 0 0; }');
                    if (roomChatIcons.residentdj)
                        a.push('.icon-chat-dj,', '.message.from-residentdj > .icon,', '.emote.from-residentdj > .icon,', '.mention.from-residentdj > .icon { background-image: url("' + loadImage(roomChatIcons.residentdj) + '"); background-position: 0 0; }');
                    if (roomChatIcons.host)
                        a.push('.icon-chat-host,', '.message.from-host > .icon,', '.emote.from-host > .icon,', '.mention.from-host > .icon { background-image: url("' + loadImage(roomChatIcons.host) + '"); background-position: 0 0; }');
                    if (roomChatIcons.manager)
                        a.push('.icon-chat-manager,', '.message.from-manager > .icon,', '.emote.from-manager > .icon,', '.mention.from-manager > .icon { background-image: url("' + loadImage(roomChatIcons.manager) + '"); background-position: 0 0; }');
                }
                this.customColorsStyle.text(a.join("\n"));
            },
            /**
             * @this {plugCubedModel}
             */
            initAPIListeners: function() {
                API.on(API.CHAT_COMMAND, this.proxy.onChatCommand);
                API.on(API.ADVANCE, this.proxy.onDjAdvance);
                API.on(API.VOTE_UPDATE, this.proxy.onVoteUpdate);
                API.on(API.GRAB_UPDATE, this.proxy.onGrab);
                API.on(API.USER_JOIN, this.proxy.onUserJoin);
                API.on(API.USER_LEAVE, this.proxy.onUserLeave);
                API.on(API.CHAT, this.proxy.onChat);
                API.on(API.USER_SKIP, this.proxy.onSkip);
                API.on(API.MOD_SKIP, this.proxy.onSkip);
            },
            initBody: function() {
                var rank = 'regular';
                if (API.hasPermission(undefined, API.ROLE.ADMIN)) rank = 'admin';
                else if (API.hasPermission(undefined, API.ROLE.AMBASSADOR)) rank = 'ambassador';
                else if (API.hasPermission(undefined, API.ROLE.HOST)) rank = 'host';
                else if (API.hasPermission(undefined, API.ROLE.COHOST)) rank = 'cohost';
                else if (API.hasPermission(undefined, API.ROLE.MANAGER)) rank = 'manager';
                else if (API.hasPermission(undefined, API.ROLE.BOUNCER)) rank = 'bouncer';
                else if (API.hasPermission(undefined, API.ROLE.DJ)) rank = 'residentdj';
                $('body').addClass('p3-' + rank);
            },
            setEnabled: function(id, value) {
                $('.p3-s-' + id).removeClass('selected');
                if (value) $('.p3-s-' + id).addClass('selected');
            },
            /**
             * @this {plugCubedModel}
             */
            moderation: function(target, type) {
                if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                    var service;
                    switch (type) {
                        case 'removedj':
                            service = API.moderateRemoveDJ;
                            break;
                        case 'adddj':
                            service = API.moderateAddDJ;
                            break;
                        default:
                            API.chatLog(p3Lang.i18n('error.unknownModeration'));
                            return;
                    }
                    var user = getUser(target);
                    if (user === null) API.chatLog(p3Lang.i18n('error.userNotFound'));
                    else service(user.id, ' ');
                }
            },
            /**
             * @this {plugCubedModel}
             */
            onMenuClick: function() {
                if (menuDiv !== undefined) {
                    if (menuDiv.css('left') === '0px')
                        return menuDiv.animate({
                            left: -271
                        }), dialogColors.hide();
                    return menuDiv.animate({
                        left: 0
                    });
                }
                menuDiv = $('<div id="p3-settings" style="left: -271px;">').append(
                    $('<div class="header">').append(
                        $('<div class="back">').append(
                            $('<i class="icon icon-arrow-left"></i>')
                        ).click(function() {
                            if (menuDiv !== undefined) menuDiv.animate({
                                left: -271
                            });
                            dialogColors.hide();
                        })
                    ).append(
                        $('<div class="title">').append(
                            $('<i class="icon icon-settings-white"></i>')
                        ).append(
                            $('<span>plug&#179;</span>')
                        ).append(
                            $('<span>').addClass('version').text(version)
                        )
                    )
                ).append(
                    $('<div class="container">').append(
                        $('<div class="section">Features</div>')
                    ).append(
                        (typeof roomRules.allowAutowoot === 'undefined' || roomRules.allowAutowoot !== false ?
                            GUIButton(this.settings.autowoot, 'woot', p3Lang.i18n('menu.autowoot')) :
                            ''
                        )
                    ).append(
                        (typeof roomRules.allowAutojoin === 'undefined' || roomRules.allowAutojoin !== false ?
                            GUIButton(this.settings.autojoin, 'join', p3Lang.i18n('menu.autojoin')) :
                            ''
                        )
                    ).append(
                        (typeof roomRules.allowAutorespond === 'undefined' || roomRules.allowAutorespond !== false ?
                            GUIButton(this.settings.autorespond, 'autorespond', p3Lang.i18n('menu.autorespond')) :
                            ''
                        )
                    ).append(
                        (typeof roomRules.allowAutorespond === 'undefined' || roomRules.allowAutorespond !== false ?
                            $('<div class="item">').addClass('p3-s-autorespond-input').append($('<input>').val(plugCubed.settings.awaymsg === '' ? this.defaultAwayMsg : plugCubed.settings.awaymsg).keyup(function() {
                                $(this).val($(this).val().split('@').join(''));
                                plugCubed.settings.awaymsg = $(this).val().trim();
                                plugCubed.saveSettings();
                            }))
                            .mouseover(function() {
                                Context.trigger('tooltip:show', p3Lang.i18n('tooltip.afk'), $(this), false);
                            })
                            .mouseout(function() {
                                Context.trigger('tooltip:hide');
                            }) :
                            ''
                        )
                    ).append(
                        (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER) ?
                            GUIButton(this.settings.afkTimers, 'afktimers', p3Lang.i18n('menu.afktimers')) :
                            ''
                        )
                    ).append(
                        (haveRoomSettings ?
                            GUIButton(this.settings.useRoomSettings[window.location.pathname.split('/')[1]] !== undefined ? this.settings.useRoomSettings[window.location.pathname.split('/')[1]] : true, 'roomsettings', p3Lang.i18n('menu.roomsettings')) :
                            ''
                        )
                    ).append(
                        GUIButton(false, 'colors', p3Lang.i18n('menu.customchatcolors') + '...')
                    ).append(
                        GUIButton(this.settings.chatimages, 'chatimages', p3Lang.i18n('menu.chatimages'))
                    ).append(
                        $('<div class="spacer">').append(
                            $('<div class="divider">')
                        )
                    ).append(
                        $('<div class="section">' + p3Lang.i18n('notify.header') + '</div>')
                    ).append(
                        GUIButton((this.settings.notify & 1) === 1, 'notify-join', p3Lang.i18n('notify.join')).data('bit', 1)
                    ).append(
                        GUIButton((this.settings.notify & 2) === 2, 'notify-leave', p3Lang.i18n('notify.leave')).data('bit', 2)
                    ).append(
                        GUIButton((this.settings.notify & 4) === 4, 'notify-curate', p3Lang.i18n('notify.curate')).data('bit', 4)
                    ).append(
                        GUIButton((this.settings.notify & 8) === 8, 'notify-stats', p3Lang.i18n('notify.stats')).data('bit', 8)
                    ).append(
                        GUIButton((this.settings.notify & 16) === 16, 'notify-updates', p3Lang.i18n('notify.updates')).data('bit', 16)
                    )
                );
                if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
                    var songLengthSlider = new Slider(5, 30, this.settings.notifySongLength, function(v) {
                        plugCubed.settings.notifySongLength = v;
                        plugCubed.saveSettings();
                        $('.p3-s-notify-songLength').find('span').text(p3Lang.i18n('notify.songLength', v))
                    });
                    menuDiv.find('.container').append(
                        GUIButton((this.settings.notify & 32) === 32, 'notify-history', p3Lang.i18n('notify.history')).data('bit', 32).data('perm', API.ROLE.BOUNCER)
                    ).append(
                        GUIButton((this.settings.notify & 64) === 64, 'notify-songLength', p3Lang.i18n('notify.songLength', this.settings.notifySongLength)).data('bit', 64).data('perm', API.ROLE.BOUNCER)
                    ).append(
                        songLengthSlider.$slider.css('left', 40)
                    );
                }
                menuDiv.animate({
                    left: 0
                });
                $('body').append(menuDiv);
                if (songLengthSlider !== undefined) songLengthSlider.onChange();
            },
            /**
             * @this {plugCubedModel}
             */
            onMenuButtonClick: function(e) {
                var a = $(e.currentTarget).data('key');
                switch (a) {
                    case 'woot':
                        this.settings.autowoot = !this.settings.autowoot;
                        this.setEnabled('woot', this.settings.autowoot);
                        if (this.settings.autowoot)
                            woot();
                        break;
                    case 'join':
                        this.settings.autojoin = !this.settings.autojoin;
                        this.setEnabled('join', this.settings.autojoin);
                        if (this.settings.autojoin)
                            join();
                        break;
                    case 'colors':
                        dialogColors.render();
                        break;
                    case 'chatimages':
                        this.settings.chatimages = !this.settings.chatimages;
                        this.setEnabled('chatimages', this.settings.chatimages);
                        break;
                    case 'autorespond':
                        this.settings.autorespond = !this.settings.autorespond;
                        this.setEnabled('autorespond', this.settings.autorespond);
                        if (this.settings.autorespond) {
                            if (this.settings.awaymsg.trim() === "") this.settings.awaymsg = this.defaultAwayMsg;
                            $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                            if (API.getUser().status <= 0)
                                API.setStatus(API.STATUS.AFK);
                        } else {
                            $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                            API.setStatus(API.STATUS.AVAILABLE);
                        }
                        break;
                    case 'notify-join':
                    case 'notify-leave':
                    case 'notify-curate':
                    case 'notify-stats':
                    case 'notify-updates':
                    case 'notify-history':
                    case 'notify-songLength':
                        if (!$('.p3-s-' + a).data('perm') || (API.hasPermission(undefined, $('.p3-s-' + a).data('perm')) || p3Utils.isPlugCubedDeveloper())) {
                            var bit = $('.p3-s-' + a).data('bit');
                            this.settings.notify += (this.settings.notify & bit) === bit ? -bit : bit;
                            this.setEnabled(a, (this.settings.notify & bit) === bit);
                            Context.trigger('notify', 'icon-chat-system', [p3Lang.i18n(a.split('-').join('.')), p3Lang.i18n('notify.header'), (this.settings.notify & bit) === bit ? 'enabled' : 'disabled'].join(' '));
                        }
                        break;
                    case 'stream':
                        PlaybackModel.set('streamDisabled', !Database.settings.streamDisabled);
                        this.setEnabled('stream', Database.settings.streamDisabled);
                        return;
                        break;
                    case 'clear':
                        Chat.clear();
                        return;
                        break;
                    case 'roomsettings':
                        var a = this.settings.useRoomSettings[window.location.pathname.split('/')[1]];
                        a = a === undefined || a === true ? false : true;
                        this.settings.useRoomSettings[window.location.pathname.split('/')[1]] = a;
                        (a ? loadRoomSettings : runRoomSettings)({});
                        this.setEnabled('roomsettings', a);
                        break;
                    case 'afktimers':
                        this.settings.afkTimers = !this.settings.afkTimers;
                        this.setEnabled('afktimers', this.settings.afkTimers);
                        if (this.settings.afkTimers)
                            Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                        else {
                            Styles.unset('waitListMove');
                            $('#waitlist .user .afkTimer').remove();
                        }
                        break;
                    default:
                        return API.chatLog(p3Lang.i18n('error.unknownMenuKey', a));
                }
                this.saveSettings();
            },
            /**
             * @this {plugCubedModel}
             */
            onColorDefault: function() {
                for (var i in this.settings.colors) {
                    if (!this.settings.colors.hasOwnProperty(i)) continue;
                    var elem = $('input[name="' + i + '"]');
                    elem.val(elem.data('ph'));
                    elem.parents('.dialog-input-container').find('.dialog-input-label').css('color', elem.val().toRGB());
                }
            },
            /**
             * @this {plugCubedModel}
             * @param {plugDJAdvanceEvent} data
             */
            onDjAdvance: function(data) {
                if ((this.settings.notify & 8) === 8)
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.stats', data.lastPlay.score.positive, data.lastPlay.score.negative, data.lastPlay.score.grabs), this.settings.colors.stats);
                if ((this.settings.notify & 16) === 16)
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.updates', data.media.title, data.media.author, Utils.cleanTypedString(data.dj.username)), this.settings.colors.updates);
                if ((this.settings.notify & 64) === 64 && data.media.duration > this.settings.notifySongLength * 60) {
                    playMentionSound();
                    setTimeout(playMentionSound, 50);
                    p3Utils.chatLog('system', p3Lang.i18n('notify.message.songLength', this.settings.notifySongLength) + '<br /><span onclick="if (API.getMedia().id === \'' + id + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>');
                }
                if (this.settings.autojoin) join();
                setTimeout($.proxy(this.onDjAdvanceLate, this), Math.randomRange(1, 10) * 1000);
                this.onHistoryCheck(data.media.id);
                var obj = {
                    id: data.media.id,
                    author: data.media.author,
                    title: data.media.title,
                    wasSkipped: false,
                    user: {
                        id: data.dj.id,
                        username: data.dj.username
                    }
                };
                if (p3history.unshift(obj) > 50)
                    p3history.splice(50, p3history.length - 50);
                if (!this.settings.autoMuted && this.settings.registeredSongs.indexOf(data.media.id) > -1) {
                    setTimeout(function() {
                        while (!PlaybackModel.get('mutedOnce'))
                            volume.onClick();
                    }, 800);
                    API.chatLog(p3Lang.i18n('automuted', data.media.title));

                }
                var users = API.getUsers();
                for (var i in users) {
                    if (!users.hasOwnProperty(i)) continue;
                    setUserData(users[i].id, 'curVote', 0);
                }
            },
            /**
             * @this {plugCubedModel}
             * @param {plugVoteUpdateEvent} data
             */
            onVoteUpdate: function(data) {
                if (!data || !data.user) return;
                var curVote = getUserData(data.user.id, 'curVote', 0);

                if (curVote === 1) setUserData(data.user.id, 'wootcount', getUserData(data.user.id, 'wootcount', 0) - 1);
                else if (curVote === -1) setUserData(data.user.id, 'mehcount', getUserData(data.user.id, 'mehcount', 0) - 1);

                if (data.vote === 1) setUserData(data.user.id, 'wootcount', getUserData(data.user.id, 'wootcount', 0) + 1);
                else if (data.vote === -1) setUserData(data.user.id, 'mehcount', getUserData(data.user.id, 'mehcount', 0) + 1);

                setUserData(data.user.id, 'curVote', data.vote);
            },
            /**
             * @this {plugCubedModel}
             * @param {plugCurateUpdateEvent} data
             */
            onGrab: function(data) {
                var media = API.getMedia();
                if ((this.settings.notify & 4) === 4)
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.curate', Utils.cleanTypedString(data.user.username), media.author, media.title), this.settings.colors.curate);
            },
            /**
             * @this {plugCubedModel}
             */
            onDjAdvanceLate: function() {
                if (this.settings.autowoot && this.settings.registeredSongs.indexOf(API.getHistory()[0].media.id) < 0) woot();
            },
            /**
             * @this {plugCubedModel}
             * @param {plugUserJoinEvent} data
             */
            onUserJoin: function(data) {
                if ((this.settings.notify & 1) === 1 /* && Room.getUserByID(data.id) !== undefined*/ ) {
                    var relationship = 0; //Room.getUserByID(data.id).get('relationship');
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.join.' + (relationship === 0 || relationship === undefined ? 'normal' : (relationship > 1 ? 'friend' : 'fan')), Utils.cleanTypedString(data.username)), this.settings.colors.join);
                }
                if (getUserData(data.id, 'joinTime', 0) === 0)
                    setUserData(data.id, 'joinTime', Date.now());
            },
            /**
             * @this {plugCubedModel}
             * @param {plugUserLeaveEvent} data
             */
            onUserLeave: function(data) {
                var disconnects = getUserData(data.id, 'disconnects', {
                    count: 0
                });
                if ((this.settings.notify & 2) === 2 && (disconnects.time === undefined || Date.now() - disconnects.time < 1000)) {
                    var relationship = 0; //data.relationship;
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.leave.' + (relationship === 0 ? 'normal' : (relationship > 1 ? 'friend' : 'fan')), Utils.cleanTypedString(data.username)), this.settings.colors.leave);
                }
                disconnects.count++;
                disconnects.position = API.getDJ().id === data.id ? -1 : (API.getWaitListPosition(data.id) < 0 ? -2 : API.getWaitListPosition(data.id));
                disconnects.time = Date.now();
                setUserData(data.id, 'disconnects', disconnects);
            },
            /**
             * @this {plugCubedModel}
             */
            chatDisable: function(data) {
                var a = data.message.indexOf('@' + API.getUser().username) > -1 && API.hasPermission(data.uid, API.ROLE.BOUNCER),
                    b = data.message.indexOf('@') < 0 && (API.hasPermission(data.uid, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.uid));
                if (a || b) {
                    if (data.message.indexOf('!joindisable') > -1 && (typeof roomRules.allowAutojoin === 'undefined' || roomRules.allowAutojoin !== false)) {
                        if (this.settings.autojoin) {
                            this.settings.autojoin = false;
                            this.setEnabled('autojoin', this.settings.autojoin);
                            this.saveSettings();
                            API.sendChat(p3Lang.i18n('autojoin.commandDisable', '@' + data.un));
                        } else API.sendChat(p3Lang.i18n('autojoin.commandNotEnabled', '@' + data.un));
                    }
                    if (data.message.indexOf('!afkdisable') > -1 && (typeof roomRules.allowAutorespond === 'undefined' || roomRules.allowAutorespond !== false)) {
                        if (this.settings.autorespond) {
                            this.settings.autorespond = false;
                            this.setEnabled('autorespond', this.settings.autorespond);
                            this.saveSettings();
                            API.sendChat(p3Lang.i18n('autorespond.commandDisable', '@' + data.un));
                        } else API.sendChat(p3Lang.i18n('autorespond.commandNotEnabled', '@' + data.un));
                    }
                }
            },
            /**
             * @this {plugCubedModel}
             * @this {plugChatEvent} data
             */
            onChat: function(data) {
                this.chatDisable(data);
                if (data.type == 'mention') {
                    if (this.settings.autorespond && !this.settings.recent && (typeof roomRules.allowAutorespond === 'undefined' || roomRules.allowAutorespond !== false)) {
                        this.settings.recent = true;
                        $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.nextIn', this.getTimestamp(Date.now() + 18E4)));
                        setTimeout(function() {
                            $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.next'));
                            plugCubed.settings.recent = false;
                            plugCubed.saveSettings();
                        }, 18E4);
                        API.sendChat('[AFK] @' + data.from + ' ' + this.settings.awaymsg.split('@').join(''));
                    }
                } else if ($('.icon-chat-sound-on').length > 0) {
                    for (var i in this.settings.alertson) {
                        if (!this.settings.alertson.hasOwnProperty(i)) continue;
                        if (data.message.indexOf(this.settings.alertson[i]) > -1)
                            playChatSound();
                    }
                }
            },
            onSkip: function() {
                p3history[1].wasSkipped = true;
            },
            onHistoryCheck: function(id) {
                if ((!API.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper()) || (plugCubed.settings.notify & 32) !== 32) return;
                var found = -1;
                for (var i in p3history) {
                    if (!p3history.hasOwnProperty(i)) continue;
                    var a = p3history[i];
                    if (a.id == id && (~~i + 1) < p3history.length) {
                        found = ~~i + 2;
                        if (!a.wasSkipped) {
                            playMentionSound();
                            setTimeout(playMentionSound, 50);
                            p3Utils.chatLog('system', p3Lang.i18n('notify.message.history', found, p3history.length) + '<br /><span onclick="if (API.getMedia().id === \'' + id + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>');
                            return;
                        }
                    }
                }
                if (found > 0)
                    return API.chatLog(p3Lang.i18n('notify.message.historySkipped', found, p3history.length), true);
            },
            getTimestamp: function(t, format) {
                if (!format) format = 'hh:mm';
                var time = t ? new Date(t) : new Date(),
                    hours = time.getHours(),
                    minutes = time.getMinutes(),
                    seconds = time.getSeconds();
                hours = (hours < 10 ? '0' : '') + hours;
                minutes = (minutes < 10 ? '0' : '') + minutes;
                seconds = (seconds < 10 ? '0' : '') + seconds;
                return format.split('hh').join(hours).split('mm').join(minutes).split('ss').join(seconds);
            },
            onChatCommand: function(value) {
                if (API.hasPermission(undefined, API.ROLE.AMBASSADOR) || p3Utils.isPlugCubedDeveloper()) {
                    if (value.indexOf('/whois ') === 0)
                        return value.toLowerCase() === '/whois all' ? getAllUsers() : getUserInfo(value.substr(7));
                    if (API.hasPermission(undefined, API.ROLE.MANAGER)) {
                        if (value.indexOf('/banall') === 0) {
                            var me = API.getUser(),
                                users = API.getUsers();
                            for (var i in users) {
                                if (!users.hasOwnProperty(i)) continue;
                                if (users[i].id !== me.id)
                                    API.moderateBanUser(users[i].id, 0, API.BAN.PERMA);
                            }
                            return;
                        }
                    }
                }
                if (API.hasPermission(undefined, API.ROLE.COHOST) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedSponsor()) {
                    if (value.indexOf('/strobe') === 0) {
                        if (socket.readyState !== SockJS.OPEN) return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                        var args = value.split(' ');
                        if (value.indexOf('off') > -1)
                            socket.send(JSON.stringify({
                                type: 'rave',
                                value: 0
                            }));
                        else if (args.length > 1 && args[1].isNumber() && ~~args[1] >= 50 && ~~args[1] <= 100)
                            socket.send(JSON.stringify({
                                type: 'rave',
                                value: ~~args[1]
                            }));
                        else
                            socket.send(JSON.stringify({
                                type: 'rave',
                                value: 1
                            }));
                    }
                    if (value.indexOf('/rave') === 0) {
                        if (socket.readyState !== SockJS.OPEN) return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                        socket.send(JSON.stringify({
                            type: 'rave',
                            value: value.indexOf('off') > -1 ? 0 : 2
                        }));
                    }
                }
                if (API.hasPermission(undefined, API.ROLE.MANAGER)) {
                    if (value === '/lock')
                        return API.moderateLockWaitList(true);
                    if (value === '/unlock')
                        return API.moderateLockWaitList(false);
                    if (value === '/lockskip') {
                        var a = API.getDJ().id;
                        API.once(API.ADVANCE, function() {
                            API.once(API.WAIT_LIST_UPDATE, function() {
                                API.moderateMoveDJ(a, 1);
                            });
                            API.moderateAddDJ(a);
                        });
                        API.moderateForceSkip();
                    }
                }
                if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                    if (value.indexOf('/skip') === 0) {
                        if (API.getDJ() === undefined) return;
                        if (value.length > 5)
                            API.sendChat('@' + API.getDJ().username + ' - Reason for skip: ' + value.substr(5).trim());
                        return API.moderateForceSkip();
                    }
                    if (value.indexOf('/whois ') === 0)
                        return getUserInfo(value.substr(7));
                    if (value.indexOf('/add ') === 0)
                        return this.moderation(value.substr(5), 'adddj');
                    if (value.indexOf('/remove ') === 0)
                        return this.moderation(value.substr(8), 'removedj');
                }
                if (value === '/commands')
                    return dialogCommands.print();
                if (value === '/avail' || value === '/available')
                    return API.setStatus(0);
                if (value === '/brb' || value === '/away')
                    return API.setStatus(1);
                if (value === '/work' || value === '/working')
                    return API.setStatus(2);
                if (value === '/game' || value === '/gaming')
                    return API.setStatus(3);
                if (value.indexOf('/msg') === 0 || value.indexOf('/pm') === 0) {
                    var user = getUser(value.split(' ')[1]);
                    if (user !== null) {
                        socket.send(JSON.stringify({
                            type: 'PM',
                            value: {
                                id: user.id,
                                message: value.substr(value.indexOf(user.username) + user.username.length + 1)
                            }
                        }));
                        this.lastPMReceiver = user;
                    } else
                        API.chatLog('Username not found', true);
                    return;
                }
                if (value.indexOf('/r ') === 0) {
                    if (this.lastPMReceiver !== undefined && API.getUser(this.lastPMReceiver.id) !== undefined)
                        socket.send(JSON.stringify({
                            type: 'PM',
                            value: {
                                id: this.lastPMReceiver.id,
                                message: value.substr(3)
                            }
                        }));
                    else
                        API.chatLog('Can not find the last PM receiver', true);
                    return;
                }
                if (value === '/join')
                    return API.djJoin();
                if (value === '/leave')
                    return API.djLeave();
                if (value === '/whoami')
                    return getUserInfo(API.getUser().id);
                if (value === '/refresh')
                    return $('#refresh-button').click();
                if (value === '/version')
                    return API.chatLog(p3Lang.i18n('running', version));
                if (value.indexOf('/nick ') === 0) {
                    var nick = value.substr(6).trim();
                    $.ajax({
                        type: 'POST',
                        url: 'http://plug.dj/_/gateway/user.change_name',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            service: "user.change_name",
                            body: [nick]
                        })
                    });
                }
                if (value === '/mute') {
                    if (API.getVolume() === 0) return;
                    this.lastVolume = API.getVolume();
                    return API.setVolume(0);
                }
                if (value === '/unmute')
                    return API.getVolume() > 0 ? API.setVolume(this.lastVolume) : true;
                if (value === '/link')
                    return API.sendChat('plugCubed : http://plugcubed.net');
                if (value === '/nextsong') {
                    var nextSong = API.getNextMedia(),
                        found = -1;
                    if (nextSong === undefined) return API.chatLog(p3Lang.i18n('noNextSong'));
                    nextSong = nextSong.media;
                    for (var i in p3history) {
                        if (!p3history.hasOwnProperty(i)) continue;
                        var a = p3history[i];
                        if (a.id == nextSong.id) {
                            found = ~~i + 1;
                            if (!a.wasSkipped)
                                return API.chatLog(p3Lang.i18n('nextsong', nextSong.title, nextSong.author)), API.chatLog(p3Lang.i18n('isHistory', found, p3history.length), true);
                        }
                    }
                    return API.chatLog(p3Lang.i18n('nextsong', nextSong.title, nextSong.author));
                }
                if (value === '/automute') {
                    var a = API.getMedia();
                    if (a === undefined) return;
                    if (this.settings.registeredSongs.indexOf(a.id) < 0) {
                        this.settings.registeredSongs.push(a.id);
                        while (!PlaybackModel.get('mutedOnce'))
                            volume.onClick();
                        API.chatLog(p3Lang.i18n('automute.registered', a.title));
                    } else {
                        this.settings.registeredSongs.splice(this.settings.registeredSongs.indexOf(a.id), 1);
                        while (PlaybackModel.get('muted'))
                            volume.onClick();
                        API.chatLog(p3Lang.i18n('automute.unregistered', a.title));
                    }
                    return this.saveSettings();
                }
                if (value === '/getpos') {
                    var lookup = getUser(value.substr(8)),
                        user = lookup === null ? API.getUser() : lookup,
                        spot = API.getWaitListPosition(user.id);
                    if (API.getDJ().id === user.id)
                        API.chatLog(p3Lang.i18n('info.userDjing', user.id === API.getUser().id ? p3Lang.i18n('ranks.you') : Utils.cleanTypedString(user.username)));
                    else if (spot === 0)
                        API.chatLog(p3Lang.i18n('info.userNextDJ', user.id === API.getUser().id ? p3Lang.i18n('ranks.you') : Utils.cleanTypedString(user.username)));
                    else if (spot > 0)
                        API.chatLog(p3Lang.i18n('info.inWaitlist', spot + 1, API.getWaitList().length));
                    else
                        API.chatLog(p3Lang.i18n('info.notInList'));
                    return;
                }
                if (value === '/curate' || value === '/grab') {
                    var a = JSON.parse(localStorage.getItem('playlist')),
                        b;
                    for (var b in a) {
                        if (!a.hasOwnProperty(b)) continue;
                        if (a[b].selected)
                            return Context.dispatch(new MCE(MCE.CURATE, a[b].id)), true;
                    }
                    return;
                }
                if (value.indexOf('/alertson ') === 0 && value.trim() !== '/alertson') {
                    this.settings.alertson = value.substr(10).split(' ');
                    this.saveSettings();
                    API.chatLog('Playing sound on the following words: ' + this.settings.alertson.join(', '));
                    return;
                }
                if (value.trim() === '/alertson' || value.indexOf('/alertsoff') === 0) {
                    this.settings.alertson = [];
                    this.saveSettings();
                    API.chatLog('No longer playing sound on specific words');
                    return;
                }
            }
        });
    });
    define('f82fae/d67453/a1ab3a', ['jquery', 'd7854/eba2c/c9281', 'lang/Lang', 'd7854/eba2c/ecd43', 'f82fae/f1da31'], function($, b, c, d, p3Lang) {
        function GUIInput(id, text, defaultColor) {
            return $('<div class="item">').addClass('p3-s-cc-' + id).append(
                $('<span>').text(text)
            ).append(
                $('<span>').addClass('default').css('display', plugCubed.settings.colors[id] === defaultColor ? 'none' : 'block')
                .mouseover(function() {
                    d.trigger('tooltip:show', p3Lang.i18n('tooltip.reset'), $(this), false);
                })
                .mouseout(function() {
                    d.trigger('tooltip:hide');
                })
                .click(function() {
                    $(this).parent().find('input').val(defaultColor);
                    $(this).parent().find('.example').css('background-color', defaultColor.toRGB());
                    $(this).css('display', 'none');
                    plugCubed.settings.colors[id] = defaultColor;
                    plugCubed.saveSettings();
                    plugCubed.updateCustomColors();
                })
            ).append(
                $('<span>').addClass('example').css('background-color', plugCubed.settings.colors[id].toRGB())
            ).append(
                $('<input>').val(plugCubed.settings.colors[id]).keyup(function() {
                    if ($(this).val().isRGB()) {
                        $(this).parent().find('.example').css('background-color', $(this).val().toRGB());
                        plugCubed.settings.colors[id] = $(this).val();
                        plugCubed.saveSettings();
                        plugCubed.updateCustomColors();
                    }
                    $(this).parent().find('.default').css('display', $(this).val() === defaultColor ? 'none' : 'block');
                })
            );
        }
        var div, a = b.extend({
            render: function() {
                if (div !== undefined) {
                    if (div.css('left') === '-271px')
                        return div.animate({
                            left: $('#p3-settings').width() + 1
                        });
                    return div.animate({
                        left: -271
                    });
                }
                var container = $('<div class="container">').append(
                    $('<div class="section">').text('User Ranks')
                );
                for (var i in plugCubed.colorInfo.ranks) {
                    if (!plugCubed.colorInfo.ranks.hasOwnProperty(i)) continue;
                    container.append(GUIInput(i, p3Lang.i18n(plugCubed.colorInfo.ranks[i].title), plugCubed.colorInfo.ranks[i].color));
                }
                container.append(
                    $('<div class="spacer">').append($('<div class="divider">'))
                ).append(
                    $('<div class="section">').text(p3Lang.i18n('notify.header'))
                );
                for (var i in plugCubed.colorInfo.notifications) {
                    if (!plugCubed.colorInfo.notifications.hasOwnProperty(i)) continue;
                    container.append(GUIInput(i, p3Lang.i18n(plugCubed.colorInfo.notifications[i].title), plugCubed.colorInfo.notifications[i].color));
                }
                div = $('<div id="p3-settings-custom-colors" style="left: -271px;">').append(
                    $('<div class="header">').append(
                        $('<div class="back">').append(
                            $('<i class="icon icon-arrow-left""></i>')
                        ).click(function() {
                            if (div !== undefined) div.animate({
                                left: -271
                            });
                        })
                    ).append(
                        $('<div class="title">').append(
                            $('<span>').text(p3Lang.i18n('menu.customchatcolors'))
                        )
                    )
                ).append(container).animate({
                    left: $('#p3-settings').width() + 1
                });
                $('body').append(div);
            },
            hide: function() {
                if (div !== undefined) div.animate({
                    left: -271
                });
            }
        });
        return new a();
    });
    define('f82fae/d67453/f0dff5', ['jquery', 'd7854/f5687/b8a45/c4852', 'lang/Lang', 'd7854/eba2c/c9281', 'd7854/eba2c/ecd43', 'd7854/e75cd/b9a26', 'f82fae/f1da31'], function($, b, c, d, e, f, p3Lang) {
        var a = d.extend({
            init: function(id) {
                e.dispatch(new f(f.SHOW, new b.extend({
                    id: 'dialog-userinfo',
                    className: 'dialog',
                    render: function() {
                        return this.$el.append(
                            this.getHeader(p3Lang.i18n('info.header'))
                        ).append(
                            this.getBody().append(id)
                        ), this._super();
                    },
                    submit: function() {
                        this.close();
                    }
                })));
            }
        });
        return a;
    });
    define('f82fae/d67453/c8e8fc', ['jquery', 'd7854/eba2c/c9281', 'lang/Lang', 'f82fae/f1da31', 'f82fae/ac606c'], function($, b, c, p3Lang, p3Utils) {
        var userCommands = [
                ['/nick', 'commands.descriptions.nick'],
                ['/avail', 'commands.descriptions.avail'],
                ['/afk', 'commands.descriptions.afk'],
                ['/work', 'commands.descriptions.work'],
                ['/gaming', 'commands.descriptions.gaming'],
                ['/join', 'commands.descriptions.join'],
                ['/leave', 'commands.descriptions.leave'],
                ['/whoami', 'commands.descriptions.whoami'],
                ['/mute', 'commands.descriptions.mute'],
                ['/automute', 'commands.descriptions.automute'],
                ['/unmute', 'commands.descriptions.unmute'],
                ['/nextsong', 'commands.descriptions.nextsong'],
                ['/refresh', 'commands.descriptions.refresh'],
                ['/alertson (commands.variables.word)', 'commands.descriptions.alertson'],
                ['/alertsoff', 'commands.descriptions.alertsoff'],
                ['/curate', 'commands.descriptions.curate'],
                ['/grab', 'commands.descriptions.curate'],
                ['/getpos', 'commands.descriptions.getpos'],
                ['/version', 'commands.descriptions.version'],
                ['/commands', 'commands.descriptions.commands'],
                ['/link', 'commands.descriptions.link']
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
                ['/strobe (commands.variables.onoff)', 'commands.descriptions.strobe', API.ROLE.COHOST],
                ['/rave (commands.variables.onoff)', 'commands.descriptions.rave', API.ROLE.COHOST],
                ['/whois all', 'commands.descriptions.whois', API.ROLE.AMBASSADOR],
                ['/banall', 'commands.descriptions.banall', API.ROLE.AMBASSADOR]
            ],
            a = b.extend({
                print: function() {
                    var content = '<strong style="font-size:1.4em;">' + p3Lang.i18n('commands.header') + '</strong><br />';
                    content += '<strong style="position:relative;left:-20px;">=== ' + p3Lang.i18n('commands.userCommands') + ' ===</strong><br />';
                    for (var i in userCommands) {
                        if (!userCommands.hasOwnProperty(i)) continue;
                        var command = userCommands[i][0];
                        if (command.split('(').length > 1)
                            command = command.split('(')[0] + '(' + p3Lang.i18n(command.split('(')[1].split(')')[0]) + ')';
                        content += '<div style="position:relative;left:-10px;">' + command + '<br /><em style="position:relative;left: 25px;">' + p3Lang.i18n(userCommands[i][1]) + '</em></div>';
                    }
                    if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                        content += '<br /><strong style="position:relative;left:-20px;">=== ' + p3Lang.i18n('commands.modCommands') + ' ===</strong><br />';
                        for (var i in modCommands) {
                            if (!modCommands.hasOwnProperty(i)) continue;
                            if (API.hasPermission(undefined, modCommands[i][2])) {
                                var command = modCommands[i][0];
                                if (command.split('(').length > 1)
                                    command = command.split('(')[0] + '(' + p3Lang.i18n(command.split('(')[1].split(')')[0]) + ')';
                                content += '<div style="position:relative;left:-10px;">' + command + '<br /><em style="position:relative;left: 25px;">' + p3Lang.i18n(modCommands[i][1]) + '</em></div>';
                            }
                        }
                    }
                    p3Utils.chatLog(undefined, content);
                }
            });
        return new a();
    });
    define('f82fae/a07c86', ['jquery', 'd7854/eba2c/c9281'], function($, Class) {
        var obj,
            styles = {},
            update = function() {
                var a = '';
                for (var i in styles) {
                    if (!styles.hasOwnProperty(i)) continue;
                    a += styles[i];
                }
                obj.text(a);
            },
            a = Class.extend({
                init: function() {
                    obj = $('<style type="text/css">');
                    $('head').append(obj);
                },
                set: function(key, style) {
                    styles[key] = style;
                    update();
                },
                has: function(key) {
                    return styles[key] !== undefined;
                },
                unset: function(key) {
                    if (typeof key === 'string')
                        key = [key];
                    var doUpdate = false;
                    for (var i in key) {
                        if (!key.hasOwnProperty(i)) continue;
                        if (this.has(key[i])) {
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
    define('f82fae/ac606c', ['d7854/eba2c/c9281', 'd7854/f5687/de727/f87d1/da7b6', 'f82fae/f1da31'], function(Class, PopoutView, p3Lang) {
        var cleanMessage = function(input) {
                var allowed = ['span', 'div', 'table', 'tr', 'td', 'br', 'br/', 'strong', 'em', 'a'],
                    tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
                return input.replace(tags, function(a, b) {
                    return allowed.indexOf(b.toLowerCase()) > -1 ? a : '';
                });
            },
            developer = [],
            sponsor = [],
            ambassador = [],
            donatorDiamond = [],
            donatorPlatinum = [],
            donatorGold = [],
            donatorSilver = [],
            donatorBronze = [],
            special = {};
        $.getJSON('https://d1rfegul30378.cloudfront.net/titles.json', function(data) {
            developer = data.developer ? data.developer : [];
            sponsor = data.sponsor ? data.sponsor : [];
            ambassador = data.ambassador ? data.ambassador : [];
            if (data.donator) {
                donatorDiamond = data.donator.diamond ? data.donator.diamond : [];
                donatorPlatinum = data.donator.platinum ? data.donator.platinum : [];
                donatorGold = data.donator.gold ? data.donator.gold : [];
                donatorSilver = data.donator.silver ? data.donator.silver : [];
                donatorBronze = data.donator.bronze ? data.donator.bronze : [];
            }
            special = data.special ? data.special : {};
        });
        var handler = Class.extend({
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
            havePlugCubedRank: function(userID, ignoreSpecial) {
                return this.isPlugCubedDeveloper(userID) ||
                    this.isPlugCubedSponsor(userID) ||
                    (!ignoreSpecial && this.isPlugCubedSpecial(userID)) ||
                    this.isPlugCubedAmbassador(userID) ||
                    this.isPlugCubedDonatorDiamond(userID) ||
                    this.isPlugCubedDonatorPlatinum(userID) ||
                    this.isPlugCubedDonatorGold(userID) ||
                    this.isPlugCubedDonatorSilver(userID) ||
                    this.isPlugCubedDonatorBronze(userID);
            },
            getAllPlugCubedRanks: function(userID, ignoreSpecial) {
                var ranks = [];

                if (this.isPlugCubedDeveloper(userID)) ranks.push(p3Lang.i18n('info.specialTitles.developer'));
                if (this.isPlugCubedSponsor(userID)) ranks.push(p3Lang.i18n('info.specialTitles.sponsor'));
                if (!ignoreSpecial && this.isPlugCubedSpecial(userID)) ranks.push(p3Lang.i18n('info.specialTitles.special', this.getPlugCubedSpecial(userID).title));
                if (this.isPlugCubedAmbassador(userID)) ranks.push(p3Lang.i18n('info.specialTitles.ambassador'));
                if (this.isPlugCubedDonatorDiamond(userID)) ranks.push(p3Lang.i18n('info.specialTitles.donatorDiamond'));
                if (this.isPlugCubedDonatorPlatinum(userID)) ranks.push(p3Lang.i18n('info.specialTitles.donatorPlatinum'));
                if (this.isPlugCubedDonatorGold(userID)) ranks.push(p3Lang.i18n('info.specialTitles.donatorGold'));
                if (this.isPlugCubedDonatorSilver(userID)) ranks.push(p3Lang.i18n('info.specialTitles.donatorSilver'));
                if (this.isPlugCubedDonatorBronze(userID)) ranks.push(p3Lang.i18n('info.specialTitles.donatorBronze'));

                return ranks.join(' / ');
            },
            isPlugCubedDeveloper: function(userID) {
                if (!userID) userID = API.getUser().id;
                return developer.indexOf(userID.toString()) > -1;
            },
            isPlugCubedSponsor: function(userID) {
                if (!userID) userID = API.getUser().id;
                return sponsor.indexOf(userID.toString()) > -1;
            },
            isPlugCubedSpecial: function(userID) {
                if (!userID) userID = API.getUser().id;
                return special[userID.toString()] !== undefined;
            },
            isPlugCubedAmbassador: function(userID) {
                if (!userID) userID = API.getUser().id;
                return ambassador.indexOf(userID.toString()) > -1;
            },
            isPlugCubedDonatorDiamond: function(userID) {
                if (!userID) userID = API.getUser().id;
                return donatorDiamond.indexOf(userID.toString()) > -1;
            },
            isPlugCubedDonatorPlatinum: function(userID) {
                if (!userID) userID = API.getUser().id;
                return donatorPlatinum.indexOf(userID.toString()) > -1;
            },
            isPlugCubedDonatorGold: function(userID) {
                if (!userID) userID = API.getUser().id;
                return donatorGold.indexOf(userID.toString()) > -1;
            },
            isPlugCubedDonatorSilver: function(userID) {
                if (!userID) userID = API.getUser().id;
                return donatorSilver.indexOf(userID.toString()) > -1;
            },
            isPlugCubedDonatorBronze: function(userID) {
                if (!userID) userID = API.getUser().id;
                return donatorBronze.indexOf(userID.toString()) > -1;
            },
            getPlugCubedSpecial: function(userID) {
                if (!userID) userID = API.getUser().id;
                return special[userID.toString()];
            },
            chatLog: function(type, message, color) {
                if (!message) return;
                if (typeof message !== 'string') message = message.html();
                message = cleanMessage(message);
                var $chat = PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'),
                    b = $chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - 20,
                    $message = $('<div>').addClass(type ? type : 'update'),
                    $text = $('<span>').addClass('text').html(message);
                if (type === 'system') $message.append('<i class="icon icon-chat-system"></i>');
                else $text.css('color', (color ? color : 'd1d1d1').toRGB());
                $chat.append($message.append($text));
                b && $chat.scrollTop($chat[0].scrollHeight);
            }
        });
        return new handler();
    });
    define('f82fae/f36e0e', ['jquery', 'd7854/f5687/de727/e1632/a6cee', 'f82fae/f1da31', 'f82fae/ac606c', 'd7854/eba2c/ecd43'], function($, RoomUserListRow, p3Lang, p3Utils, Context) {
        return RoomUserListRow.extend({
            vote: function() {
                if (this.model.get('grab') || this.model.get('vote') !== 0) {
                    if (!this.$icon)
                        this.$icon = $('<i/>').addClass('icon');
                    this.$el.append(this.$icon);
                    if (this.model.get('grab'))
                        this.$icon.removeClass().addClass('icon icon-grab');
                    else if (this.model.get('vote') == 1)
                        this.$icon.removeClass().addClass('icon icon-woot');
                    else
                        this.$icon.removeClass().addClass('icon icon-meh');
                } else if (this.$icon) {
                    this.$icon.remove();
                    this.$icon = undefined;
                }

                var id = this.model.get('id');
                if (p3Utils.havePlugCubedRank(id)) {
                    var $icon = this.$el.find('.icon:not(.icon-woot,.icon-meh,.icon-grab)'),
                        specialIconInfo = p3Utils.getPlugCubedSpecial(id);
                    if ($icon.length < 1) {
                        $icon = $('<i>').addClass('icon');
                        this.$el.append($icon);
                    }

                    $icon.addClass('icon-is-p3' + p3Utils.getHighestRank(id)).mouseover(function() {
                        Context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(id)).text(), $(this), true);
                    }).mouseout(function() {
                        Context.trigger('tooltip:hide');
                    });

                    if (specialIconInfo !== undefined)
                        $icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/files/images/icons.p3special.' + specialIconInfo.icon + '.png")');
                }
            }
        });
    });
    define('f82fae/f1da31', ['jquery', 'd7854/eba2c/c9281'], function($, Class) {
        var language = {},
            isLoaded = false,
            Lang = Class.extend({
                init: function() {
                    var _this = this;
                    $.getJSON('https://d1rfegul30378.cloudfront.net/files/langs/lang.en.json', function(a) {
                        language = a;
                        isLoaded = true;
                    }).error(function() {
                        setTimeout(function() {
                            _this.init();
                        }, 500);
                    });
                },
                load: function(lang, callback) {
                    if (!isLoaded) {
                        var _this = this;
                        return setTimeout(function() {
                            _this.load(lang, callback);
                        }, 500);
                    }
                    if (!lang || lang === 'en') {
                        if (callback) callback();
                        return;
                    }
                    $.getJSON('https://d1rfegul30378.cloudfront.net/files/langs/lang.' + lang + '.json', function(a) {
                        language = $.extend(true, language, a);
                        if (callback) callback();
                    }).error(function() {
                        if (callback) callback();
                    });
                },
                i18n: function(selector) {
                    var a = language,
                        i;
                    if (a === undefined) return '{' + $.makeArray(arguments).join(', ') + '}';
                    var key = selector.split('.');
                    for (i in key) {
                        if (!key.hasOwnProperty(i)) continue;
                        if (a[key[i]] === undefined) return '{' + $.makeArray(arguments).join(', ') + '}';
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
        $.getJSON('https://d1rfegul30378.cloudfront.net/files/lang.json', function(data) {
            Lang.allLangs = data;
        }).done(function() {
            if (Lang.allLangs.length === 0) API.chatLog('Error loading language informations for plugCubed', true);
        });
        return new Lang;
    });
    define('f82fae/a8c196', ['jquery', 'd7854/eba2c/c9281'], function($, Class) {
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
                this.value = Math.max(this.min, Math.min(this.max, ~~ ((this.max - this.min) * ((event.pageX - this._min) / this._max)) + this.min));
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
    define('f82fae/e78de6', ['jquery', 'd7854/eba2c/c9281', 'f82fae/b93191', 'd7854/f5687/b8a45/c4852', 'f82fae/f1da31', 'f82fae/ac606c'], function($, Class, Model, ADV, p3Lang, p3Utils) {
        var test = localStorage.getItem('plugCubedLang');
        if (test !== null && test !== '@@@')
            return Class.extend({
                init: function() {
                    plugCubed = new Model();
                }
            });
        return ADV.extend({
            id: 'plugCubedLang-panel',
            className: 'dialog',
            render: function() {
                var self = this;
                console.log(self);
                this.languages = [];
                $.getJSON('https://d1rfegul30378.cloudfront.net/files/lang.json', function(data) {
                    self.languages = data;
                    this.$el.append(this.getHeader('plug&#179; language'))
                        .append(this.getBody().append(this.getMessage(this.draw())));
                    _.defer(_.bind(this.adjustTop, this));
                    $('.lang-button').click($.proxy(this.onLangClick, this));
                    return this._super();
                }).done(function() {
                    if (self.languages.length === 0) p3Utils.chatLog(undefined, '<span style="color:#FF0000">Error loading plugCubed</span>');
                });
                /*
                $('#overlay-container').append($('#avatar-overlay').clone(false,false).attr('id','plugCubedLang-overlay').width(800).height(600).css('position','absolute'));
                $('#plugCubedLang-overlay').find('.overlay-title').html('plug&#179; language');
                $('#plugCubedLang-overlay').find('#avatar-sets').remove();
                $('#plugCubedLang-overlay').find('#avatar-panel').attr('id','plugCubedLang-panel').css('padding-top','60px');
                $('#plugCubedLang-overlay').find('.overlay-close-button').click($.proxy(this.hide,this));
                this.initLanguages();
                */
            },
            draw: function() {
                var i, len = this.languages.length,
                    container = $('<div/>');
                if (len > 5) {
                    for (var j = 0; j < len / 5; j++)
                        container.append(this.drawRow(this.languages.slice(j * 5, j * 5 + 5)).css('top', j * 75));
                } else container.append(this.drawRow(this.languages).css('top', j * 75));
                return container;
            },
            drawRow: function(languages) {
                var row = $('<div/>').addClass('lang-row'),
                    len = languages.length,
                    x = len == 5 ? 0 : len == 4 ? 75 : len == 3 ? 150 : len == 2 ? 225 : 300;
                for (var i = 0; i < len; ++i) {
                    var button = $('<div/>').addClass('lang-button').css('display', 'inline-block').css('left', x).data('language', languages[i].file).css('cursor', 'pointer').append($('<img/>').attr('src', 'https://d1rfegul30378.cloudfront.net/files/flags/flag.' + languages[i].file + '.png').attr('alt', languages[i].name).height(75).width(150));
                    row.append(button);
                    x += 150;
                }
                return row;
            },
            onLangClick: function(a) {
                a = $(a.currentTarget);
                localStorage.setItem('plugCubedLang', a.data('language'), true);
                plugCubed = new Model();
                this.close();
            }
        });
    });

    /**
        Modified version of plug.dj's VolumeView
        VolumeView copyright (C) 2013 by Plug DJ, Inc.
    */
    define('f82fae/abd868', ['jquery', 'underscore', 'd7854/f5687/de727/e9dc9/ebcbd', 'd7854/cfea4/ce6d9', 'hbs!templates/room/playback/Volume', 'd7854/eba2c/ecd43', 'f82fae/f1da31'], function($, e, original, r, s, Context, p3Lang) {
        var o = original.extend({
            render: function() {
                this._super();
                this.$('.button').mouseover(function() {
                    if (typeof plugCubed !== 'undefined') {
                        if (r.get('mutedOnce'))
                            Context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), $(this), true);
                        else if (r.get('muted'))
                            Context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), $(this), true);
                    }
                }).mouseout(function() {
                    if (typeof plugCubed !== 'undefined')
                        Context.trigger('tooltip:hide');
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
                    Context.trigger('tooltip:hide');
                    if (r.get('muted'))
                        Context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), this.$('.button'), true);
                    else if (!r.get('mutedOnce'))
                        Context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), this.$('.button'), true);
                    else
                        Context.trigger('tooltip:hide');
                }

                if (r.get('mutedOnce'))
                    r.set('volume', r.get('lastVolume'));
                else if (r.get('muted')) {
                    r.onVolumeChange();
                    this.onChange();
                } else if (r.get('volume') > 0) {
                    r.set({
                        lastVolume: r.get('volume'),
                        volume: 0
                    });
                }
            },
            onChange: function() {
                var e = r.get('volume');
                this.$span.text(e + '%');
                this.$circle.css('left', parseInt(this.$hit.css('left')) + this.max * (e / 100) - this.$circle.width() / 2);
                if (e > 60 && !this.$icon.hasClass('icon-volume-on'))
                    this.$icon.removeClass().addClass('icon icon-volume-on');
                else if (e > 0 && !this.$icon.hasClass('icon-volume-half'))
                    this.$icon.removeClass().addClass('icon icon-volume-half');
                else if (e === 0) {
                    if (r.get('mutedOnce')) {
                        if (!this.$icon.hasClass('icon-volume-off-once'))
                            this.$icon.removeClass().addClass('icon icon-volume-off-once');
                    } else if (!this.$icon.hasClass('icon-volume-off'))
                        this.$icon.removeClass().addClass('icon icon-volume-off');
                }
            }
        });
        return o;
    });

    require(['f82fae/b93191', 'f82fae/ac606c'], function(a, b) {
        plugCubed = new a();
    });
})();