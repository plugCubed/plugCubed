define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/dialogs/Commands', 'plugCubed/Settings', 'plugCubed/Version', 'plugCubed/StyleManager', 'plugCubed/bridges/PlaybackModel'], function(TriggerHandler, p3Utils, p3Lang, dialogCommands, Settings, Version, StyleManager, PlaybackModel) {
    var CommandHandler, user, Context;

    Context = window.plugCubedModules.context;

    function commandLog(message) {
        p3Utils.chatLog('message', message, undefined, -11);
    }

    /*
     * Command parser adapted from PlugAPI https://github.com/plugCubed/plugAPI
     */
    function commandParser(message) {
        var cmd = message.substr(1).split(' ')[0];
        var random = Math.ceil(Math.random() * 1E10);
        var messageData = {};
        var i;

        messageData.command = cmd;
        messageData.args = message.substr(2 + cmd.length);
        messageData.mentions = [];

        if (messageData.args === '') {
            messageData.args = [];
        } else {
            var lastIndex = -1;
            var allUsers = API.getUsers();

            for (i = 0; i < allUsers.length; i++) {
                user = allUsers[i];

                lastIndex = messageData.args.toLowerCase().indexOf(user.username.toLowerCase());
                if (lastIndex > -1) {
                    messageData.args = messageData.args.substr(0, lastIndex) + '%MENTION-' + random + '-' + messageData.mentions.length + '% ' + messageData.args.substr(lastIndex + user.username.length + 1);
                    messageData.mentions.push(user);
                }
            }
            messageData.args = messageData.args.split(' ').filter(function(item) {
                return item != null && item !== '';
            });
            for (i = 0; i < messageData.args.length; i++) {
                if (isFinite(Number(messageData.args[i])) && messageData.args[i] !== '') {
                    messageData.args[i] = Number(messageData.args[i]);
                }
            }
        }

        // Mention placeholder => User object
        if (messageData.mentions.length > 0) {
            for (i = 0; i < messageData.mentions.length; i++) {
                var normalIndex = messageData.args.indexOf('%MENTION-' + random + '-' + i + '%');
                var atIndex = messageData.args.indexOf('@%MENTION-' + random + '-' + i + '%');

                if (normalIndex > -1) {
                    messageData.args[normalIndex] = messageData.mentions[i];
                }
                if (atIndex > -1) {
                    messageData.args[atIndex] = messageData.mentions[i];
                }
            }
        }
        messageData.mappedArgs = messageData.args.map(function(item) {
            if (typeof item === 'object' && item != null) {
                return '@' + item.username;
            }

            return item;
        });

        return messageData;
    }
    CommandHandler = TriggerHandler.extend({
        trigger: API.CHAT_COMMAND,
        handler: function(value) {
            var i, msg, time, reason;
            var commandData = commandParser(value);
            var args = commandData.args;
            var mappedArgs = commandData.mappedArgs;
            var command = commandData.command;

            if (p3Utils.equalsIgnoreCase(command, 'commands')) {
                dialogCommands.print();
            } else if (p3Utils.equalsIgnoreCase(command, 'badges')) {
                if (args.length > 0) {
                    if (p3Utils.equalsIgnoreCase(args[0], p3Lang.i18n('commands.variables.off')) && Settings.badges) {
                        p3Utils.toggleBadges(true);
                        commandLog(p3Lang.i18n('commands.responses.badgeoff'));
                    } else if (p3Utils.equalsIgnoreCase(args[0], p3Lang.i18n('commands.variables.on')) && !Settings.badges) {
                        p3Utils.toggleBadges(true);
                        commandLog(p3Lang.i18n('commands.responses.badgeon'));
                    }
                } else {
                    p3Utils.toggleBadges(true);
                    commandLog(p3Lang.i18n((Settings.badges ? 'commands.responses.badgeon' : 'commands.responses.badgeoff')));
                }
            } else if (p3Utils.equalsIgnoreCase(command, 'export')) {
                $('.message').each(function(item) {
                    var $this = $(this);

                    if (!$this.data('cid')) return;
                    console.log('[' + $this.data('cid') + '] [' + $this.find('.un').text() + '] ' + $this.find('.text').text());

                });
            } else if (p3Utils.equalsIgnoreCase(command, 'join')) {
                if (API.getWaitListPosition() !== -1) return;
                API.djJoin();

                return;
            } else if (p3Utils.equalsIgnoreCase(command, 'leave')) {
                if (API.getWaitListPosition() === -1) return;
                API.djLeave();
            } else if (p3Utils.equalsIgnoreCase(command, 'unload')) {
                if (typeof window.plugCubed === 'undefined') return;

                return window.plugCubed.close();
            } else if (p3Utils.equalsIgnoreCase(command, 'whoami')) {
                p3Utils.getUserInfo(API.getUser().id);
            } else if (p3Utils.equalsIgnoreCase(command, 'shrug')) {
                msg = '¯\\_(ツ)_/¯';

                if (mappedArgs.length > 0) {
                    msg = mappedArgs.join(' ') + msg;
                }
                API.sendChat(msg);
            } else if (p3Utils.equalsIgnoreCase(command, 'lenny')) {
                msg = '( ͡° ͜ʖ ͡°)';

                if (mappedArgs.length > 0) {
                    msg = mappedArgs.join(' ') + msg;
                }
                API.sendChat(msg);
            } else if (p3Utils.equalsIgnoreCase(command, 'refresh')) {
                $('.button.refresh').click();
            } else if (p3Utils.equalsIgnoreCase(command, 'volume')) {
                if (args.length > 0) {
                    if (_.isFinite(args[0])) {
                        API.setVolume(args[0]);
                    } else if (args[0] === '+') {
                        API.setVolume(API.getVolume() + 1);
                    } else if (args[0] === '-') {
                        API.setVolume(API.getVolume() - 1);
                    }
                }
            } else if (p3Utils.equalsIgnoreCase(command, 'version')) {
                commandLog(p3Lang.i18n('running', Version));
            } else if (p3Utils.equalsIgnoreCase(command, 'mute')) {
                if (API.getVolume() === 0) return;
                PlaybackModel.mute();
            } else if (p3Utils.equalsIgnoreCase(command, 'unmute')) {
                if (API.getVolume() > 0) return;
                PlaybackModel.unmute();
            } else if (p3Utils.equalsIgnoreCase(command, 'muteonce')) {
                if (API.getVolume() === 0) return;
                PlaybackModel.muteOnce();
            } else if (p3Utils.equalsIgnoreCase(command, 'link')) {
                var message = 'plugCubed: https://plugcubed.net';

                if (mappedArgs.length > 0) {
                    API.sendChat(mappedArgs.join(' ') + message);
                } else {
                    API.sendChat(message);
                }
            } else if (p3Utils.equalsIgnoreCase(command, 'status')) {
                p3Utils.statusREST(function(status, text, responseTime) {
                    p3Utils.chatLog(undefined, p3Lang.i18n('commands.responses.status.rest', status, text, responseTime), status === 200 ? '00FF00' : 'FF0000', -1);
                });
                p3Utils.statusSocket(function(status, text, responseTime2) {
                    p3Utils.chatLog(undefined, p3Lang.i18n('commands.responses.status.socket', status, text, responseTime2), status === 1000 ? '00FF00' : 'FF0000', -1);
                });
            } else if (p3Utils.equalsIgnoreCase(command, 'nextsong')) {
                var nextSong = API.getNextMedia();

                if (nextSong == null) {
                    commandLog(p3Lang.i18n('error.noNextSong'));

                    return;
                }
                nextSong = nextSong.media;
                var p3history = require('plugCubed/notifications/History');
                var historyInfo = p3history.isInHistory(nextSong.id);

                commandLog(p3Lang.i18n('commands.responses.nextsong', nextSong.title, nextSong.author));
                if (historyInfo.pos > -1 && !historyInfo.skipped) {
                    commandLog(p3Lang.i18n('commands.responses.isHistory', historyInfo.pos, historyInfo.length));
                }
            } else if (p3Utils.equalsIgnoreCase(command, 'automute')) {
                var media = API.getMedia();

                if (media == null) return;
                if (Settings.registeredSongs.indexOf(media.id) < 0) {
                    Settings.registeredSongs.push(media.id);
                    PlaybackModel.muteOnce();
                    commandLog(p3Lang.i18n('commands.responses.automute.registered', media.title));
                } else {
                    Settings.registeredSongs.splice(Settings.registeredSongs.indexOf(media.id), 1);
                    PlaybackModel.unmute();
                    commandLog(p3Lang.i18n('commands.responses.automute.unregistered', media.title));
                }
                Settings.save();
            } else if (p3Utils.equalsIgnoreCase(command, 'getpos')) {
                var lookup = p3Utils.getUser(value.substr(8));

                user = lookup === null ? API.getUser() : lookup;
                var spot = API.getWaitListPosition(user.id);

                if (API.getDJ().id === user.id) {
                    commandLog(p3Lang.i18n('info.userDjing', user.id === API.getUser().id ? p3Lang.i18n('ranks.you') : p3Utils.cleanTypedString(user.username)));
                } else if (spot === 0) {
                    commandLog(p3Lang.i18n('info.userNextDJ', user.id === API.getUser().id ? p3Lang.i18n('ranks.you') : p3Utils.cleanTypedString(user.username)));
                } else if (spot > 0) {
                    commandLog(p3Lang.i18n('info.inWaitlist', spot + 1, API.getWaitList().length));
                } else {
                    commandLog(p3Lang.i18n('info.notInList'));
                }
            } else if (p3Utils.equalsIgnoreCase(command, 'grab')) {
                var playlists = window.plugCubedModules.playlists;

                if (!playlists.models) return commandLog(p3Lang.i18n('errorGettingPlaylistInfo'));
                if (!playlists.models.length) return commandLog(p3Lang.i18n('error.noPlaylistsFound'));

                for (i = 0; i < playlists.models.length; i++) {
                    var playlist = playlists.models[i].attributes;

                    if (playlist.active) {
                        if (playlist.count < 200) {
                            var historyID = PlaybackModel.get('historyID');
                            var MGE = window.plugCubedModules.MediaGrabEvent;

                            Context.dispatch(new MGE(MGE.GRAB, playlist.id, historyID));
                        } else {
                            return commandLog(p3Lang.i18n('error.yourActivePlaylistIsFull'));
                        }
                    }
                }
            } else if (p3Utils.startsWithIgnoreCase(value, '/alertson ') && !p3Utils.equalsIgnoreCaseTrim(value, '/alertson') && mappedArgs.length > 0) {
                Settings.alertson = mappedArgs;
                Settings.save();
                commandLog(p3Lang.i18n('commands.responses.alertson', Settings.alertson.join(', ')));
            } else if (p3Utils.equalsIgnoreCaseTrim(value, '/alertson') || p3Utils.startsWithIgnoreCase(value, '/alertsoff')) {
                Settings.alertson = [];
                Settings.save();
                commandLog(p3Lang.i18n('commands.responses.alertsoff'));
            }

            /* Bouncer and above or p3 Ambassador / Dev */
            if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) {

                if (p3Utils.equalsIgnoreCase(command, 'whois')) {
                    if (args.length > 0 && p3Utils.equalsIgnoreCase(args[0], 'all')) {
                        p3Utils.getAllUsers();
                    } else if (args.length > 0) {
                        p3Utils.getUserInfo(args[0].id);
                    } else {
                        commandLog(p3Lang.i18n('error.invalidWhoisSyntax'));
                    }
                }
            }

            /* Bouncer and above */
            if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {

                if (p3Utils.equalsIgnoreCaseTrim(command, 'ban') || p3Utils.equalsIgnoreCase(command, 'ban')) {
                    if (args[0] && (args[0].id || _.isFinite(args[0]))) {
                        user = args[0].id || args[0];
                        if (args[1]) {
                            time = args[1];

                            if ([-1, 1, 24, 60, 1440, 'forever', 'perma', 'day', 'hour'].indexOf(time) < 0) {
                                return commandLog(p3Lang.i18n('error.invalidBanTime'), time);
                            }
                            if (time === 60 || time === 1 || time === 'hour') time = API.BAN.HOUR;
                            if (time === 24 || time === 1440 || time === 'day') time = API.BAN.DAY;
                            if (time === -1 || time === 'forever' || time === 'perma') time = API.BAN.PERMA;

                            if ([1, 2, 3, 4, 5].indexOf(reason) < 0) {
                                reason = 1;
                            }
                            p3Utils.banUser(user, reason, time);
                        } else {
                            p3Utils.banUser(user, 1, API.BAN.HOUR);
                        }
                    } else {
                        return commandLog(p3Lang.i18n('error.userNotFound'));
                    }
                } else if (p3Utils.equalsIgnoreCase(command, 'skip')) {
                    if (API.getDJ() == null) return;
                    if (mappedArgs.length > 0) {
                        API.sendChat('@' + API.getDJ().username + ' - Reason for skip: ' + mappedArgs.join(' ').trim());
                    }
                    API.moderateForceSkip();
                } else if (p3Utils.equalsIgnoreCase(command, 'add')) {
                    if (args.length < 1) {
                        commandLog(p3Lang.i18n('error.invalidAddSyntax'));

                        return;
                    }
                    user = args[0];
                    if (user.id) {
                        if (API.getWaitListPosition(user.id) === -1) {
                            API.moderateAddDJ(user.id);
                        } else {
                            commandLog(p3Lang.i18n('error.alreadyInWaitList', user.username));
                        }
                    } else {
                        commandLog(p3Lang.i18n('error.userNotFound'));
                    }
                } else if (p3Utils.equalsIgnoreCase(command, 'remove')) {
                    if (args.length < 1) {
                        commandLog(p3Lang.i18n('error.invalidRemoveSyntax'));

                        return;
                    }
                    user = args[0];
                    if (user.id) {
                        if (API.getWaitListPosition(user.id !== -1)) {
                            API.moderateRemoveDJ(user.id);
                        } else {
                            commandLog(p3Lang.i18n('error.notInWaitList', user.username));
                        }
                    } else {
                        commandLog(p3Lang.i18n('error.userNotFound'));
                    }
                }
            }

            /* Manager and Above */
            if (API.hasPermission(undefined, API.ROLE.MANAGER)) {
                if (p3Utils.equalsIgnoreCase(command, 'lock')) {
                    API.moderateLockWaitList(true, false);
                } else if (p3Utils.equalsIgnoreCase(command, 'unlock')) {
                    API.moderateLockWaitList(false, false);
                } else if (p3Utils.equalsIgnoreCase(command, 'lockskip')) {
                    var userID = API.getDJ().id;

                    if (API.getDJ() == null) return;
                    API.once(API.ADVANCE, function() {
                        if (API.getWaitListPosition(userID) === -1) {
                            API.once(API.WAIT_LIST_UPDATE, function() {
                                API.moderateMoveDJ(userID, 1);
                            });
                            API.moderateAddDJ(userID);
                        } else {
                            API.moderateMoveDJ(userID, 1);
                        }
                    });
                    API.moderateForceSkip();
                } else if (p3Utils.equalsIgnoreCase(command, 'move')) {
                    user = args[0];
                    var pos = args[1];

                    if (user.id) {
                        if (_.isFinite(pos)) {
                            p3Utils.moveUser(user.id, pos);
                        } else {
                            commandLog(p3Utils.i18n('error.invalidMoveSyntax'));
                        }
                    } else {
                        commandLog(p3Utils.i18n('error.userNotFound'));
                    }
                }
            } else if (p3Utils.equalsIgnoreCase(command, 'unban')) {
                if (args[0] && (args[0].id || _.isFinite(args[0]))) {
                    user = args[0].id || args[0];

                    p3Utils.unban(user);
                } else {
                    commandLog(p3Utils.i18n('error.invalidUnbanSyntax'));
                }
            }

            /* BA and above only */
            if (p3Utils.equalsIgnoreCase(command, 'banall') && p3Utils.hasPermission(undefined, API.ROLE.MANAGER, true)) {
                var me = API.getUser();
                var users = API.getUsers();

                if (users.length < 2) return;
                for (i = 0; i < users.length; i++) {
                    if (users[i].id !== me.id) {
                        API.moderateBanUser(users[i].id, 0, API.BAN.PERMA);
                    }
                }
            }
        }
    });

    return new CommandHandler();
});
