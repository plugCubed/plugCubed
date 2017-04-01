define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/dialogs/Commands', 'plugCubed/Settings', 'plugCubed/Version', 'plugCubed/StyleManager', 'plugCubed/bridges/PlaybackModel'], function(TriggerHandler, p3Utils, p3Lang, dialogCommands, Settings, Version, StyleManager, PlaybackModel) {
    var CommandHandler, user, Context;

    Context = window.plugCubedModules.context;

    function commandLog(message) {
        p3Utils.chatLog('message', message, undefined, -11);
    }
    CommandHandler = TriggerHandler.extend({
        trigger: API.CHAT_COMMAND,
        handler: function(value) {
            var i, msg;
            var args = value.split(' ');
            var command = args.shift().substr(1);

            if (p3Utils.equalsIgnoreCase(command, 'commands')) {
                dialogCommands.print();
            } else if (p3Utils.equalsIgnoreCase(command, 'badges')) {
                if (args.length > 0) {
                    if (p3Utils.equalsIgnoreCase(args[0], p3Lang.i18n('commands.variables.off')) && Settings.badges) {
                        StyleManager.set('hide-badges', '#chat .msg { padding: 5px 8px 6px 8px; } #chat-messages .badge-box { display: none; }');
                        Settings.badges = false;
                        commandLog(p3Lang.i18n('commands.responses.badgeoff'));
                    } else if (p3Utils.equalsIgnoreCase(args[0], p3Lang.i18n('commands.variables.on')) && !Settings.badges) {
                        StyleManager.unset('hide-badges');
                        Settings.badges = true;
                        commandLog(p3Lang.i18n('commands.responses.badgeon'));
                    }
                } else {
                    Settings.badges = !Settings.badges;
                    if (Settings.badges) {
                        StyleManager.unset('hide-badges');
                    } else {
                        StyleManager.set('hide-badges', '#chat .msg { padding: 5px 8px 6px 8px; } #chat-messages .badge-box { display: none; }');

                    }
                    commandLog(p3Lang.i18n((Settings.badges ? 'commands.responses.badgeon' : 'commands.responses.badgeoff')));
                }
                Settings.save();
            } else if (p3Utils.equalsIgnoreCase(command, 'exportchat')) {
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

                if (args.length > 0) {
                    msg += ' ' + args.join(' ');
                }
                API.sendChat(msg);
            } else if (p3Utils.equalsIgnoreCase(command, 'lenny')) {
                msg = '( ͡° ͜ʖ ͡°)';

                if (args.length > 0) {
                    msg += ' ' + args.join(' ');
                }
                API.sendChat(msg);
            } else if (p3Utils.equalsIgnoreCase(command, 'refresh')) {
                $('.button.refresh').click();
            } else if (p3Utils.equalsIgnoreCase(command, 'volume')) {
                if (args.length > 0) {
                    if (_.isFinite(args[0])) {
                        API.setVolume(~~args[0]);
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
                API.sendChat('plugCubed: https://plugcubed.net');
            } else if (p3Utils.equalsIgnoreCase(command, 'status')) {
                p3Utils.statusREST(function(status, text, time) {
                    p3Utils.chatLog(undefined, p3Lang.i18n('commands.responses.status.rest', status, text, time), status === 200 ? '00FF00' : 'FF0000', -1);
                });
                p3Utils.statusSocket(function(status, text, time) {
                    p3Utils.chatLog(undefined, p3Lang.i18n('commands.responses.status.socket', status, text, time), status === 1000 ? '00FF00' : 'FF0000', -1);
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

                for (i in playlists.models) {
                    if (!playlists.models.hasOwnProperty(i)) continue;

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
            } else if (p3Utils.startsWithIgnoreCase(value, '/alertson ') && !p3Utils.equalsIgnoreCaseTrim(value, '/alertson')) {
                Settings.alertson = value.substr(10).split(' ');
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
                        p3Utils.getUserInfo(args.join(' '));
                    } else {
                        commandLog(p3Lang.i18n('error.invalidWhoisSyntax'));
                    }
                }
            }

            /* Bouncer and above */
            if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {

                if (p3Utils.equalsIgnoreCaseTrim(command, 'ban') || p3Utils.equalsIgnoreCase(command, 'ban')) {
                    if (value.indexOf('::') < 0) {
                        user = p3Utils.getUser(args.join(' '));
                        if (user == null) {
                            commandLog(p3Lang.i18n('error.userNotFound'));
                        } else {
                            API.moderateBanUser(user.id, 1, API.BAN.HOUR);
                        }
                    } else {
                        var time, reason, values; // eslint-disable-line one-var

                        values = value.split('::');

                        console.log(values[0].split('/ban').join(''));

                        user = p3Utils.getUser(values[0].split('/ban').join(''));
                        if (user == null) {
                            commandLog(p3Lang.i18n('error.userNotFound'));
                        } else {
                            if (_.isFinite(values[1])) {
                                time = parseInt(values[1], 10);
                            } else {
                                commandLog(p3Lang.i18n('error.invalidBanTime'), values[1]);
                            }
                            if (_.isFinite(values[2])) {
                                reason = parseInt(values[2], 10);
                            } else {
                                return;
                            }
                            if ([60, 1, 1440, 24, -1].indexOf(time) < 0) {
                                commandLog(p3Lang.i18n('error.invalidBanTime'), time);

                                return;
                            }
                            if (time === 60 || time === 1) time = API.BAN.HOUR;
                            if (time === 24 || time === 1440) time = API.BAN.DAY;
                            if (time === -1) time = API.BAN.PERMA;
                            if ([1, 2, 3, 4, 5].indexOf(reason) < 0) {
                                reason = 1;
                            }
                            API.moderateBanUser(user.id, reason, time);
                        }
                    }
                } else if (p3Utils.equalsIgnoreCase(command, 'skip')) {
                    if (API.getDJ() == null) return;
                    if (value.length > 6) {
                        API.sendChat('@' + API.getDJ().username + ' - Reason for skip: ' + value.substr(5).trim());
                    }
                    API.moderateForceSkip();
                } else if (p3Utils.equalsIgnoreCase(command, 'add')) {
                    if (args.length < 1) {
                        commandLog(p3Lang.i18n('error.invalidAddSyntax'));

                        return;
                    }
                    user = p3Utils.getUser(args.join(' '));
                    if (user !== null) {
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
                    user = p3Utils.getUser(args.join(' '));
                    if (user !== null) {
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

                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'unlock')) {
                    API.moderateLockWaitList(false, false);

                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'lockskip')) {
                    var userID = API.getDJ().id;

                    if (API.getDJ() == null) return;
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

            /* BA and above only */
            if (p3Utils.equalsIgnoreCase(command, 'banall') && p3Utils.hasPermission(undefined, API.ROLE.MANAGER, true)) {
                var me = API.getUser();
                var users = API.getUsers();

                if (users.length < 2) return;
                for (i in users) {
                    if (users.hasOwnProperty(i) && users[i].id !== me.id) {
                        API.moderateBanUser(users[i].id, 0, API.BAN.PERMA);
                    }
                }
            }
        }
    });

    return new CommandHandler();
});

