define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Version'], function(Class, p3Utils, p3Lang, Version) {
    var socket, tries, socketReconnecting, SocketHandler, Context, roomInitSent, currentRoomContext, reconnectTimer, sendTimer;

    tries = 0;

    Context = window.plugCubedModules.context;
    roomInitSent = true;
    currentRoomContext = {
        slug: null
    };

    SocketHandler = Class.extend({
        connect: function() {
            if (socket != null && socket.readyState === WebSocket.OPEN) return;
            socket = new WebSocket('wss://socket.plugcubed.net/');
            console.log('[plug³] Socket Server', socketReconnecting ? 'Reconnecting' : 'Connecting');
            socket.onopen = this.onOpen.bind(this);
            socket.onmessage = this.onMessage.bind(this);
            socket.onclose = this.onClose.bind(this);
            Context.on('room:joined', this.changeRoom, this);
        },
        reconnect: function() {
            if (socket == null || socket.readyState !== WebSocket.OPEN) {
                this.connect();
            } else {
                socket.close();
            }
        },
        disconnect: function() {
            if (socket == null || socket.readyState !== WebSocket.OPEN) return;
            socket.onclose = function() {
                console.log('[plug³] Socket Server', 'Closed');
            };
            if (reconnectTimer != null) clearTimeout(reconnectTimer);
            if (sendTimer != null) clearTimeout(sendTimer);
            socket.close();
        },
        onOpen: function() {
            tries = 0;
            console.log('[plug³] Socket Server', socketReconnecting ? 'Reconnected' : 'Connected');
            var userData = API.getUser();

            if (sendTimer != null) clearTimeout(sendTimer);

            sendTimer = setTimeout(function() {
                this.send(JSON.stringify({
                    type: 'user:validate',
                    userData: userData,
                    room: {
                        name: p3Utils.getRoomName(),
                        slug: p3Utils.getRoomID()
                    },
                    version: Version.getSemver()
                }));
            }.bind(this), 5000);

            // $('.plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.online')));
        },
        onMessage: function(msg) {
            var obj, type, data;

            obj = JSON.parse(msg.data);
            type = obj.type;
            data = obj.data;

            switch (type) { // eslint-disable-line default-case
                case 'user:validate':
                    if (data.status === 1) {
                        console.log('[plug³] Socket Server', 'User validated');
                    }

                    return;
                case 'user:changeroom':
                    if (data.status === 1) {
                        console.log('[plug³] Socket Server', 'User changed room successfully');
                    } else {
                        console.log('[plug³] Socket Server', 'Room change failed');
                    }

                    return;
                case 'broadcast:message':
                    if (p3Utils.isPlugCubedDeveloper(data.id) || p3Utils.isPlugCubedSponsor(data.id)) {
                        p3Utils.chatLog('system', '<strong>' + (data.global ? 'Global' : 'Room') + ' Broadcast from a ' + p3Lang.i18n('info.specialTitles.developer') + '</strong><br><span style="color:#FFFFFF;font-weight:400">' + data.message + '</span>');
                    }

                    return;
            }
        },
        onClose: function(info) {
            console.log('[plug³] Socket Server', 'Closed', info);

            // $('.plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.offline')));

            var delay;

            socketReconnecting = true;

            switch (info.code) {
                case 3001:
                    delay = 60;
                    break;
                case 3002:
                    delay = 300;
                    break;
                case 3003:
                case 3006:

                    // plug.dj account linked to p3 account (3006)
                    return;
                default:
                    tries++;
                    if (tries < 2) {
                        delay = 5;
                    } else if (tries < 4) {
                        delay = 30;
                    } else if (tries < 8) {
                        delay = 60;
                    } else return;
                    break;
            }

            reconnectTimer = setTimeout(function() {
                this.connect();
            }.bind(this), (delay * 1E3) + (Math.ceil(Math.random() * 5000)));
        },
        getState: function() {
            return socket.readyState;
        },
        changeRoom: function() {
            if (!roomInitSent && p3Utils.getRoomID() !== currentRoomContext.slug) {
                this.send(JSON.stringify({
                    type: 'user:changeroom',
                    room: {
                        name: p3Utils.getRoomName(),
                        slug: p3Utils.getRoomID()
                    }
                }));
                currentRoomContext = {
                    slug: p3Utils.getRoomID()
                };
            }
            roomInitSent = false;
        },
        send: function(msg) {
            if (typeof msg === 'string' && this.getState() === WebSocket.OPEN) {
                socket.send(msg);
            }
        }
    });

    return new SocketHandler();
});
