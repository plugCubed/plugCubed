define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/bridges/PlaybackModel'], function(Class, p3Utils, p3Lang, Styles, PlaybackModel) {
    var names = [];
    var curVersion;

    // Misc
    names.push('version');

    // Features
    names.push('autowoot', 'autojoin', 'autorespond', 'awaymsg', 'chatLog', 'etaTimer', 'notify', 'customColors', 'moderation', 'notifySongLength', 'useRoomSettings', 'chatImages', 'twitchEmotes', 'songTitle', 'boothAlert', 'badges', 'emotes', 'customCSS', 'markdown', 'hideVideo', 'mentionSound');

    // Registers
    names.push('registeredSongs', 'alertson', 'colors');

    curVersion = 3.3;

    function upgradeVersion(save) {
        switch (save.version) {
            case undefined:
            case 1:

                // Inline Images => Chat Images
                if (save.inlineimages != null) {
                    save.chatImages = save.inlineimages;
                }

                // Moderation
                if (save.moderation == null) {
                    save.moderation = {};
                }
                if (save.afkTimers != null) {
                    save.moderation.afkTimers = save.afkTimers;
                }
                break;
            case 2:

                // Curate => Grab
                if (save.colors != null) {
                    save.colors = {};
                }
                if (save.colors.curate != null) {
                    save.colors.grab = save.colors.curate;
                }
                break;
            case 3:
                if (save.colors.leave != null) {
                    save.colors.leave = 'E26728';
                }
                break;
            case 3.1:
                if (save.colors.boothAlert != null) {
                    save.colors.boothAlert = 'AC76FF';
                }
                break;
            case 3.2:
                if (save.twitchEmotes != null) {
                    save.emotes = {};
                    save.emotes.twitchEmotes = true;
                }
                break;
            default:
                break;
        }
        console.log('[plug³] Updated save', save.version, '=>', curVersion);
        save.version = curVersion;

        return save;
    }

    var Controller = Class.extend({
        recent: false,
        awaymsg: '',
        autowoot: false,
        badges: true,
        chatLog: false,
        autojoin: false,
        autorespond: false,
        notify: 0,
        customColors: false,
        chatImages: true,
        emotes: {
            bttvEmotes: false,
            customEmotes: true,
            emoteSet: 'apple',
            ffzEmotes: false,
            tastyEmotes: false,
            twitchEmotes: false,
            twitchSubEmotes: false
        },
        mentionSound: window.plugCubedModules.plugUrls.sfx,
        songTitle: false,
        registeredSongs: [],
        alertson: [],
        etaTimer: true,
        moderation: {
            afkTimers: false,
            inlineUserInfo: false,
            showDeletedMessages: false
        },
        boothAlert: 1,
        markdown: false,
        customCSS: '',
        hideVideo: false,
        notifyUpdatesLink: false,
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
                    color: 'E26728'
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
                boothAlert: {
                    title: 'notify.boothAlert',
                    color: 'AC76FF'
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
            leave: 'E26728',
            grab: '00FF00',
            meh: 'FF0000',
            stats: '66FFFF',
            updates: 'FFFF00',
            boothAlert: 'AC76FF',
            songLength: '66FFFF'
        },
        load: function() {
            try {
                var save = JSON.parse(localStorage.getItem('plugCubed')) || {};
                var i;

                // Upgrade if needed
                if (save.version == null || save.version !== curVersion) {
                    save = upgradeVersion(save);
                    this.save();
                }

                // Get the settings
                for (i = 0; i < names.length; i++) {
                    if (!names[i]) continue;
                    if (save[names[i]] != null && typeof this[names[i]] == typeof save[names[i]]) {
                        if ($.isPlainObject(this[names[i]])) {
                            if (_.isEmpty(this[names[i]]) && !_.isEmpty(save[names[i]])) {
                                this[names[i]] = save[names[i]];
                            } else {
                                for (var j in this[names[i]]) {
                                    if (!this[names[i]].hasOwnProperty(j)) continue;
                                    if (save[names[i]][j] != null) {
                                        this[names[i]][j] = save[names[i]][j];
                                    }
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
                if (this.emotes.bttvEmotes) {
                    require('plugCubed/handlers/ChatHandler').loadBttvEmotes();
                }
                if (this.emotes.ffzEmotes) {
                    require('plugCubed/handlers/ChatHandler').loadFfzEmotes();
                }
                if (this.emotes.tastyEmotes) {
                    require('plugCubed/handlers/ChatHandler').loadTastyEmotes();
                }
                if (this.emotes.twitchEmotes) {
                    require('plugCubed/handlers/ChatHandler').loadTwitchEmotes();
                }
                if (this.emotes.twitchSubEmotes) {
                    require('plugCubed/handlers/ChatHandler').loadTwitchSubEmotes();
                }
                if (this.hideVideo) {
                    $('#playback-container').hide();
                }

                if (!this.badges) {
                    Styles.set('hide-badges', '#chat .msg { padding: 5px 8px 6px 8px; } #chat-messages .badge-box { display: none; }');
                }
                if (this.customCSS !== '') {
                    Styles.set('room-settings-custom-css', this.customCSS);
                }

                if (this.emotes.emoteSet !== 'apple') {
                    if (this.emotes.emoteSet === 'google') {
                        Styles.set('plug-emojiset', "span.emoji-inner:not(.gemoji-plug){background:url('https://i.imgur.com/T0l9HFK.png')}");
                    } else if (this.emotes.emoteSet === 'emojione') {
                        Styles.set('plug-emojiset', "span.emoji-inner:not(.gemoji-plug){background:url('https://i.imgur.com/PT0KMtp.png')}");
                    } else if (this.emotes.emoteSet === 'twitter') {
                        Styles.set('plug-emojiset', "span.emoji-inner:not(.gemoji-plug){background:url('https://i.imgur.com/gFFWRXH.png')}");
                    }
                }

                if (this.registeredSongs.length > 0 && API.getMedia() != null && this.registeredSongs.indexOf(API.getMedia().id) > -1) {
                    PlaybackModel.muteOnce();
                    API.chatLog(p3Lang.i18n('automuted', API.getMedia().title));
                }

                if (this.etaTimer) {
                    Styles.set('etaTimer', '#your-next-media .song { top: 8px!important; }');
                }
            } catch (e) {
                console.error('[plug³ Settings] Error loading settings', e.stack);
                p3Utils.chatLog('system', 'Error loading settings');
            }
        },
        save: function() {
            var settings = {};

            for (var i = 0; i < names.length; i++) {
                if (names[i]) {
                    settings[names[i]] = this[names[i]];
                }
            }

            settings.version = curVersion;
            localStorage.setItem('plugCubed', JSON.stringify(settings));
        }
    });

    return new Controller();
});
