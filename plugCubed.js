/**
 * @license Copyright (C) 2012-2013 Thomas "TAT" Andresen and other contributors
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
Math.randomRange = function(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
};
if (plugCubed !== undefined) plugCubed.close();

(function() {
    if (!requirejs.defined('c4161/e80a1/cf1e8'))
        return API.chatLog('This version of plug&#179; is not compatible with this version of plug.dj', true), false;

    define('plugCubed/Model', ['jquery', 'underscore', 'c4161/e80a1/cf1e8', 'c4161/e80a1/a11b0', 'c4161/f8916/c0277', 'c4161/b933e/fa706', 'c4161/fd1b2/e2fef', 'c4161/dee2b/cbe1d', 'c4161/a8590/d5736', 'c4161/adfed/af575', 'c4161/adfed/e6125', 'c4161/dee2b/af141', 'lang/Lang', 'c4161/da043/d49a9/a9e53', 'c4161/a8590/b18da', 'c4161/a8590/b7275', 'plugCubed/StyleManager', 'c4161/da043/d49a9/f13d3/d6a18', 'c4161/da043/d49a9/f13d3/f5752', 'plugCubed/RoomUserListRow', 'plugCubed/Lang', 'plugCubed/Utils', 'c4161/b933e/d7906', 'c4161/dee2b/ac169', 'plugCubed/dialogs/CustomChatColors', 'plugCubed/dialogs/Commands', 'plugCubed/Slider'], function($, _, Class, Context, Chat, LocalStorage, Utils, Room, MCE, Socket, SIO, TUM, Lang, Audience, RJE, RSE, Styles, RoomUserListView, RoomUserListRow, _RoomUserListRow, p3Lang, p3Utils, DB, PlaybackModel, dialogColors, dialogCommands, Slider) {
        SIO.sio.$events.chat = Socket.listener.chat = function(a) {
            if (typeof plugCubed !== 'undefined') {
                if (a.fromID) setUserData(a.fromID, 'lastChat', Date.now());
                if (plugCubed.settings.ignore.indexOf(a.fromID) > -1) {
                    plugCubed.chatDisable(a);
                    return;
                }
            }
            /*if (!a.chatID || $(".cid-" + a.chatID).length > 0) {
                if (a.fromID) {
                    if (a.fromID === API.getUser().id) {
                        if (socket.readyState === SockJS.OPEN)
                            socket.send(JSON.stringify({type:"chat",msg:a.message,chatID:a.chatID}));
                    
                        if ($(".cid-" + a.chatID).data('eventSent') !== true) {
                            API.dispatch(API.CHAT,a);
                            $(".cid-" + a.chatID).data('eventSent',true);
                        }
                    }
                }
                return;
            }*/
            Chat.receive(a);
            API.dispatch(API.CHAT, a);
        };

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
                if (settings.colors !== undefined) {
                    if (settings.colors.background)
                        Styles.set('rss-background-color', 'body { background-color: ' + (settings.colors.background.substr(0, 1) !== '#' ? '#' : '') + settings.colors.background + '!important; }');
                    else
                        Styles.unset('rss-background-color');
                    if (settings.colors.chat !== undefined) {
                        var b = {};
                        for (var i in settings.colors.chat) {
                            if (['admin', 'ambassador', 'bouncer', 'cohost', 'residentdj', 'leader', 'host', 'manager', 'volunteer'].indexOf(i) > -1 && settings.colors.chat[i].isRGB())
                                b[i] = settings.colors.chat[i].substr(0, 1) === '#' ? settings.colors.chat[i].substr(1) : settings.colors.chat[i];
                        }
                        roomChatColors = b;
                    }
                } else Styles.unset('rss-background-color');
                if (settings.images !== undefined) {
                    Audience.defaultRoomElements();
                    if (settings.images.audience !== undefined)
                        $('#room-wheel').css('display', settings.images.audience.wheel && settings.images.audience.wheel === "false" ? 'none' : '');
                    else $('#room-wheel').css('display', '');
                    Context.trigger('audience:redraw');
                    if (settings.images.background)
                        Styles.set('rss-background-image', 'body { background-image: url("' + settings.images.background + '")!important; }');
                    else
                        Styles.unset('rss-background-image');
                    if ($('#playback .background img').data('_o') === undefined)
                        $('#playback .background img').data('_o', $('#playback .background img').attr('src'));
                    $('#playback .background img').attr('src', settings.images.playback ? settings.images.playback : $('#playback .background img').data('_o'));
                    $('#p3-dj-booth').remove();
                    if (settings.images.booth !== undefined)
                        $('#dj-booth').append($('<div id="p3-dj-booth">').css('background-image', 'url("' + settings.images.booth.booth + '")'));
                    roomChatIcons = settings.images.icons;
                } else {
                    Audience.defaultRoomElements();
                    $('#room-wheel').css('display', '');
                    Styles.unset('rss-background-image');
                    Styles.unset('rss-booth');
                    Context.trigger('audience:redraw');
                }
                /*if (settings.text !== undefined) {
                    if (settings.text.plugCubed !== undefined) {

                    }
                    if (settings.text.plugDJ !== undefined) {

                    }
                }*/
                plugCubed.updateCustomColors();
            }
        }

        function loadRoomSettings() {
            var a = Room.get('description'),
                b = plugCubed.settings.useRoomSettings[window.location.pathname.split('/')[1]];

            if (a === null) return;
            b = b === undefined || b === true ? true : false;

            if (a.indexOf('@p3=') > -1) {
                a = a.substr(a.indexOf('@p3=') + 4);
                if (a.indexOf(' ') > -1)
                    a.substr(0, a.indexOf(' '));
                if (a.indexOf('\n') > -1)
                    a.substr(0, a.indexOf('\n'));
                if (b)
                    return $.getJSON(a, function(settings) {
                        p3Utils.chatLog(undefined, p3Lang.i18n('roomSpecificSettingsHeader') + '</span><br /><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('roomSpecificSettingsDesc'), plugCubed.colors.infoMessage2);
                        runRoomSettings(settings);
                    });
                haveRoomSettings = true;
                plugCubed.initGUI();
            }
        }

        function getUser(data) {
            data = data.trim();
            if (data.substr(0, 1) === '@')
                data = data.substr(1);

            var users = API.getUsers();
            for (var i in users) {
                if (users[i].username.equalsIgnoreCase(data) || users[i].id.equalsIgnoreCase(data))
                    return users[i];
            }
            return null;
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
                    points = user.djPoints + user.curatorPoints + user.listenerPoints,
                    voteTotal = getUserData(user.id, 'wootcount', 0) + getUserData(user.id, 'mehcount', 0),
                    waitlistpos = API.getWaitListPosition(user.id),
                    inbooth = API.getDJ().id === user.id,
                    lang = user.language,
                    allLangs = Chat.uiLanguages.concat(Chat.chatLanguages),
                    disconnectInfo = getUserData(user.id, 'disconnects', {
                        count: 0
                    });

                for (var i in allLangs) {
                    if (allLangs.value !== lang) continue;
                    lang = allLangs[i].label;
                }


                if (API.hasPermission(user.id, API.ROLE.ADMIN)) rank = p3Lang.i18n('ranks.admin');
                else if (API.hasPermission(user.id, API.ROLE.AMBASSADOR)) rank = p3Lang.i18n('ranks.ambassador');
                else if (API.hasPermission(user.id, API.ROLE.HOST)) rank = p3Lang.i18n('ranks.host');
                else if (API.hasPermission(user.id, API.ROLE.COHOST)) rank = p3Lang.i18n('ranks.cohost');
                else if (API.hasPermission(user.id, API.ROLE.MANAGER)) rank = p3Lang.i18n('ranks.manager');
                else if (API.hasPermission(user.id, API.ROLE.BOUNCER)) rank = p3Lang.i18n('ranks.bouncer');
                else if (API.hasPermission(user.id, API.ROLE.RESIDENTDJ)) rank = p3Lang.i18n('ranks.residentdj');
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

                var title = undefined;
                if (p3Utils.isPlugCubedDeveloper(user.id)) title = p3Lang.i18n('info.specialTitles.developer');
                if (p3Utils.isPlugCubedSponsor(user.id)) title = p3Lang.i18n('info.specialTitles.sponsor');
                if (p3Utils.isPlugCubedVIP(user.id)) title = p3Lang.i18n('info.specialTitles.vip');

                p3Utils.chatLog(undefined, '<table style="width:100%;color:#CC00CC"><tr><td colspan="2"><strong>' + p3Lang.i18n('info.name') + '</strong>: <span style="color:#FFFFFF">' + Utils.cleanTypedString(user.username) + '</span></td></tr>' +
                    (title ? '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.title') + '</strong>: <span style="color:#FFFFFF">' + title + '</span></td></tr>' : '') +
                    '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.id') + '</strong>: <span style="color:#FFFFFF">' + user.id + '</span></td></tr>' +
                    '<tr><td><strong> ' + p3Lang.i18n('info.rank') + '</strong>: <span style="color:#FFFFFF">' + rank + '</span></td><td><strong>' + p3Lang.i18n('info.joined') + '</strong>: <span style="color:#FFFFFF">' + plugCubed.getTimestamp(getUserData(user.id, 'joinTime', Date.now())) + '</span></td></tr>' +
                    '<tr><td><strong>' + p3Lang.i18n('info.status') + '</strong>: <span style="color:#FFFFFF">' + status + '</span></td><td><strong> ' + p3Lang.i18n('info.vote') + '</strong>: <span style="color:#FFFFFF">' + voted + '</span></td></tr>' +
                    '<tr><td colspan="2"><strong>' + p3Lang.i18n('info.position') + '</strong>: <span style="color:#FFFFFF">' + position + '</span></td></tr>' +
                    '<tr><td><strong>' + p3Lang.i18n('info.points') + '</strong>: <span style="color:#FFFFFF" title = "' + p3Lang.i18n('info.pointType.dj', user.djPoints) + '&#13; ' + p3Lang.i18n('info.pointType.listener', user.listenerPoints) + '&#13; ' + p3Lang.i18n('info.pointType.curator', user.curatorPoints) + '">' + points + '</span></td><td><strong> ' + p3Lang.i18n('info.fans') + '</strong>: <span style="color:#FFFFFF">' + user.fans + '</span></td></tr>' +
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
            for (var i in users)
                table.append($('<tr/>').append($('<td/>').append(users[i].username)).append($('<td/>').append(users[i].id)));
            p3Utils.chatLog(undefined, $('<div/>').append(table).html());
        }

        function playMentionSound() {
            document.getElementById("chat-sound").playMentionSound();
        }

        function woot() {
            var dj = API.getDJ();
            if (dj === null || dj.id === API.getUser().id) return;
            $('#woot').click();
        }

        function afkTimerTick() {
            if (plugCubed.settings.afkTimers && $('#waitlist-button').hasClass('selected')) {
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

        function onChatReceived(data) {
            if (!data.from || !data.from.id) return;

            if (data.type === 'mention') {
                data.type += ' is-';
                if (API.hasPermission(data.from.id, API.ROLE.ADMIN)) data.type += 'admin';
                else if (API.hasPermission(data.from.id, API.ROLE.VOLUNTEER)) data.type += 'ambassador';
                else if (API.hasPermission(data.from.id, API.ROLE.BOUNCER)) data.type += 'staff';
                else if (API.hasPermission(data.from.id, API.ROLE.DJ)) data.type += 'dj';
                else data.type += 'you';
                var nameRegex = new RegExp('@' + API.getUser().username, 'g');
                data.text = data.text.replace(nameRegex, '<span class="name">@' + API.getUser().username + '</span>');
            }

            data.type += ' from';
            if (API.hasPermission(data.from.id, API.ROLE.RESIDENTDJ) || data.from.id == API.getUser().id)
                data.type += '-';

            if (API.hasPermission(data.from.id, API.ROLE.ADMIN)) data.type += 'admin';
            else if (API.hasPermission(data.from.id, API.ROLE.AMBASSADOR)) data.type += 'ambassador';
            else if (API.hasPermission(data.from.id, API.ROLE.HOST)) data.type += 'host';
            else if (API.hasPermission(data.from.id, API.ROLE.COHOST)) data.type += 'cohost';
            else if (API.hasPermission(data.from.id, API.ROLE.MANAGER)) data.type += 'manager';
            else if (API.hasPermission(data.from.id, API.ROLE.BOUNCER)) data.type += 'bouncer';
            else if (API.hasPermission(data.from.id, API.ROLE.RESIDENTDJ)) data.type += 'residentdj';
            else if (data.from.id == API.getUser().id) data.type += 'you';
        }

        function __init() {
            afkTimerInterval = setInterval(afkTimerTick, 1E3);

            this.colors = {
                userCommands: '66FFFF',
                modCommands: 'FF0000',
                infoMessage1: 'FFFF00',
                infoMessage2: '66FFFF'
            };
            this.defaultAwayMsg = p3Lang.i18n('autorespond.default');

            setTimeout(function() {
                p3history = [];
                var data = API.getHistory();
                for (var i in data) {
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

            this.customColorsStyle = $('<style type="text/css" />');
            $('head').append(this.customColorsStyle);
            p3Utils.chatLog(undefined, p3Lang.i18n('running', version) + '</span><br /><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('commandsHelp'), this.colors.infoMessage1);

            window.addEventListener('pushState', this.proxy.onRoomJoin);
            $('body').prepend('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="http://alpha.plugcubed.net/plugCubed.css?=' + Date.now() + '" />');
            $('#plug-dj').after(menuButton);
            menuButton.click(this.proxy.onMenuClick);
            $('#room-bar').css('left', 108);
            this.loadSettings();
            this.initAPIListeners();
            var users = API.getUsers();
            for (var i in users) {
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
            this.changeGUIColor('stream', DB.settings.streamDisabled);

            Context.on('chat:receive', onChatReceived);
            Context._events['chat:receive'].unshift(Context._events['chat:receive'].pop());

            RoomUserListView.prototype.RowClass = _RoomUserListRow;

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
            version = {
                major: 3,
                minor: 0,
                patch: 0,
                prerelease: 'alpha',
                build: 111,
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
            menuButton = $('<div id="plug-cubed"><i class="icon icon-plug-cubed"></i></div>'),
            menuDiv,
            socket,
            customChatColorDiv;

        return Class.extend({
            /**
             * @this {plugCubedModel}
             */
            init: function() {
                if (typeof plugCubedUserData === 'undefined') plugCubedUserData = {};
                //if (LocalStorage.getItem('plugCubedLang') === null || LocalStorage.getItem('plugCubedLang') === '@@@') return;
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
                    onRoomJoin: $.proxy(this.onRoomJoin, this),
                    onMenuClick: $.proxy(this.onMenuClick, this)
                };
                // Load language and begin script after language loaded
                p3Lang.load(LocalStorage.getItem('plugCubedLang'), $.proxy(__init, this));
            },
            onRoomJoin: function() {
                if (typeof plugCubed !== 'undefined') {
                    setTimeout(function() {
                        if (API.enabled) $.getScript('http://alpha.plugcubed.net/plugCubed.' + (version.minified ? 'min.' : '') + 'js?=' + Date.now());
                        else plugCubed.onRoomJoin();
                    }, 500);
                }
            },
            /**
             * @this {plugCubedModel}
             */
            close: function() {
                if (this.loaded === undefined || this.loaded === false) return;
                clearInterval(afkTimerInterval);
                runRoomSettings({});
                window.removeEventListener('pushState', plugCubed.proxy.onRoomJoin);
                API.off(API.CHAT_COMMAND, this.proxy.onChatCommand);
                API.off(API.DJ_ADVANCE, this.proxy.onDjAdvance);
                API.off(API.VOTE_UPDATE, this.proxy.onVoteUpdate);
                API.off(API.CURATE_UPDATE, this.proxy.onGrab);
                API.off(API.USER_JOIN, this.proxy.onUserJoin);
                API.off(API.USER_LEAVE, this.proxy.onUserLeave);
                API.off(API.CHAT, this.proxy.onChat);
                API.off(API.VOTE_SKIP, this.proxy.onSkip);
                API.off(API.USER_SKIP, this.proxy.onSkip);
                API.off(API.MOD_SKIP, this.proxy.onSkip);
                Context.off('chat:receive', onChatReceived);
                $('#plugcubed-css,#font-awesome,#plugcubed-js-extra,#side-right,#side-left,#notify-dialog,.plugcubed-footer,#plug-cubed,#p3-settings,#p3-settings-custom-colors,.p3-s-stream,.p3-s-clear,#waitlist .user .afkTimer').remove();
                $('#room-bar').css('left', 54);
                if (this.customColorsStyle)
                    this.customColorsStyle.remove();
                if (socket) {
                    socket.onclose = function() {
                        console.log('[plug³ Socket Server]', 'Closed');
                    };
                    socket.close();
                }
                RoomUserListView.prototype.RowClass = RoomUserListRow;
                requirejs.undef('plugCubed/Model');
                requirejs.undef('plugCubed/dialogs/Notify');
                requirejs.undef('plugCubed/dialogs/CustomChatColors');
                requirejs.undef('plugCubed/dialogs/Commands');
                requirejs.undef('plugCubed/Lang');
                requirejs.undef('plugCubed/MenuView');
                requirejs.undef('plugCubed/Utils');
                requirejs.undef('plugCubed/Slider');
                requirejs.undef('plugCubed/Loader');
                requirejs.undef('plugCubed/RoomUserListRow');
                Styles.destroy();
                requirejs.undef('plugCubed/StyleManager');
                this.loaded = false;
                delete plugCubed;
            },
            /**
             * @this {plugCubedModel}
             */
            Socket: function() {
                if (socket !== undefined && socket.readyState === SockJS.OPEN) return;
                socket = new SockJS('http://socket.plugcubed.net/gateway');
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
                    if (type === 'update') {
                        this.onclose = function() {};
                        this.close();
                        p3Utils.chatLog(undefined, p3Lang.i18n('newVersion'), plugCubed.colors.infoMessage1);
                        return setTimeout(function() {
                            $.getScript('http://alpha.plugcubed.net/plugCubed.' + (version.minified ? 'min.' : '') + 'js');
                        }, 5000);
                    }
                    if (type === 'chat') {
                        if (!data.chatID || $(".chat-id-" + data.chatID).length > 0 || plugCubed.settings.ignore.indexOf(data.fromID) > -1)
                            return;
                        Chat.receive(data);
                        return API.trigger(API.CHAT, data);
                    }
                    if (type === 'rave') {
                        if (p3Utils.isPlugCubedDeveloper(data.id) || p3Utils.isPlugCubedSponsor(data.id) || API.hasPermission(data.id, API.ROLE.HOST)) {
                            switch (data.value) {
                                case 0:
                                    return clearTimeout(Audience.strobeTimeoutID), Audience.lightsOut(false);
                                case 1:
                                    return Audience.strobeOnSpeed = 50, Audience.strobeOffSpeed = 160, Audience.strobeSwap();
                                case 2:
                                    return Audience.lightsOut(true);
                            }
                            if (data.value >= 50 && data.value <= 100)
                                return Audience.strobeOnSpeed = data.value, Audience.strobeOffSpeed = data.value * (160 / 50), Audience.strobeSwap();
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
                autorespond: false,
                notify: 0,
                customColors: false,
                avatarAnimations: true,
                registeredSongs: [],
                ignore: [],
                alertson: [],
                autoMuted: false,
                afkTimers: false,
                notifySongLength: 10,
                useRoomSettings: {},
                colors: {
                    you: 'FFDD6F',
                    regular: 'B0B0B0',
                    residentdj: 'E90E82',
                    bouncer: 'E90E82',
                    manager: 'E90E82',
                    cohost: 'E90E82',
                    host: 'E90E82',
                    ambassador: '9A50FF',
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
                    var save = JSON.parse(LocalStorage.getItem('plugCubed'));
                    for (var i in this.settings) {
                        if (save[i] !== undefined) this.settings[i] = save[i];
                    }
                    this.settings.recent = false;
                    if (this.settings.autowoot) woot();
                    this.updateCustomColors();
                    if (this.settings.afkTimers) Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                    if (this.settings.notify > 127) this.settings.notify = 0;
                    if (this.settings.registeredSongs.length > 0 && this.settings.registeredSongs.indexOf(API.getMedia().id) > -1) {
                        setTimeout(function() {
                            API.setVolume(0);
                        }, 800);
                        this.lastVolume = API.getVolume();
                        this.settings.autoMuted = true;
                        API.chatLog(p3Lang.i18n('automuted', API.getMedia().title));
                    } else this.settings.autoMuted = false;
                } catch (e) {}
            },
            /**
             * @this {plugCubedModel}
             */
            saveSettings: function() {
                LocalStorage.setItem('plugCubed', JSON.stringify(this.settings));
            },
            /**
             * @this {plugCubedModel}
             */
            updateCustomColors: function() {
                var a = [],
                    b = this.settings.useRoomSettings[window.location.pathname.split('/')[1]];
                b = b === undefined || b === true ? true : false;
                if ((b && roomChatColors.regular) || this.settings.colors.regular !== this.colorInfo.ranks.regular.color)
                    a.push('.message.from > .from,', '.emote.from > .from,', '.mention.from > .from { color:#' + (this.settings.colors.regular !== this.colorInfo.ranks.regular.color ? this.settings.colors.regular : roomChatColors.regular) + '!important; }');
                if ((b && roomChatColors.residentdj) || this.settings.colors.residentdj !== this.colorInfo.ranks.residentdj.color)
                    a.push('.message.from-residentdj > .from,', '.emote.from-residentdj > .from,', '.mention.from-residentdj > .from { color:#' + (this.settings.colors.residentdj !== this.colorInfo.ranks.residentdj.color ? this.settings.colors.residentdj : roomChatColors.residentdj) + '!important; }');
                if ((b && roomChatColors.bouncer) || this.settings.colors.bouncer !== this.colorInfo.ranks.bouncer.color)
                    a.push('.message.from-bouncer > .from,', '.emote.from-bouncer > .from,', '.mention.from-bouncer > .from { color:#' + (this.settings.colors.bouncer !== this.colorInfo.ranks.bouncer.color ? this.settings.colors.bouncer : roomChatColors.bouncer) + '!important; }');
                if ((b && roomChatColors.manager) || this.settings.colors.manager !== this.colorInfo.ranks.manager.color)
                    a.push('.message.from-manager > .from,', '.emote.from-manager > .from,', '.mention.from-manager > .from { color:#' + (this.settings.colors.manager !== this.colorInfo.ranks.manager.color ? this.settings.colors.manager : roomChatColors.manager) + '!important; }');
                if ((b && roomChatColors.cohost) || this.settings.colors.cohost !== this.colorInfo.ranks.cohost.color)
                    a.push('.message.from-cohost > .from,', '.emote.from-cohost > .from,', '.mention.from-cohost > .from { color:#' + (this.settings.colors.cohost !== this.colorInfo.ranks.cohost.color ? this.settings.colors.cohost : roomChatColors.cohost) + '!important; }');
                if ((b && roomChatColors.host) || this.settings.colors.host !== this.colorInfo.ranks.host.color)
                    a.push('.message.from-host > .from,', '.emote.from-host > .from,', '.mention.from-host > .from { color:#' + (this.settings.colors.host !== this.colorInfo.ranks.host.color ? this.settings.colors.host : roomChatColors.host) + '!important; }');
                if ((b && roomChatColors.ambassador) || this.settings.colors.ambassador !== this.colorInfo.ranks.ambassador.color)
                    a.push('.message.from-ambassador > .from,', '.emote.from-ambassador > .from,', '.mention.from-ambassador > .from { color:#' + (this.settings.colors.ambassador !== this.colorInfo.ranks.ambassador.color ? this.settings.colors.ambassador : roomChatColors.ambassador) + '!important; }');
                if ((b && roomChatColors.admin) || this.settings.colors.admin !== this.colorInfo.ranks.admin.color)
                    a.push('.message.from-admin > .from,', '.emote.from-admin > .from,', '.mention.from-admin > .from { color:#' + (this.settings.colors.admin !== this.colorInfo.ranks.admin.color ? this.settings.colors.admin : roomChatColors.admin) + '!important; }');
                if ((b && roomChatColors.you) || this.settings.colors.you !== this.colorInfo.ranks.you.color)
                    a.push('.message.from-you > .from,', '.emote.from-you > .from,', '.mention.from-you > .from { color:#' + (this.settings.colors.you !== this.colorInfo.ranks.you.color ? this.settings.colors.you : roomChatColors.you) + '!important; }');
                if (b) {
                    if (roomChatIcons.admin)
                        a.push('.message.from-admin > .icon,', '.emote.from-admin > .icon,', '.mention.from-admin > .icon { background-image: url("' + roomChatIcons.admin + '"); background-position: 0 0; }');
                    if (roomChatIcons.ambassador)
                        a.push('.message.from-ambassador > .icon,', '.emote.from-ambassador > .icon,', '.mention.from-ambassador > .icon { background-image: url("' + roomChatIcons.ambassador + '"); background-position: 0 0; }');
                    if (roomChatIcons.bouncer)
                        a.push('.message.from-bouncer > .icon,', '.emote.from-bouncer > .icon,', '.mention.from-bouncer > .icon { background-image: url("' + roomChatIcons.bouncer + '"); background-position: 0 0; }');
                    if (roomChatIcons.cohost)
                        a.push('.message.from-cohost > .icon,', '.emote.from-cohost > .icon,', '.mention.from-cohost > .icon { background-image: url("' + roomChatIcons.cohost + '"); background-position: 0 0; }');
                    if (roomChatIcons.residentdj)
                        a.push('.message.from-residentdj > .icon,', '.emote.from-residentdj > .icon,', '.mention.from-residentdj > .icon { background-image: url("' + roomChatIcons.residentdj + '"); background-position: 0 0; }');
                    if (roomChatIcons.host)
                        a.push('.message.from-host > .icon,', '.emote.from-host > .icon,', '.mention.from-host > .icon { background-image: url("' + roomChatIcons.host + '"); background-position: 0 0; }');
                    if (roomChatIcons.manager)
                        a.push('.message.from-manager > .icon,', '.emote.from-manager > .icon,', '.mention.from-manager > .icon { background-image: url("' + roomChatIcons.manager + '"); background-position: 0 0; }');
                }
                this.customColorsStyle.text(a.join("\n"));
            },
            /**
             * @this {plugCubedModel}
             */
            initAPIListeners: function() {
                API.on(API.CHAT_COMMAND, this.proxy.onChatCommand);
                API.on(API.DJ_ADVANCE, this.proxy.onDjAdvance);
                API.on(API.VOTE_UPDATE, this.proxy.onVoteUpdate);
                API.on(API.CURATE_UPDATE, this.proxy.onGrab);
                API.on(API.USER_JOIN, this.proxy.onUserJoin);
                API.on(API.USER_LEAVE, this.proxy.onUserLeave);
                API.on(API.CHAT, this.proxy.onChat);
                API.on(API.VOTE_SKIP, this.proxy.onSkip);
                API.on(API.USER_SKIP, this.proxy.onSkip);
                API.on(API.MOD_SKIP, this.proxy.onSkip);
            },
            changeGUIColor: function(id, value) {
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
                            left: -270
                        }), dialogColors.hide();
                    return menuDiv.animate({
                        left: 0
                    });
                }
                menuDiv = $('<div id="p3-settings" style="left: -270px;">').append(
                    $('<div class="header">').append(
                        $('<div class="back">').append(
                            $('<i class="icon icon-back"></i>')
                        ).click(function() {
                            if (menuDiv !== undefined) menuDiv.animate({
                                left: -270
                            });
                            dialogColors.hide();
                        })
                    ).append(
                        $('<div class="title">').append(
                            $('<i class="icon icon-settings"></i>')
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
                        GUIButton(this.settings.autowoot, 'woot', p3Lang.i18n('menu.autowoot'))
                    ).append(
                        GUIButton(this.settings.autorespond, 'autorespond', p3Lang.i18n('menu.autorespond'))
                    ).append(
                        $('<div class="item">').addClass('p3-s-autorespond-input').append($('<input>').val(plugCubed.settings.awaymsg === '' ? this.defaultAwayMsg : plugCubed.settings.awaymsg).keyup(function() {
                            $(this).val($(this).val().split('@').join(''));
                            plugCubed.settings.awaymsg = $(this).val().trim();
                        }))
                        .mouseover(function() {
                            Context.trigger('tooltip:show', p3Lang.i18n('tooltip.afk'), $(this), true);
                        })
                        .mouseout(function() {
                            Context.trigger('tooltip:hide');
                        })
                    ).append(
                        (API.hasPermission(undefined, API.ROLE.BOUNCER) ?
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
                    menuDiv.find('.container').append(
                        GUIButton((this.settings.notify & 32) === 32, 'notify-history', p3Lang.i18n('notify.history')).data('bit', 32).data('perm', API.ROLE.BOUNCER)
                    ).append(
                        GUIButton((this.settings.notify & 64) === 64, 'notify-songlength', p3Lang.i18n('notify.songLength')).data('bit', 64).data('perm', API.ROLE.BOUNCER)
                    ).append(
                        new Slider(5, 20, plugCubed.settings.notifySongLength, function(v) {
                            console.log('Setting', v);
                            plugCubed.settings.notifySongLength = v;
                        })
                        .$slider
                        .css('left', 40)
                        .mouseover(function() {
                            Context.trigger('tooltip:show', p3Lang.i18n('tooltip.songLength'), $(this), true);
                        })
                        .mouseout(function() {
                            Context.trigger('tooltip:hide');
                        })
                    );
                }
                menuDiv.animate({
                    left: 0
                });
                $('body').append(menuDiv);
            },
            /**
             * @this {plugCubedModel}
             */
            onMenuButtonClick: function(e) {
                var a = $(e.currentTarget).data('key');
                switch (a) {
                    case 'woot':
                        this.settings.autowoot = !this.settings.autowoot;
                        this.changeGUIColor('woot', this.settings.autowoot);
                        if (this.settings.autowoot)
                            $('#woot').click();
                        break;
                    case 'colors':
                        dialogColors.render();
                        break;
                    case 'autorespond':
                        this.settings.autorespond = !this.settings.autorespond;
                        this.changeGUIColor('autorespond', this.settings.autorespond);
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
                    case 'notify-songlength':
                        if (!$('.p3-s-' + a).data('perm') || (API.hasPermission(undefined, $('.p3-s-' + a).data('perm')) || p3Utils.isPlugCubedDeveloper())) {
                            var bit = $('.p3-s-' + a).data('bit');
                            this.settings.notify += (this.settings.notify & bit) === bit ? -bit : bit;
                            this.changeGUIColor(a, (this.settings.notify & bit) === bit);
                            Context.trigger("notify", "icon-chat-system", [p3Lang.i18n(a.split('-').join('.')), p3Lang.i18n('notify.header'), (this.settings.notify & bit) === bit ? 'enabled' : 'disabled'].join(' '));
                        }
                        break;
                    case 'stream':
                        PlaybackModel.set('streamDisabled', !DB.settings.streamDisabled);
                        this.changeGUIColor('stream', DB.settings.streamDisabled);
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
                        this.changeGUIColor('roomsettings', a);
                        break;
                    case 'afktimers':
                        this.settings.afkTimers = !this.settings.afkTimers;
                        this.changeGUIColor('afktimers', this.settings.afkTimers);
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
                    var elem = $('input[name="' + i + '"]');
                    elem.val(elem.data('ph'));
                    elem.parents('.dialog-input-container').find('.dialog-input-label').css('color', '#' + elem.val());
                }
            },
            /**
             * @this {plugCubedModel}
             * @param {plugDJAdvanceEvent} data
             */
            onDjAdvance: function(data) {
                if ((this.settings.notify & 8) === 8)
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.stats', data.lastPlay.score.positive, data.lastPlay.score.negative, data.lastPlay.score.curates), this.settings.colors.stats);
                if ((this.settings.notify & 16) === 16)
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.updates', data.media.title, data.media.author, Utils.cleanTypedString(data.dj.username)), this.settings.colors.updates);
                if ((this.settings.notify & 64) === 64 && data.media.duration > this.settings.notifySongLength * 1E3) {
                    playMentionSound();
                    setTimeout(function() {
                        playMentionSound()
                    }, 50);
                    API.chatLog(p3Lang.i18n('notify.message.songLength', this.settings.notifySongLength), true);
                }
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
                if (this.settings.autoMuted && this.settings.registeredSongs.indexOf(data.media.id) < 0) {
                    setTimeout(function() {
                        API.setVolume(plugCubed.lastVolume);
                    }, 800);
                    this.settings.autoMuted = false;
                }
                if (!this.settings.autoMuted && this.settings.registeredSongs.indexOf(data.media.id) > -1) {
                    setTimeout(function() {
                        API.setVolume(0);
                    }, 800);
                    this.settings.autoMuted = true;
                    this.lastVolume = API.getVolume();
                    API.chatLog(p3Lang.i18n('automuted', data.media.title));

                }
                var users = API.getUsers();
                for (var i in users)
                    setUserData(users[i].id, 'curVote', 0);
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
                if ((this.settings.notify & 1) === 1)
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.join', Utils.cleanTypedString(data.username)), this.settings.colors.join);
                if (getUserData(data.id, 'joinTime', 0) === 0)
                    setUserData(data.id, 'joinTime', Date.now());
            },
            /**
             * @this {plugCubedModel}
             * @param {plugUserLeaveEvent} data
             */
            onUserLeave: function(data) {
                if ((this.settings.notify & 2) === 2)
                    p3Utils.chatLog(undefined, p3Lang.i18n(data.relationship === 0 ? 'notify.message.leave.normal' : (data.relationship > 1 ? 'notify.message.leave.friend' : 'notify.message.leave.fan'), Utils.cleanTypedString(data.username)), this.settings.colors.leave);
                var disconnects = getUserData(data.id, 'disconnects', {
                    count: 0
                });
                disconnects.count++;
                disconnects.position = API.getDJ().id === data.id ? -1 : (API.getWaitListPosition(data.id) < 0 ? -2 : API.getWaitListPosition(data.id));
                disconnects.time = Date.now();
                setUserData(data.id, 'disconnects', disconnects);
            },
            /**
             * @this {plugCubedModel}
             */
            chatDisable: function(data) {
                var a = data.type == 'mention' && (API.hasPermission(data.fromID, API.ROLE.BOUNCER)),
                    b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID, API.ROLE.HOST) || p3Utils.isPlugCubedDeveloper(data.fromID));
                if (a || b) {
                    if (data.message.indexOf('!afkdisable') > -1) {
                        if (this.settings.autorespond) {
                            this.settings.autorespond = false;
                            this.changeGUIColor('autorespond', this.settings.autorespond);
                            this.saveSettings();
                            API.sendChat(p3Lang.i18n('autorespond.commandDisable', '@' + data.from));
                        } else API.sendChat(p3Lang.i18n('autorespond.commandNotEnabled', '@' + data.from));
                    }
                    if (data.message.indexOf('!afkdisable') > 0) return;
                }
            },
            /**
             * @this {plugCubedModel}
             * @this {plugChatEvent} data
             */
            onChat: function(data) {
                this.chatDisable(data);
                if (data.type == 'mention') {
                    if (this.settings.autorespond && !this.settings.recent) {
                        this.settings.recent = true;
                        $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.nextIn', this.getTimestamp(Date.now() + 18E4)));
                        setTimeout(function() {
                            $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.next'));
                            plugCubed.settings.recent = false;
                            plugCubed.saveSettings();
                        }, 18E4);
                        API.sendChat('@' + data.from + ' ' + this.settings.awaymsg.split('@').join(''));
                    }
                } else
                    for (var i in this.settings.alertson) {
                        if (data.message.indexOf(this.settings.alertson[i]) > -1)
                            playMentionSound();
                    }
            },
            onSkip: function() {
                p3history[1].wasSkipped = true;
            },
            onHistoryCheck: function(id) {
                if ((!API.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper()) || (plugCubed.settings.notify & 32) !== 32) return;
                var found = -1;
                for (var i in p3history) {
                    var a = p3history[i];
                    if (a.id == id && (~~i + 1) < p3history.length) {
                        found = ~~i + 2;
                        if (!a.wasSkipped)
                            return playMentionSound(), setTimeout(function() {
                                playMentionSound()
                            }, 50), API.chatLog(p3Lang.i18n('notify.message.history', found, p3history.length), true);
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
                if (value.indexOf('/commands') === 0) {
                    dialogCommands.print();
                    return true;
                }
                if (value == '/avail' || value == '/available')
                    return API.setStatus(0);
                if (value == '/brb' || value == '/away')
                    return API.setStatus(1);
                if (value == '/work' || value == '/working')
                    return API.setStatus(2);
                if (value == '/game' || value == '/gaming')
                    return API.setStatus(3);;
                if (value == '/join')
                    return API.djJoin();
                if (value == '/leave')
                    return API.djLeave();
                if (value == '/whoami')
                    return getUserInfo(API.getUser().id);
                if (value == '/refresh')
                    return $('#refresh-button').click();
                if (value == '/version')
                    return API.chatLog(p3Lang.i18n('running', version));
                if (value == '/mute') {
                    if (API.getVolume() === 0) return;
                    this.lastVolume = API.getVolume();
                    return API.setVolume(0);
                }
                if (value == '/link')
                    return API.sendChat('plugCubed : http://plugcubed.net');
                if (value == '/unmute')
                    return API.getVolume() > 0 ? API.setVolume(this.lastVolume) : true;
                if (value == '/nextsong') {
                    var nextSong = API.getNextMedia(),
                        found = -1;
                    if (nextSong === undefined) return API.chatLog(p3Lang.i18n('noNextSong'));
                    nextSong = nextSong.media;
                    for (var i in p3history) {
                        var a = p3history[i];
                        if (a.id == nextSong.id) {
                            found = ~~i + 1;
                            if (!a.wasSkipped)
                                return API.chatLog(p3Lang.i18n('nextsong', nextSong.title, nextSong.author)), API.chatLog(p3Lang.i18n('isHistory', found, p3history.length), true);
                        }
                    }
                    return API.chatLog(p3Lang.i18n('nextsong', nextSong.title, nextSong.author));
                }
                if (value == '/automute') {
                    var a = API.getMedia();
                    if (a === undefined) return;
                    if (this.settings.registeredSongs.indexOf(a.id) < 0) {
                        this.settings.registeredSongs.push(a.id);
                        this.settings.autoMuted = true;
                        this.lastVolume = API.getVolume();
                        API.setVolume(0);
                        API.chatLog(p3Lang.i18n('automute.registered', a.title));
                    } else {
                        this.settings.registeredSongs.splice(this.settings.registeredSongs.indexOf(API.getMedia().id), 1);
                        this.settings.autoMuted = false;
                        API.setVolume(this.lastVolume);
                        API.chatLog(p3Lang.i18n('automute.unregistered', a.title));
                    }
                    return this.saveSettings();
                }
                if (value.indexOf('/getpos') === 0) {
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
                if (value == '/curate') {
                    var a = JSON.parse(LocalStorage.getItem('playlist')),
                        b;
                    for (var b in a) {
                        if (a[b].selected)
                            return Context.dispatch(new MCE(MCE.CURATE, a[b].id)), true;
                    }
                    return;
                }
                if (value.indexOf('/ignore ') === 0 || value.indexOf('/unignore ') === 0) {
                    var user = getUser(value.substr(value.indexOf('/ignore') === 0 ? 8 : 10));
                    if (user === null) return API.chatLog(p3Lang.i18n('error.userNotFound')), true;
                    if (user.id === API.getUser().id) return API.chatLog(p3Lang.i18n('error.ignoreSelf')), true;
                    if (this.settings.ignore.indexOf(user.id) > -1) return this.settings.ignore.splice(this.settings.ignore.indexOf(user.id), 1), this.saveSettings(), API.chatLog(p3Lang.i18n('ignore.disabled', user.username)), true;
                    return this.settings.ignore.push(user.id), this.saveSettings(), API.chatLog(p3Lang.i18n('ignore.enabled', Utils.cleanTypedString(user.username)));
                }
                if (p3Utils.isPlugCubedDeveloper()) {
                    if (value.indexOf('/whois ') === 0)
                        return value.toLowerCase() === '/whois all' ? getAllUsers() : getUserInfo(value.substr(7));
                }
                if (API.hasPermission(undefined, API.ROLE.AMBASSADOR) || (p3Utils.isPlugCubedDeveloper() && API.hasPermission(undefined, API.ROLE.MANAGER))) {
                    if (value.indexOf('/whois ') === 0)
                        return value.toLowerCase() === '/whois all' ? getAllUsers() : getUserInfo(value.substr(7));
                    if (value.indexOf('/banall') === 0) {
                        if (value.length > 9) {
                            var me = API.getUser(),
                                users = API.getUsers();
                            for (var i in users) {
                                if (users[i].id !== me.id)
                                    API.moderateBanUser(users[i].id, value.substr(9).trim());
                            }
                        } else API.chatLog(p3Lang.i18n('error.missingReason'));
                        return;
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
                if (API.hasPermission(undefined, API.ROLE.MANAGER)) {
                    if (value === '/lock')
                        return API.moderateLockWaitList(true);
                    if (value === '/unlock')
                        return API.moderateLockWaitList(false);
                    if (value === '/lockskip') {
                        var a = API.getDJ().id;
                        API.once(API.DJ_ADVANCE, function() {
                            API.once(API.WAIT_LIST_UPDATE, function() {
                                API.moderateMoveDJ(a, 1);
                            });
                            API.moderateAddDJ(a);
                        });
                        API.moderateForceSkip();
                    }
                }
                if (API.hasPermission(undefined, API.ROLE.HOST) || p3Utils.isPlugCubedDeveloper()) {
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
                        if (value.indexOf('off') > -1)
                            socket.send(JSON.stringify({
                                type: 'rave',
                                value: 0
                            }));
                        else
                            socket.send(JSON.stringify({
                                type: 'rave',
                                value: 2
                            }));
                    }
                }
            }
        });
    });
    define('plugCubed/dialogs/CustomChatColors', ['jquery', 'c4161/e80a1/cf1e8', 'lang/Lang', 'c4161/e80a1/a11b0', 'plugCubed/Lang'], function($, b, c, d, p3Lang) {
        function GUIInput(id, text, defaultColor) {
            return $('<div class="item">').addClass('p3-s-cc-' + id).append(
                $('<span>').text(text)
            ).append(
                $('<span>').addClass('default').css('display', plugCubed.settings.colors[id] === defaultColor ? 'none' : 'block')
                .mouseover(function() {
                    d.trigger('tooltip:show', p3Lang.i18n('tooltip.reset'), $(this), true);
                })
                .mouseout(function() {
                    d.trigger('tooltip:hide');
                })
                .click(function() {
                    $(this).parent().find('input').val(defaultColor);
                    $(this).parent().find('.example').css('background-color', '#' + defaultColor);
                    $(this).css('display', 'none');
                    plugCubed.settings.colors[id] = defaultColor;
                    plugCubed.saveSettings();
                    plugCubed.updateCustomColors();
                })
            ).append(
                $('<span>').addClass('example').css('background-color', '#' + plugCubed.settings.colors[id])
            ).append(
                $('<input>').val(plugCubed.settings.colors[id]).keyup(function() {
                    if ($(this).val().isRGB()) {
                        $(this).parent().find('.example').css('background-color', '#' + $(this).val());
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
                        if (div.css('left') === '-270px')
                            return div.animate({
                                left: $('#p3-settings').width() + 1
                            });
                        return div.animate({
                            left: -270
                        });
                    }
                    var container = $('<div class="container">').append(
                        $('<div class="section">').text('User Ranks')
                    );
                    for (var i in plugCubed.colorInfo.ranks)
                        container.append(GUIInput(i, p3Lang.i18n(plugCubed.colorInfo.ranks[i].title), plugCubed.colorInfo.ranks[i].color));
                    container.append(
                        $('<div class="spacer">').append($('<div class="divider">'))
                    ).append(
                        $('<div class="section">').text(p3Lang.i18n('notify.header'))
                    );
                    for (var i in plugCubed.colorInfo.notifications)
                        container.append(GUIInput(i, p3Lang.i18n(plugCubed.colorInfo.notifications[i].title), plugCubed.colorInfo.notifications[i].color));
                    div = $('<div id="p3-settings-custom-colors" style="left: -270px;">').append(
                        $('<div class="header">').append(
                            $('<div class="back">').append(
                                $('<i class="icon icon-back"></i>')
                            ).click(function() {
                                if (div !== undefined) div.animate({
                                    left: -270
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
                        left: -270
                    });
                }
            });
        return new a();
    });
    define('plugCubed/dialogs/Userinfo', ['jquery', 'c4161/da043/ae072/d63c2', 'lang/Lang', 'c4161/e80a1/cf1e8', 'c4161/e80a1/a11b0', 'c4161/a8590/d79ff', 'plugCubed/Lang'], function($, b, c, d, e, f, p3Lang) {
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
    define('plugCubed/dialogs/Commands', ['jquery', 'c4161/e80a1/cf1e8', 'lang/Lang', 'plugCubed/Lang', 'plugCubed/Utils'], function($, b, c, p3Lang, p3Utils) {
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
            ['/ignore (commands.variables.username)', 'commands.descriptions.ignore'],
            ['/alertson (commands.variables.word)', 'commands.descriptions.alertson'],
            ['/curate', 'commands.descriptions.curate'],
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
                ['/strobe (commands.variables.onoff)', 'commands.descriptions.strobe', API.ROLE.HOST],
                ['/rave (commands.variables.onoff)', 'commands.descriptions.rave', API.ROLE.HOST],
                ['/whois all', 'commands.descriptions.whois', API.ROLE.AMBASSADOR],
                ['/banall', 'commands.descriptions.banall', API.ROLE.AMBASSADOR]
            ],
            a = b.extend({
                print: function() {
                    var content = '<strong style="font-size:1.4em;">' + p3Lang.i18n('commands.header') + '</strong><br />';
                    content += '<strong style="position:absolute;left: 5px;">=== ' + p3Lang.i18n('commands.userCommands') + ' ===</strong><br />';
                    for (var i in userCommands) {
                        var command = userCommands[i][0];
                        if (command.split('(').length > 1)
                            command = command.split('(')[0] + '(' + p3Lang.i18n(command.split('(')[1].split(')')[0]) + ')';
                        content += '<span style="position:absolute;left: 20px;">' + command + '</span><br /><em style="position:absolute;left: 45px;">' + p3Lang.i18n(userCommands[i][1]) + '</em><br />';
                    }
                    if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                        content += '<br /><strong style="position:absolute;left: 5px;">=== ' + p3Lang.i18n('commands.modCommands') + ' ===</strong><br />';
                        for (var i in modCommands) {
                            if (API.hasPermission(undefined, modCommands[i][2])) {
                                var command = modCommands[i][0];
                                if (command.split('(').length > 1)
                                    command = command.split('(')[0] + '(' + p3Lang.i18n(command.split('(')[1].split(')')[0]) + ')';
                                content += '<span style="position:absolute;left: 20px;">' + command + '</span><br /><em style="position:absolute;left: 45px;">' + p3Lang.i18n(modCommands[i][1]) + '</em><br />';
                            }
                        }
                    }
                    p3Utils.chatLog(undefined, content);
                }
            });
        return new a();
    });
    define('plugCubed/StyleManager', ['jquery', 'c4161/e80a1/cf1e8'], function($, Class) {
        var obj,
            styles = {},
            update = function() {
                var a = '';
                for (var i in styles) a += styles[i];
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
                    if (delete styles[key])
                        update();
                },
                destroy: function() {
                    styles = {};
                    obj.remove();
                }
            });
        return new a();
    });
    define('plugCubed/Utils', function() {
        return {
            isPlugCubedDeveloper: function(id) {
                if (!id) id = API.getUser().id;
                return id == '50aeb31696fba52c3ca0adb6';
            },
            isPlugCubedSponsor: function(id) {
                if (!id) id = API.getUser().id;
                return ['5121578196fba506408bb9eb'].indexOf(id) > -1;
            },
            isPlugCubedVIP: function(id) {
                if (!id) id = API.getUser().id;
                return ['5112c273d6e4a94ec0554792', '50b1961c96fba57db2230417', '50aeb077877b9217e2fbff00', '50aeb020d6e4a94f774740a9'].indexOf(id) > -1;
            },
            chatLog: function(type, message, color) {
                if (!message) return;
                if (typeof message !== 'string') message = message.html();
                message = message.split('<script').join('');
                var $chat = $('#chat-messages'),
                    b = $chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - 20,
                    $message = $('<div>').addClass(type ? type : 'update'),
                    $text = $('<span>').addClass('text').html(message);
                if (type === 'system') $message.append('<i class="icon icon-chat-system"></i>');
                else $text.css('color', '#' + (color ? color : 'd1d1d1'));
                $chat.append($message.append($text));
                b && $chat.scrollTop($chat[0].scrollHeight);
            }
        };
    });
    define('plugCubed/RoomUserListRow', ['jquery', 'c4161/da043/d49a9/f13d3/ced58', 'plugCubed/Utils'], function($, RoomUserListRow, p3Utils) {
        return RoomUserListRow.extend({
            vote: function() {
                if (this.model.get("curated") || this.model.get("vote") !== 0) {
                    if (!this.$icon)
                        this.$icon = $("<i/>").addClass("icon");
                    this.$el.append(this.$icon);
                    if (this.model.get("curated"))
                        this.$icon.removeClass().addClass("icon icon-curate");
                    else if (this.model.get("vote") == 1)
                        this.$icon.removeClass().addClass("icon icon-woot");
                    else if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper())
                        this.$icon.removeClass().addClass("icon icon-meh");
                } else if (this.$icon) {
                    this.$icon.remove();
                    this.$icon = undefined;
                }
            }
        });
    });
    define('plugCubed/Lang', ['jquery', 'c4161/e80a1/cf1e8'], function($, Class) {
        var language = {},
            isLoaded = false,
            Lang = Class.extend({
                init: function() {
                    var _this = this;
                    $.getJSON('http://alpha.plugcubed.net/langs/lang.en.json', function(a) {
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
                    $.getJSON('http://alpha.plugcubed.net/langs/lang.' + lang + '.json', function(a) {
                        language = $.extend(true, language, a);
                        if (callback) callback();
                    }).error(function() {
                        if (callback) callback();
                    });
                },
                i18n: function(selector) {
                    var a = language,
                        i;
                    if (a === undefined) return '{' + selector + '}';
                    var key = selector.split('.');
                    for (i in key) {
                        if (a[key[i]] === undefined) return '{' + selector + '}';
                        a = a[key[i]];
                    }
                    if (arguments.length > 1) {
                        for (i = 1; i < arguments.length; i++)
                            a = a.split('%' + i).join(arguments[i]);
                    }
                    return a;
                }
            });
        return new Lang;
    });
    define('plugCubed/Slider', ['jquery', 'c4161/e80a1/cf1e8'], function($, Class) {
        return Class.extend({
            init: function(min, max, val, callback) {
                this.min = min ? min : 0;
                this.max = max ? max : 100;
                this.cb = callback;

                console.log('Slider with min', this.min, 'max', this.max, 'value', val);

                this.startBind = $.proxy(this.onStart, this);
                this.moveBind = $.proxy(this.onUpdate, this);
                this.stopBind = $.proxy(this.onStop, this);
                this.clickBind = $.proxy(this.onClick, this);

                this.$slider = $('<div class="p3slider"><div class="line"></div><div class="circle"></div><div class="hit"></div></div>');
                this.$line = this.$slider.find('.line');
                this.$hit = this.$slider.find('.hit');
                this.$circle = this.$slider.find('.circle');
                this.$hit.mousedown(this.startBind);

                this.$circle.css('left', parseInt(this.$hit.css('left')) + this.$line.width() * (val / this.max) - this.$circle.width() / 2);

                this._max = this.$hit.width() - this.$circle.width();

                return this;
            },
            onStart: function(event) {
                this._min = this.$hit.offset().left;
                this._max = this.$hit.width() - this.$circle.width();
                $(document).on('mouseup', this.stopBind).on('mousemove', this.moveBind);
                return this.onUpdate(event);
            },
            onUpdate: function(event) {
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
                var val = Math.max(this.min, Math.min(this.max, ~~ (this.max * ((event.pageX - this._min) / this._max))));
                if (typeof this.cb === 'function') this.cb(val);
                this.$circle.css('left', parseInt(this.$hit.css('left')) + this.$line.width() * (val / this.max) - this.$circle.width() / 2);
            }
        });
    });
    define('plugCubed/Loader', ['jquery', 'c4161/e80a1/cf1e8', 'plugCubed/Model', 'c4161/b933e/fa706', 'c4161/da043/ae072/d63c2', 'plugCubed/Lang', 'plugCubed/Utils'], function($, Class, Model, LocalStorage, ADV, p3Lang, p3Utils) {
        var test = LocalStorage.getItem('plugCubedLang');
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
                $.getJSON('http://alpha.plugcubed.net/lang.json', function(data) {
                    self.languages = data;
                    this.$el.append(this.getHeader('plug&#179; language'))
                        .append(this.getBody().append(this.getMessage(this.draw())));
                    _.defer(_.bind(this.adjustTop, this));
                    $(".lang-button").click($.proxy(this.onLangClick, this));
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
                var row = $("<div/>").addClass("lang-row"),
                    len = languages.length,
                    x = len == 5 ? 0 : len == 4 ? 75 : len == 3 ? 150 : len == 2 ? 225 : 300;
                for (var i = 0; i < len; ++i) {
                    var button = $("<div/>").addClass("lang-button").css('display', 'inline-block').css("left", x).data("language", languages[i].file).css("cursor", "pointer").append($("<img/>").attr("src", 'http://alpha.plugcubed.net/flags/flag.' + languages[i].file + '.png').attr('alt', languages[i].name).height(75).width(150));
                    row.append(button);
                    x += 150;
                }
                return row;
            },
            onLangClick: function(a) {
                a = $(a.currentTarget);
                LocalStorage.setItem('plugCubedLang', a.data('language'), true);
                plugCubed = new Model();
                this.close();
            }
        });
    });

    require(['plugCubed/Model', 'plugCubed/Utils'], function(a, b) {
        plugCubed = new a();
    });
})();