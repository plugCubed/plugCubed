define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/bridges/PlaybackModel'], function(Class, p3Utils, p3Lang, Styles, PlaybackModel) {
    var names = [], curVersion;

    // Misc
    names.push('version');
    // Features
    names.push('autowoot', 'autojoin', 'autorespond', 'awaymsg', 'notify', 'customColors', 'chatimages', 'moderation', 'notifySongLength', 'useRoomSettings');
    // Registers
    names.push('registeredSongs', 'alertson', 'colors');

    curVersion = 2;

    function upgradeVersion(save) {
        switch (save.version) {
            case void 0:
            case 1:
                // Inline Images => Chat Images
                if (save.inlineimages !== undefined)
                    save.chatImages = save.inlineimages;

                // Moderation
                if (save.moderation === undefined)
                    save.moderation = {};
                if (save.afkTimers !== undefined)
                    save.moderation.afkTimers = save.afkTimers;
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
        registeredSongs: [],
        alertson: [],
        moderation: {
            afkTimers: false,
            showDeletesMessages: false
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
                curate: {
                    title: 'notify.curate',
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
                    title: 'notify.songLength',
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
            curate: '00FF00',
            stats: '66FFFF',
            updates: 'FFFF00',
            songLength: '66FFFF'
        },
        load: function() {
            try {
                var save = JSON.parse(localStorage.getItem('plugCubed'));

                // Upgrade if needed
                if (save.version === undefined || save.version !== curVersion) {
                    save = upgradeVersion(save);
                    this.save();
                }

                // Get the settings
                for (var i in names) {
                    if (!names.hasOwnProperty(i)) continue;
                    if (save[names[i]] !== undefined && typeof this[names[i]] == typeof save[names[i]])
                        this[names[i]] = save[names[i]];
                }

                if (this.autowoot) {
                    (function() {
                        var dj = API.getDJ();
                        if (dj === null || dj.id === API.getUser().id) return;
                        $('#woot').click();
                    })();
                }

                if (this.autojoin) {
                    (function() {
                        var dj = API.getDJ();
                        if (dj === null || dj.id === API.getUser().id || API.getWaitListPosition() > -1) return;
                        $('#dj-button').click();
                    })();
                }

                // Update styles if AFK timers are enabled
                if (this.moderation.afkTimers && (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER))) {
                    Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                }

                if (this.twitchEmotes) {
                    require('plugCubed/handlers/ChatHandler').loadTwitchEmotes();
                }

                if (this.registeredSongs.length > 0 && this.registeredSongs.indexOf(API.getMedia().id) > -1) {
                    if (!p3Utils.runLite) {
                        PlaybackModel.muteOnce();
                    } else {
                        this.lastVolume = API.getVolume();
                        API.setVolume(0);
                    }
                    API.chatLog(p3Lang.i18n('automuted', API.getMedia().title));
                    this.autoMuted = true;
                } else if (this.autoMuted) {
                    API.setVolume(this.lastVolume);
                    this.autoMuted = false;
                }
            } catch (err) {
                console.error('[plug³] Error loading settings');
                trackJs.track(err);
            }
        },
        save: function() {
            var settings = {};
            for (var i in names) {
                if (names.hasOwnProperty(i))
                    settings[names[i]] = this[names[i]];
            }
            localStorage.setItem('plugCubed', JSON.stringify(settings));
        }
    });
    return new controller();
});