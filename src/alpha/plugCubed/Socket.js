define(['underscore', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Version'], function(_, Class, p3Utils, p3Lang, Version) {
    var _this, Chat, socket, tries = 0, socketReconnecting, socketHandler = Class.extend({
        connect: function() {
            if (socket !== undefined && socket.readyState === SockJS.OPEN) return;
            _this = this;
            socket = new SockJS('https://socket.plugcubed.net/_/socket');
            console.log('[plug³] Socket Server', socketReconnecting ? 'Reconnecting' : 'Connecting');
            socket.onopen = _.bind(this.onOpen, this);
            socket.onmessage = _.bind(this.onMessage, this);
            socket.onclose = _.bind(this.onClose, this);
        },
        reconnect: function() {
            if (socket === undefined || socket.readyState !== SockJS.OPEN) {
                this.connect();
            } else {
                socket.close();
            }
        },
        disconnect: function() {
            if (socket === undefined || socket.readyState !== SockJS.OPEN) return;
            socket.onclose = function() {
                console.log('[plug³] Socket Server', 'Closed');
            };
            socket.close();
        },
        onOpen: function() {
            tries = 0;
            console.log('[plug³] Socket Server', socketReconnecting ? 'Reconnected' : 'Connected');
            var userData = API.getUser();
            this.send(JSON.stringify({
                type: 'user:validate',
                id: userData.id,
                username: userData.username,
                room: p3Utils.getRoomID(),
                version: Version.toString()
            }));
            $('.plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.online')));
        },
        onMessage: function(msg) {
            var obj = JSON.parse(msg.data), type = obj.type, data = obj.data;

            switch (type) {
                case 'user:validate':
                    if (data.status === 1) {
                        console.log('[plug³] Socket Server', 'User validated');
                    }
                    return;
                case 'chat:private':
                    if (p3Utils.runLite || !data.chatID || $('.chat-id-' + data.chatID).length > 0)
                        return;
                    if (data.fromID !== API.getUser().id)
                        p3Utils.playMentionSound();
                    Chat.receive(data);
                    API.trigger(API.CHAT, data);
                    return;
                case 'chat:private:notfound':
                    var user = API.getUser(data.id) ? API.getUser(data.id) : {
                        username: 'Receiver'
                    };
                    API.chatLog('[plug³ Socket] ' + user.username + ' not found', true);
                    return;
                case 'room:rave':
                    if (p3Utils.runLite) return;
                    if (p3Utils.isPlugCubedDeveloper(data.id) || p3Utils.isPlugCubedSponsor(data.id) || p3Utils.hasPermission(data.id, API.ROLE.COHOST)) {
                        var Audience = require('app/views/room/AudienceView');
                        clearTimeout(Audience.strobeTimeoutID);
                        if (data.value === 0)
                            Audience.onStrobeChange(null, 0); else if (data.value === 1) {
                            Audience.onStrobeChange(null, 2);
                            p3Lang.chatLog(undefined, p3Lang.i18n('strobe', API.getUser(data.id).username));
                        } else if (data.value === 2) {
                            Audience.onStrobeChange(null, 1);
                            p3Utils.chatLog(undefined, p3Lang.i18n('lightsOut', API.getUser(data.id).username));
                        }
                    }
                    return;
                case 'broadcast:message':
                    if (p3Utils.isPlugCubedDeveloper(data.id) || p3Utils.isPlugCubedSponsor(data.id))
                        p3Utils.chatLog('system', '<strong>' + (data.global ? 'Global' : 'Room') + ' Broadcast from a ' + p3Lang.i18n('info.specialTitles.' + (p3Utils.isPlugCubedDeveloper(data.id) ? 'developer' : 'sponsor')) + '</strong><br><span style="color:#FFFFFF;font-weight:400">' + data.message + '</span>');
                    return;
            }
        },
        onClose: function(info) {
            console.log('[plug³] Socket Server', 'Closed', info);
            $('.plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.offline')));

            var delay;
            socketReconnecting = true;

            switch (info.code) {
                case 3002:
                    delay = 300;
                    break;
                case 3003:
                    return;
                case 3006:
                    // plug.dj account linked to p3 account
                    return;
                default:
                    tries++;
                    if (tries < 5) {
                        delay = 5;
                    } else if (tries < 30) {
                        delay = 30;
                    } else if (tries < 60) {
                        delay = 60;
                    } else return;
                    break;
            }

            setTimeout(function() {
                _this.connect();
            }, delay * 1E3);
        },
        getState: function() {
            return socket.readyState;
        },
        send: function(msg) {
            if (typeof msg === 'string')
                socket.send(msg);
        }
    });
    if (!p3Utils.runLite)
        Chat = require('app/facades/ChatFacade');
    return new socketHandler();
});