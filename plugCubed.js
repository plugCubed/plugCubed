/**
 * @license Copyright (c) 2012-2013 by Thomas "TAT" Andresen and other contributors
 * 
 * Permission to use this software for any purpose without fee is hereby granted, provided
 * that the above copyright notice and this permission notice appear in all copies.
 * 
 * Permission to copy and/or edit this software or parts of it for any purpose is permitted,
 * provided that the following points are followed.
 * - The above copyright notice and this permission notice appear in all copies
 * - Within two (2) days after modification is proven working, any modifications are send back
 *   to the original authors to be inspected with the goal of inclusion in the official software
 * - Any edited version are only test versions and not permitted to be run as a final product
 * - Any edited version aren't to be distributed
 * - Any edited version have the prerelease version set to something that can be distinguished
 *   from a version used in the original software
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHORS DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHORS
 * BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
if (typeof plugCubed !== 'undefined') plugCubed.close();
String.prototype.equalsIgnoreCase     = function(a)   { return typeof a !== 'string' ? false : this.toLowerCase() === a.toLowerCase(); };
String.prototype.startsWith           = function(a)   { return typeof a !== 'string' || a.length > this.length ? false : this.indexOf(a) === 0; };
String.prototype.endsWith             = function(a)   { return typeof a !== 'string' || a.length > this.length ? false : this.indexOf(a) === this.length-a.length; };
String.prototype.startsWithIgnoreCase = function(a)   { return typeof a !== 'string' || a.length > this.length ? false : this.toLowerCase().startsWith(a.toLowerCase()); };
String.prototype.endsWithIgnoreCase   = function(a)   { return typeof a !== 'string' || a.length > this.length ? false : this.toLowerCase().endsWith(a.toLowerCase()); };
String.prototype.isNumber             = function()    { return !isNaN(parseInt(this,10)) && isFinite(this); };
String.prototype.isRGB                = function()    { return /^(#|)(([0-9A-F]{6}$)|([0-9A-F]{3}$))/i.test(this.substr(0,1) === '#' ? this : '#' + this); };
Math.randomRange                      = function(a,b) { return a + Math.floor(Math.random()*(b-a+1)); };
var _PCL, plugCubed, plugCubedUserData;

define('plugCubed/Model',['jquery','underscore','app/base/Class','app/facades/ChatFacade','app/store/LocalStorage','app/utils/Utilities','app/models/RoomModel','app/base/Context','app/events/MediaCurateEvent','app/net/Socket','app/net/SocketIO','app/models/TheUserModel','lang/Lang','app/views/room/AudienceView','app/events/RoomJoinEvent','app/events/RoomStateEvent'],function($,_,Class,Chat,LocalStorage,Utils,Room,Context,MCE,Socket,SIO,TUM,Lang,Audience,RJE,RSE) {
    SIO.sio.$events.chat = Socket.listener.chat = function(a) {
        if (a.fromID) setUserData(a.fromID,'lastChat',Date.now());
        if (typeof plugCubed !== 'undefined' && plugCubed.settings.ignore.indexOf(a.fromID) > -1) {
            plugCubed.chatDisable(a);
            return;
        }
        if (!a.chatID || $(".cid-" + a.chatID).length > 0) {
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
        }
        Chat.receive(a);
        API.dispatch(API.CHAT,a);
    };
    function getUserData(a,b,c) {
        if (plugCubedUserData[a] === undefined || plugCubedUserData[a][b] === undefined)
            return c;
        return plugCubedUserData[a][b];
    }
    function setUserData(a,b,c) {
        if (plugCubedUserData[a] === undefined)
            plugCubedUserData[a] = {};
        plugCubedUserData[a][b] = c;
    }
    function isPlugCubedDeveloper(id) {
        if (!id) id = API.getUser().id;
        return id == '50aeb31696fba52c3ca0adb6';
    }
    function isPlugCubedSponsor(id) {
        if (!id) id = API.getUser().id;
        return ['5121578196fba506408bb9eb'].indexOf(id) > -1;
    }
    function isPlugCubedVIP(id) {
        if (!id) id = API.getUser().id;
        return ['5112c273d6e4a94ec0554792','50b1961c96fba57db2230417','50aeb077877b9217e2fbff00'].indexOf(id) > -1;
    }
    function appendChatMessage(message,color) {
        if (!message) return;
        var a = $('#chat-messages'),b = a.scrollTop() > a[0].scrollHeight - a.height() - 20;
        a.append('<div class="message"><span class="text" style="color:#' + (color ? color : 'd1d1d1') + '">' + message + '</span></div>');
        b && a.scrollTop(a[0].scrollHeight);
    }
    function runRoomSettings(settings) {
        if (settings !== undefined) {
            haveRoomSettings = true;
            roomChatColors = {};
            roomChatIcons = {};
            if (settings.colors !== undefined) {
                $('body').css('background-color',settings.colors.background ? '#' + settings.colors.background : '');
                if (settings.colors.chat !== undefined) {
                    var b = {};
                    for (var i in settings.colors.chat) {
                        if (['admin','ambassador','bouncer','cohost','featureddj','leader','host','manager','volunteer'].indexOf(i) > -1 && settings.colors.chat[i].isRGB())
                            b[i] = settings.colors.chat[i].substr(0,1) === '#' ? settings.colors.chat[i].substr(1) : settings.colors.chat[i];
                    }
                    roomChatColors = b;
                }
            } else $('body').css('background-color','');
            if (settings.images !== undefined) {
                Audience.defaultRoomElements();
                if (settings.images.audience !== undefined) {
                    var b = $.extend([],Audience.roomElements);
                    for (var i in Audience.roomElements) {
                        var c = Audience.roomElements[i];
                        if (c.image.src === Audience.arch.src && settings.images.audience.arch && settings.images.audience.arch === "false")
                            b.splice(b.indexOf(c),1);
                        if (c.image.src === Audience.mountain.src && settings.images.audience.mountain && settings.images.audience.mountain === "false")
                            b.splice(b.indexOf(c),1);
                        if (c.image.src === Audience.cactus.src && settings.images.audience.cactus && settings.images.audience.cactus === "false")
                            b.splice(b.indexOf(c),1);
                        if (c.image.src === Audience.cloud.src && settings.images.audience.cloud && settings.images.audience.cloud === "false")
                            b.splice(b.indexOf(c),1);
                    }
                    $('#room-wheel').css('display',settings.images.audience.wheel && settings.images.audience.wheel === "false" ? 'none' : '');
                    Audience.roomElements = b;
                } else $('#room-wheel').css('display','');
                Context.trigger('audience:redraw');
                $('body').css('background-image',settings.images.background ? 'url("' + settings.images.background + '")' : '');
                if (settings.images.booth !== undefined)
                    $('#dj-console').css('background-image',settings.images.booth.booth ? 'url("' + settings.images.booth.booth + '")' : '');
                else
                    $('#dj-console').css('background-image','');
                roomChatIcons = settings.images.icons;
            } else {
                Audience.defaultRoomElements();
                $('#room-wheel').css('display','');
                $('body').css('background-image','');
                $('#dj-console').css('background-image','');
                Context.trigger('audience:redraw');
            }
            if (settings.text !== undefined) {
                if (settings.text.plugCubed !== undefined) {

                }
                if (settings.text.plugDJ !== undefined) {

                }
            }
            plugCubed.initGUI();
            plugCubed.updateCustomColors();
        }
    }
    function loadRoomSettings() {
        var a = Room.get('description'),
            b = plugCubed.settings.useRoomSettings[window.location.pathname.split('/')[1]];
        if (a === null) return;
            b = b === undefined || b === true ? true : false;
        if (a.indexOf('@p3=') > -1) {
            a = a.substr(a.indexOf('@p3=')+4);
            if (a.indexOf(' ') > -1)
                a.substr(0,a.indexOf(' '));
            if (a.indexOf('\n') > -1)
                a.substr(0,a.indexOf('\n'));
            if (b) return $.getJSON(a,function(settings) { runRoomSettings(settings); });
            haveRoomSettings = true;
            plugCubed.initGUI();
        }
    }
    function getUser(data) {
        data = data.trim();
        if (data.substr(0,1) === '@')
            data = data.substr(1);

        var users = API.getUsers();
        for (var i in users) {
            if (users[i].username.equalsIgnoreCase(data) || users[i].id.equalsIgnoreCase(data))
                return users[i];
        }
        return null;
    }
    /**
     * @this {plugCubedModel}
     */
    function getUserInfo(data) {
        var user = getUser(data);
        if (user === null) API.chatLog(plugCubed.i18n('error.userNotFound'));
        else {
            var rank,
                status,
                voted,
                position,
                points      = user.djPoints + user.curatorPoints + user.listenerPoints,
                voteTotal   = getUserData(user.id,'wootcount',0) + getUserData(user.id,'mehcount',0),
                waitlistpos = API.getWaitListPosition(user.id),
                boothpos    = API.getBoothPosition(user.id),
                djs         = API.getDJs(),
                lang        = user.language,
                allLangs    = Chat.uiLanguages.concat(Chat.chatLanguages);


            for (var i in allLangs) {
                if (allLangs.value !== lang) continue;
                lang = allLangs[i].label;
            }


                 if (API.hasPermission(user.id,API.ROLE.ADMIN))      rank = plugCubed.i18n('ranks.admin');
            else if (API.hasPermission(user.id,API.ROLE.AMBASSADOR)) rank = plugCubed.i18n('ranks.ambassador');
            else if (API.hasPermission(user.id,API.ROLE.HOST))       rank = plugCubed.i18n('ranks.host');
            else if (API.hasPermission(user.id,API.ROLE.COHOST))     rank = plugCubed.i18n('ranks.cohost');
            else if (API.hasPermission(user.id,API.ROLE.MANAGER))    rank = plugCubed.i18n('ranks.manager');
            else if (API.hasPermission(user.id,API.ROLE.BOUNCER))    rank = plugCubed.i18n('ranks.bouncer');
            else if (API.hasPermission(user.id,API.ROLE.FEATUREDDJ)) rank = plugCubed.i18n('ranks.featureddj');
            else                                                     rank = plugCubed.i18n('ranks.regular');

            if (boothpos === 0)
                position = plugCubed.i18n('info.djing');
            else if (boothpos > -1)
                position = plugCubed.i18n('info.inbooth',boothpos + 1,djs.length);
            else if (waitlistpos > -1)
                position = plugCubed.i18n('info.inwaitlist',waitlistpos,API.getWaitList().length);
            else
                position = plugCubed.i18n('info.notinlist');

            switch (user.status) {
                default:                  status = plugCubed.i18n('status.available'); break;
                case API.STATUS.AFK:      status = plugCubed.i18n('status.afk');       break;
                case API.STATUS.WORKING:  status = plugCubed.i18n('status.working');   break;
                case API.STATUS.SLEEPING: status = plugCubed.i18n('status.sleeping');  break;
            }

            switch (user.vote) {
                case -1:  voted = plugCubed.i18n('vote.meh');       break;
                default:  voted = plugCubed.i18n('vote.undecided'); break;
                case 1:   voted = plugCubed.i18n('vote.woot');      break;
            }
            if (boothpos === 0) voted = plugCubed.i18n('vote.djing');

            var title = undefined;
            if (isPlugCubedDeveloper(user.id)) title = plugCubed.i18n('info.specialTitles.developer');
            if (isPlugCubedSponsor(user.id))   title = plugCubed.i18n('info.specialTitles.sponsor');
            if (isPlugCubedVIP(user.id))       title = plugCubed.i18n('info.specialTitles.vip');

            appendChatMessage('<table style="width:100%;color:#CC00CC"><tr><td colspan="2"><strong>' + plugCubed.i18n('info.name') + '</strong>: <span style="color:#FFFFFF">' + Utils.cleanTypedString(user.username) + '</span></td></tr>' +
            (title ? '<tr><td colspan="2"><strong>' + plugCubed.i18n('info.title') + '</strong>: <span style="color:#FFFFFF">' + title + '</span></td></tr>' : '') +
            '<tr><td colspan="2"><strong>' + plugCubed.i18n('info.id') + '</strong>: <span style="color:#FFFFFF">' + user.id + '</span></td></tr>' +
            '<tr><td><strong> ' + plugCubed.i18n('info.rank') + '</strong>: <span style="color:#FFFFFF">' + rank + '</span></td><td><strong>' + plugCubed.i18n('info.joined') + '</strong>: <span style="color:#FFFFFF">' + plugCubed.getTimestamp(getUserData(user.id,'joinTime',Date.now())) + '</span></td></tr>' +
            '<tr><td><strong>' + plugCubed.i18n('info.status') + '</strong>: <span style="color:#FFFFFF">' + status + '</span></td><td><strong> ' + plugCubed.i18n('info.vote') + '</strong>: <span style="color:#FFFFFF">' + voted + '</span></td></tr>' +
            '<tr><td colspan="2"><strong>' + plugCubed.i18n('info.position') + '</strong>: <span style="color:#FFFFFF">' + position + '</span></td></tr>' +
            '<tr><td><strong>' + plugCubed.i18n('info.points') + '</strong>: <span style="color:#FFFFFF" title = "' + plugCubed.i18n('info.pointType.dj',user.djPoints) + '&#13; ' + plugCubed.i18n('info.pointType.listener',user.listenerPoints) + '&#13; ' + plugCubed.i18n('info.pointType.curator',user.curatorPoints) + '">' + points + '</span></td><td><strong> ' + plugCubed.i18n('info.fans') + '</strong>: <span style="color:#FFFFFF">' + user.fans + '</span></td></tr>' +
            '<tr><td><strong>' + plugCubed.i18n('info.wootCount') + '</strong>: <span style="color:#FFFFFF">' + getUserData(user.id,'wootcount',0) + '</span></td><td><strong>' + plugCubed.i18n('info.mehCount') + '</strong>: <span style="color:#FFFFFF">' + getUserData(user.id,'mehcount',0) + '</span></td></tr>' +
            '<tr><td colspan="2"><strong>' + plugCubed.i18n('info.ratio') + '</strong>: <span style="color:#FFFFFF">' + (function(a,b) { if (b === 0) return a === 0 ? '0:0' : '1:0'; for (var i = 1;i <= b;i++) { var e = i*(a/b); if (e%1 === 0) return e + ':' + i; } })(getUserData(user.id,'wootcount',0),getUserData(user.id,'mehcount',0)) + '</span></td></tr>' +
            '<tr><td><strong>Disconnects</strong>: <span style="color:#FFFFFF">' + getUserData(user.id,'disconnects',0) + '</td></tr></table>');
        }
    }
    function getAllUsers() {
        var table = $('<table style="width:100%;color:#CC00CC"/>'),
            users = API.getUsers();
        for (var i in users)
            table.append($('<tr/>').append($('<td/>').append(users[i].username)).append($('<td/>').append(users[i].id)));
        appendChatMessage($('<div/>').append(table).html());
    }
    function playMentionSound() {
        document.getElementById("chat-sound").playMentionSound();
    }
    function woot() {
        if (API.getDJs().length === 0) return;
        var dj = API.getDJs()[0];
        if (dj === null || dj == API.getUser()) return;
        $('#button-vote-positive').click();
    }
    function afkTimerEnable() {
        $('#dj-booth').append($('<div />').addClass('afkTimer').css('left', 22));
    }
    function afkTimerDisable() {
        $('#dj-booth .afkTimer').remove();
    }
    function afkTimerTick() {
        var a = API.getDJs(),
            b = $('#dj-booth .afkTimer');
        if (a.length < 1) b.text('');
        else {
            var c = Date.now() - getUserData(a[0].id,'lastChat',getUserData(a[0].id,'joinTime',Date.now()));
            b.text(plugCubed.getTimestamp(c,c < 36E5 ? 'mm:ss' : 'hh:mm:ss'));
        }
    }
    var guiButtons = {},
        afkTimerInterval,
        version = {
            major: 3,
            minor: 0,
            patch: 0,
            prerelease: 'alpha.1',
            minified: false,
            /**
             * @this {version}
             */
            toString: function() {
                return this.major + '.' + this.minor + '.' + this.patch + (this.prerelease !== undefined && this.prerelease !== '' ? '-' + this.prerelease : '') + (this.minified ? '_min' : '');
            }
        },
        p3history = [],
        p3lang = {},
        socket,
        haveRoomSettings = false,
        roomChatColors = {},
        roomChatIcons = {},
        menuButton = $('<div id="plug-cubed"><i class="icon icon-plug-cubed"></i></div>');
    return Class.extend({
        /**
         * @this {plugCubedModel}
         */
        init: function() {
            if (typeof plugCubedUserData === 'undefined') plugCubedUserData = {};
            //if (LocalStorage.getItem('plugCubedLang') === null || LocalStorage.getItem('plugCubedLang') === '@@@') return;
            this.proxy = {
                menu:                 $.proxy(this.onMenuClick,     this),
                onDjAdvance:          $.proxy(this.onDjAdvance,     this),
                onVoteUpdate:         $.proxy(this.onVoteUpdate,    this),
                onCurate:             $.proxy(this.onCurate,        this),
                onUserJoin:           $.proxy(this.onUserJoin,      this),
                onUserLeave:          $.proxy(this.onUserLeave,     this),
                onChat:               $.proxy(this.onChat,          this),
                onSkip:               $.proxy(this.onSkip,          this),
                onRoomJoin:           $.proxy(this.onRoomJoin,      this)
            };
            //Load language and third-party scripts
            $.getScript('http://localhost/plugCubed/langs/lang.en.js',function() {
                require(['plugCubed/Lang'],function(a) {
                    p3lang = a;
                    plugCubed.__init();
                });
            });
        },
        i18n: function(key) {
            var a = p3lang,i;
            if (a === undefined) return '{' + key + '}';
            key = key.split('.');
            for (i in key) {
                if (a[key[i]] === undefined) return '{' + key.join('.') + '}';
                a = a[key[i]];
            }
            if (arguments.length > 1) {
                for (i = 1;i < arguments.length;i++)
                    a = a.split('%'+i).join(arguments[i]);
            }
            return a;
        },
        /**
         * @this {plugCubedModel}
         */
        __init: function() {
            afkTimerInterval = setInterval(afkTimerTick,1E3);

            this.userData = {};

            this.colors = {
                userCommands: '66FFFF',
                modCommands:  'FF0000',
                infoMessage1: 'FFFF00',
                infoMessage2: '66FFFF'
            };
            this.defaultAwayMsg = this.i18n('AFK.default');

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
                            user: {
                                id: a.user.id.toString(),
                                username: a.user.username
                            }
                        };
                    p3history.push(obj);
                }
            },1);

            this.customColorsStyle = $('<style type="text/css" />');
            $('head').append(this.customColorsStyle);
            //appendChatMessage(this.i18n('running',version.toString()) + '</span><br /><span class="chat-text" style="color:#66FFFF">' + this.i18n('commandsHelp'),'FFFF00');
            appendChatMessage(this.i18n('running',version.toString()) + '</span>','FFFF00');

            window.addEventListener('pushState',plugCubed.proxy.onRoomJoin);
            $('body').prepend('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="http://localhost/plugCubed/plugCubed.css?=' + Date.now() + '" />')
                     .append('<script type="text/javascript" src="http://localhost/plugCubed/thirdparty.js?=' + Date.now() + '"></script>');
            $('#plug-dj').after(menuButton);
            $('#room-bar').css('left',108);
            this.loadSettings();
            this.initGUI();
            this.initAPIListeners();
            var users = API.getUsers();
            for (var i in users) {
                if (getUserData(users[i].id,'joinTime',-1) < 0)
                    setUserData(users[i].id,'joinTime',Date.now());
            }

            this.Socket();
            this.loaded = true;
            loadRoomSettings();

            $('#footer-links').append($('<div />').addClass('footer').addClass('plugcubed-footer').css('top',12).html(this.i18n('running',version.toString()) + this.i18n('footer.seperator')).append($('<span />').addClass('plugcubed-status').text(this.i18n('footer.socket',this.i18n('footer.unknown')))));
        },
        onRoomJoin: function() {
            if (typeof plugCubed !== 'undefined') {
                setTimeout(function() {
                    if (API.enabled) $.getScript('http://localhost/plugCubed/plugCubed.' + (version.minified ? 'min.' : '') + 'js?=' + Date.now());
                    else plugCubed.onRoomJoin();
                },500);
            }
        },
        /**
         * @this {plugCubedModel}
         */
        close: function() {
            if (this.loaded === undefined || this.loaded === false) return;
            clearInterval(afkTimerInterval);
            afkTimerDisable();
            runRoomSettings({});
            window.removeEventListener('pushState',plugCubed.proxy.onRoomJoin);
            API.off(API.CHAT_COMMAND,               this.customChatCommand);
            API.off(API.DJ_ADVANCE,                 this.proxy.onDjAdvance);
            API.off(API.VOTE_UPDATE,                this.proxy.onVoteUpdate);
            API.off(API.CURATE_UPDATE,              this.proxy.onCurate);
            API.off(API.USER_JOIN,                  this.proxy.onUserJoin);
            API.off(API.USER_LEAVE,                 this.proxy.onUserLeave);
            API.off(API.CHAT,                       this.proxy.onChat);
            API.off(API.VOTE_SKIP,                  this.proxy.onSkip);
            API.off(API.USER_SKIP,                  this.proxy.onSkip);
            API.off(API.MOD_SKIP,                   this.proxy.onSkip);
            for (var i in guiButtons) {
                if (i === undefined || guiButtons[i] === undefined) continue;
                $('#plugcubed-btn-' + i).unbind();
                delete guiButtons[i];
            }
            $('#plugcubed-css,#font-awesome,#plugcubed-js-extra,#side-right,#side-left,#notify-dialog,.plugcubed-footer,#plug-cubed').remove();
            $('#room-bar').css('left',54);
            if (this.customColorsStyle)
                this.customColorsStyle.remove();
            if (socket) {
                socket.onclose = function() { console.log('[plug³ Socket Server]','Closed'); };
                socket.close();
            }
            requirejs.undef('plugCubed/Model');
            requirejs.undef('plugCubed/dialog/notify');
            requirejs.undef('plugCubed/dialog/customChatColors');
            requirejs.undef('plugCubed/dialog/chatLimit');
            requirejs.undef('plugCubed/dialog/commands');
            requirejs.undef('plugCubed/Lang');
            requirejs.undef('plugCubed/Loader');
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
            console.log('[plug³ Socket Server]',this.reconnecting ? 'Reconnecting' : 'Connecting');
            /**
             * @this {SockJS}
             */
            socket.onopen = function() {
                this.tries = 0;
                console.log('[plug³ Socket Server]',this.reconnecting ? 'Reconnected' : 'Connected');
                var userData = API.getUser();
                this.send(JSON.stringify({
                    type:     'userdata',
                    id:       userData.id,
                    username: userData.username,
                    room:     Room.get('id'),
                    version:  version.toString()
                }));
                $('.plugcubed-status').text(plugCubed.i18n('footer.socket',plugCubed.i18n('footer.online')));
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
                    API.chatLog(plugCubed.i18n('newVersion'), null, plugCubed.colors.infoMessage1);
                    return setTimeout(function() { $.getScript('http://localhost/plugCubed/plugCubed.' + (version.minified ? 'min.' : '') + 'js'); },5000);
                }
                if (type === 'chat') {
                    if (!data.chatID || $(".chat-id-" + data.chatID).length > 0 || plugCubed.settings.ignore.indexOf(data.fromID) > -1)
                        return;
                    Chat.receive(data);
                    return API.trigger(API.CHAT,data);
                }
                if (type === 'rave') {
                    if (isPlugCubedDeveloper(data.id) || isPlugCubedSponsor(data.id) || API.hasPermission(data.id,API.ROLE.HOST))
                        return data.value < 2 ? Audience.strobeMode(data.value === 1) : Audience.lightsOut(true);
                }
            }
            /**
             * @this {SockJS}
             */
            socket.onclose = function() {
                console.log('[plug³ Socket Server]','Closed');
                this.tries++;
                this.reconnecting = true;

                var delay;
                if (this.tries < 5)       delay = 5;
                else if (this.tries < 30) delay = 30;
                else if (this.tries < 60) delay = 60;
                else                      return;

                setTimeout(function() { plugCubed.Socket(); },delay*1E3);
                $('.plugcubed-status').text(plugCubed.i18n('footer.socket',plugCubed.i18n('footer.offline')));
            }
        },
        colorInfo: {
            you        : { title: 'ranks.you',          color: 'FFDD6F' },
            regular    : { title: 'ranks.regular',      color: 'B0B0B0' },
            featureddj : { title: 'ranks.featureddj',   color: 'E90E82' },
            bouncer    : { title: 'ranks.bouncer',      color: 'E90E82' },
            manager    : { title: 'ranks.manager',      color: 'E90E82' },
            cohost     : { title: 'ranks.cohost',       color: 'E90E82' },
            host       : { title: 'ranks.host',         color: 'E90E82' },
            ambassador : { title: 'ranks.ambassador',   color: '9A50FF' },
            admin      : { title: 'ranks.admin',        color: '42A5DC' },
            join       : { title: 'notify.join',        color: '3366FF' },
            leave      : { title: 'notify.leave',       color: '3366FF' },
            curate     : { title: 'notify.curate',      color: '00FF00' },
            stats      : { title: 'notify.stats',       color: '66FFFF' },
            updates    : { title: 'notify.updates',     color: 'FFFF00' }
        },
        settings: {
            recent           : false,
            awaymsg          : '',
            autowoot         : false,
            autorespond      : false,
            notify           : 65,
            customColors     : false,
            avatarAnimations : true,
            registeredSongs  : [],
            ignore           : [],
            alertson         : [],
            autoMuted        : false,
            afkTimers        : false,
            chatlimit        : {
                enabled         : false,
                limit           : 50
            },
            useRoomSettings  : {},
            colors           : {
                you             : 'FFDD6F',
                regular         : 'B0B0B0',
                featureddj      : 'E90E82',
                bouncer         : 'E90E82',
                manager         : 'E90E82',
                cohost          : 'E90E82',
                host            : 'E90E82',
                ambassador      : '9A50FF',
                admin           : '42A5DC',
                join            : '3366FF',
                leave           : '3366FF',
                curate          : '00FF00',
                stats           : '66FFFF',
                updates         : 'FFFF00'
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
                if (this.settings.afkTimers) afkTimerEnable();
                if (this.settings.autowoot) woot();
                if (this.settings.customColors) this.updateCustomColors();
                if (this.settings.registeredSongs.length > 0 && this.settings.registeredSongs.indexOf(Models.room.data.media.id) > -1) {
                    API.setVolume(0);
                    this.settings.autoMuted = true;
                    API.chatLog(this.i18n('automuted',API.getMedia().title));
                }
                if (JSON.parse(LocalStorage.getItem('s01')).emoji === undefined) {
                    var a = JSON.parse(LocalStorage.getItem('s01'));
                    a.emoji = true;
                    LocalStorage.setItem('s01',JSON.stringify(a),true);
                }
            } catch (e) {}
        },
        /**
         * @this {plugCubedModel}
         */
        saveSettings: function() {
            LocalStorage.setItem('plugCubed',JSON.stringify(this.settings));
        },
        /**
         * @this {plugCubedModel}
         */
        updateCustomColors: function() {
            var a = [],
                b = this.settings.useRoomSettings[window.location.pathname.split('/')[1]];
            b = b === undefined || b === true ? true : false;
            if ((b && roomChatColors.regular) || this.settings.customColors)
                a.push('.chat-message .chat-from,','.chat-mention .chat-from { color:#' + (roomChatColors.regular ? roomChatColors.regular : this.settings.colors.regular) + '!important; }');
            if ((b && roomChatColors.featureddj) || this.settings.customColors)
                a.push('.chat-message .chat-from-featureddj,','.chat-mention .chat-from-featureddj { color:#' + (roomChatColors.featureddj ? roomChatColors.featureddj : this.settings.colors.featureddj) + '!important; }');
            if ((b && roomChatColors.bouncer) || this.settings.customColors)
                a.push('.chat-message .chat-from-bouncer,','.chat-mention .chat-from-bouncer { color:#' + (roomChatColors.bouncer ? roomChatColors.bouncer : this.settings.colors.bouncer) + '!important; }');
            if ((b && roomChatColors.manager) || this.settings.customColors)
                a.push('.chat-message .chat-from-manager,','.chat-mention .chat-from-manager { color:#' + (roomChatColors.manager ? roomChatColors.manager : this.settings.colors.manager) + '!important; }');
            if ((b && roomChatColors.cohost) || this.settings.customColors)
                a.push('.chat-message .chat-from-cohost,','.chat-mention .chat-from-cohost { color:#' + (roomChatColors.cohost ? roomChatColors.cohost : this.settings.colors.cohost) + '!important; }');
            if ((b && roomChatColors.host) || this.settings.customColors)
                a.push('.chat-message .chat-from-host,','.chat-mention .chat-from-host { color:#' + (roomChatColors.host ? roomChatColors.host : this.settings.colors.host) + '!important; }');
            if ((b && roomChatColors.ambassador) || this.settings.customColors)
                a.push('.chat-message .chat-from-ambassador,','.chat-mention .chat-from-ambassador { color:#' + (roomChatColors.ambassador ? roomChatColors.ambassador : this.settings.colors.ambassador) + '!important; }');
            if ((b && roomChatColors.admin) || this.settings.customColors)
                a.push('.chat-message .chat-from-admin,','.chat-mention .chat-from-admin { color:#' + (roomChatColors.admin ? roomChatColors.admin : this.settings.colors.admin) + '!important; }');
            if ((b && roomChatColors.you) || this.settings.customColors)
                a.push('.chat-message .chat-from-you,','.chat-mention .chat-from-you { color:#' + (roomChatColors.you ? roomChatColors.you : this.settings.colors.you) + '!important; }');
            if (b) {
                if (roomChatIcons.admin)
                    a.push('.chat-admin { background-image: url("' + roomChatIcons.admin + '"); }');
                if (roomChatIcons.ambassador)
                    a.push('.chat-ambassador { background-image: url("' + roomChatIcons.ambassador + '"); }');
                if (roomChatIcons.bouncer)
                    a.push('.chat-bouncer { background-image: url("' + roomChatIcons.bouncer + '"); }');
                if (roomChatIcons.cohost)
                    a.push('.chat-cohost { background-image: url("' + roomChatIcons.cohost + '"); }');
                if (roomChatIcons.featured)
                    a.push('.chat-featureddj { background-image: url("' + roomChatIcons.featured + '"); }');
                if (roomChatIcons.host)
                    a.push('.chat-host { background-image: url("' + roomChatIcons.host + '"); }');
                if (roomChatIcons.manager)
                    a.push('.chat-manager { background-image: url("' + roomChatIcons.manager + '"); }');
            }
            this.customColorsStyle.text(a.join("\n"));
        },
        /**
         * @this {plugCubedModel}
         */
        initAPIListeners: function() {
            API.on(API.CHAT_COMMAND,     this.customChatCommand);
            API.on(API.DJ_ADVANCE,       this.proxy.onDjAdvance);
            API.on(API.VOTE_UPDATE,      this.proxy.onVoteUpdate);
            API.on(API.CURATE_UPDATE,    this.proxy.onCurate);
            API.on(API.USER_JOIN,        this.proxy.onUserJoin);
            API.on(API.USER_LEAVE,       this.proxy.onUserLeave);
            API.on(API.CHAT,             this.proxy.onChat);
            API.on(API.VOTE_SKIP,        this.proxy.onSkip);
            API.on(API.USER_SKIP,        this.proxy.onSkip);
            API.on(API.MOD_SKIP,         this.proxy.onSkip);
        },
        /**
         * @this {plugCubedModel}
         */
        initGUI: function() {
            guiButtons = {};
            $('#side-right .sidebar-content .plugcubed-btn, #side-right .sidebar-content hr').remove();
            this.addGUIButton(this.settings.autowoot,                                    'woot',        this.i18n('menu.autowoot'),         'heart');
            this.addGUIButton(this.settings.customColors,                                'colors',      this.i18n('menu.customchatcolors'), 'tint');
            this.addGUIButton(this.settings.autorespond,                                 'autorespond', this.i18n('menu.afkstatus'),        'reply');
            this.addGUIButton((this.settings.notify & 1) === 1,                          'notify',      this.i18n('menu.notify'),           'warning-sign');
            this.addGUIButton(this.settings.chatlimit.enabled,                           'chatlimit',   this.i18n('menu.limitchatlog'),     'ban-circle');
            this.addGUIButton(!JSON.parse(LocalStorage.getItem('s01')).streamDisabled,   'stream',      this.i18n('menu.stream'),           'facetime-video');
            if (API.hasPermission(undefined,API.ROLE.BOUNCER))
                this.addGUIButton(this.settings.afkTimers,                               'afktimers',   this.i18n('menu.afktimers'),        'time');
            if (haveRoomSettings) {
                var useRoomSettings = this.settings.useRoomSettings[window.location.pathname.split('/')[1]];
                this.addGUIButton(useRoomSettings !== undefined ? useRoomSettings : true,              'roomsettings',this.i18n('menu.roomsettings'),     'beaker');
            }
        },
        addGUIButton: function(setting, id, text, icon) {
            if (guiButtons[id] !== undefined) return;
            if ($('#side-right .sidebar-content .plugcubed-btn').length > 0)
                $('#side-right .sidebar-content').append('<hr />');

            $('#side-right .sidebar-content').append('<a id="plugcubed-btn-' + id + '" class="plugcubed-btn"><div class="status-' + (setting ? 'on' : 'off') + ' faicon-' + (icon ? icon : 'circle') + '"></div>' + text + '</a>');
            $('#plugcubed-btn-' + id).data('key',id).click(this.proxy.menu);

            guiButtons[id] = { text: text };
        },
        changeGUIColor: function(id,value) {
            $('#plugcubed-btn-' + id).find('[class^="status-"], [class*=" status-"]').removeClass('status-on').removeClass('status-off').addClass('status-' + (value === true ? 'on' : 'off'));
        },
        /**
         * @this {plugCubedModel}
         */
        moderation: function(target, type) {
            if (API.hasPermission(undefined,API.ROLE.BOUNCER)) {
                var service;
                switch (type) {
                    case 'kick':     service = API.moderateKickUser; break;
                    case 'removedj': service = API.moderateRemoveDJ; break;
                    case 'adddj':    service = API.moderateAddDJ;    break;
                    default:         API.chatLog(this.i18n('error.unknownModeration')); return;
                }
                var user = getUser(target);
                if (user === null) API.chatLog(this.i18n('error.userNotFound'));
                else               service(user.id,' ');
            }
        },
        /**
         * @this {plugCubedModel}
         */
        onMenuClick: function(e) {
            var a = $(e.currentTarget).data('key');
            switch (a) {
                case 'woot':
                    this.settings.autowoot = !this.settings.autowoot;
                    this.changeGUIColor('woot',this.settings.autowoot);
                    if (this.settings.autowoot)
                        $('#button-vote-positive').click();
                    break;
                case 'colors':
                    require(['plugCubed/dialog/customChatColors','app/base/Context','app/events/ShowDialogEvent'],function(a,b,c) {b.dispatch(new c(c.SHOW,new a()))});
                    break;
                case 'autorespond':
                    this.settings.autorespond = !this.settings.autorespond;
                    this.changeGUIColor('autorespond',this.settings.autorespond);
                    if (this.settings.autorespond) {
                        var a = prompt(this.i18n('AFK.information'),this.settings.awaymsg === '' ? this.defaultAwayMsg : this.settings.awaymsg);
                        if (a === null) {
                            this.settings.autorespond = false;
                            this.changeGUIColor('autorespond',false);
                            return;
                        }
                        a = a.split('@').join('').trim();
                        this.settings.awaymsg = a === '' ? this.defaultAwayMsg : a;
                        if (API.getUser().status <= 0)
                            API.setStatus(API.STATUS.AFK);
                    } else API.setStatus(API.STATUS.AVAILABLE);
                    break;
                case 'notify':
                    require(['plugCubed/dialog/notify','app/base/Context','app/events/ShowDialogEvent'],function(a,b,c) {b.dispatch(new c(c.SHOW,new a()))});
                    break;
                case 'chatlimit':
                    require(['plugCubed/dialog/chatLimit','app/base/Context','app/events/ShowDialogEvent'],function(a,b,c) {b.dispatch(new c(c.SHOW,new a()))});
                    break;
                case 'stream':
                    var a = JSON.parse(LocalStorage.getItem('s01')).streamDisabled;
                    this.changeGUIColor('stream',a);
                    return API.sendChat(a ? '/stream on' : '/stream off');
                    break;
                case 'emoji':
                    var a = JSON.parse(LocalStorage.getItem('s01')).emoji === false;
                    this.changeGUIColor('emoji',a);
                    return API.sendChat(a ? '/emoji on' : '/emoji off');
                    break;
                case 'roomsettings':
                    var a = this.settings.useRoomSettings[window.location.pathname.split('/')[1]];
                    a = a === undefined || a === true ? false : true;
                    this.settings.useRoomSettings[window.location.pathname.split('/')[1]] = a;
                    (a ? loadRoomSettings : runRoomSettings)({});
                    this.changeGUIColor('roomsettings',a);
                    break;
                case 'afktimers':
                    this.settings.afkTimers = !this.settings.afkTimers;
                    this.changeGUIColor('afktimers',this.settings.afkTimers);
                    (this.settings.afkTimers ? afkTimerEnable : afkTimerDisable)();
                    break;
                default: return API.chatLog(this.i18n('menu.unknownMenuKey'));
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
                elem.parents('.dialog-input-container').find('.dialog-input-label').css('color','#' + elem.val());
            }
        },
        /**
         * @this {plugCubedModel}
         */
        onVoteUpdate: function(data) {
            if (!data || !data.user) return;
            var curVote = getUserData(data.user.id,'curVote',0);

            if (curVote === 1)         setUserData(data.user.id,'wootcount',getUserData(data.user.id,'wootcount',0) - 1);
            else if (curVote === -1)   setUserData(data.user.id,'mehcount',getUserData(data.user.id,'mehcount',0) - 1);

            if (data.vote === 1)       setUserData(data.user.id,'wootcount',getUserData(data.user.id,'wootcount',0) + 1);
            else if (data.vote === -1) setUserData(data.user.id,'mehcount',getUserData(data.user.id,'mehcount',0) + 1);

            setUserData(data.user.id,'curVote',data.vote);
        },
        /**
         * @this {plugCubedModel}
         */
        onCurate: function(data) {
            var media = API.getMedia();
            if ((this.settings.notify & 9) === 9)
                appendChatMessage(this.i18n('notify.message.curate',Utils.cleanTypedString(data.user.username),media.author,media.title),this.settings.colors.curate);
        },
        /**
         * @this {plugCubedModel}
         */
        onDjAdvance: function(data) {
            if ((this.settings.notify & 17) === 17)
                appendChatMessage(this.i18n('notify.message.stats',data.lastPlay.score.positive,data.lastPlay.score.negative,data.lastPlay.score.curates),this.settings.colors.stats);
            if ((this.settings.notify & 33) === 33)
                appendChatMessage(this.i18n('notify.message.updates',data.media.title,data.media.author,Utils.cleanTypedString(data.dj.username)),this.settings.colors.updates);
            setTimeout($.proxy(this.onDjAdvanceLate,this),Math.randomRange(1,10)*1000);
            this.onHistoryCheck(data.media.id);
            var obj = {
                id         : data.media.id,
                author     : data.media.author,
                title      : data.media.title,
                wasSkipped : false,
                user       : {
                    id       : data.dj.id,
                    username : data.dj.username
                }
            };
            if (p3history.unshift(obj) > 50)
                p3history.splice(50,p3history.length-50);
            if (this.settings.autoMuted && this.settings.registeredSongs.indexOf(data.media.id) < 0) {
                setTimeout(function(){ API.setVolume(plugCubed.lastVolume); },800);
                this.settings.autoMuted = false;
            }
            if (!this.settings.autoMuted && this.settings.registeredSongs.indexOf(data.media.id) > -1) {
                setTimeout(function() { API.setVolume(0); }, 800);
                this.settings.autoMuted = true;
                this.lastVolume = API.getVolume();
                API.chatLog(i18n('automuted',data.media.title));

            }
            var users = API.getUsers();
            for (var i in users)
                setUserData(users[i].id,'curVote',0);
        },
        /**
         * @this {plugCubedModel}
         */
        onDjAdvanceLate: function(data) {
            if (this.settings.autowoot && this.settings.registeredSongs.indexOf(API.getHistory()[0].media.id) < 0) woot();
        },
        /**
         * @this {plugCubedModel}
         */
        onUserJoin: function(data) {
            if ((this.settings.notify & 3) === 3 && Room.getUserByID(data.id) !== undefined && Room.getUserByID(data.id).get('relationship') < 1)
                appendChatMessage(this.i18n('notify.message.join',Utils.cleanTypedString(data.username)),this.settings.colors.join);
            if (getUserData(data.id,'joinTime',0) === 0)
                setUserData(data.id,'joinTime',Date.now());
        },
        /**
         * @this {plugCubedModel}
         */
        onUserLeave: function(data) {
            if ((this.settings.notify & 5) === 5)
                appendChatMessage(this.i18n(data.relationship === 0 ? 'notify.message.leave.normal' : (data.relationship > 1 ? 'notify.message.leave.friend' : 'notify.message.leave.fan'),Utils.cleanTypedString(data.username)),this.settings.colors.leave);
            setUserData(data.id,'disconnects',getUserData(data.id,'disconnects',0) + 1);
            setUserData(data.id,'lastDisconnect',Date.now());
        },
        /**
         * @this {plugCubedModel}
         */
        chatDisable: function(data) {
            var a = data.type == 'mention' && (API.hasPermission(data.fromID,API.ROLE.BOUNCER)),b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID,API.ROLE.HOST) || isPlugCubedDeveloper(data.fromID));
            if (a || b) {
                if (data.message.indexOf('!afkdisable') > -1) {
                    if (this.settings.autorespond) {
                        this.settings.autorespond = false;
                        this.changeGUIColor('autorespond',this.settings.autorespond);
                        this.saveSettings();
                        API.sendChat('@' + data.from + ' AFK message disabled');
                    } else API.sendChat('@' + data.from + ' AFK message was not enabled');
                }
                if (data.message.indexOf('!afkdisable') > 0) return;
            }
        },
        /**
         * @this {plugCubedModel}
         */
        onChat: function(data) {
            this.chatDisable(data);
            if (data.type == 'mention') {
                if (this.settings.autorespond && !this.settings.recent) {
                    this.settings.recent = true;
                    setTimeout(function() { plugCubed.settings.recent = false; plugCubed.saveSettings(); },180000);
                    API.sendChat('@' + data.from + ' ' + this.settings.awaymsg);
                }
            } else for (var i in this.settings.alertson) {
                if (data.message.indexOf(this.settings.alertson[i]) > -1)
                    playMentionSound();
            }
            if (this.settings.chatlimit.enabled) {
                var elems = $('#chat-messages').children('div'),num = elems.length,i = 0;
                elems.each(function() {
                    ++i;
                    var a = num-plugCubed.settings.chatlimit.limit-1;
                    if (i < a)
                        $(this).remove();
                    else if (i == a && i%2 == 0)
                        $(this).remove();
                });
            }
        },
        onSkip: function() {
            p3history[1].wasSkipped = true;
        },
        onHistoryCheck: function(id) {
            if ((!API.hasPermission(undefined, API.ROLE.BOUNCER) && !isPlugCubedDeveloper()) || (plugCubed.settings.notify & 65) !== 65) return;
            var found = -1;
            for (var i in p3history) {
                var a = p3history[i];
                if (a.id == id && (~~i + 1) < p3history.length) {
                    found = ~~i + 2;
                    if (!a.wasSkipped)
                        return playMentionSound(),setTimeout(function() { playMentionSound() },50),API.chatLog(this.i18n('historyCheck.inHistory',found,p3history.length),true);
                }
            }
            if (found > 0)
                return API.chatLog(this.i18n('historyCheck.inHistorySkipped',found,p3history.length),true);
        },
        getTimestamp: function(t,format) {
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
        /**
         * @this {Models.chat}
         */
        customChatCommand: function(value) {
            if (value.indexOf('/commands') === 0) {
                require(['plugCubed/dialog/commands','app/base/Context','app/events/ShowDialogEvent'],function(a,b,c) {b.dispatch(new c(c.SHOW,new a()))});
                return true;
            }
            if (value == '/avail' || value == '/available')
                return API.setStatus(0);
            if (value == '/brb' || value == '/away') {
                return API.setStatus(1);
            }
            if (value == '/work' || value == '/working')
                return API.setStatus(2);
            if (value == '/sleep' || value == '/sleeping') {
                return API.setStatus(3);;
            }
            if (value == '/join')
                return API.djJoin();
            if (value == '/leave')
                return API.djLeave();
            if (value == '/whoami')
                return getUserInfo(API.getUser().id);
            if (value == '/refresh')
                return $('#button-refresh').click();
            if (value == '/version')
                return API.chatLog(plugCubed.i18n('running',version.toString()));
            if (value == '/mute') {
                if (API.getVolume() === 0) return;
                plugCubed.lastVolume = API.getVolume();
                return API.setVolume(0);
            }
            if (value == '/link')
                return API.sendChat('plugCubed : http://plugcubed.net');
            if (value == '/unmute')
                return API.getVolume() > 0 ? API.setVolume(plugCubed.lastVolume) : true;
            if (value == '/nextsong') {
                var nextSong = API.getNextMedia(),found = -1;
                if (nextSong === undefined) return API.chatLog(plugCubed.i18n('noNextSong'));
                nextSong = nextSong.media;
                for (var i in p3history) {
                    var a = p3history[i];
                    if (a.id == nextSong.id) {
                        found = ~~i + 1;
                        if (!a.wasSkipped)
                            return API.chatLog(plugCubed.i18n('nextsong',nextSong.title,nextSong.author)),API.chatLog(plugCubed.i18n('isHistory',found,p3history.length),true);
                    }
                }
                return API.chatLog(plugCubed.i18n('nextsong',nextSong.title,nextSong.author));
            }
            if (value == '/automute') {
                var a = API.getMedia();
                if (a === undefined) return;
                if (plugCubed.settings.registeredSongs.indexOf(a.id) < 0) {
                    plugCubed.settings.registeredSongs.push(a.id);
                    plugCubed.settings.autoMuted = true;
                    plugCubed.lastVolume = API.getVolume();
                    API.setVolume(0);
                    API.chatLog(plugCubed.i18n('automute.registered',a.title));
                } else {
                    plugCubed.settings.registeredSongs.splice(plugCubed.settings.registeredSongs.indexOf(API.getMedia().id), 1);
                    plugCubed.settings.autoMuted = false;
                    API.setVolume(plugCubed.lastVolume);
                    API.chatLog(plugCubed.i18n('automute.unregistered',a.title));
                }
                return plugCubed.saveSettings();
            }
            if (value == '/alertsoff') {
                if ((plugCubed.settings.notify & 1) === 1) {
                    appendChatMessage(plugCubed.i18n('notify.message.disabled'),plugCubed.colors.infoMessage1);
                    plugCubed.settings.notify--;
                    plugCubed.changeGUIColor('notify',false);
                }
                return;
            }
            if (value == '/alertson') {
                if ((plugCubed.settings.notify & 1) !== 1) {
                    appendChatMessage(plugCubed.i18n('notify.message.enabled'),plugCubed.colors.infoMessage1);
                    plugCubed.settings.notify++;
                    plugCubed.changeGUIColor('notify',true);
                }
                return;
            }
            if (value.indexOf('/getpos') === 0) {
                var lookup = getUser(value.substr(8)),
                    user = lookup === null ? API.getUser() : lookup,
                    spot = API.getWaitListPosition(user.id);
                if (spot != -1)
                    return API.chatLog(plugCubed.i18n('info.inwaitlist',spot,API.getWaitList.length));
                spot = API.getBoothPosition(user.id);
                if (spot < 0)
                    API.chatLog(plugCubed.i18n('info.notinlist'));
                else if (spot === 0)
                    API.chatLog(plugCubed.i18n('info.userDjing',user.id === API.getUser().id ? plugCubed.i18n('ranks.you') : Utils.cleanTypedString(user.username)));
                else if (spot === 1)
                    API.chatLog(plugCubed.i18n('info.userNextDJ',user.id === API.getUser().id ? plugCubed.i18n('ranks.you') : Utils.cleanTypedString(user.username)));
                else
                    API.chatLog(plugCubed.i18n('info.inbooth',spot + 1,API.getDJs().length));
                return;
            }
            if (value == '/curate') {
                var a = JSON.parse(LocalStorage.getItem('playlist')),b;
                for (var b in a) {
                    if (a[b].selected)
                        return Context.dispatch(new MCE(MCE.CURATE,a[b].id)),true;
                }
                return;
            }
            if (value.indexOf('/ignore ') === 0 || value.indexOf('/unignore ') === 0) {
                var user = getUser(value.substr(value.indexOf('/ignore') === 0 ? 8 : 10));
                if (user === null) return API.chatLog(plugCubed.i18n('error.userNotFound')),true;
                if (user.id === API.getUser().id) return API.chatLog(plugCubed.i18n('error.ignoreSelf')),true;
                if (plugCubed.settings.ignore.indexOf(user.id) > -1) return plugCubed.settings.ignore.splice(plugCubed.settings.ignore.indexOf(user.id),1),plugCubed.saveSettings(),API.chatLog(plugCubed.i18n('ignore.disabled',user.username)),true;
                return plugCubed.settings.ignore.push(user.id),plugCubed.saveSettings(),API.chatLog(plugCubed.i18n('ignore.enabled',Utils.cleanTypedString(user.username)));
            }
            if (isPlugCubedDeveloper()) {
                if (value.indexOf('/whois ') === 0)
                    return value.toLowerCase() === '/whois all' ? getAllUsers() : getUserInfo(value.substr(7));
            }
            if (API.hasPermission(undefined,API.ROLE.AMBASSADOR) || (isPlugCubedDeveloper() && API.hasPermission(undefined,API.ROLE.MANAGER))) {
                if (value.indexOf('/whois ') === 0)
                    return value.toLowerCase() === '/whois all' ? getAllUsers() : getUserInfo(value.substr(7));
                if (value.indexOf('/kickall') === 0) {
                    if (value.length > 9) {
                        var me = API.getUser(),
                            users = API.getUsers();
                        for (var i in users) {
                            if (users[i].id !== me.id)
                                API.moderateKickUser(users[i].id,value.substr(9).trim());
                        }
                    } else API.chatLog(plugCubed.i18n('error.missingReason'));
                    return;
                }
                if (value.indexOf('/banall') === 0) {
                    if (value.length > 9) {
                        var me = API.getUser(),
                            users = API.getUsers();
                        for (var i in users) {
                            if (users[i].id !== me.id)
                                API.moderateBanUser(users[i].id,value.substr(9).trim());
                        }
                    } else API.chatLog(plugCubed.i18n('error.missingReason'));
                    return;
                }
            }
            if (API.hasPermission(undefined,API.ROLE.BOUNCER)) {
                if (value.indexOf('/skip') === 0) {
                    if (API.getDJs().length < 1) return;
                    if (API.getBoothPosition() === 0)
                        return $('#button-skip-this').click();
                    if (value.length > 5)
                        API.sendChat('@' + API.getDJs()[0].username + ' - Reason for skip: ' + value.substr(5).trim());
                    return API.moderateForceSkip();
                }
                if (value.indexOf('/whois ') === 0)
                    return getUserInfo(value.substr(7));
                if (value.indexOf('/kick ') === 0) {
                    if (value.indexOf('::') < 0)
                        return plugCubed.moderation(value.substr(6),'kick');
                    var data = value.substr(6).split(':: '),
                        user = getUser(data[0]);
                        return API.moderateKickUser(user.id,data[1]);
                }
                if (value.indexOf('/add ') === 0)
                    return plugCubed.moderation(value.substr(5),'adddj');
                if (value.indexOf('/remove ') === 0)
                    return plugCubed.moderation(value.substr(8),'removedj');
            }
            if (API.hasPermission(undefined,API.ROLE.MANAGER)) {
                if (value === '/lock')
                    return API.moderateRoomProps(true,Room.get('waitListEnabled'));
                if (value === '/unlock')
                    return API.moderateRoomProps(false,Room.get('waitListEnabled'));
                if (value === '/lockskip') {
                    require(['app/services/room/RoomPropsService'],function(s) {
                        if (Room.get('boothLocked')) {
                            API.once(API.DJ_ADVANCE,function() {
                                var c = new s(Room.get('id'),false,Room.get('waitListEnabled'));
                                c.parse = function(d) {
                                    if (d.status !== 0) API.chatLog('Could not unlock booth',true);
                                }
                            });
                            API.moderateForceSkip();
                            return;
                        }
                        var a = new s(Room.get('id'),true,Room.get('waitListEnabled'));
                        a.parse = function(b) {
                            if (b.status === 0) {
                                API.once(API.DJ_ADVANCE,function() {
                                    var e = new s(Room.get('id'),false,Room.get('waitListEnabled'));
                                    e.parse = function(f) {
                                        if (f.status !== 0) API.chatLog('Could not unlock booth',true);
                                    }
                                });
                                API.moderateForceSkip();
                                return;
                            }
                            API.chatLog('Could not lock booth',true);
                        }
                    });
                }
            }
            if (API.hasPermission(undefined,API.ROLE.HOST) || isPlugCubedDeveloper()) {
                if (value.indexOf('/strobe') === 0) {
                    if (socket.readyState !== SockJS.OPEN) return API.chatLog('Not connected to socket server',true);
                    if (value.indexOf('off') > -1)
                        socket.send(JSON.stringify({type:'rave',value:0}));
                    else
                        socket.send(JSON.stringify({type:'rave',value:1}));
                }
                if (value.indexOf('/rave') === 0) {
                    if (socket.readyState !== SockJS.OPEN) return API.chatLog('Not connected to socket server',true);
                    if (value.indexOf('off') > -1)
                        socket.send(JSON.stringify({type:'rave',value:0}));
                    else
                        socket.send(JSON.stringify({type:'rave',value:2}));
                }
            }
        }
    });
});
define('plugCubed/dialog/notify',['app/views/dialogs/AbstractDialogView','lang/Lang'],function(b,c) {
    var a = b.extend({
        id: 'dialog-notify',
        className: 'dialog',
        render: function() {
            return this.$el.append(this.getHeader(plugCubed.i18n('notify.header'))).append(this.getBody().append('<table style="width: 100%;">' + 
                '<tr><td>' + plugCubed.i18n('enable')         + '</td><td align="right"><input type="checkbox" name="enabled"'     + ((plugCubed.settings.notify &  1) ===  1 ? ' checked="checked"' : '') + ' value="1" /></td></tr>' +
                '<tr><td>' + plugCubed.i18n('notify.join')    + '</td><td align="right"><input type="checkbox" name="join"'        + ((plugCubed.settings.notify &  2) ===  2 ? ' checked="checked"' : '') + ' value="2" /></td></tr>' +
                '<tr><td>' + plugCubed.i18n('notify.leave')   + '</td><td align="right"><input type="checkbox" name="leave"'       + ((plugCubed.settings.notify &  4) ===  4 ? ' checked="checked"' : '') + ' value="4" /></td></tr>' +
                '<tr><td>' + plugCubed.i18n('notify.curate')  + '</td><td align="right"><input type="checkbox" name="curate"'      + ((plugCubed.settings.notify &  8) ===  8 ? ' checked="checked"' : '') + ' value="8" /></td></tr>' +
                (API.hasPermission(undefined,API.ROLE.BOUNCER) ?
                    '<tr><td>' + plugCubed.i18n('notify.history') + '</td><td align="right"><input type="checkbox" name="history"' + ((plugCubed.settings.notify & 16) === 16 ? ' checked="checked"' : '') + ' value="16" /></td></tr>'
                : '') +
            '</table>')).append(this.getSubmitButton(c.dialog.ok)),this._super();
        },
        submit: function() {
            plugCubed.settings.notify = 0;
            this.$el.find(':checked').each(function() {
                plugCubed.settings.notify += ~~$(this).val();
            });
            plugCubed.saveSettings();
            plugCubed.changeGUIColor('notify',(plugCubed.settings.notify & 1) === 1);
            this.close();
        }
    });
    return a;
});
define('plugCubed/dialog/customChatColors',['app/views/dialogs/AbstractDialogView','lang/Lang'],function(b,c) {
    var a = b.extend({
        id: 'dialog-custom-colors',
        className: 'dialog',
        render: function() {
            var body = $('<table style="width:100%;padding:5px"/>');
            body.append('<tr><td>' + plugCubed.i18n('enable') + '</td><td align="right"><input type="checkbox" name="enabled"' + (plugCubed.settings.customColors ? ' checked="checked"' : '') + ' /></td></tr>');
            for (var i in plugCubed.colorInfo)
                body.append(
                    $('<tr/>')
                        .append('<td style="color:#' + plugCubed.settings.colors[i] + '"><span><strong>' + plugCubed.i18n(plugCubed.colorInfo[i].title) + '</strong></span></td>')
                        .append(
                            $('<td align="right"></td>')
                                .append(
                                    $('<input type="text" name="' + i + '" value="' + plugCubed.settings.colors[i] + '" placeholder="' + plugCubed.colorInfo[i].color + '" />')
                                        .data('default',plugCubed.colorInfo[i].color)
                                        .css('width','60px')
                                        .change(function() { $(this).closest('tr').find('span').css('color','#' + $(this).val()); })
                                )
                        )
                );
            return this.$el.append(this.getHeader(plugCubed.i18n('menu.customchatcolors')))
            .append(this.getBody().append(body))
            .append($('<div/>').addClass('dialog-button dialog-default-button').click(function() {
                $(this).parent().find('input[type="text"]').each(function() {
                    var a = $(this);
                    a.val(a.data('default'));
                    a.closest('tr').find('span').css('color','#' + a.val());
                });
            }).append($('<span/>').text('Default')))
            .append(this.getCancelButton())
            .append(this.getSubmitButton(c.dialog.ok)),this._super();
        },
        submit: function() {
            plugCubed.settings.customColors = this.$el.find('input[name="enabled"]').is(':checked');
            for (var i in plugCubed.settings.colors) {
                var a = this.$el.find('input[name="' + i + '"]');
                plugCubed.settings.colors[i] = a.val() === '' || !a.val().isRGB() ? a.data('default') : a.val();
            }
            plugCubed.changeGUIColor('colors',plugCubed.settings.customColors);
            plugCubed.saveSettings();
            plugCubed.updateCustomColors();
            this.close();
        }
    });
    return a;
});
define('plugCubed/dialog/chatLimit',['app/views/dialogs/AbstractDialogView','lang/Lang'],function(b,c) {
    var a = b.extend({
        id: 'dialog-chat-limit',
        className: 'dialog',
        render: function() {
            return this.$el.append(this.getHeader(plugCubed.i18n('menu.limitchatlog'))).append(this.getBody().append('<table style="width: 100%;">' + 
                '<tr><td>' + plugCubed.i18n('enable') + '</td><td align="right"><input type="checkbox" name="enabled"' + (plugCubed.settings.chatlimit.enabled ? ' checked="checked"' : '') + ' /></td></tr>' +
                '<tr><td>' + plugCubed.i18n('limit') + '</td><td align="right"><input type="text" name="limit" value="' + plugCubed.settings.chatlimit.limit + '" /></td></tr>' +
            '</table>')).append(this.getSubmitButton(c.dialog.ok)),this._super();
        },
        submit: function() {
            var a = this.$el.find('input[name="enabled"]').is(':checked'),b = ~~this.$el.find('input[name="limit"]').val();
            if (b < 1) b = 1;
            if (b > 1024) { a = false; b = 1024; }
            plugCubed.settings.chatlimit.enabled = a;
            plugCubed.settings.chatlimit.limit = b;
            plugCubed.changeGUIColor('chatlimit',a);
            plugCubed.saveSettings();
            if (a) {
                var elems = $('#chat-messages').children('div'),num = elems.length,i = 0;
                elems.each(function() {
                    if (++i<num-b)
                        $(this).remove();
                });
            }
            this.close();
        }
    });
    return a;
});
define('plugCubed/dialog/userinfo',['app/views/dialogs/AbstractDialogView','lang/Lang','app/base/Class','app/base/Context','app/events/ShowDialogEvent'],function(b,c,d,e,f) {
    var a = d.extend({
        init: function(id) {
            e.dispatch(new f(f.SHOW,new b.extend({
                    id: 'dialog-commands',
                    className: 'dialog',
                    render: function() {
                        var content = '<table>';
                        for (var i in userCommands)
                            content += '<tr><td>' + userCommands[i][0] + '</td><td>' + userCommands[i][1] + '</td></tr>';
                        content += '</table>';
                        if (API.hasPermission(undefined,API.ROLE.BOUNCER)) {
                            content = '<div id="plugCubedCommands"><ul><li><a href="#user">' + plugCubed.i18n('commands.userCommands') + '</a></li><li><a href="#mod">' + plugCubed.i18n('commands.modCommands') + '</a></li></ul><div id="user">' + content + '</div><div id="mod"><table>';
                            for (var i in modCommands) {
                                if (API.hasPermission(undefined,modCommands[i][2]))
                                    content += '<tr><td>' + modCommands[i][0] + '</td><td>' + modCommands[i][1] + '</td></tr>';
                            }
                            content += '</table></div></div>';
                            content = $(content).tabs();
                        }
                        return this.$el.append(this.getHeader(plugCubed.i18n('info.header'))).append(this.getBody().append(content)),this._super();
                    },
                    submit: function() {
                        this.close();
                    }
                })
            ));
        }
    });
    return a;
});
define('plugCubed/dialog/commands',['app/views/dialogs/AbstractDialogView','lang/Lang'],function(b,c) {
    var userCommands = [
        ['/nick'              ,'change username'],
        ['/avail'             ,'set status to available'],
        ['/afk'               ,'set status to afk'],
        ['/work'              ,'set status to working'],
        ['/sleep'             ,'set status to sleeping'],
        ['/join'              ,'join dj booth/waitlist'],
        ['/leave'             ,'leaves dj booth/waitlist'],
        ['/whoami'            ,'get your own information'],
        ['/mute'              ,'set volume to 0'],
        ['/automute'          ,'register currently playing song to automatically mute on future plays'],
        ['/unmute'            ,'set volume to last volume'],
        ['/nextsong'          ,'display next song in playlist and if it\'s in history'],
        ['/refresh'           ,'refresh the video'],
        ['/ignore (username)' ,'ignore all chat messages from user'],
        ['/alertson (word)'   ,'play mention sound whenever word is written in chat'],
        ['/curate'            ,'add current song to your selected playlist'],
        ['/getpos'            ,'get current waitlist position'],
        ['/version'           ,'displays version number'],
        ['/commands'          ,'shows this list'],
        ['/link'              ,'paste link to plugCubed website in chat']
    ],
    modCommands = [
        ['/whois (username)'    ,'gives general information about user'               ,API.ROLE.BOUNCER],
        ['/skip'                ,'skip current song'                                  ,API.ROLE.BOUNCER],
        ['/kick (username)'     ,'kicks targeted user'                                ,API.ROLE.BOUNCER],
        ['/lockskip'            ,'locks DJ booth, skip and unlocks afterwards'        ,API.ROLE.MANAGER],
        ['/lock'                ,'locks DJ booth'                                     ,API.ROLE.MANAGER],
        ['/unlock'              ,'unlocks DJ booth'                                   ,API.ROLE.MANAGER],
        ['/add (username)'      ,'adds targeted user to dj booth/waitlist'            ,API.ROLE.BOUNCER],
        ['/remove (username)'   ,'removes targeted user from dj booth/waitlist'       ,API.ROLE.BOUNCER],
        ['/strobe (on|off)'     ,'enable/disable strobe'                              ,API.ROLE.HOST],
        ['/rave (on|off)'       ,'enable/disable lights out'                          ,API.ROLE.HOST],
        ['/whois all'           ,'gives userid and username of all users in the room' ,API.ROLE.AMBASSADOR],
        ['/kickall (reason)'    ,'kicks all users in the room with reason'            ,API.ROLE.AMBASSADOR],
        ['/banall (reason)'     ,'bans all users in the room with reason'             ,API.ROLE.AMBASSADOR]
    ],
    a = b.extend({
        id: 'dialog-commands',
        className: 'dialog',
        render: function() {
            var content = '<table>';
            for (var i in userCommands)
                content += '<tr><td>' + userCommands[i][0] + '</td><td>' + userCommands[i][1] + '</td></tr>';
            content += '</table>';
            if (API.hasPermission(undefined,API.ROLE.BOUNCER)) {
                content = '<div id="plugCubedCommands"><ul><li><a href="#user">' + plugCubed.i18n('commands.userCommands') + '</a></li><li><a href="#mod">' + plugCubed.i18n('commands.modCommands') + '</a></li></ul><div id="user">' + content + '</div><div id="mod"><table>';
                for (var i in modCommands) {
                    if (API.hasPermission(undefined,modCommands[i][2]))
                        content += '<tr><td>' + modCommands[i][0] + '</td><td>' + modCommands[i][1] + '</td></tr>';
                }
                content += '</table></div></div>';
                content = $(content).tabs();
            }
            return this.$el.append(this.getHeader(plugCubed.i18n('commands.header').split('&#179;').join('³'))).append(this.getBody().append(content)).append(this.getSubmitButton(c.dialog.ok)),this._super();
        },
        submit: function() {
            this.close();
        }
    });
    return a;
});
define('plugCubed/Loader',['app/base/Class','plugCubed/Model','app/store/LocalStorage','app/views/dialogs/AbstractDialogView'],function(Class,Model,LocalStorage,ADV) {
    var test = LocalStorage.getItem('plugCubedLang');
    function appendChatMessage(message,color) {
        if (!message) return;
        var a = $('#chat-messages'),b = a.scrollTop() > a[0].scrollHeight - a.height() - 20;
        a.append('<div class="chat-update"><span class="chat-text" style="color:#' + (color ? color : 'd1d1d1') + '">' + message + '</span></div>');
        b && a.scrollTop(a[0].scrollHeight);
    }
    if (test !== null && test !== '@@@')
        return Class.extend({ init: function() { plugCubed = new Model(); } });
    return ADV.extend({
        id: 'plugCubedLang-panel',
        className: 'dialog',
        render: function() {
            var self = this;
            console.log(self);
            this.languages = [];
            $.getJSON('http://localhost/plugCubed/lang.json',function(data) {
                self.languages = data;
                this.$el.append(this.getHeader('plug&#179; language'))
                            .append(this.getBody().append(this.getMessage(this.draw())));
                    _.defer(_.bind(this.adjustTop, this));
                    $(".lang-button").click($.proxy(this.onLangClick, this));
                    return this._super();
            }).done(function() { if (self.languages.length === 0) appendChatMessage('<span style="color:#FF0000">Error loading plugCubed</span>'); });
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
            var i,len = this.languages.length,container = $('<div/>');
            if (len > 5) {
                for (var j = 0;j<len/5;j++)
                    container.append(this.drawRow(this.languages.slice(j*5,j*5+5)).css('top',j*75));
            } else container.append(this.drawRow(this.languages).css('top',j*75));
            return container;
        },
        drawRow: function(languages) {
            var row = $("<div/>").addClass("lang-row"),
                len = languages.length,
                x = len == 5 ? 0 : len == 4 ? 75 : len == 3 ? 150 : len == 2 ? 225 : 300;
            for (var i = 0; i < len; ++i) {
                var button = $("<div/>").addClass("lang-button").css('display','inline-block').css("left", x).data("language", languages[i].file).css("cursor", "pointer").append($("<img/>").attr("src", 'http://localhost/plugCubed/flags/flag.' + languages[i].file + '.png').attr('alt',languages[i].name).height(75).width(150));
                row.append(button);
                x += 150;
            }
            return row;
        },
        onLangClick: function(a) {
            a = $(a.currentTarget);
            LocalStorage.setItem('plugCubedLang',a.data('language'),true);
            plugCubed = new Model();
            this.close();
        }
    });
});

require(['plugCubed/Model'],function(a) { plugCubed = new a(); });