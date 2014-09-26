define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/dialogs/Commands', 'plugCubed/Settings', 'plugCubed/Socket', 'plugCubed/Version', 'plugCubed/bridges/Context', 'plugCubed/bridges/PlaybackModel'], function(TriggerHandler, p3Utils, p3Lang, dialogCommands, Settings, Socket, Version, Context, PlaybackModel) {
    var lastPMReceiver, commandHandler;
    commandHandler = TriggerHandler.extend({
        trigger: API.CHAT_COMMAND,
        handler: function(value) {
            var i, args = value.split(' '), command = args.shift().substr(1);
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
                        var me = API.getUser(), users = API.getUsers();
                        for (i in users) {
                            if (users.hasOwnProperty(i) && users[i].id !== me.id)
                                API.moderateBanUser(users[i].id, 0, API.BAN.PERMA);
                        }
                        return;
                    }
                }
            }
            if (API.hasPermission(undefined, API.ROLE.COHOST) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedSponsor()) {
                if (p3Utils.equalsIgnoreCase(command, 'strobe')) {
                    if (Socket.getState() !== SockJS.OPEN) {
                        return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                    }
                    Socket.send(JSON.stringify({
                        type: 'room:rave',
                        value: value.indexOf(p3Lang.i18n('commands.variables.off', 'off')) > -1 ? 0 : (args.length > 0 && p3Utils.isNumber(args[1]) && ~~args[1] >= 50 && ~~args[1] <= 100 ? ~~args[1] : 1)
                    }));
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'rave')) {
                    if (Socket.getState() !== SockJS.OPEN) {
                        return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                    }
                    Socket.send(JSON.stringify({
                        type: 'room:rave',
                        value: value.indexOf(p3Lang.i18n('commands.variables.off', 'off')) > -1 ? 0 : 2
                    }));
                    return;
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
                    if (API.getDJ() === undefined) return;
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
            if (p3Utils.equalsIgnoreCase(command, 'avail') || p3Utils.equalsIgnoreCase(command, 'available')) {
                API.setStatus(0);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'afk') || p3Utils.equalsIgnoreCase(command, 'brb') || p3Utils.equalsIgnoreCase(command, 'away')) {
                API.setStatus(1);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'work') || p3Utils.equalsIgnoreCase(command, 'working')) {
                API.setStatus(2);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'game') || p3Utils.equalsIgnoreCase(command, 'gaming')) {
                API.setStatus(3);
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
                        console.log('API.setVolume(' + ~~args[0] + ')');
                        API.setVolume(~~args[0]);
                    } else if (args[0] == '+') {
                        console.log('API.setVolume(' + (API.getVolume() + 1) + ')');
                        API.setVolume(API.getVolume() + 1);
                    } else if (args[0] == '-') {
                        console.log('API.setVolume(' + (API.getVolume() - 1) + ')');
                        API.setVolume(API.getVolume() - 1);
                    } else {
                        console.log('Unknown');
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
            if (p3Utils.equalsIgnoreCase(command, 'link')) {
                API.sendChat('plugCubed : http://plugcubed.net');
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'nextsong')) {
                var nextSong = API.getNextMedia(), found = -1;
                if (nextSong === undefined) return API.chatLog(p3Lang.i18n('noNextSong'));
                nextSong = nextSong.media;
                var p3history = require('plugCubed/notifications/History');
                var historyInfo = p3history.isInHistory(nextSong.id);
                API.chatLog(p3Lang.i18n('nextsong', nextSong.title, nextSong.author));
                if (historyInfo.pos > -1 && !historyInfo.skipped) {
                    API.chatLog(p3Lang.i18n('isHistory', historyInfo.pos, historyInfo.length), true);
                }
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'automute')) {
                var media = API.getMedia();
                if (media === undefined) return;
                if (Settings.registeredSongs.indexOf(media.id) < 0) {
                    Settings.registeredSongs.push(media.id);
                    PlaybackModel.muteOnce();
                    API.chatLog(p3Lang.i18n('automute.registered', media.title));
                } else {
                    Settings.registeredSongs.splice(Settings.registeredSongs.indexOf(media.id), 1);
                    PlaybackModel.unmute();
                    API.chatLog(p3Lang.i18n('automute.unregistered', media.title));
                }
                Settings.save();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'getpos')) {
                var lookup = p3Utils.getUser(value.substr(8)), user = lookup === null ? API.getUser() : lookup, spot = API.getWaitListPosition(user.id);
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
                    return API.chatLog(p3Lang.i18n('error.noLiteSupport'), true);
                }
                $.getJSON('https://plug.dj/_/playlists', function(response) {
                    if (response.status !== 'ok') {
                        API.chatLog('Error getting playlist info', true);
                        return;
                    }
                    var playlists = response.data;
                    if (playlists.length < 1) {
                        API.chatLog('No playlists found', true);
                        return;
                    }
                    for (var i in playlists) {
                        if (!playlists.hasOwnProperty(i)) continue;
                        var playlist = playlists[i];
                        if (playlist.active) {
                            if (playlist.count < 200) {
                                var historyID = require('app/models/PlaybackModel').get('historyID');
                                var MGE = require('app/events/MediaGrabEvent');
                                Context.dispatch(new MGE(MGE.GRAB, playlist.id, historyID));
                            } else {
                                API.chatLog('Your active playlist is full', true);
                            }
                            return;
                        }
                    }
                    API.chatLog('No playlists found', true);
                }).fail(function() {
                    API.chatLog('Error getting playlist info', true);
                });
                return;
            }
            if (p3Utils.startsWithIgnoreCase(value, '/alertson ') && !p3Utils.equalsIgnoreCaseTrim(value, '/alertson')) {
                Settings.alertson = value.substr(10).split(' ');
                Settings.save();
                API.chatLog('Playing sound on the following words: ' + Settings.alertson.join(', '));
                return;
            }
            if (p3Utils.equalsIgnoreCaseTrim(value, '/alertson') || p3Utils.startsWithIgnoreCase(value, '/alertsoff')) {
                Settings.alertson = [];
                Settings.save();
                API.chatLog('No longer playing sound on specific words');
                return;
            }
            if (p3Utils.startsWithIgnoreCase(value, '/msg ') || p3Utils.startsWithIgnoreCase(value, '/pm ')) {
                if (Socket.getState() !== SockJS.OPEN) {
                    return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                }
                var user = p3Utils.getUser(value.split(' ')[1]);
                if (user !== null) {
                    Socket.send(JSON.stringify({
                        type: 'chat:private',
                        value: {
                            id: user.id,
                            message: value.substr(value.indexOf(user.username) + user.username.length + 1)
                        }
                    }));
                    lastPMReceiver = user;
                } else {
                    API.chatLog('Username not found', true);
                }
                return;
            }
            if (p3Utils.startsWithIgnoreCase(value, '/r ')) {
                if (Socket.getState() !== SockJS.OPEN) {
                    return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                }
                if (lastPMReceiver !== undefined && API.getUser(lastPMReceiver.id) !== undefined) {
                    Socket.send(JSON.stringify({
                        type: 'chat:private',
                        value: {
                            id: lastPMReceiver.id,
                            message: value.substr(3)
                        }
                    }));
                } else
                    API.chatLog('Can not find the last PM receiver', true);
            }
        }
    });
    return new commandHandler();
});